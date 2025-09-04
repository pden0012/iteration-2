<template>
  <div class="homepage">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <!-- Background Decorative Ellipse -->
        <div class="hero-ellipse"></div>
        <!-- Hero Image -->
        <div class="hero-image"></div>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">{{ heroData.title }}</h1>
        <p class="hero-subtitle">{{ heroData.subtitle }}</p>
        <button class="hero-button" @click="handleGetStarted">
          <span>{{ heroData.buttonText }}</span>
        </button>
      </div>
    </section>

    <!-- Info Section - moved to middle -->
    <section class="info-section">
      <div class="page-container">
        <div class="info-container">
          <h2 class="info-title">{{ infoData.title }}</h2>
          <p class="info-description">{{ infoData.description }}</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
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
      heroData: {
        title: 'Beat hay fever before it beats you',
        subtitle: 'Your partner in managing allergies daily',
        buttonText: "Check Today's Pollen"
      },
      featuresTitle: 'All the Tools You Need to Stay Ahead',
      features: [
        {
          id: 'tracker',
          title: 'Pollen & Allergen Tracker',
          description: 'Instantly see live Pollen Index, Tree, Grass, Ragweed, Dust levels for your location.',
          buttonText: 'View Dashboard',
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
          id: 'trends',
          title: 'Explore Latest Trends',
          description: 'Track allergen patterns over time or outlook of pollen and allergen conditions.',
          buttonText: 'Explore More',
          iconText: '/images/prototype images/image copy 9.png'
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
        }
      ],
      infoData: {
        title: 'Take Control of Your Hay Fever',
        description: 'Our resources provide the information and tools you need to effectively manage hay fever and maintain your quality of life.'
      }
    }
  },
  methods: {
    handleGetStarted() {
      console.log('Get Started button clicked');
      this.$emit('get-started-clicked');
    },
    handleFeatureClick(featureId) {
      console.log('Feature card clicked:', featureId);
      this.$emit('feature-clicked', featureId);
    },
    handleButtonClick(featureId) {
      console.log('Feature button clicked:', featureId);
      this.$emit('feature-button-clicked', featureId);
    }
  }
}
</script>

<style scoped>
/* 主页容器 - 控制整个页面的宽度和溢出
   - width: 100% 设置容器占满父元素宽度
   - max-width: 100vw 限制最大宽度为视口宽度，防止横向滚动
   - overflow-x: hidden 隐藏水平方向的溢出内容 */
