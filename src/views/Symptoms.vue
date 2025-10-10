<template>
  <div class="symptoms-page">
    <!-- back button -->
    <div class="back-button-container">
      <div class="back-button-column">
        <button class="back-button" @click="goBackToResources">
          ← Back to Resources
        </button>
      </div>
      <div class="back-button-spacer"></div>
    </div>

    <!-- page title -->
    <section class="title-section">
      <div class="page-container">
        <h1 class="page-title">{{ pageData.title }}</h1>
      </div>
    </section>

    <!-- symptoms checklist section -->
    <section class="checklist-section">
      <div class="page-container">
        <!-- 左侧：症状清单 | Left: checklist list -->
        <div class="left-column">
          <div class="checklist-panel">
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
          </div>
        </div>

        <!-- 右侧：提示卡片 | Right: tips card -->
        <div class="right-column">
          <!-- simple advice -->
          <div class="advice-panel">
            <div class="advice-box" v-if="checkedCount > 0">
              <p class="advice-text">{{ advice }}</p>
            </div>
          </div>
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
    // this computed returns how many symptoms are checked
    // returns: number - count of selected checklist items
    checkedCount() {
      return this.symptoms.filter(symptom => symptom.checked).length;
    }
  },

  methods: {
    // this method handles the back button click to return to resources page
    // returns: nothing, but navigates back to resources view
    goBackToResources() {
      // tell parent component to switch back to resources tab
      this.$parent.setActiveItem('resources');
    },

    // this method updates the advice text based on number of checks
    // returns: nothing, but fills the advice box with tailored help
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
    // reset advice on first load so box is hidden
    this.advice = '';
  }
}
</script>

<style scoped>


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
  
  --item-spacing: 4px;
  --title-spacing: 24px;
  
  --font-heading: 'Questrial', sans-serif;
  --font-body: 'AR One Sans', sans-serif;
}


/* page container - centered with comfortable gutters */
.page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 32px;
}


/* symptoms page - white background */
.symptoms-page {
  background: #FFFFFF;
  min-height: calc(100vh - 105px - 60px);
  padding: 64px 0 var(--spacing-xl);
}

/* back button container - align with checklist left edge */
.back-button-container {
  background: #FFFFFF;
  padding: 20px 0 0;
  max-width: 1100px;
  margin: 0 auto;
  padding-left: 32px;
  padding-right: 32px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr; /* match checklist layout */
  gap: 24px;
}

/* back button column */
.back-button-column {
  width: 100%;
}

/* back button spacer */
.back-button-spacer {
  width: 100%;
}

/* back button - navigation return to resources page */
.back-button {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.3s ease;
  margin-bottom: 16px;
  /* align left with checklist inner padding (16px) */
  margin-left: 16px;
}

.back-button:hover {
  color: #1a7a84;
  text-decoration: underline;
}


/* title section - compact line height */
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
  text-align: center;
}


/* checklist area - single column layout */
.checklist-section {
  padding: 0;
}

.checklist-section .page-container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr; /* left checklist, right tips */
  gap: 24px;
  align-items: start;
  max-width: 1100px; /* wider so two columns have room */
}

/* two-column wrappers */
.left-column, .right-column { width: 100%; }

/* left checklist panel card */
.checklist-panel {
  background: #FFFFFF;
  border: none; /* remove outer border for cleaner look */
  border-radius: 10px;
  padding: 16px 16px 8px;
}

/* right tips panel container - vertically center */
.right-column { display: flex; align-items: center; }
.advice-panel { position: static; }

/* right tips card fine-tuning inside column */
.right-column .advice-box {
  margin: 0; /* align to top, no extra outside margin on desktop */
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.checklist-grid {
  display: flex;
  flex-direction: column;
  gap: var(--item-spacing);
  max-width: 100%;
}


/* single symptom item - clean rhythm */
.symptom-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  cursor: pointer;
}

.symptom-item:hover {
  cursor: pointer;
}


/* checkbox container - square design */
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


/* square check mark - use brand color when checked */
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


/* checked state - green background with white tick */
.symptom-checkbox:checked + .checkmark {
  background: var(--color-checkbox-checked);
}

.symptom-checkbox:checked + .checkmark .check-icon {
  color: var(--color-checkmark);
}


/* focus accessibility - keyboard navigation */
.symptom-checkbox:focus-visible + .checkmark {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(35, 155, 167, 0.2);
}


