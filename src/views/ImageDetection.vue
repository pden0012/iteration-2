<template>
  <div class="image-page">
    <div class="image-grid">
      <!-- Left side: upload -->
      <div class="left-panel">
        <div class="upload-section">
          <!-- 上传区域现在会被图片覆盖 -->
          <div class="upload-box" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
            <!-- 显示图片预览或上传提示 -->
            <div v-if="imagePreview" class="preview-overlay">
              <img :src="imagePreview" alt="Preview" class="preview-img" />
              <button class="close-preview" @click.stop="clearPreview">×</button>
            </div>
            <div v-else class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <p class="upload-tip">Upload a plant photo<br />(JPG, PNG, WEBP, HEIC, HEIF)</p>
            </div>
          </div>
          
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg, image/jpg, image/png, image/webp, image/heic, image/heif"
            class="hidden-input"
            @change="onFileChange"
          />
          
          <button class="upload-btn" @click="triggerFileInput">
            {{ imagePreview ? 'Change Image' : 'Upload Image' }}
          </button>
          
          <div v-if="uploadSuccess && !isLoading" class="upload-success">
            Image uploaded successfully.
          </div>
          
          <!-- Loading indicator -->
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <p class="loading-text">Analyzing image...</p>
          </div>
        </div>
      </div>
      
      <!-- Right side: results -->
      <div class="right-panel">
        <div v-for="(result, idx) in topResults" :key="`result-${idx}`" 
             class="result-card" 
             :class="{ 
               'loading-card': result.isLoading, 
               'primary-result': idx === 0, 
               'secondary-result': idx > 0 
             }">
          <div class="card-header">
            <h3 class="card-title">{{ result.title || 'Plant Species' }}</h3>
            <span 
              class="badge" 
              :class="result.risk === 'safe' ? 'safe' : result.risk === 'risk' ? 'risk' : 'unknown'"
            >
              {{ result.risk === 'safe' ? 'Safe' : result.risk === 'risk' ? 'Risk' : 'Unknown' }}
            </span>
          </div>
          <!-- 删除了 scientific name 这一行 -->
          <p class="card-confidence" v-if="!result.isLoading">Confidence Level: {{ idx + 1 }}</p>
          <p class="card-confidence" v-else>
            <span class="loading-dots">Analyzing</span>
          </p>
          <p class="card-description">{{ result.description || 'Analysis in progress...' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageDetection',
  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      uploadSuccess: false,
      results: [], // 后端返回的结果
      isLoading: false,
      retryCount: 0,
      maxRetries: 1
    };
  },
  computed: {
    // 显示前3个结果，按后端返回顺序
    topResults() {
      // 如果正在加载，显示加载状态
      if (this.isLoading) {
        return [
          { title: 'Analyzing...', scientificName: '', risk: 'unknown', description: 'AI is analyzing your image...', isLoading: true },
          { title: 'Processing...', scientificName: '', risk: 'unknown', description: 'Identifying plant species...', isLoading: true },
          { title: 'Almost done...', scientificName: '', risk: 'unknown', description: 'Determining safety level...', isLoading: true }
        ];
      }
      
      const placeholders = [
        { title: 'Waiting for analysis...', scientificName: '', risk: 'unknown', description: 'Upload an image to get started.' },
        { title: 'Waiting for analysis...', scientificName: '', risk: 'unknown', description: 'Upload an image to get started.' },
        { title: 'Waiting for analysis...', scientificName: '', risk: 'unknown', description: 'Upload an image to get started.' }
      ];
      
      if (this.results.length === 0) {
        return placeholders;
      }
      
      // 使用后端返回的前3个结果，如果不足3个就用占位符补充
      const actualResults = this.results.slice(0, 3);
      while (actualResults.length < 3) {
        actualResults.push({ 
          title: 'No additional matches', 
          scientificName: '', 
          risk: 'unknown', 
          description: 'No more species identified.' 
        });
      }
      
      return actualResults;
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    async onFileChange(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      
      // 验证文件类型：jpg, png, webp, heic, heif
      if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/.test(file.type)) {
        alert('Only JPG, PNG, WEBP, HEIC, and HEIF image files are allowed.');
        return;
      }
      
      // 验证文件大小：< 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        alert('Image size must be less than 2MB.');
        return;
      }
      
      this.selectedFile = file;
      this.uploadSuccess = true;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // 发送到后端进行检测
      await this.detectImage(file);
    },
    
    clearPreview() {
      this.imagePreview = null;
      this.uploadSuccess = false;
      this.selectedFile = null;
      this.results = [];
      this.$refs.fileInput.value = '';
    },
    
    getApiUrl(path) {
      // 使用我们自己的代理服务器
      const isDev = import.meta.env.DEV;
      if (isDev) {
        return `http://localhost:3003/api${path}`;
      } else {
        // 生产环境使用我们自己的代理服务器
        const proxyUrl = 'https://your-proxy-server.onrender.com'; // 替换为你的代理服务器URL
        return `${proxyUrl}/api${path}`;
      }
    },
    
    async detectImage(file) {
      try {
        this.isLoading = true;
        
        // 使用我们自己的代理服务器
        const url = this.getApiUrl('/ai/image');
        const form = new FormData();
        form.append('image', file);
        form.append('text', ' ');
        
        // 确保文件有正确的MIME类型
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          const blob = new Blob([file], { type: 'image/jpeg' });
          form.set('image', blob, 'image.jpg');
        }
        
        console.log('🔄 Using our own proxy server for image detection...');
        console.log('Request URL:', url);
        
        const res = await fetch(url, {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        
        console.log('Detection result:', json);
        
        // 处理后端返回的数据
        if (json.data && Array.isArray(json.data)) {
          this.results = json.data.map(item => ({
            title: item.commonName || item.name || 'Unknown Species',
            scientificName: item.scientificName || item.scientific_name || '',
            description: this.getRiskDescription(item.isHarmful),
            risk: this.mapRiskLevel(item.isHarmful)
          }));
        } else {
          console.warn('Unexpected API response format:', json);
          this.results = [{
            title: 'Analysis Complete',
            scientificName: '',
            risk: 'unknown',
            description: 'Image analysis completed, but no specific plant species were identified. Please try with a clearer image.'
          }];
        }
        
      } catch (error) {
        console.error('Image detection failed:', error);
        
        // 根据错误类型显示不同的用户提示
        let errorMessage = 'Failed to analyze image. ';
        if (error.message.includes('CORS proxy')) {
          errorMessage += 'Network service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('All CORS proxy services failed')) {
          errorMessage += 'All network services are currently unavailable. Please try again in a few minutes.';
        } else {
          errorMessage += 'Please check your internet connection and try again.';
        }
        
        // 显示错误结果而不是弹窗
        this.results = [{
          title: 'Analysis Failed',
          scientificName: '',
          risk: 'unknown',
          description: errorMessage + ' Click "Change Image" to try again.'
        }];
        
        // 重置重试计数器
        this.retryCount = 0;
      } finally {
        this.isLoading = false;
      }
    },
    
    mapRiskLevel(isHarmful) {
      // 将后端的 isHarmful 映射到前端的 risk 级别
      if (isHarmful === '1' || isHarmful === true || isHarmful === 1) {
        return 'risk';
      } else if (isHarmful === '0' || isHarmful === false || isHarmful === 0) {
        return 'safe';
      } else {
        return 'unknown';
      }
    },
    
    getRiskDescription(isHarmful) {
      const risk = this.mapRiskLevel(isHarmful);
      switch (risk) {
        case 'safe':
          return 'This plant is generally safe for most people.';
        case 'risk':
          return 'Potential allergen risk. Avoid close contact.';
        default:
          return 'Risk level unknown. Exercise caution.';
      }
    }
  }
};
</script>