.homepage {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* 页面容器 - 中心栏 + 两侧 gutter 版式
   - max-width: 1200px 最大宽度1200像素，限制内容宽度
   - margin: 0 auto 水平居中对齐
   - padding: 0 24px 左右内边距24像素，提供基础gutter空间 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero区域样式 - 页面顶部的蓝色区域，包含主标题和按钮
   - position: relative 相对定位，作为子元素的定位参考点
   - width: 100% 占满容器宽度
   - height: 824px 固定高度824像素
   - background: #239BA7 青蓝色背景(RGB: 35, 155, 167)
   - overflow: hidden 隐藏超出区域的内容，防止装饰元素溢出 */
.hero-section {
  position: relative;
  width: 100%;
  height: 824px;
  background: #239BA7;
  overflow: hidden;
}

/* Hero背景容器 - 包含装饰性元素和背景图像
   - position: relative 相对定位，为内部绝对定位元素提供参考
   - width: 100% 占满父容器宽度
   - height: 100% 占满父容器高度(824px) */
.hero-background {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Hero区域装饰性椭圆 - 右上角的半透明青色圆形装饰
   - position: absolute 绝对定位，相对于hero-background定位
   - width: 1219px 椭圆宽度1219像素
   - height: 1485px 椭圆高度1485像素
   - right: -400px 右边距-400px，使椭圆部分超出容器右边界
   - top: -93px 顶部距离-93px，使椭圆部分超出容器顶部
   - background: rgba(125, 222, 221, 0.5) 半透明青色(RGB: 125, 222, 221, 透明度50%)
   - border-radius: 50% 设置为圆形 */
.hero-ellipse {
  position: absolute;
  width: 1219px;
  height: 1485px;
  right: -400px;
  top: -93px;
  background: rgba(125, 222, 221, 0.5);
  border-radius: 50%;
}

/* Hero图像占位符 - 右侧显示人物图像的区域
   - position: absolute 绝对定位，相对于hero-background定位
   - width: 720px 图像区域宽度720像素
   - height: 720px 图像区域高度720像素
   - right: 0 紧贴容器右边缘
   - top: 104px 距离容器顶部104像素
   - background: url('/images/prototype images/home page.png') 人物图片路径
   - background-size: contain 图片完整显示，保持比例
   - background-repeat: no-repeat 不重复显示背景图
   - background-position: center right 图片居中右对齐 */
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

/* Hero内容容器 - 包含主标题、副标题和按钮的左侧文字区域
   - position: absolute 绝对定位，相对于hero-section定位
   - left: 80px 距离容器左边缘80像素
   - top: 120px 距离容器顶部120像素
   - z-index: 2 层级为2，确保在装饰元素之上显示
   - max-width: 500px 最大宽度500像素，防止文字过长 */
.hero-content {
  position: absolute;
  left: 80px;
  top: 120px;
  z-index: 2;
  max-width: 500px;
}

/* Hero主标题样式 - "Beat hay fever before it beats you"的大标题
   - font-family: 'Questrial', sans-serif 使用Questrial字体，备用sans-serif
   - font-style: normal 正常字体样式(非斜体)
   - font-weight: 400 字体粗细400(正常粗细)
   - font-size: 92px 字体大小92像素，超大标题
   - line-height: 1 行高为1倍字体大小，紧凑排列
   - color: #FFFFFF 白色文字(RGB: 255, 255, 255)
   - margin-bottom: 20px 底部外边距20像素
   - text-align: left 文字左对齐 */
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

/* Hero副标题样式 - "Your partner in managing allergies daily"的副标题
   - font-family: 'Questrial', sans-serif 使用Questrial字体，与主标题保持一致
   - font-style: normal 正常字体样式
   - font-weight: 400 字体粗细400(正常粗细)
   - font-size: 30px 字体大小30像素，中等大小
   - line-height: 1 行高为1倍字体大小
   - color: #FFFFFF 白色文字，与主标题一致
   - margin-bottom: 40px 底部外边距40像素，为按钮留出空间
   - text-align: left 文字左对齐 */
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

/* Hero行动按钮样式 - "Check Today's Pollen"的黄色按钮
   - box-sizing: border-box 边框和内边距包含在总宽高内
   - display: flex 弹性布局容器
   - flex-direction: row 子元素水平排列
   - justify-content: center 水平居中对齐
   - align-items: center 垂直居中对齐
   - padding: 16px 32px 内边距：上下16px，左右32px
   - width: 280px 按钮宽度280像素
   - height: 56px 按钮高度56像素
   - background: #F9D65C 黄色背景(RGB: 249, 214, 92)
   - border: 1px solid #F9D65C 1像素黄色边框
   - border-radius: 16px 圆角半径16像素，圆润按钮
   - cursor: pointer 鼠标悬停时显示手型光标
   - transition: all 0.3s ease 所有属性0.3秒缓动过渡效果 */
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

/* Hero按钮悬停效果 - 鼠标悬停时的颜色和位移变化
   - background: #f0c94a 悬停时背景色变为更深的黄色(RGB: 240, 201, 74)
   - transform: translateY(-2px) Y轴向上移动2像素，创造浮起效果 */
.hero-button:hover {
  background: #f0c94a;
  transform: translateY(-2px);
}

/* Hero按钮文字样式 - 按钮内部文字的字体和颜色设置
   - font-family: 'Inter', sans-serif 使用Inter字体，现代无衬线字体
   - font-style: normal 正常字体样式
   - font-weight: 600 字体粗细600(半粗体)，比正常文字更突出
   - font-size: 20px 字体大小20像素，适中按钮文字大小
   - line-height: 120% 行高为字体大小的120%，适当行间距
   - letter-spacing: -0.02em 字符间距-0.02em，字母稍微紧凑
   - color: #303030 深灰色文字(RGB: 48, 48, 48)，在黄色背景上清晰可读 */
.hero-button span {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 120%;
  letter-spacing: -0.02em;
  color: #303030;
}

/* 功能卡片区域样式 - 包含5个功能卡片的青色背景区域
   - box-sizing: border-box 边框和内边距包含在总尺寸内
   - position: relative 相对定位，为内部元素提供参考
   - width: 100% 占满父容器宽度
   - max-width: 100vw 最大宽度为视口宽度，防止溢出
   - background: #FFFFFF 白色背景，外层容器背景
   - border: 1px solid rgba(0, 0, 0, 0.1) 1像素半透明黑色边框(透明度10%)
   - border-radius: 2px 2像素圆角，轻微圆润
   - padding: 60px 0 100px 上下内边距60px/100px，左右由page-container控制 */
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

/* 功能卡片容器 - 包含所有功能卡片的圆角青色框
   - position: relative 相对定位，使用正常文档流
   - width: min(1040px, calc(100% - 64px)) 收窄宽度：最大1040px或容器宽度减64px，创造更明显的左右留白
   - margin: 0 auto 水平居中对齐
   - background: #239BA7 青蓝色背景(RGB: 35, 155, 167)，与Hero区域一致
   - border-radius: 51px 大圆角半径51像素，创造圆润的卡片容器效果
   - padding: 56px 32px 96px 内边距：顶部56px，左右32px，底部96px，为内容留出充足空间
   - overflow: visible 允许内容可见，支持自适应高度
   - box-sizing: border-box 边框和内边距包含在总尺寸内 */
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

/* 功能区域标题 - "All the Tools You Need to Stay Ahead"的白色标题
   - font-family: 'Questrial', sans-serif 使用Questrial字体，与Hero标题一致
   - font-style: normal 正常字体样式
   - font-weight: 400 字体粗细400(正常)
   - font-size: 48px 字体大小48像素，大标题尺寸
   - line-height: 1.2 行高为字体大小的1.2倍
   - color: #FFFFFF 白色文字，在青色背景上清晰可见
   - text-align: center 文字居中对齐
   - margin-bottom: 28px 底部外边距28像素，与卡片网格保持间距 */
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

/* 功能卡片网格布局 - 自适应响应式网格，用于排列5个功能卡片
   - display: grid CSS网格布局
   - grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) 自适应列数：每列最小280px，自动适应屏幕宽度
   - gap: 30px 网格项目间距30像素
   - width: 100% 占满容器宽度
   - justify-items: center 网格项目在各自单元格内水平居中 */
/* Features grid layout - Professional 3+2 layout solution */
/* 功能网格布局 - 专业级3+2布局解决方案 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6列网格，便于精确控制 */
  grid-template-rows: auto auto;
  gap: 30px;
  justify-items: center;
  width: 100%;
}

/* Desktop: 3+2 layout using grid areas */
/* 桌面端：使用网格区域的3+2布局 */
.feature-card:nth-child(1) { grid-column: 1 / 3; grid-row: 1; } /* 占据1-2列 */
.feature-card:nth-child(2) { grid-column: 3 / 5; grid-row: 1; } /* 占据3-4列 */
.feature-card:nth-child(3) { grid-column: 5 / 7; grid-row: 1; } /* 占据5-6列 */

/* Bottom row: centered in middle 4 columns */
/* 底部行：在中间4列居中 */
.feature-card:nth-child(4) { grid-column: 2 / 4; grid-row: 2; } /* 占据2-3列 */
.feature-card:nth-child(5) { grid-column: 4 / 6; grid-row: 2; } /* 占据4-5列 */

/* Tablet: 2 columns */
/* 平板：2列布局 */
@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto auto auto;
  }
  
  .feature-card:nth-child(1) { grid-column: 1; grid-row: 1; }
  .feature-card:nth-child(2) { grid-column: 2; grid-row: 1; }
  .feature-card:nth-child(3) { grid-column: 1; grid-row: 2; }
  .feature-card:nth-child(4) { grid-column: 2; grid-row: 2; }
  .feature-card:nth-child(5) { grid-column: 1 / 3; grid-row: 3; justify-self: center; }
}

