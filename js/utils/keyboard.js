/**
 * ============================================================================
 * NeuroScan — Keyboard Shortcuts & Accessibility Navigation (Unit I / V)
 * ============================================================================
 */

export const KeyboardManager = {
  shortcuts: new Map(),

  init() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input or textarea
      const targetTag = e.target.tagName.toLowerCase();
      if ((targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') && e.key !== 'Escape') {
        return;
      }

      // Check Escape key for modal closing
      if (e.key === 'Escape') {
        const activeModalCloseBtn = document.querySelector('.modal-container:not(.hidden) .modal-close-btn');
        if (activeModalCloseBtn) {
          activeModalCloseBtn.click();
          e.preventDefault();
          return;
        }
      }

      // Check registered shortcuts
      for (const [keyCombination, handler] of this.shortcuts.entries()) {
        const isCtrl = keyCombination.includes('ctrl') ? (e.ctrlKey || e.metaKey) : true;
        const isShift = keyCombination.includes('shift') ? e.shiftKey : true;
        const isAlt = keyCombination.includes('alt') ? e.altKey : true;
        const key = keyCombination.split('+').pop().toLowerCase();

        if (isCtrl && isShift && isAlt && e.key.toLowerCase() === key) {
          e.preventDefault();
          handler(e);
          break;
        }
      }
    });
  },

  register(combo, handler) {
    this.shortcuts.set(combo.toLowerCase(), handler);
  }
};
