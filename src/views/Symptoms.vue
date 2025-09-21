<template>
  <div class="symptoms-page">
    <!-- Page Title -->
    <!-- 页面标题 -->
    <section class="title-section">
      <div class="page-container">
        <h1 class="page-title">{{ pageData.title }}</h1>
      </div>
    </section>

    <!-- Symptoms Checklist Section -->
    <!-- 症状清单区域 -->
    <section class="checklist-section">
      <div class="page-container">
        <div class="checklist-grid">
          <div 
            v-for="symptom in symptoms" 
            :key="symptom.id"
            class="symptom-item"
          >
            <div class="checkbox-container">
              <input 
                type="checkbox" 
                :id="symptom.id"
                v-model="symptom.checked"
                class="symptom-checkbox"
                @change="updateAdvice"
              />
              <div class="checkmark">
                <span class="check-icon">✓</span>
              </div>
            </div>
            <label :for="symptom.id" class="symptom-label">
              {{ symptom.text }}
            </label>
          </div>
        </div>
        
        <!-- Simple advice -->
        <!-- 简单建议 -->
        <div class="advice-box" v-if="checkedCount > 0">
          <p class="advice-text">{{ advice }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Symptoms',
  data() {
    return {
      pageData: {
        title: 'Recognize & Manage Hay Fever Symptoms',
        buttonText: 'Watch'
      },
      symptoms: [
        { id: 'sneezing', text: 'Frequent sneezing', checked: false },
        { id: 'nose', text: 'Blocked or runny nose', checked: false },
        { id: 'eyes', text: 'Itchy and watery eyes', checked: false },
        { id: 'throat', text: 'Itchy throat, ears or roof of mouth', checked: false },
        { id: 'cough', text: 'Coughing or throat irritation', checked: false },
        { id: 'drip', text: 'Postnasal drip (mucus running down the back of the throat)', checked: false },
        { id: 'pressure', text: 'Sinus pressure or headaches', checked: false },
        { id: 'fatigue', text: 'Fatigue or poor sleep from persistent symptoms', checked: false },
        { id: 'concentration', text: 'Reduced concentration during daytime activities', checked: false }
      ],
      
      advice: ''
    }
  },

  computed: {
    checkedCount() {
      return this.symptoms.filter(symptom => symptom.checked).length;
    }
  },

  methods: {
    updateAdvice() {
      const count = this.checkedCount;
      if (count <= 3) {
        this.advice = "💡 Mild symptoms:\n• Try over-the-counter antihistamines (cetirizine, loratadine)\n• Keep windows closed during high pollen periods\n• Use saline nasal sprays\n• Wear sunglasses outdoors\n• Consider using air purifiers at home";
      } else if (count <= 6) {
        this.advice = "⚠️ Moderate symptoms:\n• Consider prescription nasal corticosteroid sprays\n• Use combination antihistamine + decongestant medications\n• Get allergen-proof bedding covers\n• Use air purifiers at home\n• Monitor pollen forecasts and plan outdoor activities\n• Shower after outdoor exposure";
      } else {
        this.advice = "🚨 Severe symptoms:\n• Consult with an allergist for immunotherapy treatment\n• Use prescription-strength medications\n• Consider short-term oral steroids if recommended by doctor\n• Avoid outdoor activities during peak pollen times\n• Use HEPA air filters\n• Consider moving to coastal areas where pollen levels are lower";
      }
    }
  },

  mounted() {
    // Don't show advice initially - only show when user checks symptoms
    // 初始不显示建议 - 只有用户勾选症状后才显示
    this.advice = '';
  }
}
</script>

<style scoped>
/* CSS Variables - Simple clean design */
/* CSS变量 - 简洁清爽设计 */
:root {
  --color-primary: #239BA7;
  --color-success: #4CAF50;
  --color-background: #FFFFFF;
  --color-text-primary: #333333;
  --color-checkbox: #E7E7E7;
  --color-checkbox-checked: #4CAF50;
  --color-checkmark: #FFFFFF;
  
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 40px;
  
  --item-spacing: 12px;
  --title-spacing: 24px;
  
  --font-heading: 'Questrial', sans-serif;
  --font-body: 'AR One Sans', sans-serif;
}

/* Page Container - Centered with generous spacing */
/* 页面容器 - 居中且留白充足 */
.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Symptoms Page - White background */
/* 症状页面 - 白色背景 */
.symptoms-page {
  background: #FFFFFF;
  min-height: calc(100vh - 105px - 60px);
  padding: 64px 0 var(--spacing-xl);
}

/* Title Section - Compact line height */
/* 标题区域 - 紧凑行高 */
.title-section {
  font-size: 42px;
  margin-top: 44px;
  margin-bottom: 48px;
}

.page-title {
  font-family: var(--font-heading);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 42px);
  line-height: 1.1;
  color: var(--color-text-primary);
  margin: 0;
  text-align: left;
}

/* Checklist Section - Single column layout */
/* 清单区域 - 单列布局 */
.checklist-section {
  padding: 0;
}

.checklist-grid {
  display: flex;
  flex-direction: column;
  gap: var(--item-spacing);
  max-width: 100%;
}

/* Individual Symptom Item - Clean rhythm */
/* 单个症状项目 - 清洁节奏 */
.symptom-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
  cursor: pointer;
}

.symptom-item:hover {
  cursor: pointer;
}