<style scoped>
/* 中文：页面整体采用浅色背景；右侧卡片白底。
   English: page background is light; cards use plain white. */
.image-page {
  /* 背景图片高度控制，完全覆盖到第三个卡片下面 */
  width: 100%;
  margin: 0;
  padding: 24px 0 40px 0;
  background-color: #f3faf5;
  background-image: url('/images/Image Detection Background.png');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 620px; /* 刚好覆盖到第三个卡片下面一点点 */
  /* 移除 min-height，让页面高度适应内容，消除下方空隙 */
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr; /* 增加右侧结果区域宽度 */
  gap: 32px; /* 增加间距 */
  max-width: 1280px; /* 扩大整体宽度 */
  margin: 0 auto;
  padding: 0 20px;
}

/* Left panel: upload area */
.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 垂直居中对齐 */
  gap: 16px;
  min-height: 600px; /* 确保有足够的高度进行居中 */
  margin-top: -40px; /* 稍微向上移动一点点 */
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-box {
  width: 320px;
  height: 200px;
  border: 2px dashed #c8ddd0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  position: relative;
  overflow: hidden;
}

.upload-box:hover {
  border-color: #24b36b;
  background: rgba(255, 255, 255, 0.9);
}

.upload-box.has-image {
  border: 2px solid #24b36b;
  background: transparent;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* 图片预览覆盖层 */
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-overlay .preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.preview-overlay .close-preview {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 90, 90, 0.9);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 10;
}

