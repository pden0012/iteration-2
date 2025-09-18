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
      <select id="filterSelect" class="filter-select" v-model="allergenicity" @change="refreshMarkers">
        <option value="2">Show All</option>
        <option value="1">Show Only Safe</option>
        <option value="0">Show Only Risk</option>
      </select>

      <div class="legend">
        <span class="legend-item"><span class="dot safe"></span>Safe</span>
        <span class="legend-item"><span class="dot risk"></span>Risk</span>
      </div>
    </div>

    <!-- Map container -->
    <!-- 地图容器：Leaflet 会把地图渲染在这里 -->
    <div id="leafletMap" class="map-container" ref="mapEl"></div>
  </div>
  
</template>

<script>
export default {
  name: 'AllergenMap',
  data() {
    return {
      // current filter: 0 Risk, 1 Safe, 2 All
      // 当前筛选：0风险 1安全 2全部
      allergenicity: '2',
      map: null,        // Leaflet map instance
      leaflet: null,    // Loaded Leaflet namespace
      markersLayer: null // Layer group for markers
    };
  },
  methods: {
    async loadLeafletIfNeeded() {
      // Dynamically load Leaflet CSS & JS from CDN when first used
      // 动态加载Leaflet资源：不用安装包，开箱即用
      if (this.leaflet) return this.leaflet;
      await new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.onload = resolve; document.head.appendChild(link);
      });
      const L = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.body.appendChild(script);
      });
      this.leaflet = L;
      return L;
    },
    async initMap() {
      // Initialize map centered on Melbourne
      // 初始化地图，默认中心在墨尔本
      const L = await this.loadLeafletIfNeeded();
      const el = this.$refs.mapEl;
      if (!el) return;
      this.map = L.map(el).setView([-37.8136, 144.9631], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);
      this.map.on('moveend', this.refreshMarkers);
      await this.refreshMarkers();
    },
    getApiUrl() {
      // Build API URL using env config (same style as dashboard)
      // 拼API地址：沿用dashboard的代理/直连逻辑
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const bounds = this.map?.getBounds();
      const zoom = this.map?.getZoom() || 12;
      // bbox format: south,west,north,east
      const s = bounds.getSouth().toFixed(6);
      const w = bounds.getWest().toFixed(6);
      const n = bounds.getNorth().toFixed(6);
      const e = bounds.getEast().toFixed(6);
      const bbox = `${s},${w},${n},${e}`;
      const original = `http://13.236.162.216:8080/map/tree?allergenicity=${this.allergenicity}&zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
      if (apiBase.includes('allorigins') || apiBase.endsWith('url=')) {
        return `${apiBase}${encodeURIComponent(original)}`;
      } else if (apiBase) {
        return `${apiBase}/map/tree?allergenicity=${this.allergenicity}&zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
      }
      return original;
    },
    async refreshMarkers() {
      // Fetch points from backend and render markers
      // 拉取后端数据并渲染标记
      if (!this.map) return;
      try {
        const url = this.getApiUrl();
        const res = await fetch(url);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const L = this.leaflet;
        this.markersLayer.clearLayers();
        list.forEach(item => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!isFinite(lat) || !isFinite(lng)) return;
          const isSafe = String(item.allergenicity) === '1';
          const color = isSafe ? '#2EAF62' : '#E64A3B';
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            color,
            fillColor: color,
            fillOpacity: 0.9,
            weight: 1
          });
          const riskLabel = isSafe ? 'Safe' : 'Risk';
          const popup = `<div style="font-family: Inter, sans-serif; font-size:12px;">
              <strong>${item.commonName || 'Tree'}</strong><br/>
              <em>${item.scientificName || ''}</em><br/>
              Risk Level: <span style="color:${color}; font-weight:600;">${riskLabel}</span>
            </div>`;
          marker.bindPopup(popup);
          marker.addTo(this.markersLayer);
        });
      } catch (e) {
        console.error('Failed to load map data', e);
      }
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
  height: 540px; /* 足够浏览标记 */
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
}
</style>


