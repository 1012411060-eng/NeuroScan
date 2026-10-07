/**
 * ============================================================================
 * NeuroScan — Navigation Bar Component (Unit I & III)
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { CONFIG } from '../config.js';
import { AuthService } from '../services/auth.js';
import { ApiService } from '../services/api.js';

export const NavbarComponent = {
  init() {
    this.render();
    this.bindEvents();
    this.checkHealthStatus();

    // Subscribe to state updates
    Store.subscribe('theme', (theme) => this.applyTheme(theme));
  },

  render() {
    const nav = document.getElementById('main-navbar');
    if (!nav) return;

    const { currentDoctor, theme } = Store.getState();

    nav.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Brand Logo & Academic Course Identifier -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-xl">
              <i class="fas fa-brain"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  NeuroScan
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  AI-CAD v1.0
                </span>
              </div>
              <p class="text-[10px] text-slate-400 hidden sm:block">
                Automated Brain Tumor MRI Diagnostics
              </p>
            </div>
          </div>

          <!-- Quick Access Navigation & Actions -->
          <div class="flex items-center gap-2 sm:gap-4">
            
            <!-- System Health Badge -->
            <div id="api-status-badge" class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="API Status">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="api-status-text">REST API Online</span>
            </div>

            <!-- Light / Dark Theme Toggle -->
            <button id="btn-theme-toggle" type="button" class="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition" aria-label="Toggle Dark and Light Theme">
              <i id="theme-icon" class="fas ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-sky-400'}"></i>
            </button>

          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = Store.getState().theme;
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        Store.setState({ theme: nextTheme });
      });
    }
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.className = `fas ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-sky-400'}`;
    }
  },

  async checkHealthStatus() {
    const health = await ApiService.getHealth();
    const badge = document.getElementById('api-status-badge');
    const text = document.getElementById('api-status-text');

    if (badge && text) {
      if (health && health.status === 'online') {
        badge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        text.textContent = `Express API Online (${health.uptimeSeconds}s)`;
      } else {
        badge.className = 'hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20';
        text.textContent = 'PWA Offline Mode';
      }
    }
  }
};
