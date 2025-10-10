<template>
  <div class="map-page">
    <!-- page title -->
    <h1 class="map-title">Allergy Exposure Map</h1>
    <p class="map-subtitle">Explore Safe (green) and Risk (red) trees across Melbourne.</p>

    <!-- controls row: filter select + legend -->
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

      <!-- boundary toggle: whether to show municipal boundary -->
      <label class="boundary-toggle">
        <input type="checkbox" v-model="showBoundary" @change="toggleBoundary" />
        <span>Show Municipal Boundary</span>
      </label>
      
      
      <!-- zoom level display -->
      <div class="zoom-display">
        Zoom: {{ currentZoom }}
      </div>

      <!-- loading indicator -->
      <div v-if="isLoading" class="loading-indicator">
        <span class="spinner"></span>
        {{ loadingMessage }}
      </div>
      
      <!-- retry button for failed requests -->
      <button 
        v-if="emptyMessage && !isLoading && retryCount >= maxRetries" 
        @click="retryLoad" 
        class="retry-button"
      >
        🔄 Retry Loading
      </button>
      
      <!-- server status indicator -->
      <div v-if="serverStatus" class="server-status" :class="serverStatus.type">
        {{ serverStatus.message }}
      </div>
    </div>

    <!-- map container -->
    <div id="googleMap" class="map-container" ref="mapEl"></div>
  <div v-if="emptyMessage" class="empty-hint">{{ emptyMessage }}</div>
  </div>
  
</template>

