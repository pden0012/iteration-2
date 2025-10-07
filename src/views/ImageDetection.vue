<template>
  <div class="image-page">
    <!-- big page title shown at the top -->
    <div class="page-header">
      <h1 class="page-title">Plant Hayfever Risk Identifier</h1>
    </div>
    <div class="image-grid">
      <!-- left side: upload -->
      <div class="left-panel">
        <div class="upload-section">
          <!-- upload area gets covered by image -->
          <div class="upload-box" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
            <!-- show image preview or upload hint -->
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
          
          <!-- loading indicator -->
          <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
            <p class="loading-text">Analyzing image...</p>
          </div>
        </div>
      </div>
      
      <!-- right side: results -->
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
          <!-- removed scientific name line -->
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
      results: [], 
      isLoading: false,
      retryCount: 0,
      maxRetries: 1
    };
  },
  computed: {
    
    topResults() {
      
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
    // this method programmatically opens the hidden file input
    // returns: nothing, just triggers the OS file picker dialog
    triggerFileInput() {
      // click the hidden file input to open file picker
      this.$refs.fileInput.click();
    },
    
    // this method handles when user selects a file from file picker
    // it validates the file type and size, then shows preview and starts analysis
    // parameters: event - the file input change event
    // returns: nothing, but updates component state and calls detectImage
    // this method handles the change event of file input
    // params: event - input change event with files list
    // returns: nothing, validates file, shows preview, calls detectImage
    async onFileChange(event) {
      // get the first file from the input
      const file = event.target.files && event.target.files[0];
      if (!file) return; // exit if no file selected
      
      // check if file type is supported image format
      if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/.test(file.type)) {
        alert('Only JPG, PNG, WEBP, HEIC, and HEIF image files are allowed.');
        return;
      }
      
      // check file size limit (2MB)
      const maxSize = 2 * 1024 * 1024; 
      if (file.size > maxSize) {
        alert('Image size must be less than 2MB.');
        return;
      }
      
      // store the file and mark upload as successful
      this.selectedFile = file;
      this.uploadSuccess = true;
      
      // create file reader to show image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        // set the preview image data
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // send to backend for detection - analyze the uploaded image
      await this.detectImage(file);
    },
    
    // this method clears the image preview and resets all related state
    // it's called when user clicks the X button on preview
    // returns: nothing, but resets component state to initial values
    // this method resets selected file and preview state
    // returns: nothing, brings component to initial visual state
    clearPreview() {
      // remove the image preview
      this.imagePreview = null;
      // reset upload success flag
      this.uploadSuccess = false;
      // clear selected file
      this.selectedFile = null;
      // clear previous results
      this.results = [];
      // reset the file input value
      this.$refs.fileInput.value = '';
    },
    
    // this method builds the correct API URL based on environment
    // it checks if we're in development or production mode
    // parameters: path - the API endpoint path to append
    // returns: string - the complete API URL
    // this method builds base API url depending on dev/prod environment
    // params: path - api path suffix like '/ai/image'
    // returns: string complete url
    getApiUrl(path) {
      // check if we're in development mode
      const isDev = import.meta.env.DEV;
      if (isDev) {
        // use local development server
        return `http://localhost:3003/api${path}`;
      } else {
        // use production proxy server (relative path)
        return `/api${path}`;
      }
    },
    
    // this method sends the uploaded image to AI service for plant identification
    // it handles the API request, response processing, and error handling
    // parameters: file - the image file to analyze
    // returns: nothing, but updates this.results with plant identification data
    // this method sends image to backend AI and maps response to results
    // params: file - a File object from input
    // returns: nothing, but updates results/loading/error states
    async detectImage(file) {
      try {
        // show loading state to user
        this.isLoading = true;
        
        // build the API URL for image detection
        const url = this.getApiUrl('/ai/image');
        // create form data for file upload
        const form = new FormData();
        form.append('image', file);
        form.append('text', ' '); // empty text field required by API
        
        // special handling for JPEG files to ensure proper format
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          const blob = new Blob([file], { type: 'image/jpeg' });
          form.set('image', blob, 'image.jpg');
        }
        
        // log the request for debugging
        console.log('🔄 Using our own HTTPS proxy server for image detection...');
        console.log('Request URL:', url);
        
        // send the request with timeout
        const res = await fetch(url, {
          method: 'POST',
          body: form,
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        // check if request was successful
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        // parse the JSON response
        const json = await res.json();
        
        console.log('Detection result:', json);
        
        // process the response data
        if (json.data && Array.isArray(json.data)) {
          // map each result to our component format
          this.results = json.data.map(item => ({
            title: item.commonName || item.name || 'Unknown Species',
            scientificName: item.scientificName || item.scientific_name || '',
            description: this.getRiskDescription(item.isHarmful),
            risk: this.mapRiskLevel(item.isHarmful)
          }));
        } else {
          // handle unexpected response format
          console.warn('Unexpected API response format:', json);
          this.results = [{
            title: 'Analysis Complete',
            scientificName: '',
            risk: 'unknown',
            description: 'Image analysis completed, but no specific plant species were identified. Please try with a clearer image.'
          }];
        }
        
      } catch (error) {
        // handle any errors that occur during detection
        console.error('Image detection failed:', error);
        
        // create user-friendly error message based on error type
        let errorMessage = 'Failed to analyze image. ';
        if (error.message.includes('CORS proxy')) {
          errorMessage += 'Network service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('All CORS proxy services failed')) {
          errorMessage += 'All network services are currently unavailable. Please try again in a few minutes.';
        } else {
          errorMessage += 'Please check your internet connection and try again.';
        }
        
        // show error result to user
        this.results = [{
          title: 'Analysis Failed',
          scientificName: '',
          risk: 'unknown',
          description: errorMessage + ' Click "Change Image" to try again.'
        }];
        
        // reset retry count
        this.retryCount = 0;
      } finally {
        // always hide loading state
        this.isLoading = false;
      }
    },
    
    // this method converts the API's harmful flag to our risk level string
    // it handles different data types that the API might return
    // parameters: isHarmful - boolean, string, or number indicating if plant is harmful
    // returns: string - 'risk', 'safe', or 'unknown'
    mapRiskLevel(isHarmful) {
      // check if plant is harmful (various formats)
      if (isHarmful === '1' || isHarmful === true || isHarmful === 1) {
        return 'risk';
      } else if (isHarmful === '0' || isHarmful === false || isHarmful === 0) {
        return 'safe';
      } else {
        // if value is unclear, mark as unknown
        return 'unknown';
      }
    },
    
    // this method creates a user-friendly description based on plant risk level
    // it converts the risk level to a readable message for the user
    // parameters: isHarmful - the harmful flag from API
    // returns: string - human-readable risk description
    getRiskDescription(isHarmful) {
      // first convert to our risk level format
      const risk = this.mapRiskLevel(isHarmful);
      // return appropriate description based on risk level
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
/* English: page background is light; cards use plain white. */
.image-page {
  /* background image height control, covers completely to below third card */
  width: 100%;
  margin: 0;
  padding: 24px 0 40px 0;
  background-color: #f3faf5;
  background-image: url('/images/Image Detection Background.png');
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 700px; 
  
}


.page-header {
  max-width: 1280px;
  margin: 0 auto 8px auto;
  padding: 0 20px;
}


.page-title {
  margin: 0 0 8px 0;
  font-family: var(--font-heading, 'Questrial', sans-serif);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 400;
  text-align: center;
  line-height: 1.2;
  color: #1b3a2a;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr; /* increase right panel width */
  gap: 32px; /* increase spacing */
  max-width: 1280px; /* expand overall width */
  margin: 0 auto;
  padding: 0 20px;
}


.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* vertical center alignment */
  gap: 16px;
  min-height: 600px; /* ensure sufficient height for centering */
  margin-top: -40px; /* move up slightly */
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

/* image preview overlay */
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
  width: 320px; /* align with upload box width */
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

/* old preview styles removed, now using overlay preview */


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

/* first result card (highest confidence) is larger and more prominent */
.result-card.primary-result {
  background: rgba(255, 255, 255, 0.95);
  padding: 24px 20px; /* larger padding */
  min-height: 140px; /* taller */
  border: 2px solid #24b36b; /* green border for emphasis */
  box-shadow: 0 4px 16px rgba(36, 179, 107, 0.15);
  transform: scale(1.02); /* slightly larger */
}

.result-card.primary-result .card-title {
  font-size: 18px; /* larger title */
  font-weight: 700; /* bolder font */
}

.result-card.primary-result .card-confidence {
  font-size: 14px; /* larger confidence text */
  font-weight: 600;
  color: #24b36b; /* green highlight */
}

.result-card.primary-result .card-description {
  font-size: 14px; /* larger description text */
}

/* other result cards are slightly smaller */
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
  margin-bottom: 8px; 
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  line-height: 1.3; /* increase line height */
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
  margin: 0 0 8px 0; 
}

.card-description {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.5; /* increase line height */
  margin: 0;
  flex-grow: 1; /* let description take remaining space */
}



@media (max-width: 767px) {
  .image-page {
    padding: 16px 0 20px 0;
    background-size: 100% 520px; 
  }
  
  .page-header { padding: 0 12px; }
  .page-title { font-size: 22px; }
  
  .image-grid {
    grid-template-columns: 1fr; 
    gap: 16px;
    padding: 0 12px;
    max-width: 100%;
  }
  
  .left-panel {
    min-height: 400px; 
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
    height: 200px; 
  }
  
  .result-card {
    min-height: 80px;
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .result-card.primary-result {
    transform: scale(1); 
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


@media (min-width: 768px) and (max-width: 1023px) {
  .image-page {
    background-size: 100% 640px; 
  }
  
  .page-header { padding: 0 20px; }
  
  .image-grid {
    grid-template-columns: 1fr 1.2fr; 
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


@media (min-width: 1024px) and (max-width: 1439px) {
  .image-page {
    background-size: 100% 700px; 
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


@media (min-width: 1440px) {
  .image-page {
    background-size: 100% 700px; 
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