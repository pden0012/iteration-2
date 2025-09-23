<template>
  <div class="resources">
    <!-- article detail view - shows when viewing specific article -->
    <div v-if="showArticleDetail" class="article-detail-page">
      <div class="page-container">
        <!-- back button -->
        <button class="back-button" @click="goBackToResources">
          ← Back to Resources
        </button>
        
        <!-- article header -->
        <div class="article-header">
          <div class="article-category">{{ currentArticle.type }}</div>
          <h1 class="article-title">{{ currentArticle.title }}</h1>
          <p class="article-meta">By {{ currentArticle.author }} | {{ currentArticle.date }}</p>
        </div>
        
        <!-- article content container -->
        <div class="article-content-container">
          <!-- article image -->
          <div class="article-image">
            <img src="/images/prototype images/article page image.png" alt="Hay fever illustration" />
          </div>
          
          <!-- article content -->
          <div class="article-content">
            <div class="article-tip">
              <strong>1. Avoid outdoor exposure during high-pollen periods</strong>, especially mornings and windy weather.
            </div>
            <div class="article-tip">
              <strong>2. Seal your environment by keeping windows closed and drying clothes indoors</strong> to prevent pollen infiltration.
            </div>
            <div class="article-tip">
              <strong>3. Shower after outdoor exposure and change pillowcases daily</strong> to remove pollen collected in your hair and bedding.
            </div>
            <div class="article-tip">
              <strong>4. Use an air filter in the bedroom</strong> to improve sleep quality and reduce nighttime symptoms.
            </div>
            <div class="article-tip">
              <strong>5. Apply a thin layer of petroleum jelly</strong> around the nostrils as a physical barrier to trap pollen.
            </div>
            <div class="article-tip">
              <strong>6. Use antihistamines</strong> and correctly apply <strong>steroid nasal sprays</strong> for better symptom control.
            </div>
            <div class="article-tip">
              <strong>7. For severe cases, GP-recommended options</strong> may include immunotherapy or short-term oral steroids.
            </div>
            <div class="article-tip">
              <strong>8. Avoid popular unproven remedies</strong> like local honey.
            </div>
            <div class="article-tip">
              <strong>9. Spend time by the coast</strong>, where pollen levels tend to be lower.
            </div>
            <div class="article-tip">
              <strong>10. Start treatment early</strong> and use medications <strong>correctly</strong>.
            </div>
          </div>
        </div>
        
        <!-- article footer -->
        <div class="article-footer">
          <p class="article-source">Source: <a :href="currentArticle.sourceUrl" target="_blank">The Guardian</a></p>
        </div>
      </div>
    </div>

    <!-- video detail view - shows when viewing specific video -->
    <div v-else-if="showVideoDetail" class="video-detail-page">
      <div class="page-container">
        <!-- back button -->
        <button class="back-button" @click="goBackToResources">
          ← Back to Resources
        </button>
        
        <!-- video title -->
        <h1 class="video-title">{{ currentVideo.title }}</h1>
        
        <!-- video player container -->
        <div class="video-container">
          <iframe 
            :src="currentVideo.embedUrl"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="video-iframe"
          ></iframe>
        </div>
        
        <!-- video description -->
        <div class="video-info">
          <p class="video-author">By {{ currentVideo.author }}</p>
          <p class="video-description">{{ currentVideo.description }}</p>
        </div>
      </div>
    </div>

    <!-- main resources view - shows resource listing -->
    <div v-else>
      <!-- hero section - main banner with title and background -->
      <section class="hero-section">
        <div class="page-container">
          <div class="hero-content">
            <h1 class="hero-title">{{ heroData.title }}</h1>
            <p class="hero-subtitle">{{ heroData.subtitle }}</p>
          </div>
        </div>
      </section>

    <!-- resources cards section - grid layout for resource cards -->
    <section class="cards-section">
      <div class="page-container">
        <div class="cards-grid">
          <article 
            v-for="resource in resources" 
            :key="resource.id"
            class="resource-card"
            @click="openResource(resource.id)"
          >
            <!-- card image -->
            <div class="card-image">
              <img :src="resource.image" :alt="resource.title" />
            </div>
            
            <!-- card content -->
            <div class="card-content">
              <div class="card-type">{{ resource.type }}</div>
              <h3 class="card-title">{{ resource.title }}</h3>
              <div class="card-button">
                {{ resource.buttonText }}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- did you know section - educational content -->
    <section class="knowledge-section">
      <!-- top separator bar -->
      <div class="separator-bar"></div>
      <div class="page-container">
        <div class="knowledge-content">
          <h2 class="knowledge-title">{{ knowledgeData.title }}</h2>
          <p class="knowledge-text">{{ knowledgeData.content }}</p>
          <button class="knowledge-button" @click="learnMore">
            {{ knowledgeData.buttonText }}
          </button>
        </div>
      </div>
    </section>
    </div>


  </div>
