/**
 * ============================================================================
 * NeuroScan — High-Fidelity Medical MRI Procedural Generator (Unit I & III)
 * Synthesizes realistic 512x512 medical Brain MRI scans for zero-dependency offline use
 * ============================================================================
 */

export const MRIPresets = {
  /**
   * Procedurally generate a realistic 512x512 medical MRI scan as an Image or Data URL
   * @param {'glioma'|'meningioma'|'pituitary'|'normal'} type - Brain scan preset key
   * @returns {string} Base64 Data URL
   */
  generateScan(type = 'glioma') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Deep Space Background
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, 512, 512);

    // Center coordinates
    const cx = 256;
    const cy = 256;

    // 2. Outer Skull & Scalp (Elliptical Calvarium)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 185, 220, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1c212d';
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // 3. Subdural CSF Space (Dark cerebrospinal fluid border)
    ctx.beginPath();
    ctx.ellipse(cx, cy, 172, 208, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#080c14';
    ctx.fill();

    // 4. Brain Parenchyma Base (Gray & White Matter)
    ctx.beginPath();
    ctx.ellipse(cx, cy, 164, 200, 0, 0, Math.PI * 2);
    const brainGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 190);
    brainGrad.addColorStop(0, '#556075');
    brainGrad.addColorStop(0.5, '#40495a');
    brainGrad.addColorStop(0.85, '#2b3342');
    brainGrad.addColorStop(1, '#1a202c');
    ctx.fillStyle = brainGrad;
    ctx.fill();

    // 5. Interhemispheric Fissure (Midline Falx Cerebri)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 195);
    ctx.bezierCurveTo(cx - 3, cy - 60, cx + 3, cy + 60, cx, cy + 195);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // 6. Bilateral Cortical Sulci & Gyral convolutions (Anatomical grooves)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 2.5;
    for (let r = 50; r <= 150; r += 24) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.35) {
        if (Math.abs(angle - Math.PI / 2) < 0.25 || Math.abs(angle - 3 * Math.PI / 2) < 0.25) continue;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * (r * 1.18);
        ctx.beginPath();
        ctx.arc(px, py, 12, angle, angle + Math.PI * 0.7);
        ctx.stroke();
      }
    }

    // 7. Lateral Ventricles (Frontal & Occipital Horns - CSF)
    ctx.fillStyle = '#080d1a';
    // Left Ventricle
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 55);
    ctx.bezierCurveTo(cx - 45, cy - 25, cx - 40, cy + 30, cx - 18, cy + 50);
    ctx.bezierCurveTo(cx - 24, cy + 10, cx - 22, cy - 30, cx - 18, cy - 55);
    ctx.fill();

    // Right Ventricle
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 55);
    ctx.bezierCurveTo(cx + 45, cy - 25, cx + 40, cy + 30, cx + 18, cy + 50);
    ctx.bezierCurveTo(cx + 24, cy + 10, cx + 22, cy - 30, cx + 18, cy - 55);
    ctx.fill();

    // Third Ventricle (Center slit)
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Basal Ganglia & Thalamic Hypointensities
    ctx.fillStyle = 'rgba(75, 85, 99, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - 55, cy + 5, 24, 38, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 55, cy + 5, 24, 38, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 8. Specific Tumor Pathology Synthesizer
    // ==========================================
    if (type === 'glioma') {
      // High-grade Glioma in Right Frontal/Parietal Lobe (Infiltrative ring-enhancing lesion)
      const tx = cx + 58;
      const ty = cy - 45;

      // Peritumoral vasogenic edema (darker hypo-intense halo)
      const edemaGrad = ctx.createRadialGradient(tx, ty, 10, tx, ty, 68);
      edemaGrad.addColorStop(0, 'rgba(30, 41, 59, 0.8)');
      edemaGrad.addColorStop(0.7, 'rgba(51, 65, 85, 0.6)');
      edemaGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
      ctx.fillStyle = edemaGrad;
      ctx.beginPath();
      ctx.arc(tx, ty, 68, 0, Math.PI * 2);
      ctx.fill();

      // Hyperintense Contrast-Enhancing Rim
      const tumorGrad = ctx.createRadialGradient(tx, ty, 12, tx, ty, 42);
      tumorGrad.addColorStop(0, '#1e293b'); // Central necrotic core
      tumorGrad.addColorStop(0.5, '#475569');
      tumorGrad.addColorStop(0.85, '#ffffff'); // Bright enhancement
      tumorGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = tumorGrad;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 44, 38, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Heterogeneous internal nodules
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(tx - 12, ty - 8, 8, 0, Math.PI * 2);
      ctx.arc(tx + 14, ty + 10, 10, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 'meningioma') {
      // Extra-axial Parasagittal Meningioma (Homogeneous dural-attached round lesion)
      const mx = cx - 62;
      const my = cy - 85;

      // Dural Tail enhancement along skull margin
      ctx.beginPath();
      ctx.moveTo(mx - 35, my - 20);
      ctx.quadraticCurveTo(mx, my - 10, mx + 45, my - 30);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      // Homogeneous hyperintense mass
      const menGrad = ctx.createRadialGradient(mx, my, 5, mx, my, 36);
      menGrad.addColorStop(0, '#ffffff');
      menGrad.addColorStop(0.7, '#e2e8f0');
      menGrad.addColorStop(0.95, '#94a3b8');
      menGrad.addColorStop(1, '#475569');
      ctx.fillStyle = menGrad;
      ctx.beginPath();
      ctx.ellipse(mx, my, 36, 32, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Sharp margin & CSF cleft
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

    } else if (type === 'pituitary') {
      // Pituitary Macroadenoma (Sellar/Suprasellar expansion)
      const px = cx;
      const py = cy + 42;

      // Circumscribed sellar tumor mass with superior convex bulge
      const pitGrad = ctx.createRadialGradient(px, py, 4, px, py, 30);
      pitGrad.addColorStop(0, '#ffffff');
      pitGrad.addColorStop(0.65, '#cbd5e1');
      pitGrad.addColorStop(0.9, '#64748b');
      pitGrad.addColorStop(1, '#334155');
      ctx.fillStyle = pitGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, 28, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Optic Chiasm proximity highlight
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(px - 14, py - 18, 4, 0, Math.PI * 2);
      ctx.arc(px + 14, py - 18, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // (If 'normal', brain has pristine bilateral symmetry and no abnormal hyperintensities)

    // 9. Clinical Acquisition Watermark & Orientation Markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('R', 24, 256);
    ctx.fillText('L', 480, 256);
    ctx.fillText('A (Ant)', 236, 32);
    ctx.fillText('P (Post)', 236, 492);

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillText(`NEUROSCAN MRI-PACS [T1-CE]`, 20, 28);
    ctx.fillText(`FOV: 240mm | SLICE: 4.0mm`, 20, 44);
    ctx.fillText(`DESPU-MED-AI v1.0`, 20, 60);

    ctx.restore();
    return canvas.toDataURL('image/png');
  }
};
