/**
 * ============================================================================
 * NeuroScan — Syllabus Mapping & Academic Architecture Modal (Unit I - V)
 * Course: Web Technology (ETCS336 - Pattern 2024R1) | DES Pune University
 * ============================================================================
 */

import { CONFIG } from '../config.js';

export const SyllabusModalComponent = {
  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const modal = document.getElementById('syllabus-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-sky-500/30 p-6 sm:p-8 bg-slate-900 text-slate-100 shadow-2xl relative">
          
          <!-- Close Button -->
          <button type="button" class="modal-close-btn absolute top-5 right-5 text-slate-400 hover:text-white text-lg focus:outline-none" aria-label="Close Syllabus Mapping Modal">
            <i class="fas fa-times"></i>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-2xl">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-slate-100">ETCS336 Course Syllabus & Architecture Mapping</h2>
              <p class="text-xs text-sky-400 font-medium">Web Technology (Pattern 2024R1) — DES Pune University B.Tech CSE</p>
            </div>
          </div>

          <!-- Syllabus Units Grid -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            ${CONFIG.SYLLABUS_MAPPING.map(unit => `
              <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-sky-500/40 transition">
                <div class="flex items-center justify-between mb-2">
                  <span class="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">${unit.unit}</span>
                  <i class="fas fa-check-circle text-emerald-400 text-xs"></i>
                </div>
                <h3 class="text-sm font-bold text-slate-100 mb-2">${unit.title}</h3>
                <ul class="space-y-1.5 text-xs text-slate-400">
                  ${unit.topics.map(t => `<li class="flex items-start gap-2"><i class="fas fa-arrow-right text-sky-400 text-[10px] mt-1 shrink-0"></i><span>${t}</span></li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <!-- Academic Architecture & Flow Diagram -->
          <div class="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <i class="fas fa-project-diagram text-sky-400"></i>
              Application Dataflow Architecture
            </h3>
            <div class="text-[11px] font-mono text-slate-300 space-y-2 bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              <p class="text-sky-300 font-semibold">[Client Layer] HTML5 Semantic Canvas + Modular ES2020 Store (LocalStorage Sync)</p>
              <p class="text-slate-400 pl-4">└── User Actions (Upload / Preset / Filters) -> Canvas Multi-layer Pipeline</p>
              <p class="text-slate-400 pl-4">└── Async Diagnose Trigger -> AbortController Non-Blocking Request</p>
              <p class="text-emerald-300 font-semibold mt-2">[Service / API Layer] Express.js REST API + Simulated JWT RBAC Auth</p>
              <p class="text-slate-400 pl-4">└── /api/diagnose (ResNet-50 Feature Extraction -> Softmax Activation -> Grad-CAM ROI)</p>
              <p class="text-slate-400 pl-4">└── /api/patients & /api/audit-logs (JSON Schemas, OWASP Sanitization)</p>
              <p class="text-purple-300 font-semibold mt-2">[PWA & Security] Service Worker (sw.js) Offline Cache + CSP Security Headers</p>
            </div>
          </div>

          <!-- Footer Action -->
          <div class="mt-6 flex justify-end">
            <button type="button" class="modal-close-btn px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition">
              Understood & Close
            </button>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    const modal = document.getElementById('syllabus-modal');
    if (!modal) return;

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => modal.classList.add('hidden'));
    });

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        modal.classList.add('hidden');
      }
    });
  }
};
