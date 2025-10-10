# Hay Fever Management Website - Vue Version

## Project Overview
This is a Vue 3-based hay fever management website that provides pollen and allergen tracking, educational resources, emergency health support, and other features.

## Tech Stack
- **Vue 3** - Frontend Framework
- **Vite** - Build Tool
- **CSS3** - Styling and Layout
- **JavaScript ES6+** - Programming Language

## Project Structure

### File Structure
```
/
├── index.html                 # Project Entry HTML File
├── package.json              # Project Dependencies Configuration
├── vite.config.js            # Vite Build Configuration
├── src/                      # Source Code Directory
│   ├── main.js              # Vue Application Entry File
│   ├── App.vue              # Root Component (Global Layout)
│   └── components/          # Vue Components Directory
│       └── HomePage.vue     # Homepage Component
├── public/                  # Public Resources Directory
│   └── images/             # Image Resources
│       ├── placeholder.txt # Image Description
│       └── icons/          # Icons Directory
└── README.md               # Project Documentation
```

### Component Architecture
1. **App.vue** - Root Component, responsible for global layout and navigation
   - Navigation Bar (including Logo and Menu)
   - Main Content Area
   - Footer
2. **HomePage.vue** - Homepage Component, contains all homepage content
   - Hero Section
   - Features Section
   - Info Section

### Component Hierarchy
```
App.vue (Root Component - Global Layout)
├── Navigation Bar (Built-in)
├── HomePage.vue (Homepage)
│   ├── Hero Section
│   ├── Features Section
│   └── Info Section
└── Footer (Built-in)
```

## Page Layout

### Design Features
- **Color Scheme**:
  - Primary Color: #239BA7 (Teal Blue)
  - Accent Color: #F9D65C (Golden Yellow)
  - Background Color: #FFFFFF (White)
  - Text Color: #1E1E1E (Dark Gray)

- **Typography**:
  - Headings: Questrial (Large Titles)
  - Body Text: Inter, AR One Sans, Average Sans

- **Layout**:
  - Responsive Design
  - Flexbox and Grid Layout
  - Rounded Corner Design Elements
  - Card-based Layout

### Feature Modules
1. **Pollen Tracker**: Real-time display of pollen index, tree, grass, ragweed, dust levels for your location
2. **Map Functionality**: Interactive Victoria map showing allergen hotspots and safe zones
3. **Trend Analysis**: Track allergen patterns over time and outlook of pollen and allergen conditions
4. **Educational Resources**: Articles, guides and tips for managing hay fever naturally and medically
5. **Health Support**: Quick access to clinics, pharmacies and urgent care contacts

## Development Guide

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Build Production Version
```bash
npm run build
```

### Preview Production Version
```bash
npm run preview
```

## Vue Features

### Component-based Development
- **App.vue** - Global layout and navigation management
- **HomePage.vue** - Homepage content organization
- All styles are encapsulated in their respective components
- Using Composition API and Options API

### Reactive Data
- Using Vue's reactive system for state management
- Data changes automatically update UI
- Computed properties and watchers

### Event Handling
- Button click event handling
- Component-to-component event communication
- Custom event emission

## Technical Specifications
- Vue 3 Composition API
- ES6+ JavaScript syntax
- CSS3 modern layout techniques
- Responsive design
- Accessibility support
- Cross-browser compatibility

## Usage Instructions
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Visit `http://localhost:3000` in your browser
4. Place image resources in `public/images/` directory
5. Website uses component-based design for easy maintenance and extension

## Deployment
1. Run `npm run build` to build production version
2. Deploy `dist/` directory to web server
3. Ensure image resources are properly placed

## Component Description

### App.vue
- **Responsibility**: Global layout and navigation management
- **Contains**: Navigation bar, main content area, footer
- **Features**:
  - Uses flexbox layout to ensure footer stays at bottom
  - Built-in navigation bar and footer, no additional components needed
  - Responsive design, mobile-friendly

### HomePage.vue
- **Responsibility**: Homepage content organization
- **Contains**: Hero section, features section, info section
- **Features**:
  - All homepage content integrated in one component
  - Uses emoji icons, no external image resources needed
  - Responsive design and animation effects
  - Event handling and interactive features

## Advantages
- **Simplified Structure**: Only 2 main components, easy to maintain
- **Self-contained Styles**: Each component contains its own styles
- **No External Dependencies**: No dependency on external image resources
- **Responsive Design**: Adapts to various screen sizes
- **Modern Development**: Uses Vue 3 and Vite
