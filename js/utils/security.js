/**
 * ============================================================================
 * NeuroScan — Security Utilities (Unit V: OWASP Top 10 Mitigation)
 * ============================================================================
 */

export const Security = {
  /**
   * Escape and sanitize raw string inputs against Cross-Site Scripting (XSS)
   * @param {string} input - User input string
   * @returns {string} Sanitized text
   */
  escapeHTML(input) {
    if (typeof input !== 'string') return input;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return input.replace(/[&<>"'/]/g, match => map[match]);
  },

  /**
   * Validate Patient Registration Form Payloads against strict Regex rules
   * @param {Object} data - Form object
   * @returns {Object} Validation outcome { isValid: boolean, errors: string[] }
   */
  validatePatientPayload(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Patient full name must be at least 3 characters.');
    }
    if (data.name && /[<>{}\\]/.test(data.name)) {
      errors.push('Patient name contains forbidden script or malicious characters.');
    }

    const age = parseInt(data.age, 10);
    if (isNaN(age) || age < 0 || age > 125) {
      errors.push('Age must be a valid number between 0 and 125.');
    }

    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(data.gender)) {
      errors.push('Please select a valid gender option.');
    }

    if (data.phone && !/^(\+91\s?)?[6-9]\d{9}$/.test(data.phone.replace(/[\s-]/g, ''))) {
      errors.push('Phone number must be a valid 10-digit Indian contact number.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate uploaded MRI image file metadata
   * @param {File} file - Browser File object
   * @returns {Object} Validation outcome { isValid: boolean, error?: string }
   */
  validateImageFile(file) {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    if (!file) {
      return { isValid: false, error: 'No file was selected for upload.' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file format. Only JPEG, PNG, or WebP brain MRI scans are permitted.' };
    }

    if (file.size > MAX_SIZE_BYTES) {
      return { isValid: false, error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB uploaded).` };
    }

    return { isValid: true };
  }
};
