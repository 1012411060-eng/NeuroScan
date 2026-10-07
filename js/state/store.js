/**
 * ============================================================================
 * NeuroScan — Reactive Application State Store (Unit III State Management)
 * ============================================================================
 */

import { CONFIG } from '../config.js';

const STORAGE_KEYS = {
  PATIENTS: 'neuroscan_patients_v1',
  CURRENT_DOCTOR: 'neuroscan_doctor_v1',
  THEME: 'neuroscan_theme_v1',
  AUDIT_LOGS: 'neuroscan_audit_v1',
  RECENT_DIAGNOSES: 'neuroscan_diagnoses_v1'
};

const DEFAULT_PATIENTS = [
  {
    id: 'NS-1042',
    name: 'Aarav Patel',
    age: 48,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98231 45012',
    admissionDate: '2026-10-02',
    primarySymptoms: 'Severe chronic morning cephalalgia, left-sided motor weakness',
    medicalHistory: 'Hypertension (5 yrs), Non-smoker',
    status: 'Diagnosis Pending',
    mriScans: [
      {
        scanId: 'SCN-8801',
        scanDate: '2026-10-05',
        type: 'T1-CE Axial',
        tumorType: 'Glioma',
        confidence: 96.8,
        status: 'Confirmed'
      }
    ]
  },
  {
    id: 'NS-1043',
    name: 'Sunita Deshmukh',
    age: 54,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 94220 87319',
    admissionDate: '2026-10-04',
    primarySymptoms: 'Visual field deficit (bitemporal hemianopsia), endocrine fatigue',
    medicalHistory: 'Hypothyroidism, No prior cranial surgeries',
    status: 'High Priority',
    mriScans: [
      {
        scanId: 'SCN-8802',
        scanDate: '2026-10-06',
        type: 'T2-FLAIR Coronal',
        tumorType: 'Pituitary Adenoma',
        confidence: 94.2,
        status: 'Reviewed'
      }
    ]
  },
  {
    id: 'NS-1044',
    name: 'Rohan Joshi',
    age: 36,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 97654 11092',
    admissionDate: '2026-10-06',
    primarySymptoms: 'Focal seizure with secondary generalization',
    medicalHistory: 'No chronic illnesses, Athlete',
    status: 'Under Review',
    mriScans: [
      {
        scanId: 'SCN-8803',
        scanDate: '2026-10-07',
        type: 'T1-Post Contrast',
        tumorType: 'Meningioma',
        confidence: 92.5,
        status: 'Confirmed'
      }
    ]
  },
  {
    id: 'NS-1045',
    name: 'Kavita Menon',
    age: 29,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 91588 34901',
    admissionDate: '2026-10-07',
    primarySymptoms: 'Post-concussion routine screening after low-impact motor accident',
    medicalHistory: 'Clear neurological baseline',
    status: 'Clear / Healthy',
    mriScans: [
      {
        scanId: 'SCN-8804',
        scanDate: '2026-10-07',
        type: 'T2-Weighted Axial',
        tumorType: 'No Tumor Detected',
        confidence: 99.1,
        status: 'Verified'
      }
    ]
  }
];

class StateStore {
  constructor() {
    this.subscribers = new Map();
    this.state = {
      theme: this._load(STORAGE_KEYS.THEME, 'dark'),
      currentDoctor: this._load(STORAGE_KEYS.CURRENT_DOCTOR, CONFIG.DOCTOR_PROFILES[0]),
      patients: this._load(STORAGE_KEYS.PATIENTS, DEFAULT_PATIENTS),
      selectedPatientId: 'NS-1042',
      activePresetKey: 'glioma',
      activeImageSource: null, // HTMLImageElement or data URL
      activeScanType: 'T1-CE Axial',
      isAnalyzing: false,
      analysisProgress: 0,
      currentDiagnosis: null,
      auditLogs: this._load(STORAGE_KEYS.AUDIT_LOGS, []),
      canvasFilters: {
        brightness: 0,
        contrast: 0,
        zoom: 1.0,
        panX: 0,
        panY: 0,
        invert: false,
        colormap: 'grayscale', // 'grayscale' | 'jet' | 'viridis' | 'turbo'
        showROI: true,
        showGrid: false
      }
    };
  }

  // Get current state snapshot
  getState() {
    return { ...this.state };
  }

  // Reactive state mutation with dispatch notification
  setState(patch) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...patch };

    // Auto-persist relevant slices to LocalStorage
    if (patch.theme !== undefined) this._save(STORAGE_KEYS.THEME, this.state.theme);
    if (patch.currentDoctor !== undefined) this._save(STORAGE_KEYS.CURRENT_DOCTOR, this.state.currentDoctor);
    if (patch.patients !== undefined) this._save(STORAGE_KEYS.PATIENTS, this.state.patients);
    if (patch.auditLogs !== undefined) this._save(STORAGE_KEYS.AUDIT_LOGS, this.state.auditLogs);

    // Notify registered subscribers
    for (const key of Object.keys(patch)) {
      if (this.subscribers.has(key)) {
        this.subscribers.get(key).forEach(callback => callback(this.state[key], prevState[key], this.state));
      }
    }

    // Global wild-card subscriber notification
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(callback => callback(this.state, prevState));
    }
  }

  // Subscribe to specific state slice mutations
  subscribe(sliceKey, callback) {
    if (!this.subscribers.has(sliceKey)) {
      this.subscribers.set(sliceKey, new Set());
    }
    this.subscribers.get(sliceKey).add(callback);

    // Return un-subscribe function
    return () => {
      this.subscribers.get(sliceKey).delete(callback);
    };
  }

  // Update a nested canvas filter
  setFilter(filterKey, value) {
    const newFilters = { ...this.state.canvasFilters, [filterKey]: value };
    this.setState({ canvasFilters: newFilters });
  }

  // Reset all canvas filters to defaults
  resetFilters() {
    this.setState({
      canvasFilters: {
        brightness: 0,
        contrast: 0,
        zoom: 1.0,
        panX: 0,
        panY: 0,
        invert: false,
        colormap: 'grayscale',
        showROI: true,
        showGrid: false
      }
    });
  }

  // Add a newly registered patient
  addPatient(patient) {
    const updated = [patient, ...this.state.patients];
    this.setState({
      patients: updated,
      selectedPatientId: patient.id
    });
  }

  // Append diagnosis audit record
  addAuditLog(logEntry) {
    const logs = [logEntry, ...this.state.auditLogs];
    this.setState({ auditLogs: logs });
  }

  // Helper: Read from LocalStorage with fallback
  _load(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[Store] Failed to read ${key} from storage:`, e);
      return fallback;
    }
  }

  // Helper: Write to LocalStorage
  _save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[Store] Failed to write ${key} to storage:`, e);
    }
  }
}

export const Store = new StateStore();
