<template>
  <div class="homepage">
    <!-- hero section with main title and background -->
    <section class="hero-section">
      <div class="hero-background">
        <!-- decorative ellipse in background -->
        <div class="hero-ellipse"></div>
        <!-- hero image on the right -->
        <div class="hero-image"></div>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">{{ heroData.title }}</h1>
        <p class="hero-subtitle">{{ heroData.subtitle }}</p>
        <button class="hero-button" @click="goDashboard">
          <span>{{ heroData.buttonText }}</span>
        </button>
      </div>
    </section>

    <!-- info section in the middle -->
    <section class="info-section">
      <div class="page-container">
        <div class="info-container">
          <h2 class="info-title">{{ infoData.title }}</h2>
          <p class="info-description">{{ infoData.description }}</p>
        </div>
      </div>
    </section>

    <!-- features section with all the feature cards -->
    <section class="features-section">
      <div class="page-container">
        <div class="features-container">
          <h2 class="features-title">{{ featuresTitle }}</h2>
          
          <div class="features-grid">
            <div 
              v-for="feature in features" 
              :key="feature.id"
              class="feature-card"
              @click="handleFeatureClick(feature.id)"
            >
              <div class="feature-icon">
                <img :src="feature.iconText" :alt="feature.title + ' icon'" />
              </div>
              <h3 class="feature-card-title">{{ feature.title }}</h3>
              <p class="feature-card-description">{{ feature.description }}</p>
              <button class="feature-button" @click.stop="handleButtonClick(feature.id)">
                <span>{{ feature.buttonText }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // hero section data
      heroData: {
        title: 'Beat hay fever before it beats you',
        subtitle: 'Your partner in managing allergies daily',
        buttonText: "Check Today's Pollen"
      },
      featuresTitle: 'All the Tools You Need to Stay Ahead',
      // all the feature cards data
      features: [
        {
          id: 'tracker',
          title: 'Pollen & Allergen Tracker',
          description: 'Instantly see live Pollen Index, Tree, Grass, Ragweed, Dust levels for your location.',
          buttonText: 'Dashboard',
          iconText: '/images/prototype images/image copy 5.png'
        },
        {
          id: 'map',
          title: 'Locate Hotspots on the Map',
          description: 'Explore an interactive map of Victoria with allergen hotspots and safe zones.',
          buttonText: 'View Map',
          iconText: '/images/prototype images/image copy 7.png'
        },
        {
          id: 'challenge',
          title: 'Allergy-Free Garden Challenge',
          description: 'Learn, play and grow your understanding of pollen-causing plants through fun feedback and discovery.',
          buttonText: 'Play Now',
          iconText: '/images/prototype images/image copy 14.png'
        },
        {
          id: 'education',
          title: 'Educational Resource Hub',
          description: 'Articles, guides and tips for managing hay fever naturally and medically.',
          buttonText: 'Visit Resources',
          iconText: '/images/prototype images/image copy 6.png'
        },
        {
          id: 'support',
          title: 'Emergency & Health Support Hub',
          description: 'Get quick access to clinics, pharmacies and urgent care contacts.',
          buttonText: 'Get Support',
          iconText: '/images/prototype images/image copy 10.png'
        },
        {
          id: 'plant-identifier',
          title: 'Plant Risk Identifier',
          description: 'Upload a plant photo to instantly identify species and check hay fever risk levels.',
          buttonText: 'Find Now',
          iconText: '/images/prototype images/9951758450144_.pic.jpg'
        }
      ],
      // info section data
      infoData: {
        title: 'Take Control of Your Hay Fever',
        description: 'Our resources provide the information and tools you need to effectively manage hay fever and maintain your quality of life.'
      }
    }
  },
  methods: {
    // this method handles the "Get Started" button click (not currently used)
    // it logs the click and emits an event to parent component
    // returns: nothing, but emits get-started-clicked event
    handleGetStarted() {
      console.log('Get Started button clicked');
      this.$emit('get-started-clicked');
    },
    
    // this method handles the hero section "Check Today's Pollen" button click
    // it navigates to the dashboard/tracker feature
    // returns: nothing, but emits feature-button-clicked event with 'tracker'
    goDashboard() {
      this.$emit('feature-button-clicked', 'tracker');
    },
    
    // this method handles when user clicks on a feature card (not the button)
    // it logs the click and emits an event to parent component
    // parameters: featureId - the ID of the clicked feature card
    // returns: nothing, but emits feature-clicked event
    handleFeatureClick(featureId) {
      console.log('Feature card clicked:', featureId);
      this.$emit('feature-clicked', featureId);
    },
    
    // this method handles when user clicks on a feature card's button
    // it logs the click and emits an event to parent component for navigation
    // parameters: featureId - the ID of the clicked feature button
    // returns: nothing, but emits feature-button-clicked event
    handleButtonClick(featureId) {
      console.log('Feature button clicked:', featureId);
      this.$emit('feature-button-clicked', featureId);
    }
  }
}
</script>

<style scoped>
/* homepage container - controls page width and overflow
   - width: 100% sets container to fill parent element width
   - max-width: 100vw limits maximum width to viewport width, prevents horizontal scrolling
   - overflow-x: hidden hides horizontal overflow content */
