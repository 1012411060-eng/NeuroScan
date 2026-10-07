/**
 * ============================================================================
 * NeuroScan — Main Application Bootstrapper & Coordinator (Unit I - V)
 * Course: Web Technology (ETCS336 - Pattern 2024R1) | DES Pune University
 * ============================================================================
 */

import { Store } from './state/store.js';
import { Toast } from './utils/toast.js';
import { Security } from './utils/security.js';
import { KeyboardManager } from './utils/keyboard.js';
import { NavbarComponent } from './components/navbar.js';
import { PatientPortalComponent } from './components/patientPortal.js';
import { CanvasViewerComponent } from './components/canvasViewer.js';
import { AIDiagnosticsComponent } from './components/aiDiagnostics.js';
import { ReportModalComponent } from './components/reportModal.js';
import { ApiService } from './services/api.js';

class NeuroScanApp {
  async init() {
    console.log('🧠 Initializing NeuroScan Medical AI Platform...');

    // 1. Initialize Global Utilities
    Toast.init();
    KeyboardManager.init();

    // 2. Initialize Core Components
    NavbarComponent.init();
    PatientPortalComponent.init();
    CanvasViewerComponent.init();
    AIDiagnosticsComponent.init();
    ReportModalComponent.init();

    // 3. Register Global Keyboard Shortcuts
    this._registerShortcuts();

    // 4. Bind Patient Registration Form
    this._bindPatientForm();

    // 5. Bind Role Switcher Modal Close Buttons
    this._bindModals();

    // 6. Register Progressive Web App Service Worker (Unit V)
    this._registerServiceWorker();

    console.log('✅ NeuroScan platform fully loaded and ready.');
  }

  _registerShortcuts() {
    // Ctrl + U -> Trigger Upload
    KeyboardManager.register('ctrl+u', () => {
      const fileInput = document.getElementById('input-mri-file');
      if (fileInput) fileInput.click();
    });

    // Ctrl + D -> Run Diagnosis
    KeyboardManager.register('ctrl+d', () => {
      const runBtn = document.getElementById('btn-run-diagnosis');
      if (runBtn && !runBtn.disabled) runBtn.click();
    });

    // Ctrl + P -> Open Report / Print
    KeyboardManager.register('ctrl+p', () => {
      const modal = document.getElementById('report-modal');
      if (modal) modal.classList.remove('hidden');
    });
  }

  _bindPatientForm() {
    const form = document.getElementById('form-register-patient');
    const modal = document.getElementById('new-patient-modal');
    const errBox = document.getElementById('form-patient-errors');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById('reg-patient-name').value,
        age: document.getElementById('reg-patient-age').value,
        gender: document.getElementById('reg-patient-gender').value,
        bloodGroup: document.getElementById('reg-patient-blood').value,
        phone: document.getElementById('reg-patient-phone').value,
        primarySymptoms: document.getElementById('reg-patient-symptoms').value,
        medicalHistory: document.getElementById('reg-patient-history').value
      };

      // OWASP Validation (Unit V)
      const validation = Security.validatePatientPayload(formData);
      if (!validation.isValid) {
        if (errBox) {
          errBox.innerHTML = validation.errors.map(err => `<div>• ${Security.escapeHTML(err)}</div>`).join('');
          errBox.classList.remove('hidden');
        }
        return;
      }

      if (errBox) errBox.classList.add('hidden');

      // Create patient via API with local store fallback
      const result = await ApiService.createPatient(formData);
      if (result && result.patient) {
        Store.addPatient(result.patient);
        Toast.show(`Patient ${result.patient.name} (${result.patient.id}) registered successfully!`, 'success');
        if (modal) modal.classList.add('hidden');
        form.reset();
      }
    });
  }

  _bindModals() {
    // New Patient Modal Close
    const patientModal = document.getElementById('new-patient-modal');
    const patientCloseBtn = document.getElementById('btn-close-new-patient-modal');

    if (patientModal && patientCloseBtn) {
      patientCloseBtn.addEventListener('click', () => patientModal.classList.add('hidden'));
      patientModal.addEventListener('click', (e) => {
        if (e.target === patientModal) patientModal.classList.add('hidden');
      });
    }
  }

  _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new NeuroScanApp();
  app.init();
});
