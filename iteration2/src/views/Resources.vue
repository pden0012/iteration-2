<template>
  <div class="resources">
    <!-- Article Detail View - Shows when viewing a specific article -->
    <!-- 文章详情视图 - 查看特定文章时显示 -->
    <div v-if="showArticleDetail" class="article-detail-page">
      <div class="page-container">
        <!-- Back button -->
        <!-- 返回按钮 -->
        <button class="back-button" @click="goBackToResources">
          ← Back to Resources
        </button>
        
        <!-- Article header -->
        <!-- 文章头部 -->
        <div class="article-header">
          <div class="article-category">{{ currentArticle.type }}</div>
          <h1 class="article-title">{{ currentArticle.title }}</h1>
          <p class="article-meta">By {{ currentArticle.author }} | {{ currentArticle.date }}</p>
        </div>
        
        <!-- Article content container -->
        <!-- 文章内容容器 -->
        <div class="article-content-container">
          <!-- Article image -->
          <!-- 文章图片 -->
          <div class="article-image">
            <img src="/images/prototype images/article page image.png" alt="Hay fever illustration" />
          </div>
          
          <!-- Article content -->
          <!-- 文章正文内容 -->
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
        
        <!-- Article footer -->
        <!-- 文章底部 -->
        <div class="article-footer">
          <p class="article-source">Source: <a :href="currentArticle.sourceUrl" target="_blank">The Guardian</a></p>
        </div>
      </div>
    </div>

    <!-- Video Detail View - Shows when viewing a specific video -->
    <!-- 视频详情视图 - 查看特定视频时显示 -->
    <div v-else-if="showVideoDetail" class="video-detail-page">
      <div class="page-container">
        <!-- Back button -->
        <!-- 返回按钮 -->
        <button class="back-button" @click="goBackToResources">
          ← Back to Resources
        </button>
        
        <!-- Video title -->
        <!-- 视频标题 -->
        <h1 class="video-title">{{ currentVideo.title }}</h1>
        
        <!-- Video player container -->
        <!-- 视频播放器容器 -->
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
        
        <!-- Video description -->
        <!-- 视频描述 -->
        <div class="video-info">
          <p class="video-author">By {{ currentVideo.author }}</p>
          <p class="video-description">{{ currentVideo.description }}</p>
        </div>
      </div>
    </div>

    <!-- Main Resources View - Shows resource listing -->
    <!-- 主资源视图 - 显示资源列表 -->
    <div v-else>
      <!-- Hero Section - Main banner with title and background -->
      <!-- Hero区域 - 主横幅，包含标题和背景 -->
      <section class="hero-section">
        <div class="page-container">
          <div class="hero-content">
            <h1 class="hero-title">{{ heroData.title }}</h1>
            <p class="hero-subtitle">{{ heroData.subtitle }}</p>
          </div>
        </div>
      </section>

    <!-- Resources Cards Section - Grid layout for resource cards -->
    <!-- 资源卡片区域 - 资源卡片的网格布局 -->
    <section class="cards-section">
      <div class="page-container">
        <div class="cards-grid">
          <article 
            v-for="resource in resources" 
            :key="resource.id"
            class="resource-card"
            @click="openResource(resource.id)"
          >
            <!-- Card image -->
            <!-- 卡片图片 -->
            <div class="card-image">
              <img :src="resource.image" :alt="resource.title" />
            </div>
            
            <!-- Card content -->
            <!-- 卡片内容 -->
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

    <!-- Did You Know Section - Educational content -->
    <!-- 知识普及区域 - 教育内容 -->
    <section class="knowledge-section">
      <!-- Top separator bar -->
      <!-- 顶部分隔条 -->
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
      // Article detail view state
      // 文章详情视图状态
      showArticleDetail: false,
      currentArticle: null,

      // Video detail view state
      // 视频详情视图状态
      showVideoDetail: false,
      currentVideo: null,

      // Hero section data
      // Hero区域数据
      heroData: {
        title: 'Learn. Manage. Prevent.',
        subtitle: 'Trusted guides, tips and seasonal hacks to help you stay ahead of hay fever.'
      },

      // Resources data - placeholder for future API integration
      // 资源数据 - 为将来API集成预留的占位符
      resources: [
        {
          id: 1,
          title: 'Five Ways to Treat Allergies at Home Without Medication',
          image: '/images/prototype images/video image.png', // 使用实际的视频图片 - Using actual video image
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
          image: '/images/prototype images/checklist image.png', // 使用实际的检查清单图片 - Using actual checklist image
          category: 'symptoms',
          type: 'Checklist',
          buttonText: 'Check',
          isVideo: false
        },
        {
          id: 3,
          title: 'Expert-backed Tips to Reduce Hay Fever Misery',
          image: '/images/prototype images/article image.png', // 使用实际的文章图片 - Using actual article image
          category: 'lifestyle',
          type: 'Article',
          buttonText: 'Read',
          isVideo: false,
          isArticle: true,
          author: 'Sarah Phillips',
          date: 'Apr 10, 2025',
          sourceUrl: 'https://www.theguardian.com/lifeandstyle/2025/apr/10/hay-fever-misery-20-tips-doctors-allergy-experts',
          content: [] // Will be populated by API call
        }
      ],

      // Knowledge section data
      // 知识普及区域数据
      knowledgeData: {
        title: 'Did You Know?',
        content: 'Despite its name, hay fever does not mean you have a fever. It is not the cause of a virus but rather an allergic reaction to allergens.',
        buttonText: 'Back to Dashboard'
      }
    }
  },

  methods: {
    // Open resource handler - navigate to specific pages or external content
    // 打开资源处理器 - 导航到特定页面或外部内容
    openResource(resourceId) {
      console.log('Opening resource:', resourceId);
      
      const resource = this.resources.find(r => r.id === resourceId);
      
      if (resource) {
        // If it's a video, show video detail page
        // 如果是视频，显示视频详情页面
        if (resource.isVideo) {
          this.currentVideo = resource;
          this.showVideoDetail = true;
        }
        // If it's an article, show article detail page
        // 如果是文章，显示文章详情页面
        else if (resource.isArticle) {
          this.currentArticle = resource;
          this.showArticleDetail = true;
        }
        // Navigate to symptoms page for the symptoms checklist
        // 为症状清单导航到症状页面
        else if (resourceId === 2) {
          this.$emit('navigate-to-symptoms');
        } else {
          // For other resources, could open in modal or external link
          // 对于其他资源，可以在模态框或外部链接中打开
          console.log('Opening other resource:', resourceId);
        }
      }
    },




    // Go back to resources list from detail views
    // 从详情视图返回到资源列表
    goBackToResources() {
      this.showVideoDetail = false;
      this.currentVideo = null;
      this.showArticleDetail = false;
      this.currentArticle = null;
    },

    // Back to dashboard handler - navigate back to dashboard
    // 返回仪表板处理器 - 导航回仪表板
    learnMore() {
      // Navigate back to dashboard
      // 导航回仪表板
      this.$parent.setActiveItem('dashboard');
    }
  }
}
</script>

