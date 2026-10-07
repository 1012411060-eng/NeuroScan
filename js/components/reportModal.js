/**
 * ============================================================================
 * NeuroScan — Medical Diagnostic Report Generator (Unit I, III & IV)
 * Printable clinical report with hospital headers, PACS preview, and digital signature
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { Security } from '../utils/security.js';
import { Toast } from '../utils/toast.js';

export const ReportModalComponent = {
  init() {
    this.bindEvents();

    // Re-render report preview when diagnosis or patient updates
    Store.subscribe('currentDiagnosis', () => this.renderReportContent());
    Store.subscribe('selectedPatientId', () => this.renderReportContent());
    Store.subscribe('currentDoctor', () => this.renderReportContent());
  },

  bindEvents() {
    const modal = document.getElementById('report-modal');
    const closeBtn = document.getElementById('btn-close-report-modal');
    const printBtn = document.getElementById('btn-print-report');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
        Toast.show('Print dialogue initiated.', 'info');
      });
    }

    // Modal background click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }
  },

  renderReportContent() {
    const container = document.getElementById('report-preview-body');
    if (!container) return;

    const { patients, selectedPatientId, currentDoctor, currentDiagnosis, activeImageSource } = Store.getState();
    const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

    if (!currentDiagnosis) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-400 text-sm">
          <i class="fas fa-microscope text-4xl mb-3 text-slate-500 block"></i>
          Please run AI Inference first to generate a full diagnostic report.
        </div>
      `;
      return;
    }

    const { scanId, timestamp, classification, confidence, severity, icd10, probabilities, recommendations, verificationHash, neuralNetworkMetadata } = currentDiagnosis;

    container.innerHTML = `
      <div id="printable-medical-report" class="bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-200">
        
        <!-- Hospital & Academic Header -->
        <div class="flex items-center justify-between pb-6 border-b-2 border-slate-900">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
              <i class="fas fa-brain"></i>
            </div>
            <div>
              <h1 class="text-xl font-black tracking-tight text-slate-950 uppercase">NeuroScan Clinical Informatics</h1>
              <p class="text-xs font-semibold text-slate-700">DES Pune University Medical Center • Department of Neuro-Radiology</p>
              <p class="text-[11px] text-slate-500">ISO 13485 / HL7-FHIR Compatible AI Diagnostic Platform</p>
            </div>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 rounded bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-300">
              ACCESSION: ${scanId}
            </span>
            <p class="text-[11px] text-slate-500 mt-1">Date: ${new Date(timestamp).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <p class="text-[11px] text-slate-500 font-mono">Time: ${new Date(timestamp).toLocaleTimeString('en-IN')}</p>
          </div>
        </div>

        <!-- Patient Demographics Box -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
            <strong class="text-slate-900 text-sm">${Security.escapeHTML(patient.name)}</strong>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Patient ID (MRN)</span>
            <strong class="text-slate-900 font-mono">${patient.id}</strong>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Age / Gender</span>
            <strong class="text-slate-900">${patient.age} Years / ${patient.gender}</strong>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Blood Group</span>
            <strong class="text-slate-900">${patient.bloodGroup}</strong>
          </div>
          <div class="col-span-2">
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Primary Symptoms & Indications</span>
            <span class="text-slate-800">${Security.escapeHTML(patient.primarySymptoms)}</span>
          </div>
          <div class="col-span-2">
            <span class="text-slate-500 block text-[10px] uppercase font-bold">Medical History</span>
            <span class="text-slate-800">${Security.escapeHTML(patient.medicalHistory)}</span>
          </div>
        </div>

        <!-- MRI Scan Preview & Findings Grid -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          <!-- Processed Scan Thumbnail -->
          <div class="border border-slate-300 rounded-lg p-2 bg-slate-950 text-center">
            <img src="${activeImageSource || ''}" alt="Processed Brain MRI" class="w-full h-auto rounded border border-slate-800 max-h-48 object-contain mx-auto" />
            <span class="text-[10px] text-slate-400 font-mono mt-1 block">T1-CE Axial Brain MRI Matrix (512x512)</span>
          </div>

          <!-- Diagnostic Classification & Probability Breakdown -->
          <div class="md:col-span-2 text-xs space-y-3">
            <div class="p-3.5 rounded-lg bg-sky-50 border border-sky-200">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase font-bold text-sky-900">AI Diagnostic Finding</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white font-mono">
                  ${confidence}% CONFIDENCE
                </span>
              </div>
              <h3 class="text-base font-extrabold text-slate-900 mt-1">${classification}</h3>
              <p class="text-slate-600 text-xs mt-0.5">Clinical Classification Severity: <strong>${severity}</strong> • ICD-10 Code: <strong class="font-mono">${icd10}</strong></p>
            </div>

            <!-- Softmax Probabilities Table -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th class="px-3 py-1.5">Pathology Class</th>
                    <th class="px-3 py-1.5">ICD-10</th>
                    <th class="px-3 py-1.5 text-right">Probability (%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr>
                    <td class="px-3 py-1.5 font-medium">Glioma (Glioblastoma)</td>
                    <td class="px-3 py-1.5 font-mono text-slate-500">C71.9</td>
                    <td class="px-3 py-1.5 text-right font-mono font-bold">${probabilities.glioma}%</td>
                  </tr>
                  <tr>
                    <td class="px-3 py-1.5 font-medium">Meningioma</td>
                    <td class="px-3 py-1.5 font-mono text-slate-500">D32.9</td>
                    <td class="px-3 py-1.5 text-right font-mono font-bold">${probabilities.meningioma}%</td>
                  </tr>
                  <tr>
                    <td class="px-3 py-1.5 font-medium">Pituitary Adenoma</td>
                    <td class="px-3 py-1.5 font-mono text-slate-500">D35.2</td>
                    <td class="px-3 py-1.5 text-right font-mono font-bold">${probabilities.pituitary}%</td>
                  </tr>
                  <tr>
                    <td class="px-3 py-1.5 font-medium">No Tumor (Healthy)</td>
                    <td class="px-3 py-1.5 font-mono text-slate-500">Z01.89</td>
                    <td class="px-3 py-1.5 text-right font-mono font-bold">${probabilities.normal}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Clinical Recommendations -->
        <div class="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <h4 class="font-bold text-slate-900 mb-2">Automated Clinical Recommendations & Protocol:</h4>
          <ul class="list-disc list-inside space-y-1 text-slate-700">
            ${recommendations.map(r => `<li>${Security.escapeHTML(r)}</li>`).join('')}
          </ul>
        </div>

        <!-- Physician Signature & Verification Hash -->
        <div class="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 items-end">
          <div class="text-[11px] text-slate-500">
            <p><strong>Neural Model:</strong> ${neuralNetworkMetadata.architecture}</p>
            <p><strong>Inference Latency:</strong> ${neuralNetworkMetadata.inferenceLatencyMs} ms</p>
            <p class="font-mono break-all text-[9px] mt-1 text-slate-400">SHA-256 Sig: ${verificationHash}</p>
          </div>
          
          <div class="text-right">
            <div class="inline-block border-b-2 border-slate-800 pb-1 px-4 mb-1">
              <span class="font-serif italic text-lg text-slate-900">${currentDoctor.name}</span>
            </div>
            <p class="text-xs font-bold text-slate-900">${currentDoctor.name}</p>
            <p class="text-[11px] text-slate-600">${currentDoctor.role} • ${currentDoctor.badge}</p>
            <p class="text-[10px] text-slate-400">DES Pune University Medical Center</p>
          </div>
        </div>

        <!-- Academic Disclaimer Footer -->
        <div class="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 uppercase tracking-wider">
          Strictly for Educational / Academic Evaluation — DES Pune University B.Tech CSE (ETCS336)
        </div>

      </div>
    `;
  }
};
