<template>
  <div class="map-page">
    <!-- Page title -->
    <!-- 页面标题：简洁说明这个页面干嘛的 -->
    <h1 class="map-title">Allergy Exposure Map</h1>
    <p class="map-subtitle">Explore Safe (green) and Risk (red) trees across Melbourne.</p>

    <!-- Controls row: filter select + legend -->
    <!-- 控件区：筛选下拉 + 图例，简单好用 -->
    <div class="controls">
      <label class="filter-label" for="filterSelect">Filter Trees</label>
      <select id="filterSelect" class="filter-select" v-model="allergenicity" @change="onFilterChange">
        <option value="all">Show All</option>
        <option value="0">Show Only Safe</option>
        <option value="1">Show Only Risk</option>
        <option value="2">None</option>
      </select>

      <div class="legend">
        <span class="legend-item"><span class="dot safe"></span>Safe</span>
        <span class="legend-item"><span class="dot risk"></span>Risk</span>
      </div>

      <!-- 边界开关：是否显示市政边界 -->
      <label class="boundary-toggle">
        <input type="checkbox" v-model="showBoundary" @change="toggleBoundary" />
        <span>Show Municipal Boundary</span>
      </label>
      
      
      <!-- 缩放级别显示 -->
      <div class="zoom-display">
        Zoom: {{ currentZoom }}
      </div>

      <!-- 加载提示 -->
      <div v-if="isLoading" class="loading-indicator">
        <span class="spinner"></span>
        正在加载...
      </div>
    </div>

    <!-- Map container -->
    <!-- 地图容器：Google Maps 会把地图渲染在这里 -->
    <div id="leafletMap" class="map-container" ref="mapEl"></div>
  <div v-if="emptyMessage" class="empty-hint">{{ emptyMessage }}</div>
  </div>
  
</template>

