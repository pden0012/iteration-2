<template>
  <div class="dashboard">
    <!-- page container with center column and side gutters -->
    <div class="page-container">
      
      <!-- header section with title, timestamp and location dropdown -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1 class="dashboard-title">{{ dashboardData.title }}</h1>
          <p class="last-updated">{{ dashboardData.lastUpdated }}</p>
        </div>
        <div class="header-right">
          <!-- location autocomplete dropdown -->
          <div class="location-select">
            <div class="autocomplete">
              <input
                v-model="locationQuery"
                @input="onQueryChange"
                @focus="openSuggestions"
                @keydown.enter.prevent="confirmFirstSuggestion"
                type="text"
                class="location-input"
                placeholder="Search suburb"
                autocomplete="off"
              />
              <ul v-if="showSuggestions && filteredAddresses.length" class="suggestions">
                <li
                  v-for="addr in filteredAddresses"
                  :key="addr"
                  @mousedown.prevent="selectAddress(addr)"
                  class="suggestion-item"
                >{{ addr }}</li>
              </ul>
            </div>
            <button class="confirm-button" @click="confirmLocation">Confirm</button>
          </div>
        </div>
      </header>

      <!-- main content grid with two columns -->
      <section class="main-content">
        <div class="content-grid">
          
          <!-- left column - pollen index chart -->
          <div class="chart-section">
            <h3 class="section-title">{{ chartData.title }}</h3>
            <div class="chart-container">
              <!-- circular pollen index chart -->
              <div class="pollen-chart">
                <!-- donut ring driven by css variables -->
                <div
                  class="chart-circle"
                  :style="{ '--progress': pollenProgress, '--ring-color': chartRingColor }"
                >
                  <!-- center text -->
                  <div class="chart-center">
                    <span class="pollen-level" :style="{ color: chartTextColor }">{{ pollenData.level }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            
          </div>

          <!-- right column - allergen levels list -->
          <div class="allergen-section">
            <!-- alert banner above allergen levels -->
            <div class="alert-banner" :class="alertVariant">
              <span class="alert-text">🌤️ {{ alertMessage }}</span>
            </div>
            
            <h3 class="section-title">{{ allergenData.title }}</h3>
            
            <!-- allergen levels list -->
            <div class="allergen-list">
              <div 
                v-for="allergen in allergenData.levels" 
                :key="allergen.id"
                class="allergen-item"
              >
                <div class="allergen-info">
                  <div class="allergen-icon">
                    <img :src="allergen.icon" :alt="allergen.name + ' icon'" />
                  </div>
                  <span class="allergen-name">{{ allergen.name }}</span>
                </div>
                <span class="allergen-level" :class="allergen.levelClass">
                  {{ allergen.level }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- climate & dispersion section below the main dashboard -->
      <section class="climate-section">
        <!-- scatter plot: rainfall vs wind with medians -->
        <div class="viz-card">
          <h4 class="viz-title">Melbourne — Pollen-friendly vs Pollen-suppressing months</h4>
          <svg
            v-if="scatterViz"
            class="chart-svg"
            :width="scatterViz.width"
            :height="scatterViz.height"
            role="img"
            aria-label="Monthly average rainfall versus wind speed scatter plot"
          >
            <!-- Axes -->
            <line :x1="scatterViz.padLeft" :y1="scatterViz.padTop + scatterViz.plotH" :x2="scatterViz.padLeft + scatterViz.plotW" :y2="scatterViz.padTop + scatterViz.plotH" class="axis" />
            <line :x1="scatterViz.padLeft" :y1="scatterViz.padTop" :x2="scatterViz.padLeft" :y2="scatterViz.padTop + scatterViz.plotH" class="axis" />

            <!-- Median dashed lines -->
            <line :x1="scatterViz.medianX" :y1="scatterViz.padTop" :x2="scatterViz.medianX" :y2="scatterViz.padTop + scatterViz.plotH" class="median-line" />
            <line :x1="scatterViz.padLeft" :y1="scatterViz.medianY" :x2="scatterViz.padLeft + scatterViz.plotW" :y2="scatterViz.medianY" class="median-line" />

            <!-- Points -->
            <g v-for="pt in scatterViz.points" :key="pt.month">
              <circle :cx="pt.x" :cy="pt.y" r="5" class="dot" />
              <text :x="pt.x + 6" :y="pt.y - 6" class="dot-label">{{ pt.month_abbr }}</text>
            </g>

            <!-- Axis labels -->
            <text :x="scatterViz.padLeft + scatterViz.plotW/2" :y="scatterViz.padTop + scatterViz.plotH + 32" class="axis-label" text-anchor="middle">Monthly average rainfall (mm)</text>
            <text :x="scatterViz.padLeft - 34" :y="scatterViz.padTop + scatterViz.plotH/2" class="axis-label" transform="rotate(-90, {{scatterViz.padLeft - 34}}, {{scatterViz.padTop + scatterViz.plotH/2}})" text-anchor="middle">Monthly average wind (km/h)</text>
          </svg>
        </div>

        <!-- stacked bar: seasonal contributions -->
        <div class="viz-card">
          <h4 class="viz-title">Melbourne — What’s driving dispersion by season?</h4>
          <svg
            v-if="stackedViz"
            class="chart-svg"
            :width="stackedViz.width"
            :height="stackedViz.height"
            role="img"
            aria-label="Seasonal stacked contributions chart"
          >
            <!-- Axes -->
            <line :x1="stackedViz.padLeft" :y1="stackedViz.padTop + stackedViz.plotH" :x2="stackedViz.padLeft + stackedViz.plotW" :y2="stackedViz.padTop + stackedViz.plotH" class="axis" />
            <line :x1="stackedViz.padLeft" :y1="stackedViz.padTop" :x2="stackedViz.padLeft" :y2="stackedViz.padTop + stackedViz.plotH" class="axis" />

            <!-- Bars -->
            <g v-for="bar in stackedViz.bars" :key="bar.season">
              <g v-for="seg in bar.segments" :key="seg.key">
                <rect :x="bar.x" :y="seg.y" :width="bar.width" :height="seg.h" :fill="seg.color" />
              </g>
              <text :x="bar.x + bar.width/2" :y="stackedViz.padTop + stackedViz.plotH + 16" class="tick" text-anchor="middle">{{ bar.shortLabel }}</text>
            </g>

            <!-- Legend -->
            <g class="legend" :transform="`translate(${stackedViz.padLeft}, ${stackedViz.padTop - 10})`">
              <g v-for="(lg, i) in stackedViz.legend" :key="lg.key" :transform="`translate(${i*140}, 0)`">
                <rect width="12" height="12" :fill="lg.color" rx="2" ry="2" />
                <text x="18" y="11" class="legend-label">{{ lg.label }}</text>
              </g>
            </g>
          </svg>
        </div>

        <!-- Short centered explanation below charts -->
        <!-- short explanation below charts: English content, keep concise and centered -->
        <p class="viz-note">
          Wind, fewer rainy days and drier afternoon air make pollen spread farther. 
          Use this view to spot months and seasons when dispersion is likely higher in Melbourne.
        </p>
      </section>

    </div>

    <!-- Blue separator bar -->
    <!-- blue separator bar -->
    <div class="separator-bar"></div>

    <!-- Tips Section - Quick tips and advice -->
    <!-- tips section - quick tips and advice -->
    <section class="tips-section">
      <div class="tips-container">
        <div class="tips-content">
          <!-- Left section - icon and title -->
          <!-- left section - icon and title -->
          <div class="tips-left">
            <div class="tips-icon">
              <img src="/images/prototype images/image.png" alt="Tips icon" />
            </div>
            <h2 class="tips-title">{{ tipsData.title }}</h2>
          </div>
          
          <!-- Right section - text content -->
          <!-- right section - text content -->
          <div class="tips-text">
            <p class="tip-main">{{ tipsData.mainTip }}</p>
            <p class="tip-description">{{ tipsData.description }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>


import scatterJson from '../../Iteration 1 Data/melbourne_scatter_points.json';
import seasonalJson from '../../Iteration 1 Data/melbourne_seasonal_contributions.json';
export default {
  name: 'Dashboard',
  data() {
    return {
      // dashboard main data
      dashboardData: {
        title: 'Pollen & Allergen Tracker',
        lastUpdated: 'Last updated 21-08-2025 11:43'
      },
      
      
      chartData: {
        title: 'Current Pollen Index',
        size: '342 x 342' 
      },
      
      
      pollenData: {
        level: 'Low', // current pollen level: Low/Medium/High
        
      },
      
      
      allergenData: {
        title: 'Current Allergen Levels',
        levels: [
          {
            id: 'tree',
            name: 'Tree',
            level: 'Moderate',
            levelClass: 'moderate',
            icon: '/images/prototype images/image copy.png', 
            iconColor: '#4CAF50' 
            
          },
          {
            id: 'grass',
            name: 'Grass', 
            level: 'Moderate',
            levelClass: 'moderate',
            icon: '/images/prototype images/image copy 2.png', // grass icon
            iconColor: '#8BC34A' 
          },
          {
            id: 'ragweed',
            name: 'Ragweed',
            level: 'Moderate', 
            levelClass: 'moderate',
            icon: '/images/prototype images/image copy 3.png', 
            iconColor: '#2E7D32' 
          },
          {
            id: 'dust',
            name: 'Dust',
            level: 'Moderate',
            levelClass: 'moderate', 
            icon: '/images/prototype images/image copy 4.png', 
            iconColor: '#FFC107' 
          }
        ]
      },
      
      
      tipsData: {
        title: 'Quick Tip',
        mainTip: 'Shower and change clothes as soon as you come indoors.',
        description: 'This helps wash pollen off your skin and hair, and prevents it from spreading onto your bedding and furniture, reducing nighttime symptoms.'
      },
      
      
      selectedLocation: '', 
      locationQuery: 'Melbourne', 
      addressList: [], 
      filteredAddresses: [], 
      showSuggestions: false, 
      alertMessage: 'Great day to enjoy the outdoors!', 
      alertVariant: 'normal', // alert style normal(yellow) / danger(red)
      pollenProgress: 25, 
      chartRingColor: '#C8E6C9', 
      chartTextColor: '#1E1E1E'  
      ,
      
      scatterViz: null,   
      stackedViz: null    
    }
  },
  
  methods: {
    // this method updates the "Last updated" timestamp to current time
    // it formats the date and time in DD-MM-YYYY HH:MM AM/PM format
    // returns: nothing, but updates dashboardData.lastUpdated
    updateLastUpdated() {
      // helper function to pad numbers with leading zeros
      const pad = (n) => String(n).padStart(2, '0');
      const now = new Date();
      // convert 24-hour format to 12-hour format
      const hours24 = now.getHours();
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
      // format the date string
      const formatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(hours12)}:${pad(now.getMinutes())} ${ampm}`;
      this.dashboardData.lastUpdated = `Last updated ${formatted}`;
    },
    
    
    // this method loads the address list from CSV file for location autocomplete
    // it fetches the CSV, parses it, and filters addresses based on current query
    // returns: nothing, but updates addressList and filteredAddresses
    async loadAddresses() {
      try {
        // fetch the CSV file containing all addresses
        const res = await fetch('/address/address.csv');
        const text = await res.text();
        // split into lines and clean up
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        // extract first column (address) from each line
        const addresses = lines.map(l => l.split(',')[0].trim()).filter(Boolean);
        // remove duplicates and store
        this.addressList = Array.from(new Set(addresses));
        // filter addresses based on current query
        this.filteredAddresses = this.filterByQuery(this.locationQuery);
      } catch (e) {
        console.error('Failed to load addresses CSV', e);
      }
    },

    
    // this method initializes the climate visualization charts
    // it loads scatter plot and stacked bar chart data from JSON files
    // returns: nothing, but updates scatterViz and stackedViz data
    initClimateViz() {
      try {
        // build scatter plot visualization from JSON data
        this.scatterViz = this.buildScatterViz(scatterJson);
      } catch (e) {
        console.error('Failed to init scatter viz', e);
      }
      try {
        // build stacked bar chart visualization from JSON data
        this.stackedViz = this.buildStackedViz(seasonalJson);
      } catch (e) {
        console.error('Failed to init stacked viz', e);
      }
    },

    
    
    // this method builds scatter plot visualization data from JSON
    // it calculates scales, positions points, and sets up median lines
    // parameters: json - the scatter plot data from JSON file
    // returns: object - visualization configuration with points and scales
    buildScatterViz(json) {
      // set chart dimensions
      const width = 560;    
      const height = 380;   
      const padLeft = 56; // left padding for y-axis
      const padRight = 16; // right padding
      const padTop = 18; // top padding
      const padBottom = 46; // bottom padding for x-axis
      const plotW = width - padLeft - padRight; // plot area width
      const plotH = height - padTop - padBottom; // plot area height
      
      // extract data points from JSON
      const points = Array.isArray(json?.points) ? json.points : [];
      const rainVals = points.map(p => p.rain_mm); // rainfall values
      const windVals = points.map(p => p.wind_kmh); // wind speed values
      
      // calculate data ranges for scaling
      const minRain = Math.min(...rainVals);
      const maxRain = Math.max(...rainVals);
      const minWind = Math.min(...windVals);
      const maxWind = Math.max(...windVals);
      
      // create scaling functions to map data to pixel coordinates
      const xScale = (v) => padLeft + ((v - minRain) / (maxRain - minRain)) * plotW;
      const yScale = (v) => padTop + (1 - (v - minWind) / (maxWind - minWind)) * plotH;
      
      // map all points to pixel coordinates
      const mapped = points.map(p => ({
        ...p,
        x: xScale(p.rain_mm), // x position based on rainfall
        y: yScale(p.wind_kmh) // y position based on wind speed
      }));
      
      // calculate median positions for reference lines
      const rainMed = Number(json?.medians?.rain_median ?? (minRain + maxRain) / 2);
      const windMed = Number(json?.medians?.wind_median ?? (minWind + maxWind) / 2);
      
      // return complete visualization configuration
      return {
        width, height, padLeft, padTop, plotW, plotH,
        points: mapped,
        medianX: xScale(rainMed), // median line x position
        medianY: yScale(windMed) // median line y position
      };
    },

    
    
    // this method builds stacked bar chart visualization data from JSON
    // it creates bars for each season with stacked segments for different factors
    // parameters: json - the seasonal data from JSON file
    // returns: object - visualization configuration with bars and legend
    buildStackedViz(json) {
      // set chart dimensions
      const width = 560;
      const height = 340;
      const padLeft = 56; // left padding for y-axis
      const padRight = 16; // right padding
      const padTop = 28; // top padding
      const padBottom = 40; // bottom padding for x-axis
      const plotW = width - padLeft - padRight; // plot area width
      const plotH = height - padTop - padBottom; // plot area height
      
      // extract data from JSON
      const data = Array.isArray(json?.data) ? json.data : [];
      const barGap = 22; // space between bars
      const barWidth = (plotW - barGap * (data.length - 1)) / Math.max(data.length, 1);
      
      // define colors for different factors
      const colors = {
        wind: '#4A9EFF',         // blue for wind
        dryDays: '#F2A737',      // orange for dry days
        dryAir: '#82D9B4'        // green for dry air
      };
      
      // create bars for each season
      const bars = data.map((row, i) => {
        const x = padLeft + i * (barWidth + barGap); // bar x position
        
        // extract contribution values for each factor
        const vWind = Number(row.contrib_wind || 0);
        const vDryDays = Number(row.contrib_dry_days || 0);
        const vDryAir = Number(row.contrib_dry_air || 0);
        
        // calculate heights for each segment
        const hWind = vWind * plotH;
        const hDryDays = vDryDays * plotH;
        const hDryAir = vDryAir * plotH;
        
        // calculate y positions for stacking segments
        const yWind = padTop + plotH - hWind; // bottom segment
        const yDryDays = yWind - hDryDays; // middle segment
        const yDryAir = yDryDays - hDryAir; // top segment
        
        return {
          season: row.season,
          shortLabel: (row.season || '').split(' ')[0], // first word of season name
          x,
          width: barWidth,
          segments: [
            { key: 'wind', y: yWind, h: hWind, color: colors.wind },
            { key: 'dryDays', y: yDryDays, h: hDryDays, color: colors.dryDays },
            { key: 'dryAir', y: yDryAir, h: hDryAir, color: colors.dryAir }
          ]
        };
      });
      
      // create legend configuration
      const legend = [
        { key: 'wind', label: 'Wind (dispersion)', color: colors.wind },
        { key: 'dryDays', label: 'Dry days (less rain)', color: colors.dryDays },
        { key: 'dryAir', label: 'Dry air (lower 3pm humidity)', color: colors.dryAir }
      ];
      
      return { width, height, padLeft, padTop, plotW, plotH, bars, legend };
    },

    // this method handles when user types in the location search input
    // it filters the address list and shows suggestions dropdown
    // returns: nothing, but updates filteredAddresses and showSuggestions
    onQueryChange() {
      this.filteredAddresses = this.filterByQuery(this.locationQuery);
      this.showSuggestions = true;
    },
    
    // this method handles when user focuses on the location input
    // it shows the suggestions dropdown with filtered addresses
    // returns: nothing, but updates filteredAddresses and showSuggestions
    openSuggestions() {
      this.filteredAddresses = this.filterByQuery(this.locationQuery);
      this.showSuggestions = true;
    },
    
    // this method handles when user presses Enter in the location input
    // it selects the first suggestion from the filtered list
    // returns: nothing, but calls selectAddress with first suggestion
    confirmFirstSuggestion() {
      if (this.filteredAddresses.length) this.selectAddress(this.filteredAddresses[0]);
    },
    
    // this method filters the address list based on user query
    // it performs case-insensitive search and limits results to 20 items
    // parameters: q - the search query string
    // returns: array - filtered list of addresses matching the query
    filterByQuery(q) {
      const query = (q || '').toLowerCase();
      if (!query) return this.addressList.slice(0, 20); // show first 20 if no query
      return this.addressList.filter(a => a.toLowerCase().includes(query)).slice(0, 20);
    },
    
    // this method handles when user selects an address from suggestions
    // it updates the input value and hides the suggestions dropdown
    // parameters: addr - the selected address string
    // returns: nothing, but updates locationQuery and showSuggestions
    selectAddress(addr) {
      this.locationQuery = addr;
      this.showSuggestions = false;
    },

    // this method handles when user clicks the Confirm button for location
    // it validates the location and loads data for the selected location
    // returns: nothing, but updates selectedLocation and loads dashboard data
    confirmLocation() {
      // try to find exact match in address list
      const match = this.addressList.find(a => a.toLowerCase() === this.locationQuery.toLowerCase());
      if (match) {
        // exact match found, use it
        this.selectedLocation = match;
        this.loadDataForLocation(this.selectedLocation);
        this.updateLastUpdated();
      } else {
        // no exact match, try to use first suggestion
        if (this.filteredAddresses.length) {
          this.selectedLocation = this.filteredAddresses[0];
          this.locationQuery = this.selectedLocation;
          this.loadDataForLocation(this.selectedLocation);
          this.updateLastUpdated();
        }
      }
    },
    
    
    // load data for specific location
    async loadDataForLocation(location) {
      try {
        
        const isDev = import.meta.env.DEV;
        let url;
        if (isDev) {
          url = `/api/dashboard?suburb=${encodeURIComponent(location)}&format=json`;
        } else {
          
          const backendUrl = `http://13.236.162.216:8080/dashboard?suburb=${encodeURIComponent(location)}&format=json`;
          url = `https://api.allorigins.win/raw?url=${encodeURIComponent(backendUrl)}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        const item = Array.isArray(json?.data) ? (json.data[0] || {}) : (json?.data || {});
        const toLevel = (v) => this.mapBackendLevelToUi(String(v || '').toLowerCase());

        if (item.pollen) {
          this.pollenData.level = this.mapBackendLevelToUi(String(item.pollen).toLowerCase());
          this.pollenProgress = this.levelToProgress(this.pollenData.level);
        }

        const mapping = {
          
          tree: this.mapPollenLevel(toLevel(item.tree)),
          grass: this.mapPollenLevel(toLevel(item.grass)),
          ragweed: this.mapPollenLevel(toLevel(item.ragweed)),
          
          dust: (() => {
            const dustUi = this.mapBackendLevelToUi(String(item.dust || '').toLowerCase());
            if (dustUi === 'Good') return 'Very Low';
            if (dustUi === 'Fair') return 'Low';
            if (dustUi === 'Poor') return 'Moderate';
            if (dustUi === 'Very Poor') return 'High';
            if (dustUi === 'Extremely Poor') return 'Very High';
            return 'None';
          })()
        };
        this.allergenData.levels = this.allergenData.levels.map(row => {
          const key = row.id;
          const level = mapping[key] || row.level;
          return { ...row, level, levelClass: this.levelToClass(level, key) };
        });

        
        // recalculate overall index based on four items
        this.recalculateOverallIndex();
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      }
    },

    mapBackendLevelToUi(v) {
      
      // keep backend original terms, only standardize case style
      if (!v || v === 'null' || v === 'none') return 'Unknown';
      if (v.includes('very low')) return 'Very Low';
      if (v === 'low') return 'Low';
      if (v === 'moderate' || v === 'medium') return 'Moderate';
      if (v === 'high') return 'High';
      if (v === 'very high') return 'Very High';
      if (v === 'good') return 'Good';
      if (v === 'fair') return 'Fair';
      if (v === 'poor') return 'Poor';
      if (v === 'very poor') return 'Very Poor';
      if (v === 'extremely poor') return 'Extremely Poor';
      if (v === 'no data') return 'None';
      return v.charAt(0).toUpperCase() + v.slice(1);
    },

    
    // normalize pollen levels
    mapPollenLevel(v) {
      const l = (v || '').toLowerCase();
      if (!l || l === 'unknown' || l === 'none' || l === 'no data') return 'None';
      if (l.includes('very low')) return 'Very Low';
      if (l === 'low') return 'Low';
      if (l === 'moderate' || l === 'medium') return 'Moderate';
      if (l === 'high') return 'High';
      if (l === 'very high') return 'Very High';
      return 'None';
    },

    
    // normalize dust levels
    mapDustLevel(v) {
      const l = (v || '').toLowerCase();
      if (!l || l === 'unknown' || l === 'none' || l === 'no data') return 'None';
      if (l === 'good') return 'Good';
      if (l === 'fair') return 'Fair';
      if (l === 'poor') return 'Poor';
      if (l === 'very poor') return 'Very Poor';
      if (l === 'extremely poor') return 'Extremely Poor';
      return 'None';
    },
    levelToClass(level, key) {
      const l = (level || '').toLowerCase();
      
      if (l === 'none') return 'none';
      if (l.includes('very low')) return 'very-low';
      if (l === 'low') return 'low';
      if (l === 'moderate') return 'moderate';
      if (l === 'high') return 'high';
      if (l === 'very high') return 'very-high';
      return 'none';
    },
    levelToProgress(level) {
      const l = (level || '').toLowerCase();
      if (l.includes('very low')) return 10;
      if (l === 'low') return 25;
      if (l === 'moderate') return 55;
      if (l === 'high') return 75;
      if (l === 'very high') return 90;
      return 30;
    },

    
    
    levelToScore(key, level) {
      const l = (level || '').toLowerCase();
      
      if (l === 'none') return null;
      if (l.includes('very low')) return 1;
      if (l === 'low') return 2;
      if (l === 'moderate') return 3;
      if (l === 'high') return 4;
      if (l === 'very high') return 5;
      return null;
    },

    
    // calculate average score and update left circular chart
    recalculateOverallIndex() {
      const scores = this.allergenData.levels
        .map(row => this.levelToScore(row.id, row.level))
        .filter(v => typeof v === 'number');
      if (!scores.length) {
        this.pollenData.level = 'None';
        this.pollenProgress = 10;
        this.chartRingColor = this.colorForOverall('None');
        this.chartTextColor = this.textColorForOverall('None');
        const advisory = this.advisoryForLevel('Very Low');
        this.alertMessage = advisory.message;
        this.alertVariant = advisory.variant;
        return;
      }
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const rounded = Math.round(avg); 
      const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
      const level = labels[Math.max(1, Math.min(5, rounded)) - 1];
      this.pollenData.level = level;
      
      this.pollenProgress = 10 + (rounded - 1) * 20;
      this.chartRingColor = this.colorForOverall(level);
      this.chartTextColor = this.textColorForOverall(level);
      const advisory = this.advisoryForLevel(level);
      this.alertMessage = advisory.message;
      this.alertVariant = advisory.variant;
    },

    
    // return ring color based on overall level
    colorForOverall(level) {
      const l = (level || '').toLowerCase();
      
      // use same background color as right side badges
      if (l === 'none') return '#EEEEEE';
      if (l.includes('very low')) return '#5CB88F'; 
      if (l === 'low') return '#8AD9BC';            
      if (l === 'moderate') return '#FFD79A';       
      if (l === 'high') return '#FFA8A8';           
      if (l === 'very high') return '#FF7A7A';      
      return '#9EE6C6';
    },

    
    // text color: give slightly darker color based on level
    textColorForOverall(level) {
      const l = (level || '').toLowerCase();
      if (l === 'none') return '#6B7280';
      if (l.includes('very low')) return '#2E7D32';
      if (l === 'low') return '#2F855A';
      if (l === 'moderate') return '#C05621';
      if (l === 'high') return '#C53030';
      if (l === 'very high') return '#9B2C2C';
      return '#2F855A';
    },

    
    advisoryForLevel(level) {
      const l = (level || '').toLowerCase();
      if (l.includes('very low')) return { message: 'Great day to enjoy the outdoors!', variant: 'normal' };
      if (l === 'low') return { message: 'Good conditions — outdoor activities are fine.', variant: 'normal' };
      if (l === 'moderate') return { message: 'Moderate — consider a mask if you are sensitive.', variant: 'normal' };
      if (l === 'high') return { message: 'High levels — limit outdoor time and keep meds handy.', variant: 'danger' };
      if (l === 'very high') return { message: 'Very high — stay indoors if possible and close windows.', variant: 'danger' };
      return { message: 'Great day to enjoy the outdoors!', variant: 'normal' };
    }
  },
  
  watch: {},

  
  // ensure addresses are loaded when component mounts, and try to fetch data with current input
  mounted() {
    this.loadAddresses().then(() => {
      
      if (this.locationQuery) {
        this.loadDataForLocation(this.locationQuery);
      }
    });
    
    this.chartRingColor = this.colorForOverall(this.pollenData.level);
    this.chartTextColor = this.textColorForOverall(this.pollenData.level);
      
      // initialize local climate visualization
      this.initClimateViz();
  }
}
</script>

<style scoped>


:root {
  --primary-color: #239BA7;
  --secondary-color: #F9D65C;
  --text-primary: #000000;
  --text-secondary: #1E1E1E;
  --text-muted: #757575;
  --background-white: #FFFFFF;
  --background-off-white: #FFFDFD;
  --border-light: rgba(0, 0, 0, 0.1);
  --border-medium: #D9D9D9;
  --chart-blue: #4A9EFF;
  --chart-green: #4CAF50;
  --font-heading: 'Questrial', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-content: 'AR One Sans', sans-serif;
}


/* Dashboard container - main page wrapper
   - width: 100% fills parent container width
   - max-width: 100vw limits maximum width to viewport width
   - overflow-x: hidden hides horizontal overflow
   - background: var(--background-white) uses white background variable */
.dashboard {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background: var(--background-white);
}


/* 页面容器 - 中心栏加两侧留白
   - max-width: 1200px 最大宽度1200像素
   - margin: 0 auto 水平居中
   - padding: 0 24px 左右内边距24像素 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}


/* Dashboard头部 - 标题、时间戳和控制组件
   - display: grid 网格布局
   - grid-template-columns: 1fr auto 左栏占剩余空间，右栏自适应内容
   - align-items: start 顶部对齐
   - gap: 12px 24px 行间距12px，列间距24px
   - padding: 32px 0 24px 上下内边距：顶部32px，底部24px */
.dashboard-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 12px 24px;
  padding: 32px 0 24px;
}


/* 头部左侧区域 - 标题和时间戳
   - display: flex 弹性布局
   - flex-direction: column 垂直排列
   - gap: 20px 项目间距20像素，增加标题与时间戳间距 */
.header-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


/* 头部右侧区域 - 控制组件
   - display: flex 弹性布局
   - align-items: center 垂直居中
   - justify-content: flex-end 右对齐
   - gap: 12px 项目间距12像素 */
.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}


/* 主Dashboard标题
   - font-family: var(--font-heading) 使用标题字体变量Questrial
   - font-size: clamp(40px, 4vw, 64px) 响应式字体：最小40px，最大64px
   - font-weight: 400 字体粗细400(正常)
   - line-height: 1 行高为1倍字体大小
   - color: var(--text-primary) 使用主要文本颜色变量(黑色)
   - margin: 0 0 8px 底部外边距8像素 */
.dashboard-title {
  font-family: var(--font-heading);
  font-size: clamp(40px, 4vw, 64px);
  font-weight: 400;
  line-height: 1;
  margin: 0;
  white-space: normal;
  color: var(--text-primary);
}


/* 最后更新时间戳
   - font-family: var(--font-heading) 使用标题字体变量Questrial
   - font-size: clamp(16px, 2vw, 32px) 响应式字体大小
   - color: var(--text-primary) 使用主要文本颜色(黑色)
   - margin: 0 无外边距 */
.last-updated {
  font-family: var(--font-heading);
  font-size: 22px;
  color: #4A6F6A; 
  margin: 0;
}


/* 地点选择下拉框
   - margin: 0 移除所有外边距
   - display: flex 弹性布局
   - align-items: center 垂直居中 */
.location-select {
  margin: 0;
  display: flex;
  align-items: center;
}


.autocomplete {
  position: relative;
  width: 260px;
}


.location-input {
  width: 100%;
}


.confirm-button {
  margin-left: 10px;
  height: 36px;
  padding: 8px 16px;
  background: #239BA7; /* brand primary */
  color: #FFFFFF;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.05s ease;
}

.confirm-button:hover {
  background: #1e8892;
}

.confirm-button:active {
  transform: translateY(1px);
}


.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow: auto;
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  list-style: none;
  margin: 0;
  padding: 6px 0;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #F6F6F6;
}

/* 输入框样式 */
.location-input {
  width: 220px;                     /* 稍微宽一点，内容不会挤 */
  height: 36px;                     /* 更矮一些 */
  padding: 6px 10px;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 15px;
  background: var(--background-white, #fff);
  border: 1px solid var(--border-medium, #ddd);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* 聚焦状态：更明显的边框和阴影 */
.location-input:focus {
  border-color: #239BA7;            /* 青绿色边框 */
  box-shadow: 0 0 0 2px rgba(35, 155, 167, 0.2);
}


/* 警报横幅 - 警告消息
   - display: inline-flex 内联弹性布局
   - align-items: center 垂直居中
   - gap: 8px 项目间距8像素
   - padding: 8px 12px 内边距：上下8px，左右12px
   - background: var(--secondary-color) 使用次要颜色背景(黄色#F9D65C)
   - border-radius: 12px 圆角12像素
   - align-self: flex-start 在父容器中左对齐 */
.alert-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F9D65C !important; 
  border-radius: 12px;
  align-self: flex-start;
}

/* danger variant (for High/Very High) */
.alert-banner.danger {
  background: #FFCDD2 !important;
}


/* 警报文本样式
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: 14px 字体大小14像素
   - font-weight: 400 字体粗细400(正常)
   - color: #2C2C2C 深灰色文本 */
.alert-text {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: #2C2C2C;
  background: transparent;
  border: 0;
}


/* 主内容区域
   - padding: 40px 0 上下内边距40像素 */
.main-content {
  padding: 40px 0;
}


/* 内容网格 - 双列布局
   - display: grid 网格布局
   - grid-template-columns: 1fr 1fr 两列等宽布局
   - gap: 60px 网格间距60像素
   - align-items: flex-start 顶部对齐 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: flex-start;
}


/* 区域标题 - 图表和过敏原标题的共享样式
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: clamp(20px, 2.5vw, 32px) 响应式字体大小
   - font-weight: 400 字体粗细400(正常)
   - color: var(--text-primary) 主要文本颜色(黑色)
   - margin: 0 0 30px 底部外边距30像素
   - text-align: center 文本居中 */
.section-title {
  font-family: var(--font-body);
  font-size: clamp(20px, 2.5vw, 32px);
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 30px;
  text-align: center;
}


/* 区域标题 - 不同区域的对齐方式 */
.chart-section .section-title {
  text-align: center; /* 图表标题居中对齐，与按钮保持一致 */
}

.allergen-section .section-title {
  text-align: left; /* 过敏原标题左对齐 */
}


/* 图表区域 - 左栏
   - width: 100% 占满网格单元格宽度
   - display: flex 弹性布局
   - flex-direction: column 垂直排列
   - align-items: flex-start 左对齐，与右栏保持一致
   - padding-top: 56px 顶部内边距，与右栏警报横幅高度匹配 */
.chart-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 56px;
}


/* 图表容器 - 圆形图表包装器
   - position: relative 相对定位
   - margin-bottom: 30px 底部外边距30像素 */
.chart-container {
  position: relative;
  margin-bottom: 30px;
}


/* 花粉图表 - 圆形进度图表
   - position: relative 相对定位
   - width: 342px 宽度342像素(与设计图一致)
   - height: 342px 高度342像素(与设计图一致)
   - margin: 0 auto 水平居中 */
.pollen-chart {
  position: relative;
  width: 342px;
  height: 342px;
  margin: 0 auto;
}


/* 图表圆圈 - 带蓝色边框的外圆
   - position: relative 相对定位
   - width: 100% 占满容器宽度
   - height: 100% 占满容器高度
   - border: 3px solid var(--chart-blue) 3像素蓝色边框
   - border-radius: 50% 圆形
   - display: flex 弹性布局
   - align-items: center 垂直居中
   - justify-content: center 水平居中
   - background: #f8f9fa 浅灰色背景 */

.chart-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: grid;
  place-items: center;
}


.chart-circle::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    var(--ring-color, #82D9B4) calc(var(--progress, 0) * 1%),
    #F6F7F9 0
  );
  mask: radial-gradient(circle at center, transparent 52%, #fff 53%);
  -webkit-mask: radial-gradient(circle at center, transparent 52%, #fff 53%);
}




/* 图表中心 - 带等级文本的内圆
   - position: absolute 绝对定位
   - top: 50% 垂直居中
   - left: 50% 水平居中
   - transform: translate(-50%, -50%) 居中对齐
   - width: 250px 宽度250像素
   - height: 250px 高度250像素
   - background: var(--background-white) 白色背景
   - border-radius: 50% 圆形
   - display: flex 弹性布局
   - align-items: center 垂直居中
   - justify-content: center 水平居中
   - z-index: 10 层级10，确保在进度弧之上 */
.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  background: var(--background-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}


/* 花粉等级文本 - "Low"指示器
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: clamp(32px, 4vw, 48px) 响应式字体大小
   - font-weight: 600 字体粗细600(粗体)
   - color: var(--primary-color) 使用主要颜色(青蓝色)
   - text-align: center 文本居中 */
.pollen-level {
  font-family: var(--font-body);
  font-size: clamp(24px, 3.2vw, 40px);
  font-weight: 600;
  color: var(--primary-color);
  text-align: center;
}


/* 图表角落控制点 - 蓝色方形指示器
   - position: absolute 绝对定位
   - width: 8px 宽度8像素
   - height: 8px 高度8像素
   - background: var(--chart-blue) 图表蓝色背景
   - border-radius: 1px 圆角1像素 */
.chart-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--chart-blue);
  border-radius: 1px;
}


.chart-handle.top-left {
  top: -4px;
  left: -4px;
}

.chart-handle.top-right {
  top: -4px;
  right: -4px;
}

.chart-handle.bottom-left {
  bottom: -4px;
  left: -4px;
}

.chart-handle.bottom-right {
  bottom: -4px;
  right: -4px;
}


/* 图表尺寸指示器 - 尺寸显示
   - position: absolute 绝对定位
   - bottom: -40px 距离图表底部40像素
   - left: 50% 水平居中
   - transform: translateX(-50%) 居中对齐
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: 14px 字体大小14像素
   - font-weight: 600 字体粗细600(粗体)
   - background: var(--chart-blue) 图表蓝色背景
   - color: white 白色文本
   - padding: 6px 12px 内边距：上下6px，左右12px
   - border-radius: 4px 圆角4像素 */
.chart-size {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  background: var(--chart-blue);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
}



/* 气候可视化区域容器：竖向堆叠两个图表卡片 */
.climate-section {
  margin-top: 60px; 
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 区块整体居中 */
  gap: 16px; /* 两图更集中，减少垂直间距 */
}


/* 可视化卡片外框：白底、轻边框与圆角 */
.viz-card {
  width: 100%;
  max-width: 640px;  /* 稍微更窄，让两图更集中 */
  margin: 0 auto;    /* 卡片居中 */
  background: var(--background-white);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 14px 12px 10px;
}


/* 图表下方的简短说明：居中、窄行宽、弱化色 */
.viz-note {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}


/* 可视化小标题 */
.viz-title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 6px;
  text-align: left;
}



.chart-svg { display: block; width: 100%; height: auto; }
.axis { stroke: #C7CCD1; stroke-width: 1; }
.median-line { stroke: #C9A74E; stroke-width: 1.5; stroke-dasharray: 4 4; }
.dot { fill: #F2A737; }
.dot-label { font-family: var(--font-body); font-size: 12px; fill: #333; }
.axis-label { font-family: var(--font-body); font-size: 12px; fill: #333; }
.tick { font-family: var(--font-body); font-size: 12px; fill: #333; }
.legend-label { font-family: var(--font-body); font-size: 12px; fill: #333; }


/* 过敏原区域 - 右栏
   - width: 100% 占满网格单元格宽度
   - display: flex 弹性布局
   - flex-direction: column 垂直排列
   - gap: 16px 项目间距16像素 */
.allergen-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}


/* 过敏原列表 - 过敏原项目容器
   - display: flex 弹性布局
   - flex-direction: column 垂直排列
   - gap: 16px 项目间距16像素
   - margin-bottom: 40px 底部外边距40像素 */
.allergen-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}


/* 单个过敏原项目
   - display: flex 弹性布局
   - justify-content: space-between 两端对齐
   - align-items: center 垂直居中
   - padding: 16px 20px 内边距：上下16px，左右20px
   - background: var(--background-white) 白色背景
   - border: 1px solid var(--border-light) 浅色边框
   - border-radius: 12px 圆角12像素
   - box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) 轻微阴影效果 */
.allergen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--background-white);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}


/* 过敏原信息 - 图标和名称容器
   - display: flex 弹性布局
   - align-items: center 垂直居中
   - gap: 12px 项目间距12像素 */
.allergen-info {
  display: flex;
  align-items: center;
  gap: 8px;
}


/* 过敏原图标样式
   - font-size: 24px 图标大小24像素
   - width: 32px 宽度32像素
   - height: 32px 高度32像素
   - display: flex 弹性布局
   - align-items: center 垂直居中
   - justify-content: center 水平居中 */
.allergen-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}


/* 过敏原图标图片样式 */
.allergen-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}


/* 过敏原名称文本
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: 18px 字体大小18像素
   - font-weight: 500 字体粗细500(中等粗体)
   - color: var(--text-secondary) 次要文本颜色(深灰色) */
.allergen-name {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-secondary);
}


/* 过敏原等级指示器
   - font-family: var(--font-body) 使用正文字体变量Inter
   - font-size: 16px 字体大小16像素
   - font-weight: 600 字体粗细600(粗体)
   - padding: 6px 12px 内边距：上下6px，左右12px
   - border-radius: 20px 圆角20像素 */
.allergen-level {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}


/* 中等等级样式 - 橙色背景
   - background: #FFF3E0 浅橙色背景
   - color: #F57C00 橙色文本 */
.allergen-level.moderate {
  background: #FFF3E0;
  color: #F57C00;
}


/* 低等级样式 - 绿色背景
   - background: #E8F5E8 浅绿色背景
   - color: #4CAF50 绿色文本 */
.allergen-level.low {
  background: #E8F5E8; 
  color: #43A047;
}


/* 很低等级样式 - 更柔和的绿色 */
.allergen-level.very-low {
  background: #C8E6C9; 
  color: #2E7D32;     
}


/* 很高等级样式 - 深红色 */
.allergen-level.very-high {
  background: #FFCDD2;
  color: #C62828;
}


/* 高等级样式 - 红色背景
   - background: #FFEBEE 浅红色背景
   - color: #F44336 红色文本 */
.allergen-level.high {
  background: #FFEBEE;
  color: #F44336;
}


/* 良好等级样式 - 蓝色色调 */
.allergen-level.good {
  background: #C8E6C9; 
  color: #2E7D32;
}


/* 较差等级样式 - 橙红色调 */
.allergen-level.poor {
  background: #FBE9E7;
  color: #E64A19;
}


/* 一般等级样式 - 黄色 */
.allergen-level.fair {
  background: #FFF3E0; 
  color: #F57C00;
}


/* 很差等级样式 - 强红色 */
.allergen-level.very-poor {
  background: #FFCDD2; 
  color: #C62828;
}


/* 极差等级样式 - 最深红 */
.allergen-level.extremely-poor {
  background: #FFCDD2;
  color: #B71C1C;
}

/* None/No data level styling - gray */
/* 无数据/无花粉 等级样式 - 灰色 */
.allergen-level.none {
  background: #EEEEEE;
  color: #616161;
}


/* 未知等级样式 - 中性灰 */
.allergen-level.unknown {
  background: #EEEEEE;
  color: #616161;
}



/* 蓝色分隔条 - 区域间分隔线
   - width: 100% 占满容器宽度
   - height: 12px 高度12像素
   - background: var(--primary-color) 主要颜色背景(青蓝色)
   - border-radius: 1px 圆角1像素
   - margin: 40px 0 顶部和底部外边距40像素 */
.separator-bar {
  width: 100%;
  height: 12px;
  background: #239BA7 !important;
  border-radius: 1px;
  margin: 40px 0;
}


/* 提示区域 - 建议和指导
   - padding: 60px 0 上下内边距60像素
   - background: var(--background-off-white) 使用浅白色背景 */
.tips-section {
  padding: 60px 0;
  background: var(--background-off-white);
}


/* 提示容器 - 内容包装器
   - max-width: 1200px 最大宽度1200像素
   - margin: 0 auto 水平居中
   - padding: 0 24px 左右内边距24像素 */
.tips-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}


/* 提示内容 - 图标和文本布局
   - display: flex 弹性布局
   - align-items: flex-start 顶部对齐
   - gap: 30px 项目间距30像素 */
.tips-content {
  display: flex;
  align-items: center;
  gap: 30px;
}


/* 提示左侧区域 - 图标和标题 */
.tips-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}


/* 提示图标 - 图片图标
   - width: 80px 图标宽度80像素
   - height: 80px 图标高度80像素
   - flex-shrink: 0 不缩小
   - display: flex 弹性布局用于居中图片 */
.tips-icon {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* 提示图标图片样式 */
.tips-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}


/* 提示文本容器
   - flex: 1 占据剩余空间
   - text-align: left 文本左对齐 */
.tips-text {
  flex: 1;
  text-align: left;
}


/* 提示区域标题
   - font-family: var(--font-heading) 使用标题字体变量Questrial
   - font-size: clamp(32px, 3vw, 48px) 响应式字体大小
   - font-weight: 400 字体粗细400(正常)
   - color: var(--text-primary) 主要文本颜色(黑色)
   - margin: 0 0 20px 底部外边距20像素 */
.tips-title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 3vw, 48px);
  font-weight: 400;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}


/* 主要提示文本 - 主要建议
   - font-family: var(--font-content) 使用内容字体变量AR One Sans
   - font-size: clamp(24px, 2.5vw, 36px) 响应式字体大小
   - font-weight: 400 字体粗细400(正常)
   - line-height: 1.2 行高1.2倍
   - color: var(--text-primary) 主要文本颜色(黑色)
   - margin: 0 0 16px 底部外边距16像素 */
.tip-main {
  font-family: var(--font-content);
  font-size: clamp(22px, 2.2vw, 32px);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 16px;
}


/* 提示描述 - 解释性文本
   - font-family: var(--font-content) 使用内容字体变量AR One Sans
   - font-size: clamp(18px, 1.5vw, 24px) 响应式字体大小
   - font-weight: 400 字体粗细400(正常)
   - line-height: 1.2 行高1.2倍
   - color: var(--text-primary) 主要文本颜色(黑色)
   - margin: 0 无外边距 */
.tip-description {
  font-family: var(--font-content);
  font-size: clamp(14px, 1.2vw, 18px);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}


/* 响应式断点 */



@media (min-width: 1440px) {
  
  /* 增加页面容器内边距 */
  .page-container {
    padding: 0 40px;
  }
  
  
  /* 增加提示容器内边距 */
  .tips-container {
    padding: 0 40px;
  }
}



@media (min-width: 1200px) {
  
  /* 两列网格 - 等宽以获得更好的平衡 */
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}



@media (min-width: 768px) and (max-width: 1199px) {
  
  /* 减少内容网格间距 */
  .content-grid {
    gap: 40px;
    grid-template-columns: 1fr 1fr;
  }
  
  
  /* 中等屏幕调整图表大小 */
  .pollen-chart {
    width: 280px;
    height: 280px;
  }
  
  .chart-center {
    width: 200px;
    height: 200px;
  }
}



@media (max-width: 767px) {
  
  /* 单列网格 */
  .content-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  
  /* 头部项目垂直堆叠 */
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .header-right {
    align-items: flex-start;
    width: 100%;
  }
  
  
  /* 地点选择占满宽度 */
  .location-input {
    width: 100%;
  }
  
  
  /* 移动端调整图表大小 */
  .pollen-chart {
    width: 250px;
    height: 250px;
  }
  
  .chart-center {
    width: 180px;
    height: 180px;
  }
  
  
  /* 移动端调整提示布局 */
  .tips-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  
  /* 移动端居中提示图标 */
  .tips-icon {
    align-self: center;
  }
}
</style>