</template>

<script>
export default {
  name: 'Resources',
    data() {
      return {
        
        showArticleDetail: false,
        currentArticle: null,

        
        showVideoDetail: false,
        currentVideo: null,

        
        heroData: {
          title: 'Learn. Manage. Prevent.',
          subtitle: 'Trusted guides, tips and seasonal hacks to help you stay ahead of hay fever.'
        },

        
        resources: [
          {
            id: 1,
            title: 'Five Ways to Treat Allergies at Home Without Medication',
            image: '/images/prototype images/video image.png', 
            category: 'treatments',
            type: 'Video',
            buttonText: 'Watch',
            isVideo: true,
            videoUrl: 'https://www.youtube.com/watch?v=H2DIcKgpKoE',
            embedUrl: 'https://www.youtube.com/embed/H2DIcKgpKoE',
            author: 'Norton Healthcare',
            description: 'Learn five effective ways to manage allergies at home without relying on medication. This video provides practical tips and natural remedies to help you breathe easier during allergy season.'
          },
          {
            id: 2,
            title: 'Recognize & Manage Hay Fever Symptoms',
            image: '/images/prototype images/checklist image.png', 
            category: 'symptoms',
            type: 'Checklist',
            buttonText: 'Check',
            isVideo: false
          },
          {
            id: 3,
            title: 'Expert-backed Tips to Reduce Hay Fever Misery',
            image: '/images/prototype images/article image.png', 
            category: 'lifestyle',
            type: 'Article',
            buttonText: 'Read',
            isVideo: false,
            isArticle: true,
            author: 'Sarah Phillips',
            date: 'Apr 10, 2025',
            sourceUrl: 'https://www.theguardian.com/lifeandstyle/2025/apr/10/hay-fever-misery-20-tips-doctors-allergy-experts',
            content: [] 
          }
        ],

        
        knowledgeData: {
          title: 'Did You Know?',
          content: 'Despite its name, hay fever does not mean you have a fever. It is not the cause of a virus but rather an allergic reaction to allergens.',
          buttonText: 'Back to Dashboard'
        }
      }
    },

  methods: {
    // this method handles when user clicks on a resource card
    // it determines what type of resource it is and opens the appropriate view
    // parameters: resourceId - the ID of the clicked resource
    // returns: nothing, but updates component state to show detail view
    openResource(resourceId) {
      console.log('Opening resource:', resourceId);
      
      // find the resource object by ID
      const resource = this.resources.find(r => r.id === resourceId);
      
      if (resource) {
        // check if it's a video resource
        if (resource.isVideo) {
          this.currentVideo = resource;
          this.showVideoDetail = true;
        }
        
        // check if it's an article resource
        else if (resource.isArticle) {
          this.currentArticle = resource;
          this.showArticleDetail = true;
        }
        
        // special case for checklist (resource ID 2)
        else if (resourceId === 2) {
          // emit event to navigate to symptoms page
          this.$emit('navigate-to-symptoms');
        } else {
          // handle other resource types
          console.log('Opening other resource:', resourceId);
        }
      }
    },




    // this method handles the back button click from detail views
    // it resets all detail view states and returns to main resources list
    // returns: nothing, but updates component state to show main view
    goBackToResources() {
      // hide video detail view
      this.showVideoDetail = false;
      this.currentVideo = null;
      // hide article detail view  
      this.showArticleDetail = false;
      this.currentArticle = null;
    },

    // this method handles the "Back to Dashboard" button click
    // it navigates back to the main dashboard page
    // returns: nothing, but emits navigation event to parent component
    learnMore() {
      // tell parent component to switch to dashboard tab
      this.$parent.setActiveItem('dashboard');
    }
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
  --text-light: #767676;
  --background-white: #FFFFFF;
  --background-off-white: #FFFDFD;
  --border-light: rgba(0, 0, 0, 0.1);
  --border-medium: #D9D9D9;
  --border-tab: #B2B2B2;
  --font-heading: 'Questrial', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-content: 'AR One Sans', sans-serif;
}


.page-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}


