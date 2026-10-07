# 🧠 NeuroScan — Automated Brain Tumor Detection & Clinical Reporting Platform

## 📋 Executive Overview

**NeuroScan** is an end-to-end clinical medical web application that performs automated MRI-based brain tumor screening, multi-class Softmax classification (**Glioma**, **Meningioma**, **Pituitary Adenoma**, or **Healthy Normal**), and Grad-CAM Region of Interest (ROI) lesion localization with one-click printable medical diagnostic reports.


---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (Browser)                       │
│  Semantic HTML5 • Tailwind CSS • HTML5 Canvas 512x512 Image Matrix Pipeline  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (DOM Events / Shortcuts)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    REACTIVE CLIENT STATE STORE (ES2020+)                    │
│  - Active Doctor Session (RBAC)      - Patient Directory (LocalStorage Sync)│
│  - Canvas Filter State (Zoom/Pan)    - Audit Logs & Diagnostic Cache        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Async Fetch + AbortController)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                      EXPRESS.JS REST API BACKEND LAYER                      │
│  - /api/diagnose (ResNet-50 / Grad-CAM Simulation)                          │
│  - /api/patients (CRUD + Query Filters)                                     │
│  - /api/auth/login (Stateless Simulated JWT Generation)                     │
│  - Security Middlewares (CSP, CORS, Request Timers, OWASP Protections)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                      PWA & OFFLINE RESILIENCE LAYER                         │
│  - Service Worker (sw.js): Stale-While-Revalidate Caching                   │
│  - Offline Fallback Engine for Zero-Network Environments                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Key Features Walkthrough


### 1. Patient Management Portal
- Real-time search by Patient Name, ID (`NS-XXXX`), or symptoms.
- Filter by Triage Status (*Diagnosis Pending*, *High Priority*, *Under Review*, *Clear / Healthy*).
- New Patient Registration modal with client-side regex payload validation preventing XSS injection.

### 2. Interactive Canvas MRI Studio
- Preset 1-click loaders for **Glioma**, **Meningioma**, **Pituitary**, and **Normal Brain** scans (procedurally synthesized for zero external image dependencies).
- Drag-and-drop custom MRI uploader (JPEG, PNG, WebP < 5MB).
- Pixel-level adjustments: **Brightness**, **Contrast**, **Zoom & Pan**, **Invert Filter**, and Colormaps (**Grayscale**, **Jet Heatmap**, **Viridis Spectral**, **Turbo Gradient**).
- Dynamic **Region of Interest (ROI)** bounding box and Grad-CAM contour highlight.

### 3. Asynchronous AI Diagnostic Engine
- Non-blocking async inference pipeline with interactive terminal step logs:
  1. `Ingesting DICOM/Grayscale tensor matrix (512x512x1)`
  2. `Applying Hounsfield windowing [-100, 300 HU] & skull stripping`
  3. `ResNet-50 + Spatial Vision Transformer feature extraction`
  4. `Grad-CAM activation mapping & ROI saliency localization`
  5. `Calculating Softmax probability vector & ICD-10 recommendations`
- **Request Cancellation**: Dedicated `AbortController` cancellation button.

### 4. Printable Medical Diagnostic Report
- Patient demographics, scan acquisition metadata, processed MRI thumbnail, multi-class Softmax breakdown, physician signature block, and SHA-256 verification hash.
- `@media print` CSS layout ready for physical printing or PDF export.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | Trigger Automated AI Diagnostic Inference |
| <kbd>Ctrl</kbd> + <kbd>U</kbd> | Open Custom Brain MRI Upload Dialog |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Open & Print Official Medical Report |
| <kbd>Esc</kbd> | Close Any Open Modal Dialog |

---

## 📦 Directory Structure

```
NeuroScan/
├── package.json               # Project manifest, dependencies & scripts
├── server.js                  # Node.js + Express REST API server & middlewares
├── manifest.json              # PWA Web App Manifest
├── sw.js                      # PWA Service Worker for offline caching
├── index.html                 # Semantic HTML5 single-page application entry
├── README.md                  # Academic documentation & syllabus mapping
├── css/
│   └── styles.css             # Design tokens, glassmorphism, themes & print rules
└── js/
    ├── app.js                 # App coordinator, PWA registration & event binding
    ├── config.js              # Configurations, doctor profiles & syllabus data
    ├── state/
    │   └── store.js           # Reactive state store with LocalStorage sync
    ├── services/
    │   ├── api.js             # REST client with AbortController & offline fallback
    │   ├── auth.js            # Role-based permissions & JWT session handler
    │   └── mriPresets.js      # Procedural 512x512 MRI Canvas generator
    ├── components/
    │   ├── navbar.js          # Navigation, health badge, role & theme triggers
    │   ├── patientPortal.js   # Patient registry table, search/filter & register modal
    │   ├── canvasViewer.js    # HTML5 Canvas image filters, zoom, colormaps & ROI
    │   ├── aiDiagnostics.js   # Async AI terminal logs, Softmax charts & results
    │   ├── reportModal.js     # Printable official medical diagnosis report
    │   └── syllabusModal.js   # Interactive ETCS336 syllabus unit mapper
    └── utils/
        ├── security.js        # OWASP DOM XSS sanitization & input validator
        ├── toast.js           # Accessible notification toast system
        └── keyboard.js        # Global keyboard shortcuts manager
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18.x or higher)
- Modern Web Browser (Chrome, Firefox, Edge, or Safari)

### Step 1: Clone the Repository
```bash
git clone git@github-eng:1012411060-eng/NeuroScan.git
cd NeuroScan
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Launch Server
```bash
npm start
```
The application will launch at: **`http://localhost:3000`**



## 📡 REST API Documentation

### 1. Health & Syllabus Info
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "online",
  "version": "1.0.0",
  "platform": "NeuroScan Academic Medical AI Platform",
  "course": "Web Technology (ETCS336 - Pattern 2024R1)",
  "university": "DES Pune University",
  "uptimeSeconds": 42
}
```

### 2. Run AI Diagnostic Inference
- **Endpoint**: `POST /api/diagnose`
- **Payload**:
```json
{
  "patientId": "NS-1042",
  "presetKey": "glioma",
  "scanType": "T1-CE Axial",
  "doctorSignature": "Dr. Rajesh Kulkarni"
}
```
- **Response**:
```json
{
  "scanId": "SCN-8801",
  "classification": "Glioma (Glioblastoma Multiforme Spectrum)",
  "predictedClass": "glioma",
  "confidence": 96.8,
  "severity": "High / Critical",
  "icd10": "C71.9",
  "probabilities": {
    "glioma": 96.8,
    "meningioma": 1.9,
    "pituitary": 0.9,
    "normal": 0.4
  },
  "roi": { "x": 0.58, "y": 0.38, "width": 0.24, "height": 0.22 },
  "verificationHash": "a7f3e82d1c5b9e0f6a4d7b2c9e1a8f3d..."
}
```

### 3. Patient Management
- `GET /api/patients?search=Aarav&status=Diagnosis%20Pending`
- `POST /api/patients` (Registers new patient with validated JSON body)