/* Mobile: 1 column */
/* 手机：1列布局 */
@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(5, auto);
  }
  
  .feature-card {
    grid-column: 1 !important;
    grid-row: auto !important;
    justify-self: center !important;
  }
}
/* 单个功能卡片样式 - 白色背景的功能卡片，带蓝色边框
   - position: static 静态定位，使用正常文档流
   - width: 100% 占满网格单元格宽度
   - max-width: 320px 最大宽度320像素，防止卡片过宽
   - background: #FFFFFF 白色背景
   - border: 2px solid #239BA7 2像素青蓝色边框，与容器背景色一致
   - border-radius: 30px 圆角半径30像素，圆润卡片外观
   - padding: 20px 内边距20像素，为内容留出空间
   - display: flex 弹性布局容器
   - flex-direction: column 子元素垂直排列
   - align-items: center 子元素水平居中对齐
   - text-align: center 文字居中对齐
   - transition: transform 0.3s ease transform属性0.3秒缓动过渡
   - justify-self: center 在网格单元格中居中对齐
   - box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) 阴影效果：Y轴偏移4px，模糊12px，黑色10%透明度 */
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

/* 功能卡片悬停效果 - 鼠标悬停时卡片向上移动
   - transform: translateY(-5px) Y轴向上移动5像素，创造浮起效果，比Hero按钮移动距离更大 */