/* article detail page - full screen article reading */
.article-detail-page {
  background: var(--background-white);
  min-height: calc(100vh - 105px);
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.article-detail-page .page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1000px;
  width: 100%;
}


/* article header area */
.article-header {
  width: 100%;
  margin-bottom: 32px;
  text-align: center;
}


/* article category tag */
.article-category {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}


/* article title */
.article-title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 16px;
}


/* article meta information */
.article-meta {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  margin: 0;
}


/* article content container - two column layout */
.article-content-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 24px;
  align-items: start;
}


/* article image area */
.article-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.article-image img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 12px;
}


/* article content area */
.article-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}


/* individual article tip */
.article-tip {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 0;
}

.article-tip strong {
  font-weight: 600;
  color: var(--text-primary);
}


/* 文章内容响应式设计 */
@media (max-width: 768px) {
  .article-content-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .article-image {
    order: -1;
  }
}


/* 文章底部 */
.article-footer {
  width: 100%;
  text-align: center;
  padding: 16px 0;
}


/* 文章来源链接 */
.article-source {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.article-source a {
  color: var(--primary-color);
  text-decoration: none;
}

.article-source a:hover {
  text-decoration: underline;
}




/* 视频详情页面 - 全屏视频观看 */
.video-detail-page {
  background: var(--background-white);
  min-height: calc(100vh - 105px);
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.video-detail-page .page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}


/* 返回按钮 - 导航返回资源页面 */
.back-button {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 32px;
  padding: 8px 0;
  transition: color 0.3s ease;
  align-self: flex-start;
}

.back-button:hover {
  color: #1a7a84;
  text-decoration: underline;
}


/* 视频标题 - 视频的主标题 */
.video-title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 32px;
  max-width: 800px;
}



.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 0 32px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}



.video-container::before {
  content: '';
  display: block;
  padding-top: 56.25%; 
}



.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}


/* 视频信息区域 */
.video-info {
  max-width: 800px;
}


/* 视频作者信息 */
.video-author {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


/* 视频描述文本 */
.video-description {
  font-family: var(--font-content);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  text-align: left;
  max-width: 800px;
}



.hero-section {
  background: linear-gradient(#239BA7CC, #239BA7CC), url('/images/prototype images/resources background.png');
  background-size: cover;
  background-position: center;
  background-color: var(--primary-color);
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 2px;
}



.hero-content {
  text-align: center;
  color: var(--background-white);
}



.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(42px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.0;
  margin: 0 0 16px;
  color: #FFFFFF !important;
}



.hero-subtitle {
  font-family: var(--font-heading);
  font-size: clamp(20px, 2.2vw, 22px);
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  max-width: 680px;
  color: #FFFFFF !important;
}


/* 卡片区域 - 资源卡片网格 */
.cards-section {
  background: var(--background-white);
  padding: 20px 0 60px;
  border: 1px solid var(--border-light);
  border-radius: 2px;
}


/* 卡片网格布局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}


/* 单个资源卡片 */
.resource-card {
  background: var(--background-white);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}


/* 卡片悬停效果 */
.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}


/* 卡片图片容器 */
.card-image {
  width: 100%;
  height: 190px;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* 卡片图片样式 */
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


/* 卡片内容区域 */
.card-content {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}


/* 卡片类型标签 */
.card-type {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}


/* 卡片标题 */
.card-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
  min-height: 44px; 
  display: flex;
  align-items: flex-start;
}


/* 卡片操作按钮 */
.card-button {
  background: transparent;
  border: none;
  padding: 0;
  cursor: inherit; 
  transition: all 0.3s ease;
  align-self: flex-start;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 120%;
  color: var(--primary-color);
  text-decoration: none;
  pointer-events: none; 
}


/* 卡片按钮悬停效果 - 现在由父卡片处理 */
.resource-card:hover .card-button {
  text-decoration: underline;
  color: #1a7a84;
}


/* 区域间分隔条 */
.separator-bar {
  width: 100%;
  height: 8px;
  background: #239BA7 !important;
  border-radius: 1px;
}


/* 知识区域 - 教育内容 */
.knowledge-section {
  background: var(--background-off-white);
  padding: 0 0 48px;
}


/* 知识内容包装器 */
.knowledge-content {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 48px 24px 0;
}


/* 知识区域标题 */
.knowledge-title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 400;
  line-height: 120%;
  color: var(--text-primary);
  margin: 0;
}