<style scoped>
/* CSS Variables - consistent with Dashboard.vue */
/* CSS变量 - 与Dashboard.vue保持一致 */
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

/* Page container - center column with side gutters */
/* 页面容器 - 中心栏加两侧留白 */
.page-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Article Detail Page - full screen article reading */
/* 文章详情页面 - 全屏文章阅读 */
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

/* Article header section */
/* 文章头部区域 */
.article-header {
  width: 100%;
  margin-bottom: 32px;
  text-align: center;
}

/* Article category label */
/* 文章分类标签 */
.article-category {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* Article title */
/* 文章标题 */
.article-title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 16px;
}

/* Article meta information */
/* 文章元信息 */
.article-meta {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  margin: 0;
}

/* Article content container - two column layout */
/* 文章内容容器 - 两列布局 */
.article-content-container {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 24px;
  align-items: start;
}

/* Article image section */
/* 文章图片区域 */
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

/* Article content section */
/* 文章内容区域 */
.article-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Individual article tip */
/* 单个文章提示 */
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

/* Responsive design for article content */
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

/* Article footer */
/* 文章底部 */
.article-footer {
  width: 100%;
  text-align: center;
  padding: 16px 0;
}

/* Article source link */
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



/* Video Detail Page - full screen video viewing */
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

/* Back button - navigation to return to resources */
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

/* Video title - main heading for video */
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

/* Video container - responsive iframe wrapper */
/* 视频容器 - 响应式iframe包装器 */
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

/* Maintain 16:9 aspect ratio for video */
/* 保持16:9宽高比 */
.video-container::before {
  content: '';
  display: block;
  padding-top: 56.25%; /* 16:9 aspect ratio */
}

