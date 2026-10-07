/**
 * ============================================================================
 * NeuroScan — Automated Brain Tumor Detection Platform (Backend API Server)
 * Course: Web Technology (ETCS336 - Pattern 2024R1) | DES Pune University
 * ============================================================================
 * Academic Project Demonstration:
 * - Unit IV: Express/Node.js REST API, JSON schemas, middleware error handling
 * - Unit V: Security headers (CSP, OWASP protections), CORS, Request logging
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Security & Diagnostic Middleware
// ==========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom Security Headers Middleware (Unit V: OWASP Best Practices)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy for Academic Demonstration
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com data: blob:; img-src 'self' data: blob: https:;"
  );
  next();
});

// Request Logging Middleware with High-Resolution Timing (Unit II / IV)
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${timeInMs}ms)`);
  });
  next();
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, '')));

// ==========================================
// 2. In-Memory Database Store (Unit IV)
// ==========================================
let mockPatients = [];
let mockAuditLogs = [];

// Predefined Tumor Classes & ICD-10 Clinical Mapping
const TUMOR_CATALOG = {
  'glioma': {
    name: 'Glioma (Glioblastoma Multiforme Spectrum)',
    icd10: 'C71.9',
    severity: 'High / Critical',
    typicalLocation: 'Frontal / Temporal Lobe Intraparenchymal',
    recommendations: [
      'Urgent neurosurgical consultation for stereotactic biopsy or craniotomy resection.',
      'Recommend MR Spectroscopy & Perfusion-weighted MRI to evaluate hemodynamic vascularity.',
      'Initiate dexamethasone regimen if mass effect or midline shift is evident on coronal slices.'
    ]
  },
  'meningioma': {
    name: 'Meningioma (Extra-Axial Dural-Based Mass)',
    icd10: 'D32.9',
    severity: 'Moderate / High',
    typicalLocation: 'Parasagittal / Sphenoid Ridge / Convexity',
    recommendations: [
      'Evaluate dural tail sign on post-contrast T1-weighted images.',
      'Surgical excision planning (Simpson Grade I/II goal) if symptomatic with mass effect.',
      'Periodic serial MRI monitoring (6-month interval) for asymptomatic small lesions.'
    ]
  },
  'pituitary': {
    name: 'Pituitary Adenoma (Sellar / Suprasellar Expansion)',
    icd10: 'D35.2',
    severity: 'Moderate',
    typicalLocation: 'Sella Turcica / Suprasellar Cistern',
    recommendations: [
      'Order comprehensive pituitary endocrine panel (Prolactin, GH, ACTH, TSH, IGF-1).',
      'Formal Automated Humphrey Visual Field testing to evaluate optic chiasm compression.',
      'Evaluate transsphenoidal endoscopic resection or dopamine agonist medical therapy.'
    ]
  },
  'normal': {
    name: 'No Tumor Detected (Healthy Neuro-Anatomy)',
    icd10: 'Z01.89',
    severity: 'Normal / Benign',
    typicalLocation: 'Symmetric Bilateral Parenchyma',
    recommendations: [
      'Normal ventricular volume with preserved gray-white matter differentiation.',
      'No evidence of intracranial space-occupying lesion, midline shift, or acute hemorrhage.',
      'Discharge to routine clinical follow-up as symptomatic indications dictate.'
    ]
  }
};

// ==========================================
// 3. REST API Endpoints (Unit IV)
// ==========================================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    platform: 'NeuroScan Brain Tumor MRI Diagnostic Platform',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    modelArchitecture: 'Hybrid ResNet-50 + Spatial Vision Transformer (ViT-B/16)'
  });
});

// Authentication Simulation (Simulated JWT Token)
app.post('/api/auth/login', (req, res) => {
  const { doctorId, role, pin } = req.body;
  if (!doctorId || !role) {
    return res.status(400).json({ error: 'Missing clinician identifier or role credentials.' });
  }

  // Generate a mock JWT-like token
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: doctorId,
    role: role,
    institution: 'DES Pune University Medical Center',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (8 * 3600)
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'DESPU_ETCS336_SECRET_KEY')
    .update(`${header}.${payload}`)
    .digest('base64url');

  const token = `${header}.${payload}.${signature}`;

  res.json({
    success: true,
    token: token,
    session: {
      doctorId,
      role,
      issuedAt: new Date().toISOString(),
      expiresIn: '8 Hours'
    }
  });
});

// Patients API: List & Filter
app.get('/api/patients', (req, res) => {
  const { search, status, gender } = req.query;
  let results = [...mockPatients];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.primarySymptoms.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'all') {
    results = results.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (gender && gender !== 'all') {
    results = results.filter(p => p.gender.toLowerCase() === gender.toLowerCase());
  }

  res.json({
    count: results.length,
    patients: results
  });
});

// Patients API: Register New Patient
app.post('/api/patients', (req, res) => {
  const { name, age, gender, bloodGroup, phone, primarySymptoms, medicalHistory } = req.body;

  // Validation
  if (!name || !age || !gender) {
    return res.status(400).json({ error: 'Name, age, and gender are mandatory clinical fields.' });
  }

  const newPatient = {
    id: `NS-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name.trim(),
    age: parseInt(age, 10),
    gender: gender,
    bloodGroup: bloodGroup || 'Unknown',
    phone: phone || 'N/A',
    admissionDate: new Date().toISOString().split('T')[0],
    primarySymptoms: primarySymptoms || 'Not documented',
    medicalHistory: medicalHistory || 'None reported',
    status: 'Diagnosis Pending',
    mriScans: []
  };

  mockPatients.unshift(newPatient);
  res.status(201).json({ success: true, patient: newPatient });
});

// Patients API: Get Single Patient
app.get('/api/patients/:id', (req, res) => {
  const patient = mockPatients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: `Patient with ID ${req.params.id} not found.` });
  }
  res.json(patient);
});

// AI Diagnosis Simulation Endpoint (Unit II Async & Unit IV REST)
app.post('/api/diagnose', (req, res) => {
  const { patientId, presetKey, scanType, customScan, doctorSignature } = req.body;

  // Determine diagnosis target from preset or simulated scan feature extraction
  let targetClass = 'glioma';
  if (presetKey) {
    const key = presetKey.toLowerCase();
    if (key.includes('meningioma')) targetClass = 'meningioma';
    else if (key.includes('pituitary')) targetClass = 'pituitary';
    else if (key.includes('normal') || key.includes('healthy')) targetClass = 'normal';
    else targetClass = 'glioma';
  } else {
    // If custom image uploaded, generate deterministic hash classification based on payload
    const hash = crypto.createHash('md5').update(customScan || Date.now().toString()).digest('hex');
    const mod = parseInt(hash.substring(0, 2), 16) % 4;
    const classes = ['glioma', 'meningioma', 'pituitary', 'normal'];
    targetClass = classes[mod];
  }

  const catalogEntry = TUMOR_CATALOG[targetClass];

  // Generate realistic Softmax probability distribution
  let primaryConfidence = parseFloat((91.5 + Math.random() * 7.5).toFixed(1));
  if (targetClass === 'normal') {
    primaryConfidence = parseFloat((97.2 + Math.random() * 2.5).toFixed(1));
  }

  const remainder = 100 - primaryConfidence;
  const p2 = parseFloat((remainder * 0.6).toFixed(1));
  const p3 = parseFloat((remainder * 0.3).toFixed(1));
  const p4 = parseFloat((remainder - p2 - p3).toFixed(1));

  const probabilities = {
    glioma: targetClass === 'glioma' ? primaryConfidence : (targetClass === 'normal' ? p4 : p2),
    meningioma: targetClass === 'meningioma' ? primaryConfidence : (targetClass === 'glioma' ? p2 : p3),
    pituitary: targetClass === 'pituitary' ? primaryConfidence : (targetClass === 'meningioma' ? p3 : p2),
    normal: targetClass === 'normal' ? primaryConfidence : (targetClass === 'glioma' ? p4 : p3)
  };

  // ROI Heatmap Coordinates (Normalized 0.0 - 1.0 bounding box & center)
  const roiCoordinates = {
    glioma: { x: 0.58, y: 0.38, width: 0.24, height: 0.22, contourRadius: 42 },
    meningioma: { x: 0.36, y: 0.26, width: 0.20, height: 0.20, contourRadius: 36 },
    pituitary: { x: 0.50, y: 0.62, width: 0.18, height: 0.16, contourRadius: 28 },
    normal: { x: 0.50, y: 0.50, width: 0.0, height: 0.0, contourRadius: 0 }
  }[targetClass];

  const scanId = `SCN-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();

  // Create cryptographic verification signature
  const signatureData = `${scanId}:${patientId || 'ANON'}:${targetClass}:${primaryConfidence}:${timestamp}`;
  const verificationHash = crypto.createHash('sha256').update(signatureData).digest('hex');

  const resultPayload = {
    scanId,
    timestamp,
    patientId: patientId || 'NS-GUEST',
    classification: catalogEntry.name,
    predictedClass: targetClass,
    confidence: primaryConfidence,
    severity: catalogEntry.severity,
    icd10: catalogEntry.icd10,
    typicalLocation: catalogEntry.typicalLocation,
    probabilities,
    roi: roiCoordinates,
    recommendations: catalogEntry.recommendations,
    verificationHash,
    neuralNetworkMetadata: {
      architecture: 'Hybrid ResNet-50 + Spatial Vision Transformer (ViT-B/16)',
      inputResolution: '256x256x1 Grayscale MRI',
      inferenceLatencyMs: Math.floor(140 + Math.random() * 45),
      floatingPointPrecision: 'FP16 TensorRT Optimized'
    }
  };

  // If patient ID provided, update in-memory record
  if (patientId) {
    const patient = mockPatients.find(p => p.id === patientId);
    if (patient) {
      patient.status = targetClass === 'normal' ? 'Clear / Healthy' : 'Diagnosed';
      patient.mriScans.unshift({
        scanId,
        scanDate: timestamp.split('T')[0],
        type: scanType || 'T1-CE Axial',
        tumorType: catalogEntry.name,
        confidence: primaryConfidence,
        status: 'Completed'
      });
    }
  }

  // Append to Audit Logs
  mockAuditLogs.unshift({
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp,
    doctorName: doctorSignature || 'Dr. Rajesh Kulkarni',
    role: 'Attending Radiologist',
    patientId: patientId || 'NS-GUEST',
    action: 'AI MRI Diagnostic Inference Executed',
    result: `${catalogEntry.name} (${primaryConfidence}%)`,
    signatureHash: verificationHash
  });

  res.json(resultPayload);
});

// Audit Logs API (Unit IV / V Compliance)
app.get('/api/audit-logs', (req, res) => {
  res.json({
    count: mockAuditLogs.length,
    logs: mockAuditLogs
  });
});

// ==========================================
// 4. Global Error Handling Middleware (Unit IV)
// ==========================================
app.use((err, req, res, next) => {
  console.error('[CRITICAL SERVER ERROR]:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal NeuroScan Server Error',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
});

// 404 Fallback for unhandled API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
});

// Fallback to index.html for Single-Page Application routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🧠 NeuroScan AI Diagnostic Platform running at http://localhost:${PORT}`);
  console.log('================================================================');
});