<script>
export default {
  name: 'AllergenMap',
  data() {
    return {
      
      allergenicity: 'all',  
      map: null,        
      currentDataLayer: null, 
      infoWindow: null, 
      showBoundary: true, 
      boundaryAdded: false, 
      emptyMessage: '', 
      currentZoom: 12, 
      isLoading: false, 
      loadingMessage: 'Loading tree data...',
      retryCount: 0, 
      maxRetries: 3,
      retryDelay: 1000 // initial delay in milliseconds 
    };
  },
  methods: {
    // this method ensures Google Maps JS API is available
    // returns: Promise<google> resolves with window.google on success
    loadGoogleIfNeeded() {
      // check if Google Maps is already loaded
      if (window.google && window.google.maps) return Promise.resolve(window.google);
      
      // create a promise to load the API
      return new Promise((resolve, reject) => {
        // check if script is already being loaded
        const existing = document.getElementById('google-maps-sdk');
        if (existing) { 
          existing.onload = () => resolve(window.google); 
          return; 
        }
        
        // get the API key from environment variables
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key || key === 'your_google_maps_api_key_here') {
          console.error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.');
          reject(new Error('Google Maps API key not configured'));
          return;
        }
        
        // create script element to load Google Maps
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.async = true; 
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
        
        // handle successful loading
        script.onload = () => {
          console.log('Google Maps API loaded successfully');
          resolve(window.google);
        };
        
        // handle loading errors
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error);
          reject(new Error('Failed to load Google Maps API. Please check your API key and network connection.'));
        };
        
        // add script to document
        document.body.appendChild(script);
      });
    },
    // this method initializes the Google Map instance and events
    // returns: nothing, sets up idle/zoom listeners and loads data
    async initMap() {
      try {
        console.log('Starting map initialization...');
        
        // wait for Google Maps API to be loaded
        const google = await this.loadGoogleIfNeeded();
        console.log('Google Maps API loaded successfully');
        
        // get the map container element
        const el = this.$refs.mapEl;
        if (!el) {
          console.error('Map element not found');
          this.emptyMessage = 'Map container not found';
          return;
        }
        console.log('Map element found:', el);
        
        // create the Google Map instance centered on Melbourne
        this.map = new google.maps.Map(el, {
          center: { lat: -37.8136, lng: 144.9631 }, // Melbourne coordinates
          zoom: 12, // initial zoom level
          mapTypeControl: false, // hide map type controls
          streetViewControl: false, // hide street view controls
          fullscreenControl: false // hide fullscreen control
        });
        console.log('Google Map instance created successfully');
        
        // set up debounced refresh function to avoid too many API calls
        const debounced = this.debounce(this.refreshMarkers, 400); 
        this.map.addListener('idle', debounced);
        
        // track zoom level changes
        this.map.addListener('zoom_changed', () => {
          this.currentZoom = this.map.getZoom();
        });
        
        console.log('Starting initial data load...');
        // load initial tree data
        await this.refreshMarkers();
        
        // load municipal boundary data
        await this.loadMunicipalBoundary();
        
        // apply styling to all map layers
        this.applyDataLayerStyle();
        
        // set initial zoom level
        this.currentZoom = this.map.getZoom();
        console.log('Map initialization completed successfully');
      } catch (error) {
        console.error('Failed to initialize map:', error);
        this.emptyMessage = `Map initialization failed: ${error.message}`;
      }
    },
    // this method builds API URL using current bounds and zoom
    // returns: string|null complete url or null if map not ready
    getApiUrl() {
      // get current map bounds and zoom level
      const bounds = this.map?.getBounds();
      const zoom = this.map?.getZoom() || 12;
      if (!bounds) return null; // map not ready yet
      
      // extract corner coordinates from bounds
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const s = sw.lat().toFixed(6); // south latitude
      const w = sw.lng().toFixed(6); // west longitude  
      const n = ne.lat().toFixed(6); // north latitude
      const e = ne.lng().toFixed(6); // east longitude
      const bbox = `${s},${w},${n},${e}`; // bounding box string
      
      // determine API base URL based on environment
      const isDev = import.meta.env.DEV;
      const proxyBase = isDev ? '/api' : 'http://3.106.197.188:8080';
      
      // build the target URL based on filter selection
      let targetUrl;
      if (this.allergenicity === 'all') {
        // get all trees in current view
        targetUrl = `/map/tree?zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
      } else {
        // get filtered trees based on allergenicity
        targetUrl = `/map/tree?allergenicity=${this.allergenicity}&zoom=${zoom}&bbox=${encodeURIComponent(bbox)}`;
      }
      
      // combine base URL with target path
      const apiUrl = `${proxyBase}${targetUrl}`;
      
      console.log('Generated API URL:', apiUrl); 
      return apiUrl;
    },

    // this method fetches tree data and renders them on the data layer
    // returns: nothing; manages loading/retry and user messages
    async refreshMarkers() {
      // exit if map is not initialized
      if (!this.map) return;
      
      // handle "None" filter - clear all data
      if (this.allergenicity === '2') {
        this.clearData();
        this.emptyMessage = 'No trees displayed (None selected)';
        return;
      }
      
      try {
        // show loading indicator with appropriate message
        this.isLoading = true;
        this.loadingMessage = this.retryCount > 0 ? 
          `Retrying... (Attempt ${this.retryCount}/${this.maxRetries})` : 
          'Loading tree data...';
        // clear existing tree data
        this.clearData();
        
        // get the API URL for current map view
        const url = this.getApiUrl();
        if (!url) return; // map not ready
        
        console.log('Fetching data from:', url); 
        
        // make API request with extended timeout for large datasets
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(45000) // 45 second timeout for large tree datasets
        });
        
        // check if request was successful
        if (!res.ok) {
          // handle different HTTP error codes with specific messages
          if (res.status === 400) {
            throw new Error(`Bad Request (400): Invalid request parameters. Please try adjusting your view or filter.`);
          } else if (res.status === 500) {
            throw new Error(`Server Error (500): The backend API server is experiencing issues. Please try again later or contact support.`);
          } else if (res.status === 502) {
            throw new Error(`Bad Gateway (502): The proxy server cannot connect to the backend API server. The backend server may be down or unreachable.`);
          } else if (res.status === 503) {
            throw new Error(`Service Unavailable (503): The backend API server is temporarily unavailable. Please try again in a few minutes.`);
          } else if (res.status === 504) {
            throw new Error(`Gateway Timeout (504): The request took too long to process. Try zooming in to a smaller area.`);
          } else if (res.status === 404) {
            throw new Error(`Not Found (404): The requested tree data endpoint was not found. Please check the API configuration.`);
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}. Please check API server status.`);
          }
        }
        
        // parse response data
        const json = await res.json();
        console.log('Received data:', json); 
        
        // extract tree data from response
        const list = Array.isArray(json?.data) ? json.data : [];
        
        // render trees on map as GeoJSON
        this.renderAsGeoJSON(list, String(this.allergenicity));
        // apply visual styling to all map layers
        this.applyDataLayerStyle();
        
        // show message if no trees found or success message for large datasets
        if (list.length === 0) {
          this.emptyMessage = 'No trees in current view.';
        } else if (list.length > 1000) {
          this.emptyMessage = `Loaded ${list.length} trees. For faster loading, try zooming in to a smaller area.`;
        } else {
          this.emptyMessage = '';
        }
      } catch (e) {
        console.error('Failed to load map data', e);
        
        // handle retryable errors with exponential backoff
        const isRetryableError = e.name === 'AbortError' || e.name === 'TimeoutError' || 
                                e.message.includes('NetworkError') || e.message.includes('Failed to fetch') ||
                                e.message.includes('Server Error (500)') || e.message.includes('Bad Gateway (502)') ||
                                e.message.includes('Service Unavailable (503)') || e.message.includes('Gateway Timeout (504)');
        
        if (this.retryCount < this.maxRetries && isRetryableError) {
          this.retryCount++;
          console.log(`Retryable error detected, retrying data load (attempt ${this.retryCount}/${this.maxRetries})...`);
          
          // calculate exponential backoff delay
          const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
          
          // show retry message to user with countdown
          this.emptyMessage = `Connection issue detected, retrying... (Attempt ${this.retryCount}/${this.maxRetries})`;
          
          // retry after calculated delay
          setTimeout(() => {
            this.refreshMarkers();
          }, delay);
          return; 
        }
        
        // reset retry count for other errors
        this.retryCount = 0; 
        
        // show appropriate error message based on error type
        if (e.name === 'TimeoutError' || e.name === 'AbortError') {
          this.emptyMessage = '⏱️ Data loading timeout. The tree database is large and may take time to load. Please try again or zoom in to a smaller area for faster loading.';
        } else if (e.message.includes('NetworkError') || e.message.includes('Failed to fetch')) {
          this.emptyMessage = '🌐 Network connection error. Please check your internet connection and try again.';
        } else if (e.message.includes('Bad Request (400)')) {
          this.emptyMessage = '⚠️ Invalid request. Please try adjusting your map view or filter settings.';
        } else if (e.message.includes('Server Error (500)')) {
          this.emptyMessage = '🔧 Server error: The backend API server is experiencing issues. Please try again later or contact support.';
        } else if (e.message.includes('Bad Gateway (502)')) {
          this.emptyMessage = '🚫 Gateway error: Cannot connect to the backend API server. The server may be down or unreachable. Please try again later.';
        } else if (e.message.includes('Service Unavailable (503)')) {
          this.emptyMessage = '⚠️ Service temporarily unavailable. The backend server is being maintained. Please try again in a few minutes.';
        } else if (e.message.includes('Gateway Timeout (504)')) {
          this.emptyMessage = '⏱️ Request timeout. The server took too long to respond. Try zooming in to load fewer trees.';
        } else if (e.message.includes('Not Found (404)')) {
          this.emptyMessage = '🔍 API endpoint not found. Please check the configuration or contact support.';
        } else {
          this.emptyMessage = `❌ Error loading tree data: ${e.message}`;
        }
      } finally {
        // always hide loading indicator
        this.isLoading = false;
      }
    },

    
    // this method clears current tree features and closes infoWindow
    // returns: nothing; keeps boundary features intact
    clearData() {
      // remove tree features from map data layer
      if (this.map && this.map.data) {
        this.map.data.forEach((feature) => {
          const featureType = feature.getProperty('type');
          
          // only remove tree features, keep boundary features
          if (!featureType || featureType === 'tree') {
            this.map.data.remove(feature);
          }
        });
      }
      
      // close any open info windows
      if (this.infoWindow) this.infoWindow.close();
      
      // clear empty message
      this.emptyMessage = '';
      
      // reset current data layer reference
      this.currentDataLayer = null;
    },

    // this method converts tree data to GeoJSON format and adds it to the map
    // it creates markers for each tree with color coding based on allergenicity
    // parameters: list - array of tree data from API, filterSel - current filter selection
    // returns: nothing, but updates map with tree markers and click handlers
    renderAsGeoJSON(list, filterSel) {
      // exit if map not ready or no data
      if (!this.map || !list.length) return;
      
      // create unique layer ID for this data set
      const layerId = `trees_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.currentDataLayer = layerId;
      
      // convert tree data to GeoJSON format
      const geojson = {
        type: 'FeatureCollection',
        features: list.map(item => {
          // extract coordinates and validate them
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!isFinite(lat) || !isFinite(lng)) return null;
          
          // determine if tree is safe or risky based on allergenicity
          const val = String(item.allergenicity).toLowerCase();
          const isSafe = (val === '0' || val === 'safe' || val === 'true');
          
          // set color based on safety level
          const color = isSafe ? '#2EAF62' : '#E64A3B';
          
          // create GeoJSON feature for this tree
          return {
            type: 'Feature',
            properties: {
              type: 'tree', 
              layerId: layerId,
              commonName: item.commonName || 'Tree',
              scientificName: item.scientificName || '',
              allergenicity: item.allergenicity,
              isSafe: isSafe,
              color: color
            },
            geometry: {
              type: 'Point',
              coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
            }
          };
        }).filter(f => f !== null) // remove any invalid features
      };
      
      // add the GeoJSON data to the map
      this.map.data.addGeoJson(geojson);
      
      // apply visual styling to all map layers
      this.applyDataLayerStyle();
      
      // set up click handlers for tree markers
      if (!this.infoWindow) this.infoWindow = new window.google.maps.InfoWindow();
      this.map.data.addListener('click', (event) => {
        // get tree information from clicked feature
        const feature = event.feature;
        const commonName = feature.getProperty('commonName');
        const scientificName = feature.getProperty('scientificName');
        const isSafe = feature.getProperty('isSafe');
        const color = feature.getProperty('color');
        const riskLabel = isSafe ? 'Safe' : 'Risk';
        
        // create HTML content for info window
        const content = `<div style="font-family: Inter, sans-serif; font-size:12px;">
            <strong>${commonName}</strong><br/>
            <em>${scientificName}</em><br/>
            Risk Level: <span style="color:${color}; font-weight:600;">${riskLabel}</span>
          </div>`;
        
        // show info window at clicked location
        this.infoWindow.setContent(content);
        this.infoWindow.setPosition(event.latLng);
        this.infoWindow.open(this.map);
      });
    },


    // this method handles when user changes the filter dropdown
    // it refreshes the map data based on the new filter selection
    // returns: nothing, but updates map display with filtered data
    onFilterChange() {
      // handle "None" filter - clear all data and show message
      if (this.allergenicity === '2') {
        this.clearData();
        this.emptyMessage = 'No trees displayed (None selected)';
        this.isLoading = false;
        return;
      }
      
      // refresh markers with new filter
      this.refreshMarkers();
    },

    // this method handles manual retry button clicks
    // it resets retry count and attempts to load data again
    // returns: nothing, but resets retry state and loads data
    retryLoad() {
      console.log('Manual retry requested by user');
      this.retryCount = 0; // reset retry count
      this.emptyMessage = ''; // clear error message
      this.refreshMarkers(); // attempt to load data again
    },

    // this method creates a debounced version of a function to prevent too many calls
    // it delays execution until the function hasn't been called for the specified time
    // parameters: fn - function to debounce, wait - delay time in milliseconds
    // returns: function - debounced version of the input function
    debounce(fn, wait) {
      let t = null; // timeout reference
      return (...args) => {
        clearTimeout(t); // clear previous timeout
        t = setTimeout(() => fn.apply(this, args), wait); // set new timeout
      };
    },

    
    
    // this method loads municipal boundary data from CSV file and adds it to the map
    // it parses the CSV, extracts GeoJSON data, and creates boundary overlays
    // returns: nothing, but updates map with boundary visualization
    async loadMunicipalBoundary() {
      // exit if map not ready or boundary already loaded
      if (!this.map || this.boundaryAdded) return;
      try {
        console.log('Loading municipal boundary...');
        
        // fetch the CSV file containing boundary data
        const response = await fetch('/municipal-boundary.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log('CSV loaded, length:', text.length);
        
        // split into lines and filter out empty ones
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) {
          console.error('CSV file does not have enough lines');
          return;
        }
        
        console.log('CSV lines count:', lines.length);
        console.log('Header:', lines[0]);
        
        // find the column containing GeoJSON shape data
        const header = lines[0].split(',');
        const geoShapeIdx = header.findIndex(h => h.trim().toLowerCase().includes('geo shape'));
        console.log('Geo Shape column index:', geoShapeIdx);
        
        if (geoShapeIdx === -1) {
          console.error('Geo Shape column not found');
          return;
        }
        
        // parse the first data row, handling quoted CSV values
        const firstRow = lines[1];
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
        cols.push(cur); // add the last column
        
        console.log('Parsed columns count:', cols.length);
        const shapeRaw = cols[geoShapeIdx] || '';
        console.log('Raw shape data length:', shapeRaw.length);
        
        
        const jsonLike = shapeRaw.replace(/^"|"$/g, '').replace(/""/g, '"');
        console.log('Cleaned JSON length:', jsonLike.length);
        
        const shapeObj = JSON.parse(jsonLike);
        console.log('Parsed shape object:', shapeObj.type, shapeObj.coordinates?.length);
        
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
        
        
        const outerBounds = [
          [144.5, -37.5],  
          [145.5, -37.5],  
          [145.5, -38.5],  
          [144.5, -38.5],  
          [144.5, -37.5]   
        ];
        
        
        const boundaryWithHole = {
          type: 'Feature',
          properties: { 
            type: 'boundary_overlay', 
            name: 'Outside Boundary Overlay'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              outerBounds, 
              ...shapeObj.coordinates[0] 
            ]
          }
        };
        
        console.log('Adding boundary features to map...');
        
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

    // toggle boundary visibility
    toggleBoundary() {
      if (!this.map) return;
      if (this.showBoundary) {
        if (!this.boundaryAdded) this.loadMunicipalBoundary();
      }
      // reapply styles (will show/hide boundary based on showBoundary state)
      this.applyDataLayerStyle();
    },



    applyDataLayerStyle() {
      // unified data layer style application function
      if (!this.map) return;
      this.map.data.setStyle((feature) => {
        const featureType = feature.getProperty('type');
        
        if (featureType === 'boundary_overlay') {
          // gray overlay outside boundary
          return {
            fillColor: '#808080',
            fillOpacity: this.showBoundary ? 0.3 : 0, // reduce opacity
            strokeColor: 'transparent',
            strokeWeight: 0,
            zIndex: 1 // bottom layer
          };
        } else if (featureType === 'boundary_line') {
          // boundary line
          return {
            fillColor: this.showBoundary ? '#E0F7FA' : 'transparent',
            fillOpacity: this.showBoundary ? 0.1 : 0,
            strokeColor: this.showBoundary ? '#00BCD4' : 'transparent',
            strokeOpacity: this.showBoundary ? 0.8 : 0,
            strokeWeight: this.showBoundary ? 3 : 0,
            zIndex: 2 // above gray overlay
          };
        } else if (featureType === 'tree' || !featureType) {
          // tree data points - balance performance and visual effects
          const color = feature.getProperty('color');
          const zoom = this.map.getZoom() || 12;
          // dynamic radius calculation, increase circles at high zoom levels
          let scale;
          if (zoom <= 12) {
            scale = Math.max(2, Math.min(3, zoom - 9)); 
          } else if (zoom <= 16) {
            scale = Math.max(1.5, Math.min(3, (zoom - 12) * 0.3 + 3)); 
          } else if (zoom <= 18) {
            scale = Math.max(4, Math.min(5, zoom - 14)); 
          } else if (zoom <= 19) {
            scale = Math.max(6, Math.min(8, zoom - 17)); 
          } else {
            scale = Math.max(8, Math.min(10, zoom - 18)); 
          }
          return {
            fillColor: color || '#2EAF62',
            fillOpacity: 0.7,
            strokeColor: color || '#2EAF62',
            strokeOpacity: 1,
            strokeWeight: 1,
            zIndex: 3, // top layer
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: scale, // adjust size based on zoom level
              fillColor: color || '#2EAF62',
              fillOpacity: 0.7,
              strokeColor: color || '#2EAF62',
              strokeWeight: 1
            }
          };
        } else {
          // other feature types use default styles
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
    
    // initialize map after component is mounted
    this.initMap();
  }
}
</script>

<style scoped>
.map-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px; /* consistent center width with other pages */
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
  max-width: 900px; 
  aspect-ratio: 16 / 9; 
  margin: 0 auto; 
  padding: 0 16px; 
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08); 
}


@media (max-width: 767px) {
  .map-container {
    max-width: 100%;
    margin: 0 12px; 
    aspect-ratio: 4 / 3; 
    border-radius: 8px; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
}


@media (min-width: 768px) and (max-width: 1023px) {
  .map-container {
    max-width: 720px;
    margin: 0 24px; 
    aspect-ratio: 16 / 9; 
    border-radius: 10px;
  }
}


@media (min-width: 1024px) and (max-width: 1439px) {
  .map-container {
    max-width: 800px;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
  }
}


@media (min-width: 1440px) {
  .map-container {
    max-width: 900px;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
  }
}


@media (max-width: 319px) {
  .map-container {
    margin: 0 8px;
    aspect-ratio: 1 / 1; 
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
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

.retry-button {
  background: #239BA7;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background: #1e8a94;
}

.retry-button:active {
  background: #1a7a84;
}
</style>
