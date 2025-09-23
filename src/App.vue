<template>
  <div id="app">
    <!-- navigation bar at the top -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- website logo -->
        <div class="logo">
          <img src="/images/prototype images/logo.png" alt="HayFree Logo" class="logo-image">
        </div>
        
        <!-- navigation menu with all the pages -->
        <ul class="nav-menu">
          <li 
            v-for="item in navItems" 
            :key="item.id"
            class="nav-item"
            :class="{ active: activeItem === item.id }"
            @click="setActiveItem(item.id)"
          >
            <a :href="item.href" class="nav-link">{{ item.text }}</a>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- main content area where different pages show up -->
    <main class="main-content">
              <HomePage v-if="currentView === 'home'"
                @feature-button-clicked="onHomeFeatureButton"
              />
        <Dashboard v-else-if="currentView === 'dashboard'" />
        <MapView v-else-if="currentView === 'map'" />
        <Resources v-else-if="currentView === 'resources'" @navigate-to-symptoms="navigateToSymptoms" />
        <ImageDetection v-else-if="currentView === 'image'" />
        <Symptoms v-else-if="currentView === 'symptoms'" />
        <div v-else class="coming-soon">
        <h2>Coming Soon</h2>
        <p>This page is under development.</p>
      </div>
    </main>
    
    <!-- footer at the bottom -->
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; {{ currentYear }} HayFree. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
// import all the components we need
import HomePage from './components/HomePage.vue'
import Dashboard from './views/Dashboard.vue'
import Resources from './views/Resources.vue'
import Symptoms from './views/Symptoms.vue'
import MapView from './views/Map.vue'
import ImageDetection from './views/ImageDetection.vue'

export default {
  name: 'App',
  components: {
    HomePage,
    Dashboard,
    Resources,
    Symptoms,
    MapView,
    ImageDetection
  },
  data() {
    return {
      activeItem: 'home',  // which nav item is currently active
      currentView: 'home', // which page/view is currently showing
      navItems: [
        { id: 'home', text: 'Home', href: '#home' },
        { id: 'dashboard', text: 'Pollen Dashboard', href: '#dashboard' },
        { id: 'map', text: 'Allergen Map', href: '#map' },
        { id: 'image', text: 'Image Detection', href: '#image' },
        { id: 'trends', text: 'Trends', href: '#trends' },
        { id: 'resources', text: 'Resources', href: '#resources' },
        { id: 'support', text: 'Support', href: '#support' }
      ]
    }
  },
  computed: {
    // get current year for footer
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    // this method changes current active nav and view
    // params: itemId - which nav id to activate
    // returns: nothing, just update state and url hash
    setActiveItem(itemId) {
      this.activeItem = itemId;
      this.currentView = itemId;
      // update url hash so browser back/forward works
      window.location.hash = `#${itemId}`;
    },
    
    // this method is used by child (resources) to open symptoms view
    // returns: nothing, but switches view and keeps nav highlight on Resources
    navigateToSymptoms() {
      this.currentView = 'symptoms';
      this.activeItem = 'resources'; // keep resources highlighted in nav
      window.location.hash = '#symptoms';
    },
    
    // this method handles clicks from homepage feature cards/buttons
    // params: id - feature id from HomePage ('tracker'|'education'|'plant-identifier'|'map')
    // returns: nothing, but navigates to the mapped view and updates hash
    onHomeFeatureButton(id) {
      if (id === 'tracker') {
        this.currentView = 'dashboard';
        this.activeItem = 'dashboard';
        window.location.hash = '#dashboard';
      } else if (id === 'education') {
        this.currentView = 'resources';
        this.activeItem = 'resources';
        window.location.hash = '#resources';
      } else if (id === 'plant-identifier') {
        this.currentView = 'image';
        this.activeItem = 'image';
        window.location.hash = '#image';
      } else if (id === 'map') {
        this.currentView = 'map';
        this.activeItem = 'map';
        window.location.hash = '#map';
      }
    },
    
    // this method syncs current view with location.hash
    // used on initial load and when browser back/forward happens
    // returns: nothing, just updates state safely with a default fallback
    handleHashChange() {
      const hash = window.location.hash.substring(1) || 'home';
      const validViews = ['home', 'dashboard', 'map', 'image', 'trends', 'resources', 'support', 'symptoms'];
      
      if (validViews.includes(hash)) {
        this.currentView = hash;
        this.activeItem = hash === 'symptoms' ? 'resources' : hash;
      } else {
        // default to home for invalid hashes
        this.currentView = 'home';
        this.activeItem = 'home';
        window.location.hash = '#home';
      }
    }
  },
  
  mounted() {
    // listen for hash changes when user uses browser back/forward buttons
    window.addEventListener('hashchange', this.handleHashChange);
    // handle initial page load
    this.handleHashChange();
  },
  
  beforeUnmount() {
    // clean up event listener when component is destroyed
    window.removeEventListener('hashchange', this.handleHashChange);
  }
}
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1E1E1E;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
}

/* Navigation Bar Styles - Fixed for 100% width */
.navbar {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 105px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* Website logo container - left top logo area in navbar */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Logo image styling - keep aspect ratio and contain inside box */
.logo-image {
  height: 200px;
  width: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.nav-item.active {
  background: rgba(35, 139, 167, 0.25);
}

.nav-item:hover {
  background: rgba(35, 139, 167, 0.1);
}

/* keyboard focus styles for accessibility */
.nav-item:focus-visible,
.nav-link:focus-visible {
  outline: 2px solid #239BA7;
  outline-offset: 2px;
  border-radius: 10px;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 120%;
  color: #1E1E1E;
  text-decoration: none;
  white-space: nowrap;
}

/* Footer Styles */
.footer {
  background: #f5f5f5;
  padding: 20px 0;
  text-align: center;
  width: 100%;
}

.footer-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer p {
  color: #666;
  font-size: 14px;
}

/* Coming Soon page styling - centered layout with generous spacing */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
}

/* Coming Soon title - brand colored big heading */
.coming-soon h2 {
  font-family: 'Questrial', sans-serif;
  font-size: 48px;
  color: #239BA7;
  margin: 0 0 16px;
}

/* Coming Soon description - muted paragraph */
.coming-soon p {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* 📱 Responsive Navigation Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    padding: 8px 12px;
    gap: 12px;
  }
  
  .logo {
    margin-bottom: 8px;
  }
  
  .nav-menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    width: 100%;
  }
  
  .nav-item {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .nav-link {
    font-size: 14px;
  }
  
  .navbar {
    height: auto;
    min-height: 80px;
  }
}
</style>