/* Checkbox Container - Square design */
/* 复选框容器 - 方形设计 */
.checkbox-container {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.checkbox-container:hover {
  cursor: pointer;
}

.symptom-checkbox {
  position: absolute;
  opacity: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 2;
}

/* Square Checkmark - Brand color when checked */
/* 方形复选标记 - 选中时使用品牌色 */
.checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #E7E7E7;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  pointer-events: none;
}

.checkmark:hover {
  cursor: pointer;
  transform: scale(1.02);
}

.check-icon {
  font-size: 16px;
  font-weight: bold;
  color: transparent;
  transition: color 0.3s ease;
  line-height: 1;
}

/* Checked state - Green background with white checkmark */
/* 选中状态 - 绿色背景配白色对勾 */
.symptom-checkbox:checked + .checkmark {
  background: var(--color-checkbox-checked);
}

.symptom-checkbox:checked + .checkmark .check-icon {
  color: var(--color-checkmark);
}

/* Focus accessibility - Keyboard navigation */
/* 焦点无障碍 - 键盘导航 */
.symptom-checkbox:focus-visible + .checkmark {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(35, 155, 167, 0.2);
}

/* Symptom Label - Simple black text */
/* 症状标签 - 简洁黑色文本 */
.symptom-label {
  flex: 1;
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 18px;
  line-height: 2.2;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  margin: 0;
  transition: color 0.3s ease;
}

.symptom-label:hover {
  cursor: pointer;
  color: #555555;
}

/* Responsive Design - Progressive enhancement */
/* 响应式设计 - 渐进式增强 */

/* 📱 Complete Responsive Design System for Symptoms */
/* 📱 Mobile devices (320px - 767px) */
@media (max-width: 767px) {
  .page-container {
    padding: 0 16px;
  }
  
  .symptoms-page {
    padding: 32px 0;
  }
  
  .page-title {
    font-size: clamp(24px, 6vw, 28px);
    margin-bottom: 20px;
  }
  
  .title-section {
    margin-bottom: 24px;
  }
  
  .checklist-grid {
    gap: 12px;
  }
  
  .symptom-item {
    padding: 12px 16px;
  }
  
  .symptom-label {
    font-size: 14px;
  }
  
  .advice-box {
    padding: 16px;
    margin-top: 20px;
    margin-bottom: 32px;
  }
  
  .advice-text {
    font-size: 14px;
  }
}

/* 📱 Large mobile (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .page-container {
    padding: 0 20px;
  }
  
  .page-title {
    font-size: clamp(28px, 5vw, 30px);
  }
  
  .checklist-grid {
    gap: 14px;
  }
  
  .symptom-item {
    padding: 14px 18px;
  }
  
  .symptom-label {
    font-size: 15px;
  }
}

/* 📱 Tablet devices (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .page-container {
    padding: 0 32px;
  }
  
  .symptoms-page {
    padding: 44px 0;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .title-section {
    margin-bottom: 32px;
  }
  
  .checklist-grid {
    gap: 16px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .symptom-item {
    padding: 16px 20px;
  }
  
  .advice-box {
    max-width: 600px;
    margin: 32px auto 40px;
    padding: 20px;
  }
}

/* 🖥️ Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .page-container {
    padding: 0 40px;
  }
  
  .symptoms-page {
    padding: 56px 0;
  }
  
  .page-title {
    font-size: 36px;
  }
  
  .title-section {
    margin-bottom: 40px;
  }
  
  .checklist-grid {
    gap: 18px;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .symptom-item {
    padding: 18px 22px;
  }
  
  .advice-box {
    max-width: 700px;
    margin: 40px auto 48px;
    padding: 24px;
  }
}

/* 🖥️ Large desktop (1440px+) */
@media (min-width: 1440px) {
  .page-container {
    padding: 0 48px;
  }
  
  .symptoms-page {
    padding: 64px 0;
  }
  
  .page-title {
    font-size: 40px;
  }
  
  .title-section {
    margin-bottom: 48px;
  }
  
  .checklist-grid {
    gap: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .symptom-item {
    padding: 20px 24px;
  }
  
  .advice-box {
    max-width: 800px;
    margin: 48px auto 56px;
    padding: 28px;
  }
}

/* 📱 Very small screens (<320px) */
@media (max-width: 319px) {
  .page-container {
    padding: 0 12px;
  }
  
  .symptoms-page {
    padding: 24px 0;
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .checklist-grid {
    gap: 10px;
  }
  
  .symptom-item {
    padding: 10px 14px;
  }
  
  .symptom-label {
    font-size: 13px;
  }
  
  .advice-box {
    padding: 12px;
    margin-top: 16px;
    margin-bottom: 24px;
  }
  
  .advice-text {
    font-size: 13px;
  }
}

/* Enhanced interactions for better UX */
/* 增强交互以改善用户体验 */
.symptom-item:hover .checkmark {
  box-shadow: 0 2px 4px rgba(35, 155, 167, 0.15);
}

/* Ensure first item is checked by default (if needed) */
/* 确保第一项默认选中（如需要） */

/* Simple advice box */
/* 简单建议框 */
.advice-box {
  background: #F0F8FF;
  border: 1px solid #239BA7;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
  margin-bottom: 40px;
}

.advice-text {
  font-family: var(--font-body);
  font-size: 16px;
  color: #333;
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
}
</style>
