<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- Website Logo -->
        <div class="logo">
          <img src="/images/prototype images/logo.png" alt="HayFree Logo" class="logo-image">
        </div>
        
        <!-- Navigation Menu -->
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
    
    <!-- Main Content Area -->
    <main class="main-content">
              <HomePage v-if="currentView === 'home'"
                @feature-button-clicked="onHomeFeatureButton"
              />
        <Dashboard v-else-if="currentView === 'dashboard'" />
        <Resources v-else-if="currentView === 'resources'" @navigate-to-symptoms="navigateToSymptoms" />
        <Symptoms v-else-if="currentView === 'symptoms'" />
        <div v-else class="coming-soon">
        <h2>Coming Soon</h2>
        <p>This page is under development.</p>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <p>&copy; {{ currentYear }} HayFree. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue'
import Dashboard from './views/Dashboard.vue'
import Resources from './views/Resources.vue'
import Symptoms from './views/Symptoms.vue'

export default {
  name: 'App',
  components: {
    HomePage,
    Dashboard,
    Resources,
    Symptoms
  },
  data() {
    return {
      activeItem: 'home',
      currentView: 'home', // Current active view
      navItems: [
        { id: 'home', text: 'Home', href: '#home' },
        { id: 'dashboard', text: 'Pollen Dashboard', href: '#dashboard' },
        { id: 'map', text: 'Allergen Map', href: '#map' },
        { id: 'trends', text: 'Trends', href: '#trends' },
        { id: 'resources', text: 'Resources', href: '#resources' },
        { id: 'support', text: 'Support', href: '#support' }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    setActiveItem(itemId) {
      this.activeItem = itemId;
      this.currentView = itemId; // Switch to the corresponding view
      // Update URL hash
      window.location.hash = `#${itemId}`;
    },
    
    // Navigate to symptoms page from resources
    // 从资源页面导航到症状页面
    navigateToSymptoms() {
      this.currentView = 'symptoms';
      this.activeItem = 'resources'; // Keep resources highlighted in nav
      window.location.hash = '#symptoms';
    },
    onHomeFeatureButton(id) {
      // Hero CTA 或 "View Dashboard/Visit Resources"等按钮点击回调
      if (id === 'tracker') {
        this.currentView = 'dashboard';
        this.activeItem = 'dashboard';
        window.location.hash = '#dashboard';
      } else if (id === 'education') {
        // 如果未来需要跳转到资源
        this.currentView = 'resources';
        this.activeItem = 'resources';
        window.location.hash = '#resources';
      }
    },
    
    // Handle browser back/forward and direct URL access
    handleHashChange() {
      const hash = window.location.hash.substring(1) || 'home';
      const validViews = ['home', 'dashboard', 'map', 'trends', 'resources', 'support', 'symptoms'];
      
      if (validViews.includes(hash)) {
        this.currentView = hash;
        this.activeItem = hash === 'symptoms' ? 'resources' : hash;
      } else {
        // Default to home for invalid hashes
        this.currentView = 'home';
        this.activeItem = 'home';
        window.location.hash = '#home';
      }
    }
  },
  
  mounted() {
    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', this.handleHashChange);
    // Handle initial page load
    this.handleHashChange();
  },
  
  beforeUnmount() {
    // Clean up event listener
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

/* Website logo container */
/* 网站logo容器 - 导航栏左上角的logo区域 */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Logo image styling */
/* Logo图片样式 - 实际的logo图片显示
   - height: 120px logo高度120像素(原60px的两倍)
   - width: auto 宽度自动适应，保持图片比例
   - object-fit: contain 图片完整显示，保持原始比例 */
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

/* Coming Soon page styling */
/* Coming Soon页面样式
   - display: flex 弹性布局
   - flex-direction: column 垂直排列
   - align-items: center 水平居中
   - justify-content: center 垂直居中
   - min-height: 60vh 最小高度为视口高度的60%
   - text-align: center 文本居中
   - padding: 40px 内边距40像素 */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
}

/* Coming Soon title */
/* Coming Soon标题
   - font-family: 'Questrial', sans-serif 使用Questrial字体
   - font-size: 48px 字体大小48像素
   - color: #239BA7 使用主要品牌颜色
   - margin: 0 0 16px 底部外边距16像素 */
.coming-soon h2 {
  font-family: 'Questrial', sans-serif;
  font-size: 48px;
  color: #239BA7;
  margin: 0 0 16px;
}

/* Coming Soon description */
/* Coming Soon描述
   - font-family: 'Inter', sans-serif 使用Inter字体
   - font-size: 18px 字体大小18像素
   - color: #666 灰色文本
   - margin: 0 无外边距 */
.coming-soon p {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #666;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
</style>
