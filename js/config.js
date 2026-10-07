/**
 * ============================================================================
 * NeuroScan — Application Configuration & Syllabus Metadata
 * Course: Web Technology (ETCS336 - Pattern 2024R1) | DES Pune University
 * ============================================================================
 */

export const CONFIG = {
  APP_NAME: 'NeuroScan',
  APP_SUBTITLE: 'Automated Brain Tumor Detection Platform',
  VERSION: '1.0.0',
  COURSE_CODE: 'ETCS336',
  COURSE_NAME: 'Web Technology (Pattern 2024R1)',
  INSTITUTION: 'DES Pune University — Department of Computer Science & Engineering',
  API_BASE_URL: '/api',

  // Mock Clinician Profiles (Role-Based Access Control)
  DOCTOR_PROFILES: [
    {
      id: 'DOC-101',
      name: 'Dr. Rajesh Kulkarni',
      role: 'Senior Radiologist',
      specialty: 'Neuro-Radiology & MRI Diagnostics',
      badge: 'MD, DM (Neuro-Imaging)',
      avatar: '👨‍⚕️',
      permissions: ['read', 'diagnose', 'verify', 'sign_report']
    },
    {
      id: 'DOC-102',
      name: 'Dr. Ananya Sharma',
      role: 'Lead Neurologist',
      specialty: 'Neuro-Oncology & Surgical Planning',
      badge: 'MCh (Neurosurgery), AIIMS',
      avatar: '👩‍⚕️',
      permissions: ['read', 'diagnose', 'verify', 'surgical_notes', 'sign_report']
    },
    {
      id: 'DOC-103',
      name: 'Dr. Priya Nair',
      role: 'Clinical Research Fellow',
      specialty: 'Biomedical AI & Machine Learning',
      badge: 'PhD (Bioinformatics)',
      avatar: '🔬',
      permissions: ['read', 'diagnose', 'export_dataset']
    },
    {
      id: 'DOC-104',
      name: 'Tech. Vikram Sen',
      role: 'Senior Imaging Technician',
      specialty: 'MRI PACS Acquisition & Calibration',
      badge: 'B.Sc (Radiological Tech)',
      avatar: '🩺',
      permissions: ['read', 'upload_scans', 'adjust_filters']
    }
  ],

  // Diagnostic Classes & Metadata
  TUMOR_TYPES: {
    glioma: {
      label: 'Glioma',
      fullName: 'Glioma (Glioblastoma Multiforme Spectrum)',
      icd10: 'C71.9',
      color: '#f43f5e', // Rose
      description: 'Intra-axial neuroepithelial tumor arising from glial cells with infiltrative border.'
    },
    meningioma: {
      label: 'Meningioma',
      fullName: 'Meningioma (Dural-Based Extra-Axial Mass)',
      icd10: 'D32.9',
      color: '#f59e0b', // Amber
      description: 'Benign or atypical extra-axial tumor arising from arachnoid cap cells of the meninges.'
    },
    pituitary: {
      label: 'Pituitary Adenoma',
      fullName: 'Pituitary Adenoma (Sellar/Suprasellar Expansion)',
      icd10: 'D35.2',
      color: '#8b5cf6', // Purple
      description: 'Neuroendocrine tumor originating from anterior pituitary gland with sellar remodeling.'
    },
    normal: {
      label: 'No Tumor',
      fullName: 'No Tumor Detected (Healthy Neuro-Anatomy)',
      icd10: 'Z01.89',
      color: '#10b981', // Emerald
      description: 'Symmetric brain parenchyma with preserved ventricles and intact sulcal architecture.'
    }
  },

  // ETCS336 Syllabus Unit Mapping
  SYLLABUS_MAPPING: [
    {
      unit: 'Unit I',
      title: 'Web Foundations & Modern Browser Architecture',
      topics: [
        'Semantic HTML5 Architecture (<main>, <section>, <article>, <aside>, <nav>, <header>, <footer>)',
        'WCAG 2.2 AA Compliance with dynamic ARIA attributes (role="dialog", aria-live="polite", aria-expanded)',
        'Advanced CSS Grid and Flexbox responsive layouts with dynamic Dark & Light Theme system',
        'Critical Rendering Path optimizations, modern typography hierarchy, and glassmorphism styling'
      ]
    },
    {
      unit: 'Unit II',
      title: 'Modern JavaScript (ES2020+) & Async Architecture',
      topics: [
        'Modern ES2020+ module architecture, arrow functions, destructuring, and optional chaining',
        'Non-blocking Event Loop execution management with requestAnimationFrame rendering cycles',
        'Promises, Async/Await microtask management, and AbortController request cancellation pattern',
        'Custom Pub/Sub Reactive Event Bus ensuring decoupled state dispatching'
      ]
    },
    {
      unit: 'Unit III',
      title: 'Frontend Frameworks & Reactive State Management',
      topics: [
        'Component-Driven Architecture dividing UI into standalone, reusable, encapsulated modules',
        'Reactive dynamic state store with subscriber notifications on state mutations',
        'Persistent LocalStorage synchronization with data schema versioning',
        'Interactive HTML5 Canvas multi-layer image processing (brightness, contrast, zoom, Jet/Viridis colormaps, ROI bounding)'
      ]
    },
    {
      unit: 'Unit IV',
      title: 'Backend APIs, Databases & Authentication',
      topics: [
        'Express/Node.js RESTful API architecture (/api/diagnose, /api/patients, /api/auth, /api/audit-logs)',
        'Structured JSON schemas and robust middleware error handling pipelines',
        'Simulated JWT (JSON Web Token) generation with HMAC-SHA256 signature verification',
        'Role-Based Access Control (RBAC) across Radiologists, Neurologists, Researchers, and Technicians'
      ]
    },
    {
      unit: 'Unit V',
      title: 'Security, Performance & Progressive Web Apps (PWAs)',
      topics: [
        'OWASP Top 10 mitigation: DOM XSS sanitization, strict input validation, and CSP response headers',
        'PWA implementation: web app manifest.json and Service Worker (sw.js) for background offline caching',
        'Core Web Vitals tuning: sub-100ms UI response, fast paint cycles, and zero layout shifts',
        'Accessible keyboard shortcuts (Ctrl+U, Ctrl+D, Ctrl+P, Esc) and focus trap management'
      ]
    }
  ]
};