<script>
export default {
  name: 'AllergenMap',
  data() {
    return {
      // current filter: 0 Safe, 1 Risk, 2 None, all Show All
      // 当前筛选：0安全 1风险 2无 all全部
      allergenicity: 'all',  // 默认显示全部
      map: null,        // Google Map instance
      currentDataLayer: null, // 当前数据层ID，用于清理
      infoWindow: null, // Reuse one info window
      showBoundary: true, // 中文：是否显示市政边界  English: toggle municipal boundary
      boundaryAdded: false, // 防止重复添加
      emptyMessage: '', // 当当前筛选结果为空时提示
      currentZoom: 12, // 当前缩放级别
      isLoading: false // 加载状态
    };
  },
  methods: {
    loadGoogleIfNeeded() {
      // Dynamically load Google Maps JS API using env key
      // 动态加载 Google Maps JS，使用环境变量中的密钥
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (window.google && window.google.maps) return Promise.resolve(window.google);
      return new Promise((resolve, reject) => {
        const existing = document.getElementById('google-maps-sdk');
        if (existing) { existing.onload = () => resolve(window.google); return; }
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.async = true; script.defer = true;
        // 暂时使用一个基础的API key，你需要替换为你的有效key
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key || 'AIzaSyDnje6Fe_PaFQphEP7Uzx9bk'}`;
        script.onload = () => resolve(window.google);
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error);
          reject(error);
        };
        document.body.appendChild(script);
      });
    },
    async initMap() {
      // Initialize Google Map centered on Melbourne
      // 初始化Google地图，默认中心在墨尔本
      const google = await this.loadGoogleIfNeeded();
      const el = this.$refs.mapEl;
      if (!el) return;
      this.map = new google.maps.Map(el, {
        center: { lat: -37.8136, lng: 144.9631 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      const debounced = this.debounce(this.refreshMarkers, 400); // 平衡的防抖延迟
      this.map.addListener('idle', debounced);
      
      // 更新缩放级别显示
      this.map.addListener('zoom_changed', () => {
        this.currentZoom = this.map.getZoom();
      });
      await this.refreshMarkers();
      // 初始化边界
      await this.loadMunicipalBoundary();
      // 应用初始样式
      this.applyDataLayerStyle();
      // 初始化缩放级别显示
      this.currentZoom = this.map.getZoom();
    },
    getApiUrl() {
      // Build API URL for both dev and production
      const bounds = this.map?.getBounds();
      const zoom = this.map?.getZoom() || 12;
      if (!bounds) return null;
      
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const s = sw.lat().toFixed(6);
      const w = sw.lng().toFixed(6);
      const n = ne.lat().toFixed(6);
      const e = ne.lng().toFixed(6);
      const bbox = `${s},${w},${n},${e}`;
      
      // 根据环境选择API URL构建方式
      const isDev = import.meta.env.DEV;
      
      if (isDev) {
        // 开发环境使用本地代理
        if (this.allergenicity === 'all') {
          return `/api/map/tree?zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
        } else {
          return `/api/map/tree?allergenicity=${this.allergenicity}&zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
        }
      } else {
        // 生产环境使用CORS代理解决Mixed Content问题
        let backendUrl;
        if (this.allergenicity === 'all') {
          backendUrl = `http://13.236.162.216:8080/map/tree?zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
        } else {
          backendUrl = `http://13.236.162.216:8080/map/tree?allergenicity=${this.allergenicity}&zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
        }
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(backendUrl)}`;
      }
    },

    async refreshMarkers() {
      // Fetch points from backend and render markers (Google Maps)
      // 拉取后端数据并渲染标记（Google地图）
      if (!this.map) return;
      
      // 如果选择 None，直接清空不发请求
      if (this.allergenicity === '2') {
        this.clearData();
        this.emptyMessage = 'No trees displayed (None selected)';
        return;
      }
      
      try {
        this.isLoading = true;
        this.clearData();
        const url = this.getApiUrl();
        if (!url) return;
        
        const res = await fetch(url);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        
        this.renderAsGeoJSON(list, String(this.allergenicity));
        this.applyDataLayerStyle();
        
        this.emptyMessage = list.length === 0 ? 'No trees in current view.' : '';
      } catch (e) {
        console.error('Failed to load map data', e);
        this.emptyMessage = 'Error loading tree data';
      } finally {
        this.isLoading = false;
      }
    },

    // 手动清理所有圆点
    clearData() {
      // Clear only tree data from Google Maps data layer, keep boundary
      // 只清空树木数据，保留边界数据
      if (this.map && this.map.data) {
        this.map.data.forEach((feature) => {
          const featureType = feature.getProperty('type');
          // 只删除树木数据，保留边界数据和覆盖层
          if (!featureType || featureType === 'tree') {
            this.map.data.remove(feature);
          }
        });
      }
      // Close info window if open
      // 关闭信息窗口（如果打开）
      if (this.infoWindow) this.infoWindow.close();
      // 强制清空提示，避免误导
      this.emptyMessage = '';
      // 重置当前数据层ID
      this.currentDataLayer = null;
    },

    renderAsGeoJSON(list, filterSel) {
      // Convert tree data to GeoJSON and render using Google Maps data layer
      // 将树木数据转换为GeoJSON格式并使用Google Maps数据层渲染
      if (!this.map || !list.length) return;
      
      // 生成唯一的数据层ID
      const layerId = `trees_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.currentDataLayer = layerId;
      
      // 创建GeoJSON FeatureCollection
      const geojson = {
        type: 'FeatureCollection',
        features: list.map(item => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!isFinite(lat) || !isFinite(lng)) return null;
          
          const val = String(item.allergenicity).toLowerCase();
          // 修正：0 对应 safe（绿色），1 对应 risk（红色）
          const isSafe = (val === '0' || val === 'safe' || val === 'true');
          // 简化：直接根据数据本身决定颜色，不依赖筛选参数
          const color = isSafe ? '#2EAF62' : '#E64A3B';
          
          return {
            type: 'Feature',
            properties: {
              type: 'tree', // 标识为树木数据
              layerId: layerId,
              commonName: item.commonName || 'Tree',
              scientificName: item.scientificName || '',
              allergenicity: item.allergenicity,
              amount: item.amount || 1, // 聚合点的树木数量
              isSafe: isSafe,
              color: color
            },
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          };
        }).filter(f => f !== null)
      };
      
      // 添加GeoJSON到数据层
      this.map.data.addGeoJson(geojson);
      
      // 应用统一的数据层样式
      this.applyDataLayerStyle();
      
      // 添加点击事件
      if (!this.infoWindow) this.infoWindow = new window.google.maps.InfoWindow();
      this.map.data.addListener('click', (event) => {
        const feature = event.feature;
        const commonName = feature.getProperty('commonName');
        const scientificName = feature.getProperty('scientificName');
        const amount = feature.getProperty('amount') || 1; // 获取聚合数量
        const isSafe = feature.getProperty('isSafe');
        const color = feature.getProperty('color');
        const riskLabel = isSafe ? 'Safe' : 'Risk';
        
        // 根据数量显示不同的内容
        const amountText = amount > 1 ? `<br/>Trees Count: <strong>${amount}</strong>` : '';
        
        const content = `<div style="font-family: Inter, sans-serif; font-size:12px;">
            <strong>${commonName}</strong><br/>
            <em>${scientificName}</em><br/>
            Risk Level: <span style="color:${color}; font-weight:600;">${riskLabel}</span>
            ${amountText}
          </div>`;
        
        this.infoWindow.setContent(content);
        this.infoWindow.setPosition(event.latLng);
        this.infoWindow.open(this.map);
      });
    },


    onFilterChange() {
      // 如果选择 None，立即清空
      if (this.allergenicity === '2') {
        this.clearData();
        this.emptyMessage = 'No trees displayed (None selected)';
        this.isLoading = false;
        return;
      }
      
      // 切换筛选时重新请求数据
      this.refreshMarkers();
    },

    // debounce helper to reduce refresh frequency
    debounce(fn, wait) {
      let t = null;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    // 中文：从 CSV 读取 MultiPolygon 并渲染到 Google Map Data 图层
    // English: load boundary multipolygon from CSV and render via map.data
    async loadMunicipalBoundary() {
      if (!this.map || this.boundaryAdded) return;
      try {
        console.log('Loading municipal boundary...');
        // 使用 public 目录中的 CSV 资源
        const response = await fetch('/municipal-boundary.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log('CSV loaded, length:', text.length);
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) {
          console.error('CSV file does not have enough lines');
          return;
        }
        
        console.log('CSV lines count:', lines.length);
        console.log('Header:', lines[0]);
        
        const header = lines[0].split(',');
        const geoShapeIdx = header.findIndex(h => h.trim().toLowerCase().includes('geo shape'));
        console.log('Geo Shape column index:', geoShapeIdx);
        
        if (geoShapeIdx === -1) {
          console.error('Geo Shape column not found');
          return;
        }
        
        const firstRow = lines[1];
        // 简单 CSV 解析：按双引号包裹字段拆分
        const cols = [];
        let inQuotes = false; 
        let cur = '';
        for (const ch of firstRow) {
          if (ch === '"') { 
            inQuotes = !inQuotes; 
            cur += ch; 
            continue; 
          }
          if (ch === ',' && !inQuotes) { 
            cols.push(cur); 
            cur = ''; 
            continue; 
          }
          cur += ch;
        }
        cols.push(cur);
        
        console.log('Parsed columns count:', cols.length);
        const shapeRaw = cols[geoShapeIdx] || '';
        console.log('Raw shape data length:', shapeRaw.length);
        
        // 去掉最外层引号并反转义 CSV 的双引号
        const jsonLike = shapeRaw.replace(/^"|"$/g, '').replace(/""/g, '"');
        console.log('Cleaned JSON length:', jsonLike.length);
        
        const shapeObj = JSON.parse(jsonLike);
        console.log('Parsed shape object:', shapeObj.type, shapeObj.coordinates?.length);
        // 创建边界线
        const boundaryFeature = {
          type: 'Feature',
          properties: { 
            type: 'boundary_line', 
            name: 'Municipal Boundary'
          },
          geometry: {
            type: shapeObj.type || 'MultiPolygon',
            coordinates: shapeObj.coordinates
          }
        };
        
        // 创建大的外边界矩形，覆盖整个墨尔本地区
        const outerBounds = [
          [144.5, -37.5],  // 西北
          [145.5, -37.5],  // 东北  
          [145.5, -38.5],  // 东南
          [144.5, -38.5],  // 西南
          [144.5, -37.5]   // 闭合
        ];
        
        // 创建带洞的多边形：外边界减去市政边界（形成边界外的灰色覆盖）
        const boundaryWithHole = {
          type: 'Feature',
          properties: { 
            type: 'boundary_overlay', 
            name: 'Outside Boundary Overlay'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              outerBounds, // 外边界
              ...shapeObj.coordinates[0] // 内部洞（市政边界）
            ]
          }
        };
        
        console.log('Adding boundary features to map...');
        // 添加到数据层：先添加覆盖层，再添加边界线
        this.map.data.addGeoJson({ 
          type: 'FeatureCollection', 
          features: [boundaryWithHole, boundaryFeature] 
        });
        
        this.boundaryAdded = true;
        console.log('Municipal boundary loaded and added to map successfully');
      } catch (e) {
        console.error('Failed to load municipal boundary from CSV', e);
      }
    },

    // 显隐边界
    toggleBoundary() {
      if (!this.map) return;
      if (this.showBoundary) {
        if (!this.boundaryAdded) this.loadMunicipalBoundary();
      }
      // 重新应用样式（会根据showBoundary状态显示/隐藏边界）
      this.applyDataLayerStyle();
    },



    applyDataLayerStyle() {
      // 统一的数据层样式应用函数
      if (!this.map) return;
      this.map.data.setStyle((feature) => {
        const featureType = feature.getProperty('type');
        
        if (featureType === 'boundary_overlay') {
          // 边界外的灰色蒙版
          return {
            fillColor: '#808080',
            fillOpacity: this.showBoundary ? 0.3 : 0, // 降低透明度
            strokeColor: 'transparent',
            strokeWeight: 0,
            zIndex: 1 // 在底层
          };
        } else if (featureType === 'boundary_line') {
          // 边界线
          return {
            fillColor: this.showBoundary ? '#E0F7FA' : 'transparent',
            fillOpacity: this.showBoundary ? 0.1 : 0,
            strokeColor: this.showBoundary ? '#00BCD4' : 'transparent',
            strokeOpacity: this.showBoundary ? 0.8 : 0,
            strokeWeight: this.showBoundary ? 3 : 0,
            zIndex: 2 // 在灰色覆盖之上
          };
        } else if (featureType === 'tree' || !featureType) {
          // 树木数据点 - 平衡性能和视觉效果
          const color = feature.getProperty('color');
          const zoom = this.map.getZoom() || 12;
          // 动态半径计算，高zoom级别增大圆圈
          let scale;
          if (zoom <= 12) {
            scale = Math.max(2, Math.min(3, zoom - 9)); // 低缩放：2-3px
          } else if (zoom <= 16) {
            scale = Math.max(1.5, Math.min(3, (zoom - 12) * 0.3 + 3)); // 中缩放：1.5-3px
          } else if (zoom <= 18) {
            scale = Math.max(4, Math.min(5, zoom - 14)); // 高缩放：4-5px
          } else if (zoom <= 19) {
            scale = Math.max(6, Math.min(8, zoom - 17)); // 超高缩放19：6-8px
          } else {
            scale = Math.max(8, Math.min(10, zoom - 18)); // 极高缩放20+：8-10px
          }
          return {
            fillColor: color || '#2EAF62',
            fillOpacity: 0.7,
            strokeColor: color || '#2EAF62',
            strokeOpacity: 1,
            strokeWeight: 1,
            zIndex: 3, // 在最上层
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: scale, // 根据缩放级别调整大小
              fillColor: color || '#2EAF62',
              fillOpacity: 0.7,
              strokeColor: color || '#2EAF62',
              strokeWeight: 1
            }
          };
        } else {
          // 其他类型的要素，使用默认样式
          return {
            fillColor: 'transparent',
            fillOpacity: 0,
            strokeColor: 'transparent',
            strokeOpacity: 0,
            strokeWeight: 0
          };
        }
      });
    }
  },
  mounted() {
    // Kick off the map when component is mounted
    // 组件挂载后初始化地图
    this.initMap();
  }
}
</script>

<style scoped>
.map-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px; /* 与其它页面一致的中心宽度 */
  margin: 0 auto;
  padding: 20px 24px 40px;
}

.map-title {
  font-family: var(--font-heading, 'Questrial', sans-serif);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 400;
  text-align: center;
  margin: 10px 0 8px;
}

.map-subtitle {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 16px;
  text-align: center;
  color: #555;
  margin: 0 0 14px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-label { font-size: 14px; color: #333; }
.filter-select {
  height: 34px;
  padding: 6px 10px;
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  font-family: var(--font-body, 'Inter', sans-serif);
}

.legend { display: flex; align-items: center; gap: 12px; margin-left: 12px; }
.legend-item { font-size: 13px; color: #333; display: inline-flex; align-items: center; gap: 6px; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.dot.safe { background: #2EAF62; }
.dot.risk { background: #E64A3B; }

.map-container {
  width: 100%;
  max-width: 680px; /* 限制最大宽度 */
  height: 680px; /* 更高的正方形 */
  margin: 0 auto; /* 居中显示 */
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08); /* 添加阴影 */
}

.empty-hint {
  text-align: center;
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}


.zoom-display {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-left: 20px;
  white-space: nowrap;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  color: #666;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
