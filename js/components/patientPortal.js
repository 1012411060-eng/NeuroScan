/**
 * ============================================================================
 * NeuroScan — Patient Portal & Registry Component (Unit III & IV)
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { Security } from '../utils/security.js';
import { Toast } from '../utils/toast.js';
import { ApiService } from '../services/api.js';

export const PatientPortalComponent = {
  searchQuery: '',
  statusFilter: 'all',

  init() {
    this.render();
    this.bindEvents();

    // Subscribe to patient updates
    Store.subscribe('patients', () => this.renderPatientList());
    Store.subscribe('selectedPatientId', () => {
      this.renderPatientList();
      this.updateActivePatientBanner();
    });
  },

  render() {
    const container = document.getElementById('patient-portal-section');
    if (!container) return;

    container.innerHTML = `
      <div class="glass-panel rounded-2xl p-6 mb-8">
        
        <!-- Header & Top Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
          <div>
            <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <i class="fas fa-hospital-user text-sky-400"></i>
              Clinical Patient Registry
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Select or register a neurological subject for MRI inference, PACS auditing, and report generation.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button id="btn-open-new-patient-modal" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 flex items-center gap-2 transition">
              <i class="fas fa-user-plus"></i>
              Register Patient
            </button>
          </div>
        </div>

        <!-- Active Patient Highlight Banner -->
        <div id="active-patient-banner" class="mt-4 p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Populated dynamically -->
        </div>

        <!-- Filter Controls -->
        <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="relative">
            <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input id="input-patient-search" type="text" placeholder="Search by name, NS-ID, or symptoms..." class="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none transition" />
          </div>

          <div>
            <select id="select-status-filter" class="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:border-sky-500 focus:outline-none transition">
              <option value="all">All Triage Statuses</option>
              <option value="Diagnosis Pending">Diagnosis Pending</option>
              <option value="High Priority">High Priority</option>
              <option value="Under Review">Under Review</option>
              <option value="Clear / Healthy">Clear / Healthy</option>
            </select>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 px-1">
            <span id="patient-count-text">Showing 4 patients</span>
            <button id="btn-reset-filters" type="button" class="text-sky-400 hover:text-sky-300 transition text-[11px]">
              <i class="fas fa-undo mr-1"></i>Reset Filters
            </button>
          </div>
        </div>

        <!-- Patient Directory Table -->
        <div class="mt-4 overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/40">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th scope="col" class="px-4 py-3">Patient ID</th>
                <th scope="col" class="px-4 py-3">Subject Name</th>
                <th scope="col" class="px-4 py-3">Age / Sex</th>
                <th scope="col" class="px-4 py-3">Blood Group</th>
                <th scope="col" class="px-4 py-3">Primary Symptoms</th>
                <th scope="col" class="px-4 py-3">Triage Status</th>
                <th scope="col" class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="patient-table-body" class="divide-y divide-slate-800">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

      </div>
    `;

    this.renderPatientList();
    this.updateActivePatientBanner();
  },

  bindEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('input-patient-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderPatientList();
      });
    }

    // Status filter
    const statusSelect = document.getElementById('select-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderPatientList();
      });
    }

    // Reset filters
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.statusFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (statusSelect) statusSelect.value = 'all';
        this.renderPatientList();
      });
    }

    // Open Register Modal
    const openModalBtn = document.getElementById('btn-open-new-patient-modal');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        this.openRegisterModal();
      });
    }
  },

  renderPatientList() {
    const tbody = document.getElementById('patient-table-body');
    const countText = document.getElementById('patient-count-text');
    if (!tbody) return;

    const { patients, selectedPatientId } = Store.getState();

    // Filter
    let filtered = patients.filter(p => {
      const matchSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.id.toLowerCase().includes(this.searchQuery) ||
        p.primarySymptoms.toLowerCase().includes(this.searchQuery);

      const matchStatus = this.statusFilter === 'all' || p.status.toLowerCase() === this.statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (countText) countText.textContent = `Showing ${filtered.length} of ${patients.length} patients`;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-500">
            <i class="fas fa-user-slash text-2xl mb-2 text-slate-600 block"></i>
            No matching patient records found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const isSelected = p.id === selectedPatientId;
      const statusClass = this._getStatusBadgeClass(p.status);

      return `
        <tr class="hover:bg-slate-800/40 transition cursor-pointer ${isSelected ? 'bg-sky-950/30 font-medium' : ''}" data-patient-row-id="${p.id}">
          <td class="px-4 py-3 font-mono text-sky-400 font-semibold">${Security.escapeHTML(p.id)}</td>
          <td class="px-4 py-3 text-slate-100 font-semibold">${Security.escapeHTML(p.name)}</td>
          <td class="px-4 py-3 text-slate-300">${p.age} Yrs / ${p.gender}</td>
          <td class="px-4 py-3 text-slate-400"><span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono">${p.bloodGroup}</span></td>
          <td class="px-4 py-3 text-slate-400 max-w-xs truncate" title="${Security.escapeHTML(p.primarySymptoms)}">${Security.escapeHTML(p.primarySymptoms)}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass}">
              ${p.status}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button type="button" class="btn-select-patient px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'}" data-select-id="${p.id}">
              ${isSelected ? '<i class="fas fa-check mr-1"></i>Active' : 'Select'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind row clicks
    tbody.querySelectorAll('tr[data-patient-row-id]').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.getAttribute('data-patient-row-id');
        Store.setState({ selectedPatientId: id });
      });
    });
  },

  updateActivePatientBanner() {
    const banner = document.getElementById('active-patient-banner');
    if (!banner) return;

    const { patients, selectedPatientId } = Store.getState();
    const active = patients.find(p => p.id === selectedPatientId) || patients[0];

    if (!active) {
      banner.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 py-1">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-base">
              <i class="fas fa-user-plus"></i>
            </div>
            <div>
              <h3 class="font-bold text-xs text-slate-200">No Patient Registered or Selected</h3>
              <p class="text-[11px] text-slate-400">Click "Register Patient" to record subject demographics, or run inference as a Walk-In.</p>
            </div>
          </div>
          <button id="btn-banner-register" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition self-start sm:self-auto">
            <i class="fas fa-plus mr-1"></i>Add Patient
          </button>
        </div>
      `;
      const bannerBtn = banner.querySelector('#btn-banner-register');
      if (bannerBtn) {
        bannerBtn.addEventListener('click', () => this.openRegisterModal());
      }
      return;
    }

    const lastScan = active.mriScans && active.mriScans.length > 0 ? active.mriScans[0] : null;

    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xl font-bold">
          <i class="fas fa-user-circle"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-sm text-slate-100">${Security.escapeHTML(active.name)}</h3>
            <span class="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30">${active.id}</span>
            <span class="text-xs text-slate-400">• ${active.age} Yrs (${active.gender}) • Blood: ${active.bloodGroup}</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            <strong class="text-slate-300">Symptoms:</strong> ${Security.escapeHTML(active.primarySymptoms)}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs">
        <div class="text-right hidden sm:block">
          <span class="text-[10px] text-slate-400 block uppercase">Last MRI Scan Record</span>
          <span class="font-semibold text-slate-200">${lastScan ? `${lastScan.tumorType} (${lastScan.confidence}%)` : 'No Prior Scans'}</span>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${this._getStatusBadgeClass(active.status)}">
          ${active.status}
        </span>
      </div>
    `;
  },

  openRegisterModal() {
    const modal = document.getElementById('new-patient-modal');
    if (!modal) return;

    // Reset Form
    const form = document.getElementById('form-register-patient');
    if (form) form.reset();

    const errBox = document.getElementById('form-patient-errors');
    if (errBox) errBox.classList.add('hidden');

    modal.classList.remove('hidden');
  },

  _getStatusBadgeClass(status) {
    switch (status) {
      case 'High Priority':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Diagnosis Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Clear / Healthy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  }
};