.feature-card:hover {
  transform: translateY(-5px);
}

/* 功能卡片图标容器 - 卡片顶部的图标区域
   - width: 68px 图标容器宽度68像素
   - height: 68px 图标容器高度68像素，正方形容器
   - margin-bottom: 15px 底部外边距15像素，与标题保持间距 */
.feature-icon {
  width: 68px;
  height: 68px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Feature icon image styling */
/* 功能图标图片样式 */
.feature-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Feature icon image styling - removed placeholder, now using actual images */
/* 功能图标图片样式 - 移除占位符，现在使用实际图片 */

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

/* 信息区域样式 - 中间的白色区域，包含"Take Control"标题和描述
   - position: relative 相对定位，为内部元素提供参考
   - width: 100% 占满父容器宽度
   - background: #FFFFFF 白色背景
   - padding: 80px 0 上下内边距80px，左右由page-container控制 */
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
  /* 大屏幕 - 增加页面容器左右内边距 */
  .page-container {
    padding: 0 40px;
  }
}

@media (max-width: 1440px) {
  /* Large screens - adjust hero content position */
  /* 大屏幕适配 - 调整Hero内容位置 */
  .hero-content {
    left: 5%;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 48px;
    width: 100%;
    height: auto;
  }
  
  .hero-subtitle {
    font-size: 24px;
    width: 100%;
    height: auto;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  /* Mobile feature card adjustments */
  /* 移动端功能卡片调整 - 自适应高度和宽度 */
  .feature-card {
    width: 100%;
    max-width: 320px;
    height: auto;
    min-height: 200px;
  }
  
  .info-title {
    font-size: 32px;
    width: 100%;
    height: auto;
  }
  
  .info-description {
    font-size: 20px;
    width: 100%;
    height: auto;
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
</style>
