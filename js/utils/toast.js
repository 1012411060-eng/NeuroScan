/**
 * ============================================================================
 * NeuroScan — Toast Notification System (Unit I & III)
 * ============================================================================
 */

export const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    }
  },

  /**
   * Display a notification toast
   * @param {string} message - Text or title
   * @param {'success'|'error'|'warning'|'info'} type - Toast type
   * @param {number} duration - Auto dismiss timeout in ms
   */
  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm font-medium border ${this._getTypeStyles(type)}`;
    toast.setAttribute('role', 'status');

    const iconMap = {
      success: '<i class="fas fa-check-circle text-emerald-400 text-base"></i>',
      error: '<i class="fas fa-exclamation-circle text-rose-400 text-base"></i>',
      warning: '<i class="fas fa-exclamation-triangle text-amber-400 text-base"></i>',
      info: '<i class="fas fa-info-circle text-sky-400 text-base"></i>'
    };

    toast.innerHTML = `
      ${iconMap[type] || iconMap.info}
      <span class="flex-1 text-slate-100">${message}</span>
      <button type="button" class="text-slate-400 hover:text-white text-xs ml-2 focus:outline-none" aria-label="Dismiss notification">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
      this._removeToast(toast);
    });

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this._removeToast(toast);
      }, duration);
    }
  },

  _removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  },

  _getTypeStyles(type) {
    switch (type) {
      case 'success':
        return 'bg-slate-900 border-emerald-500/40 text-emerald-100';
      case 'error':
        return 'bg-slate-900 border-rose-500/40 text-rose-100';
      case 'warning':
        return 'bg-slate-900 border-amber-500/40 text-amber-100';
      case 'info':
      default:
        return 'bg-slate-900 border-sky-500/40 text-sky-100';
    }
  }
};