/* 知识区域文本 */
.knowledge-text {
  font-family: var(--font-content);
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 400;
  line-height: 120%;
  color: var(--text-primary);
  margin: 0;
  text-align: left;
}


/* 知识区域按钮 */
.knowledge-button {
  background: #F9D65C !important;
  border: 1px solid #F9D65C;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 120%;
  color: #303030;
}


/* 知识按钮悬停效果 */
.knowledge-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}



@media (max-width: 767px) {
  .page-container {
    padding: 0 12px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr; 
    gap: 16px;
  }
  
  .hero-content {
    padding: 32px 16px;
  }
  
  .knowledge-content {
    padding: 0 16px;
  }
  
  .resource-card {
    padding: 16px;
  }
  
  .resource-title {
    font-size: 16px;
    line-height: 1.4;
  }
  
  .learn-more-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}


@media (min-width: 480px) and (max-width: 767px) {
  .page-container {
    padding: 0 16px;
  }
  
  .hero-content {
    padding: 36px 20px;
  }
  
  .knowledge-content {
    padding: 0 20px;
  }
}


@media (min-width: 768px) and (max-width: 1023px) {
  .page-container {
    padding: 0 24px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
    gap: 20px;
  }
  
  .hero-content {
    padding: 48px 24px;
  }
  
  .knowledge-content {
    padding: 0 24px;
  }
}


@media (min-width: 1024px) and (max-width: 1439px) {
  .page-container {
    padding: 0 32px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); 
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  
  .hero-content {
    padding: 56px 32px;
  }
  
  .knowledge-content {
    padding: 0 32px;
  }
}


@media (min-width: 1440px) {
  .page-container {
    padding: 0 40px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); 
    gap: 28px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .hero-content {
    padding: 64px 40px;
  }
  
  .knowledge-content {
    padding: 0 40px;
  }
}


@media (max-width: 319px) {
  .page-container {
    padding: 0 8px;
  }
  
  .cards-grid {
    gap: 12px;
  }
  
  .hero-content {
    padding: 24px 12px;
  }
  
  .knowledge-content {
    padding: 0 12px;
  }
  
  .resource-card {
    padding: 12px;
  }
  
  .resource-title {
    font-size: 14px;
  }
  
  .learn-more-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}


/* 视频详情响应式设计 */
@media (max-width: 767px) {
  .video-detail-page {
    padding: 20px 0;
  }

  .video-title {
    font-size: clamp(24px, 6vw, 32px);
    margin-bottom: 24px;
  }

  .video-container {
    margin-bottom: 24px;
    border-radius: 4px;
  }

  .back-button {
    margin-bottom: 24px;
  }
}


/* 缺失图片的占位符样式 */
.card-image::before {
  content: '📖';
  font-size: 48px;
  color: var(--text-muted);
}

.card-image img {
  display: block;
}


/* 图片加载后隐藏占位符 */
.card-image:has(img) {
  background: transparent;
}

.card-image:has(img)::before {
  display: none;
}
</style>