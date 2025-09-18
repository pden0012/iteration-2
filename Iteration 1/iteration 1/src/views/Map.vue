<template>
  <div class="map-page">
    <h1 class="map-title">Allergy Exposure Map</h1>
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
    <div ref="mapEl" class="map-container"></div>
  </div>
</template>

<script>
export default {
  name: 'AllergenMap',
  data() {
    return {
      allergenicity: '2',
      map: null,
      markersLayer: []
    };
  },
  methods: {
    loadGoogleIfNeeded() {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (window.google && window.google.maps) return Promise.resolve(window.google);
      return new Promise((resolve, reject) => {
        const existing = document.getElementById('google-maps-sdk');
        if (existing) { existing.onload = () => resolve(window.google); return; }
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.async = true; script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key || ''}`;
        script.onload = () => resolve(window.google);
        script.onerror = reject;
        document.body.appendChild(script);
      });
    },
    async initMap() {
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
      this.map.addListener('idle', this.refreshMarkers);
      await this.refreshMarkers();
    },
    getApiUrl() {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const bounds = this.map?.getBounds();
      const zoom = this.map?.getZoom() || 12;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const s = sw.lat().toFixed(6);
      const w = sw.lng().toFixed(6);
      const n = ne.lat().toFixed(6);
      const e = ne.lng().toFixed(6);
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
      if (!this.map) return;
      try {
        const url = this.getApiUrl();
        const res = await fetch(url);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        // clear
        this.markersLayer.forEach(m => m.setMap(null));
        this.markersLayer = [];
        list.forEach(item => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!isFinite(lat) || !isFinite(lng)) return;
          const isSafe = String(item.allergenicity) === '1';
          const color = isSafe ? '#2EAF62' : '#E64A3B';
          const marker = new window.google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: color,
            fillOpacity: 0.9,
            center: { lat, lng },
            radius: 15,
            map: this.map
          });
          const info = new window.google.maps.InfoWindow({
            content: `<div style=\"font-family: Inter, sans-serif; font-size:12px;\">\
              <strong>${item.commonName || 'Tree'}</strong><br/>\
              <em>${item.scientificName || ''}</em><br/>\
              Risk Level: <span style=\"color:${color}; font-weight:600;\">${isSafe ? 'Safe' : 'Risk'}</span>\
            </div>`
          });
          marker.addListener('click', () => info.open({ anchor: marker, map: this.map }));
          this.markersLayer.push(marker);
        });
      } catch (e) {
        console.error('Failed to load map data', e);
      }
    }
  },
  mounted() {
    this.initMap();
  }
}
</script>

<style scoped>
.map-page { box-sizing: border-box; width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px 24px 40px; }
.map-title { font-family: var(--font-heading, 'Questrial', sans-serif); font-size: clamp(28px, 4vw, 48px); font-weight: 400; text-align: center; margin: 10px 0 8px; }
.controls { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px; }
.filter-label { font-size: 14px; color: #333; }
.filter-select { height: 34px; padding: 6px 10px; border: 1px solid #D9D9D9; border-radius: 8px; font-family: var(--font-body, 'Inter', sans-serif); }
.legend { display: flex; align-items: center; gap: 12px; margin-left: 12px; }
.legend-item { font-size: 13px; color: #333; display: inline-flex; align-items: center; gap: 6px; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.dot.safe { background: #2EAF62; }
.dot.risk { background: #E64A3B; }
.map-container { width: 100%; height: 540px; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
</style>