.preview-overlay .close-preview:hover {
  background: #ff5a5a;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.upload-tip {
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.hidden-input {
  display: none;
}

.upload-btn {
  height: 44px;
  width: 320px; /* 与上传框同宽对齐 */
  padding: 0 16px;
  border-radius: 10px;
  border: none;
  background: #24b36b;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.06s ease, background 0.2s ease;
}
.upload-btn:hover { background: #1aa361; }
.upload-btn:active { transform: translateY(1px); }

.upload-success {
  background: #fff7cc;
  border: 1px solid #ffec99;
  color: #6a5e00;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 14px;
}

/* Loading indicator styles */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid #e7ecea;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #24b36b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* Loading dots animation for result cards */
.loading-dots::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}

/* 旧的预览样式已移除，现在使用覆盖层预览 */

/* Right panel: results */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 18px 16px;
  min-height: 110px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(231, 236, 234, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
}

/* 第一个结果卡片(最高置信度)更大更显眼 */
.result-card.primary-result {
  background: rgba(255, 255, 255, 0.95);
  padding: 24px 20px; /* 更大的内边距 */
  min-height: 140px; /* 更高 */
  border: 2px solid #24b36b; /* 绿色边框突出显示 */
  box-shadow: 0 4px 16px rgba(36, 179, 107, 0.15);
  transform: scale(1.02); /* 稍微放大 */
}

.result-card.primary-result .card-title {
  font-size: 18px; /* 更大的标题 */
  font-weight: 700; /* 更粗的字体 */
}

.result-card.primary-result .card-confidence {
  font-size: 14px; /* 更大的置信度文字 */
  font-weight: 600;
  color: #24b36b; /* 绿色高亮 */
}

.result-card.primary-result .card-description {
  font-size: 14px; /* 更大的描述文字 */
}

/* 其他结果卡片稍小一些 */
.result-card.secondary-result {
  opacity: 0.9;
  transform: scale(0.98);
}

.result-card.loading-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #24b36b;
  box-shadow: 0 2px 12px rgba(36, 179, 107, 0.15);
  animation: pulse-card 2s ease-in-out infinite;
}

@keyframes pulse-card {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 12px rgba(36, 179, 107, 0.15);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(36, 179, 107, 0.25);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px; /* 增加间距：从6px改为8px */
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  line-height: 1.3; /* 增加行高 */
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge.safe { background: #d4edda; color: #155724; }
.badge.risk { background: #f8d7da; color: #721c24; }
.badge.unknown { background: #e2e3e5; color: #6c757d; }

.card-confidence {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
  margin: 0 0 8px 0; /* 增加间距：从6px改为8px */
}

.card-description {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.5; /* 增加行高 */
  margin: 0;
  flex-grow: 1; /* 让描述占用剩余空间 */
}

/* 📱 Complete Responsive Design System */
/* 📱 Mobile devices (320px - 767px) */
@media (max-width: 767px) {
  .image-page {
    padding: 16px 0 20px 0;
    background-size: 100% 480px; /* Mobile: smaller background */
  }
  
  .image-grid {
    grid-template-columns: 1fr; /* Mobile: single column layout */
    gap: 16px;
    padding: 0 12px;
    max-width: 100%;
  }
  
  .left-panel {
    min-height: 400px; /* Mobile: reduce height */
    justify-content: center;
    margin-top: -20px;
  }
  
  .upload-box,
  .upload-btn,
  .preview-wrapper {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  
  .upload-box {
    height: 200px; /* Mobile: smaller upload area */
  }
  
  .result-card {
    min-height: 80px;
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .result-card.primary-result {
    transform: scale(1); /* Mobile: no scaling for primary */
  }
}

/* 📱 Large mobile / Small tablet (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .upload-box,
  .upload-btn,
  .preview-wrapper {
    width: 320px;
  }
  
  .upload-box {
    height: 240px;
  }
}

/* 📱 Tablet devices (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .image-page {
    background-size: 100% 580px;
  }
  
  .image-grid {
    grid-template-columns: 1fr 1.2fr; /* Tablet: adjust ratio */
    gap: 24px;
    padding: 0 20px;
    max-width: 900px;
  }
  
  .left-panel {
    min-height: 500px;
    margin-top: -30px;
  }
  
  .upload-box {
    width: 300px;
    height: 280px;
  }
  
  .result-card {
    min-height: 90px;
    padding: 14px;
  }
}

/* 🖥️ Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .image-page {
    background-size: 100% 620px;
  }
  
  .image-grid {
    grid-template-columns: 1fr 1.4fr;
    gap: 32px;
    max-width: 1100px;
  }
  
  .left-panel {
    min-height: 600px;
    margin-top: -40px;
  }
}

/* 🖥️ Large desktop (1440px+) */
@media (min-width: 1440px) {
  .image-page {
    background-size: 100% 620px;
  }
  
  .image-grid {
    grid-template-columns: 1fr 1.4fr;
    gap: 40px;
    max-width: 1280px;
  }
  
  .left-panel {
    min-height: 600px;
    margin-top: -40px;
  }
}

/* 📱 Very small screens (<320px) */
@media (max-width: 319px) {
  .image-grid {
    padding: 0 8px;
    gap: 12px;
  }
  
  .upload-box,
  .upload-btn,
  .preview-wrapper {
    width: 100%;
    max-width: 240px;
  }
  
  .upload-box {
    height: 180px;
  }
  
  .result-card {
    min-height: 70px;
    padding: 10px;
    margin-bottom: 10px;
  }
}
</style>