.homepage {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* page container - center column + side gutters layout
   - max-width: 1200px maximum width 1200 pixels, limits content width
   - margin: 0 auto horizontally centered alignment
   - padding: 0 24px left and right padding 24 pixels, provides basic gutter space */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero area - top background section with main title and button
   - position: relative used as ref for absolutely positioned children
   - width: 100% fill container width
   - height: 824px fixed height
   - background: hero background image
   - background-size: cover fill whole section
   - background-position: center keep centered
   - background-repeat: no-repeat no repeat
   - overflow: hidden hide overflow of decorative shapes */
.hero-section {
  position: relative;
  width: 100%;
  height: 824px;
  background: url('/images/prototype images/background home page.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

/* Hero background wrapper - holds decorations and bg image
   - position: relative provides ref for absolute children
   - width: 100% fill
   - height: 100% same as hero */
.hero-background {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Decorative ellipse - translucent teal circle at top-right
   - position: absolute relative to hero-background
   - large width/height to overflow the container
   - shift to the right/top so it peeks in
   - background: rgba teal
   - border-radius: 50% make circle */
.hero-ellipse {
  position: absolute;
  width: 1219px;
  height: 1485px;
  right: -400px;
  top: -93px;
  background: rgba(125, 222, 221, 0.5);
  border-radius: 50%;
}

/* Hero image placeholder - right side character image area
   - absolute inside hero-background
   - fixed width/height
   - aligned to right with a top offset
   - background image set to contain and not repeat */
.hero-image {
  position: absolute;
  width: 720px;
  height: 720px;
  right: 0;
  top: 104px;
  background: url('/images/prototype images/home page.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center right;
}

/* Hero content wrapper - left text area with title/subtitle/button
   - position: absolute relative to hero-section
   - left/top offsets
   - z-index puts it above decorations
   - max-width limits long lines */
.hero-content {
  position: absolute;
  left: 80px;
  top: 120px;
  z-index: 2;
  max-width: 500px;
}

/* Hero title - very large white heading */
.hero-title {
  font-family: 'Questrial', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 92px;
  line-height: 1;
  color: #FFFFFF;
  margin-bottom: 20px;
  text-align: left;
}

/* Hero subtitle - medium white subtitle under title */
.hero-subtitle {
  font-family: 'Questrial', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 1;
  color: #FFFFFF;
  margin-bottom: 40px;
  text-align: left;
}

/* Hero action button - yellow CTA with rounded corners */
.hero-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px 32px;
  width: 280px;
  height: 56px;
  background: #F9D65C;
  border: 1px solid #F9D65C;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Hero button hover effect - darker yellow and slight lift */
.hero-button:hover {
  background: #f0c94a;
  transform: translateY(-2px);
}

/* Hero button label - strong readable dark text */
.hero-button span {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
  letter-spacing: -0.02em;
  color: #303030;
}

/* Features section - white container block with padding */
.features-section {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  max-width: 100vw;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  padding: 60px 0 100px;
}

/* Features container - teal rounded box with inner padding */
.features-container {
  position: relative;
  width: min(1040px, calc(100% - 64px));
  margin: 0 auto;
  background: #239BA7;
  border-radius: 51px;
  padding: 56px 32px 96px;
  overflow: visible;
  box-sizing: border-box;
}

/* Features title - large white heading */
.features-title {
  font-family: 'Questrial', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 48px;
  line-height: 1;
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 60px;
}

/* Features grid - responsive 3+3 layout */
/* Features grid layout - Professional 3+3 layout solution */
/* Features grid - professional 3+3 layout */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列网格，每列等宽 */
  grid-template-rows: auto auto;
  gap: 30px;
  justify-items: center;
  width: 100%;
}

/* Desktop: Simple 3+3 layout - each card takes one column */
/* Desktop: simple 3+3 layout - one column per card */
.feature-card:nth-child(1) { grid-column: 1; grid-row: 1; }
.feature-card:nth-child(2) { grid-column: 2; grid-row: 1; }
.feature-card:nth-child(3) { grid-column: 3; grid-row: 1; }
.feature-card:nth-child(4) { grid-column: 1; grid-row: 2; }
.feature-card:nth-child(5) { grid-column: 2; grid-row: 2; }
.feature-card:nth-child(6) { grid-column: 3; grid-row: 2; }

/* Tablet: 2 columns */
/* Tablet: 2 columns */
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto auto auto;
  }
  
  .feature-card:nth-child(1) { grid-column: 1; grid-row: 1; }
  .feature-card:nth-child(2) { grid-column: 2; grid-row: 1; }
  .feature-card:nth-child(3) { grid-column: 1; grid-row: 2; }
  .feature-card:nth-child(4) { grid-column: 2; grid-row: 2; }
  .feature-card:nth-child(5) { grid-column: 1; grid-row: 3; }
  .feature-card:nth-child(6) { grid-column: 2; grid-row: 3; }
}

/* Mobile: 1 column */
/* Mobile: 1 column */
@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
  }
  
  .feature-card {
    grid-column: 1 !important;
    grid-row: auto !important;
    justify-self: center !important;
  }
}
/* Feature card - white box with teal border and subtle shadow */
.feature-card {
  position: static;
  width: 100%;
  max-width: 240px;
  background: #FFFFFF;
  border: 2px solid #239BA7;
  border-radius: 30px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease;
  justify-self: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Feature card hover - lift up a bit */
.feature-card:hover {
  transform: translateY(-5px);
}

/* Feature icon container - square icon box on top */
.feature-icon {
  width: 68px;
  height: 68px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Feature icon image styling */
/* Feature icon image styling */
.feature-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
}

/* Ensure all icons have consistent sizing */
/* Ensure all icons have consistent size */
.feature-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.feature-card-title {
  width: 100%;
  height: 40px;
  font-family: 'Questrial', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #000000;
  margin-bottom: 10px;
}

.feature-card-description {
  width: 100%;
  height: 39px;
  font-family: 'Average Sans', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #000000;
  margin-bottom: 20px;
}

.feature-button {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px;
  gap: 8px;
  width: 133px;
  height: 25px;
  background: #F9D65C;
  border: 1px solid #F9D65C;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-button:hover {
  background: #f0c94a;
}

.feature-button span {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 100%;
  color: #303030;
}

/* Info section - white middle band with heading and description */
.info-section {
  position: relative;
  width: 100%;
  background: #FFFFFF;
  padding: 80px 0;
}

/* 信息内容容器 - 文字内容的直接容器
   - text-align: center 文字居中对齐 */
.info-container {
  text-align: center;
}

.info-title {
  font-family: 'Questrial', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 64px;
  line-height: 100%;
  color: #000000;
  margin-bottom: 40px;
  text-align: center;
}

.info-description {
  font-family: 'AR One Sans', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 40px;
  line-height: 120%;
  color: #000000;
  text-align: center;
  max-width: 1134px;
  margin: 0 auto;
}

/* Responsive Design */
/* 大屏幕响应式设计 - 1440px及以上屏幕 */
@media (min-width: 1440px) {
  /* Large screens - increase page container padding */
  /* large screens - increase page container paddings */
  .page-container {
    padding: 0 40px;
  }
}

@media (max-width: 1440px) {
  /* Large screens - adjust hero content position */
  /* large screens - adjust hero content position */
  .hero-content {
    left: 5%;
  }
}

/* 📱 Complete Responsive Design System for HomePage */
/* 📱 Mobile devices (320px - 767px) */
@media (max-width: 767px) {
  .page-container {
    padding: 0 16px;
  }
  
  .hero-content {
    left: 0;
    right: 0;
    width: 100%;
    padding: 0 20px;
  }
  
  .hero-title {
    font-size: clamp(36px, 8vw, 48px);
    width: 100%;
    height: auto;
    text-align: center;
  }
  
  .hero-subtitle {
    font-size: clamp(18px, 4vw, 24px);
    width: 100%;
    height: auto;
    text-align: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr; /* Mobile: single column */
    gap: 16px;
    padding: 0 8px;
  }
  
  .feature-card {
    width: 100%;
    max-width: 280px;
    height: auto;
    min-height: 180px;
    margin: 0 auto;
  }
  
  .info-title {
    font-size: clamp(28px, 6vw, 32px);
    width: 100%;
    height: auto;
    text-align: center;
  }
  
  .info-description {
    font-size: clamp(16px, 4vw, 20px);
    width: 100%;
    height: auto;
    text-align: center;
  }
}

/* 📱 Large mobile (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .hero-title {
    font-size: 48px;
  }
  
  .hero-subtitle {
    font-size: 24px;
  }
  
  .feature-card {
    max-width: 320px;
    min-height: 200px;
  }
  
  .info-title {
    font-size: 32px;
  }
  
  .info-description {
    font-size: 20px;
  }
}

/* 📱 Tablet devices (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .page-container {
    padding: 0 32px;
  }
  
  .hero-content {
    left: 4%;
    padding: 0 24px;
  }
  
  .hero-title {
    font-size: 56px;
  }
  
  .hero-subtitle {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
    gap: 24px;
  }
  
  .feature-card {
    max-width: none;
    min-height: 220px;
  }
  
  .info-title {
    font-size: 36px;
  }
  
  .info-description {
    font-size: 22px;
  }
}

/* 🖥️ Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .page-container {
    padding: 0 36px;
  }
  
  .hero-content {
    left: 5%;
  }
  
  .features-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
    gap: 28px;
  }
  
  .feature-card {
    min-height: 240px;
  }
}

/* 📱 Very small screens (<320px) */
@media (max-width: 319px) {
  .page-container {
    padding: 0 12px;
  }
  
  .hero-content {
    padding: 0 12px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .features-grid {
    gap: 12px;
  }
  
  .feature-card {
    max-width: 240px;
    min-height: 160px;
  }
  
  .info-title {
    font-size: 24px;
  }
  
  .info-description {
    font-size: 14px;
  }
}

/* Animation Effects */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: fadeInUp 0.6s ease-out;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }
</style>
