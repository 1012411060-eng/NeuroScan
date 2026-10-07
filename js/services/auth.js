/**
 * ============================================================================
 * NeuroScan — Authentication & Role-Based Access Control (Unit IV)
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { CONFIG } from '../config.js';
import { ApiService } from './api.js';
import { Toast } from '../utils/toast.js';

export const AuthService = {
  /**
   * Switch Active Clinician Profile & Generate Simulated JWT Session
   * @param {string} doctorId - Clinician Profile ID
   */
  async switchDoctor(doctorId) {
    const doctor = CONFIG.DOCTOR_PROFILES.find(d => d.id === doctorId);
    if (!doctor) return;

    try {
      const authResult = await ApiService.loginDoctor(doctor.id, doctor.role);
      Store.setState({ currentDoctor: doctor });

      Toast.show(
        `Active Clinician Switched: ${doctor.name} (${doctor.role})`,
        'success'
      );
      return authResult;
    } catch (err) {
      Store.setState({ currentDoctor: doctor });
      Toast.show(`Clinician set locally: ${doctor.name}`, 'info');
    }
  },

  /**
   * Check if current active doctor holds a specific privilege
   * @param {string} permissionKey - e.g., 'sign_report' | 'diagnose' | 'verify'
   */
  hasPermission(permissionKey) {
    const { currentDoctor } = Store.getState();
    if (!currentDoctor || !currentDoctor.permissions) return false;
    return currentDoctor.permissions.includes(permissionKey);
  },

  /**
   * Get Active Clinician Summary
   */
  getCurrentClinician() {
    const { currentDoctor } = Store.getState();
    return currentDoctor || CONFIG.DOCTOR_PROFILES[0];
  }
};