/* Video iframe - embedded YouTube player */
/* 视频iframe - 嵌入的YouTube播放器 */
.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Video information section */
/* 视频信息区域 */
.video-info {
  max-width: 800px;
}

/* Video author information */
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

/* Video description text */
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

/* Hero Section - main banner area */
/* Hero区域 - 主横幅区域 */
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

/* Hero content wrapper */
/* Hero内容包装器 */
.hero-content {
  text-align: center;
  color: var(--background-white);
}

/* Hero main title */
/* Hero主标题 */
.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(42px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.0;
  margin: 0 0 16px;
  color: #FFFFFF !important;
}

/* Hero subtitle */
/* Hero副标题 */
.hero-subtitle {
  font-family: var(--font-heading);
  font-size: clamp(20px, 2.2vw, 22px);
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
  max-width: 680px;
  color: #FFFFFF !important;
}

/* Cards Section - resource cards grid */
/* 卡片区域 - 资源卡片网格 */
.cards-section {
  background: var(--background-white);
  padding: 20px 0 60px;
  border: 1px solid var(--border-light);
  border-radius: 2px;
}

/* Cards grid layout */
/* 卡片网格布局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

/* Individual resource card */
/* 单个资源卡片 */
.resource-card {
  background: var(--background-white);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

/* Card hover effect */
/* 卡片悬停效果 */
.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* Card image container */
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

/* Card image styling */
/* 卡片图片样式 */
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Card content area */
/* 卡片内容区域 */
.card-content {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card type label */
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

/* Card title */
/* 卡片标题 */
.card-title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
  min-height: 44px; /* Consistent height for two-line alignment */
  display: flex;
  align-items: flex-start;
}

/* Card action button */
/* 卡片操作按钮 */
.card-button {
  background: transparent;
  border: none;
  padding: 0;
  cursor: inherit; /* Inherit cursor from parent card */
  transition: all 0.3s ease;
  align-self: flex-start;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 120%;
  color: var(--primary-color);
  text-decoration: none;
  pointer-events: none; /* Prevent button from intercepting clicks */
}

/* Card button hover effect - now handled by parent card */
/* 卡片按钮悬停效果 - 现在由父卡片处理 */
.resource-card:hover .card-button {
  text-decoration: underline;
  color: #1a7a84;
}

/* Separator bar between sections */
/* 区域间分隔条 */
.separator-bar {
  width: 100%;
  height: 8px;
  background: #239BA7 !important;
  border-radius: 1px;
}

/* Knowledge Section - educational content */
/* 知识区域 - 教育内容 */
.knowledge-section {
  background: var(--background-off-white);
  padding: 0 0 48px;
}

/* Knowledge content wrapper */
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

/* Knowledge section title */
/* 知识区域标题 */
.knowledge-title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 400;
  line-height: 120%;
  color: var(--text-primary);
  margin: 0;
}

/* Knowledge section text */
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

/* Knowledge section button */
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

/* Knowledge button hover effect */
/* 知识按钮悬停效果 */
.knowledge-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 📱 Complete Responsive Design System for Resources */
/* 📱 Mobile devices (320px - 767px) */
@media (max-width: 767px) {
  .page-container {
    padding: 0 12px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr; /* Mobile: single column */
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

/* 📱 Large mobile (480px - 767px) */
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

/* 📱 Tablet devices (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .page-container {
    padding: 0 24px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* Tablet: 2 columns */
    gap: 20px;
  }
  
  .hero-content {
    padding: 48px 24px;
  }
  
  .knowledge-content {
    padding: 0 24px;
  }
}

/* 🖥️ Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .page-container {
    padding: 0 32px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* Desktop: 3 columns */
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

/* 🖥️ Large desktop (1440px+) */
@media (min-width: 1440px) {
  .page-container {
    padding: 0 40px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* Large desktop: 3 columns */
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

/* 📱 Very small screens (<320px) */
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

/* Video detail responsive design */
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

/* Placeholder styling for missing images */
/* 缺失图片的占位符样式 */
.card-image::before {
  content: '📖';
  font-size: 48px;
  color: var(--text-muted);
}

.card-image img {
  display: block;
}

/* Hide placeholder when image loads */
/* 图片加载后隐藏占位符 */
.card-image:has(img) {
  background: transparent;
}

.card-image:has(img)::before {
  display: none;
}
</style>