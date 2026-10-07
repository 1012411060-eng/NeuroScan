/**
 * ============================================================================
 * NeuroScan — AI Diagnostics & Neural Analytics Component (Unit II, III & IV)
 * Multi-stage terminal log streaming, AbortController cancellation, and Softmax charts
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { ApiService } from '../services/api.js';
import { Toast } from '../utils/toast.js';
import { Security } from '../utils/security.js';

export const AIDiagnosticsComponent = {
  init() {
    this.render();
    this.bindEvents();

    // Subscribe to diagnosis state updates
    Store.subscribe('isAnalyzing', (isAnalyzing) => this.toggleAnalyzingState(isAnalyzing));
    Store.subscribe('currentDiagnosis', (diag) => this.renderResults(diag));
  },

  render() {
    const container = document.getElementById('ai-diagnostics-section');
    if (!container) return;

    container.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between">
        
        <!-- Section Header -->
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div>
              <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2.5">
                <i class="fas fa-microchip text-sky-400"></i>
                AI Neural Diagnostic Engine
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Multi-Class ResNet-50 + Grad-CAM Saliency Classifier
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                FP16 Inference
              </span>
            </div>
          </div>

          <!-- Diagnostic Action Buttons -->
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button id="btn-run-diagnosis" type="button" class="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition cursor-pointer">
              <i class="fas fa-play"></i>
              <span>Run Automated Inference</span>
            </button>

            <button id="btn-cancel-diagnosis" type="button" class="hidden py-3 px-4 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-2 transition cursor-pointer" aria-label="Cancel diagnosis request">
              <i class="fas fa-stop-circle"></i>
              <span>Cancel Request</span>
            </button>
          </div>

          <!-- Interactive Terminal Processing Stream -->
          <div class="mt-5">
            <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
              <span><i class="fas fa-terminal text-sky-400 mr-1.5"></i>Neural Processing Pipeline:</span>
              <span id="pipeline-status-text" class="text-slate-500">Ready</span>
            </div>
            
            <div id="terminal-stream" class="terminal-console p-3.5 rounded-xl h-28 overflow-y-auto text-xs leading-relaxed font-mono" aria-live="polite">
              <div class="text-slate-500">[System] NeuroScan AI-CAD Engine initialized. Waiting for inference trigger...</div>
            </div>
          </div>

          <!-- Progress Bar (Unit II Async Visualizer) -->
          <div id="diagnosis-progress-container" class="mt-3 hidden">
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div id="diagnosis-progress-bar" class="bg-gradient-to-r from-sky-400 to-emerald-400 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>

        <!-- Softmax Classification Results & Analytics Container -->
        <div id="diagnostic-results-container" class="mt-6 pt-5 border-t border-slate-700/60">
          <div class="text-center py-6 text-slate-500 text-xs">
            <i class="fas fa-chart-pie text-3xl mb-2 text-slate-600 block"></i>
            Click <strong>"Run Automated Inference"</strong> to generate multi-class Softmax probabilities, ROI localization, and clinical recommendations.
          </div>
        </div>

      </div>
    `;
  },

  bindEvents() {
    const runBtn = document.getElementById('btn-run-diagnosis');
    const cancelBtn = document.getElementById('btn-cancel-diagnosis');

    if (runBtn) {
      runBtn.addEventListener('click', () => this.executeDiagnosis());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        const cancelled = ApiService.cancelActiveRequest();
        if (cancelled) {
          Store.setState({ isAnalyzing: false });
          this.logToTerminal('[AbortController] Diagnostic request cancelled by operator.');
          Toast.show('Inference cancelled via AbortController.', 'warning');
        }
      });
    }
  },

  async executeDiagnosis() {
    const state = Store.getState();
    const { selectedPatientId, activePresetKey, activeScanType, currentDoctor } = state;

    Store.setState({ isAnalyzing: true, currentDiagnosis: null });
    this.clearTerminal();
    this.logToTerminal(`[0.0s] Initializing AI inference for Patient ${selectedPatientId}...`);

    const progressBar = document.getElementById('diagnosis-progress-bar');
    if (progressBar) progressBar.style.width = '20%';

    try {
      const payload = {
        patientId: selectedPatientId,
        presetKey: activePresetKey,
        scanType: activeScanType,
        doctorSignature: currentDoctor.name
      };

      const result = await ApiService.diagnoseScan(payload, (logMsg) => {
        this.logToTerminal(logMsg);
        if (progressBar) {
          const currentW = parseInt(progressBar.style.width, 10) || 20;
          progressBar.style.width = `${Math.min(95, currentW + 18)}%`;
        }
      });

      if (progressBar) progressBar.style.width = '100%';
      this.logToTerminal(`[2.0s] Inference completed successfully! Predicted: ${result.classification} (${result.confidence}%)`);

      Store.setState({
        isAnalyzing: false,
        currentDiagnosis: result
      });

      Toast.show(`Diagnosis Complete: ${result.classification} (${result.confidence}%)`, 'success');

    } catch (err) {
      if (err.name === 'AbortError') {
        this.logToTerminal('[Terminated] Operation aborted.');
      } else {
        this.logToTerminal(`[Error] Diagnostic inference failure: ${err.message}`);
        Toast.show(`Diagnosis error: ${err.message}`, 'error');
      }
      Store.setState({ isAnalyzing: false });
    }
  },

  toggleAnalyzingState(isAnalyzing) {
    const runBtn = document.getElementById('btn-run-diagnosis');
    const cancelBtn = document.getElementById('btn-cancel-diagnosis');
    const progressContainer = document.getElementById('diagnosis-progress-container');
    const statusText = document.getElementById('pipeline-status-text');

    if (runBtn) {
      runBtn.disabled = isAnalyzing;
      runBtn.classList.toggle('opacity-50', isAnalyzing);
      runBtn.classList.toggle('cursor-not-allowed', isAnalyzing);
    }

    if (cancelBtn) {
      cancelBtn.classList.toggle('hidden', !isAnalyzing);
    }

    if (progressContainer) {
      progressContainer.classList.toggle('hidden', !isAnalyzing);
    }

    if (statusText) {
      statusText.textContent = isAnalyzing ? 'Analyzing Neural Tensors...' : 'Ready';
      statusText.className = isAnalyzing ? 'text-sky-400 animate-pulse' : 'text-slate-500';
    }
  },

  renderResults(diag) {
    const container = document.getElementById('diagnostic-results-container');
    if (!container) return;

    if (!diag) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">
          <i class="fas fa-chart-pie text-3xl mb-2 text-slate-600 block"></i>
          Click <strong>"Run Automated Inference"</strong> to generate multi-class Softmax probabilities, ROI localization, and clinical recommendations.
        </div>
      `;
      return;
    }

    const { classification, predictedClass, confidence, severity, icd10, probabilities, recommendations } = diag;
    const isNormal = predictedClass === 'normal';
    const tagClass = isNormal ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

    container.innerHTML = `
      <div>
        <!-- Primary Classification Badge -->
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${tagClass}">
                <i class="fas ${isNormal ? 'fa-shield-alt' : 'fa-biohazard'} mr-1"></i>
                ${severity}
              </span>
              <span class="text-xs text-slate-400 font-mono">ICD-10: ${icd10}</span>
            </div>
            <h3 class="text-base font-extrabold text-slate-100 mt-1.5">${Security.escapeHTML(classification)}</h3>
          </div>
          <div class="text-right">
            <span class="text-2xl font-black bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent font-mono">
              ${confidence}%
            </span>
            <span class="text-[10px] text-slate-400 block uppercase tracking-wider">Softmax Confidence</span>
          </div>
        </div>

        <!-- Multi-Class Probability Bars -->
        <div class="space-y-2 mt-4">
          <div class="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Softmax Class Distribution:</span>
            <span>Probability (%)</span>
          </div>
          
          ${this._renderProbBar('Glioma (C71.9)', probabilities.glioma, 'bg-rose-500')}
          ${this._renderProbBar('Meningioma (D32.9)', probabilities.meningioma, 'bg-amber-500')}
          ${this._renderProbBar('Pituitary Adenoma (D35.2)', probabilities.pituitary, 'bg-purple-500')}
          ${this._renderProbBar('Healthy / Normal (Z01.89)', probabilities.normal, 'bg-emerald-500')}
        </div>

        <!-- Clinical Recommendations -->
        <div class="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
          <h4 class="font-semibold text-slate-200 mb-1.5 flex items-center gap-2">
            <i class="fas fa-stethoscope text-sky-400"></i>
            Automated Clinical Recommendations:
          </h4>
          <ul class="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
            ${recommendations.map(r => `<li>${Security.escapeHTML(r)}</li>`).join('')}
          </ul>
        </div>

        <!-- Launch Printable Report Generator Button -->
        <div class="mt-4">
          <button id="btn-open-report-modal" type="button" class="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 flex items-center justify-center gap-2 transition cursor-pointer">
            <i class="fas fa-file-medical-alt text-sky-400"></i>
            <span>Generate Official Diagnostic Report (Print / PDF)</span>
          </button>
        </div>

      </div>
    `;

    // Bind report modal open button
    const reportBtn = document.getElementById('btn-open-report-modal');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        const modal = document.getElementById('report-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }
  },

  _renderProbBar(label, pct, colorClass) {
    return `
      <div>
        <div class="flex justify-between text-[11px] mb-1">
          <span class="text-slate-300">${label}</span>
          <span class="font-mono text-slate-200 font-semibold">${pct}%</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="${colorClass} h-1.5 rounded-full transition-all duration-700" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  },

  logToTerminal(text) {
    const terminal = document.getElementById('terminal-stream');
    if (!terminal) return;

    const line = document.createElement('div');
    line.className = 'text-sky-300 py-0.5';
    line.textContent = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  },

  clearTerminal() {
    const terminal = document.getElementById('terminal-stream');
    if (terminal) terminal.innerHTML = '';
  }
};