/* symptom label - simple black text */
.symptom-label {
  flex: 1;
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 18px;
  line-height: 1.5;
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


/* responsive design - progressive enhancement */



@media (max-width: 767px) {
  .checklist-section .page-container {
    display: block; /* stack on small screens */
  }
  .page-container {
    padding: 0 16px;
  }
  
  .back-button-container {
    padding: 16px 0 0;
    padding-left: 16px;
    padding-right: 16px;
    display: block; /* single column on mobile */
  }
  
  .back-button {
    font-size: 14px;
    margin-bottom: 12px;
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
  
  .checklist-grid { gap: 4px; }
  
  .symptom-item { padding: 4px 8px; }
  
  .symptom-label { font-size: 14px; line-height: 1.4; }
  
  .right-column { display: block; }
  .advice-panel { position: static; }
  .advice-box { padding: 16px; margin-top: 20px; margin-bottom: 32px; }
  
  .advice-text {
    font-size: 14px;
  }
}


@media (min-width: 480px) and (max-width: 767px) {
  .page-container {
    padding: 0 20px;
  }
  
  .back-button-container {
    padding-left: 20px;
    padding-right: 20px;
    display: block; /* single column on small mobile */
  }
  
  .page-title {
    font-size: clamp(28px, 5vw, 30px);
  }
  
  .checklist-grid { gap: 5px; }
  
  .symptom-item { padding: 5px 10px; }
  
  .symptom-label { font-size: 15px; line-height: 1.4; }
}


@media (min-width: 768px) and (max-width: 1023px) {
  .checklist-section .page-container {
    grid-template-columns: 1fr; /* stack on tablets */
  }
  .page-container {
    padding: 0 32px;
  }
  
  .back-button-container {
    max-width: 600px;
    padding-left: 32px;
    padding-right: 32px;
    display: block; /* single column on tablets */
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
  
  .checklist-grid { gap: 6px; max-width: 600px; margin: 0 auto; }
  
  .symptom-item { padding: 6px 8px; }
  
  .right-column { display: block; }
  .advice-panel { position: static; }
  .advice-box { max-width: 600px; margin: 32px auto 40px; padding: 20px; }
}


@media (min-width: 1024px) and (max-width: 1439px) {
  .checklist-section .page-container {
    grid-template-columns: 1.05fr 0.95fr; /* subtle balance */
  }
  .page-container {
    padding: 0 40px;
  }
  
  .back-button-container {
    max-width: 700px;
    padding-left: 40px;
    padding-right: 40px;
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
  
  .checklist-grid { gap: 7px; max-width: 700px; margin: 0 auto; }
  
  .symptom-item { padding: 7px 9px; }
  
  .right-column .advice-box { max-width: 700px; margin: 0; padding: 24px; }
}


@media (min-width: 1440px) {
  .checklist-section .page-container {
    grid-template-columns: 1.1fr 0.9fr;
  }
  .page-container {
    padding: 0 48px;
  }
  
  .back-button-container {
    max-width: 800px;
    padding-left: 48px;
    padding-right: 48px;
  }
  /* symptoms page */ 
  .symptoms-page {
    padding: 64px 0;
  }
  
  /* page title */
  .page-title {
    font-size: 40px;
  }
  
  .title-section {
    margin-bottom: 48px;
  }
  
  .checklist-grid { gap: 8px; max-width: 800px; margin: 0 auto; }
  
  .symptom-item { padding: 8px 10px; }
  
  .right-column .advice-box { max-width: 800px; margin: 0; padding: 28px; }
}


@media (max-width: 319px) {
  .page-container {
    padding: 0 12px;
  }
  
  .back-button-container {
    padding-left: 12px;
    padding-right: 12px;
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


/* enhance interaction to improve UX */
.symptom-item:hover .checkmark {
  box-shadow: 0 2px 4px rgba(35, 155, 167, 0.15);
}


/* make sure first item default checked (if needed) */


/* simple advice box */
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

/* title section styling */
.title-section {
  padding-bottom: 8px;
}

/* card-like hover for symptom item (feels clickable)
   - only a tiny background hint, don't distract too much */
.symptom-item:hover {
  background: rgba(35, 155, 167, 0.04);
  border-radius: 8px;
}

/* when checkbox checked, softly highlight the label color
   - using :has selector for parent awareness */
.symptom-item:has(.symptom-checkbox:checked) .symptom-label {
  color: #239BA7;
}

/* make the check mark pop a little more when active */
.symptom-item:has(.symptom-checkbox:checked) .checkmark {
  box-shadow: 0 2px 6px rgba(35, 155, 167, 0.25);
}
</style>
