/**
 * ============================================================================
 * NeuroScan — HTML5 Canvas MRI Processing Engine (Unit I & III)
 * Real-time brightness, contrast, zoom/pan, colormaps, and ROI overlay visualization
 * ============================================================================
 */

import { Store } from '../state/store.js';
import { MRIPresets } from '../services/mriPresets.js';
import { Security } from '../utils/security.js';
import { Toast } from '../utils/toast.js';

export const CanvasViewerComponent = {
  canvas: null,
  ctx: null,
  sourceImage: null,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,

  init() {
    this.canvas = document.getElementById('mri-main-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.bindEvents();
    this.loadPreset('glioma');

    // Subscribe to state filter updates
    Store.subscribe('canvasFilters', () => this.redraw());
    Store.subscribe('currentDiagnosis', () => this.redraw());
  },

  bindEvents() {
    // Preset buttons
    document.querySelectorAll('[data-mri-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.getAttribute('data-mri-preset');
        this.loadPreset(type);

        // Highlight active preset button
        document.querySelectorAll('[data-mri-preset]').forEach(b => {
          b.className = b === btn
            ? 'px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-white shadow-lg shadow-sky-500/25 transition'
            : 'px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition';
        });
      });
    });

    // File Drag & Drop Zone
    const dropZone = document.getElementById('mri-dropzone');
    const fileInput = document.getElementById('input-mri-file');

    if (dropZone && fileInput) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-sky-500', 'bg-sky-950/20');
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-500', 'bg-sky-950/20');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-500', 'bg-sky-950/20');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      dropZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Filter Sliders
    const brightnessSlider = document.getElementById('slider-brightness');
    const contrastSlider = document.getElementById('slider-contrast');
    const zoomSlider = document.getElementById('slider-zoom');
    const invertToggle = document.getElementById('toggle-invert');
    const roiToggle = document.getElementById('toggle-roi');
    const gridToggle = document.getElementById('toggle-grid');
    const colormapSelect = document.getElementById('select-colormap');
    const resetBtn = document.getElementById('btn-reset-canvas');
    const downloadBtn = document.getElementById('btn-download-canvas');

    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        Store.setFilter('brightness', parseInt(e.target.value, 10));
        document.getElementById('val-brightness').textContent = `${e.target.value}%`;
      });
    }

    if (contrastSlider) {
      contrastSlider.addEventListener('input', (e) => {
        Store.setFilter('contrast', parseInt(e.target.value, 10));
        document.getElementById('val-contrast').textContent = `${e.target.value}%`;
      });
    }

    if (zoomSlider) {
      zoomSlider.addEventListener('input', (e) => {
        Store.setFilter('zoom', parseFloat(e.target.value));
        document.getElementById('val-zoom').textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
      });
    }

    if (invertToggle) {
      invertToggle.addEventListener('change', (e) => {
        Store.setFilter('invert', e.target.checked);
      });
    }

    if (roiToggle) {
      roiToggle.addEventListener('change', (e) => {
        Store.setFilter('showROI', e.target.checked);
      });
    }

    if (gridToggle) {
      gridToggle.addEventListener('change', (e) => {
        Store.setFilter('showGrid', e.target.checked);
      });
    }

    if (colormapSelect) {
      colormapSelect.addEventListener('change', (e) => {
        Store.setFilter('colormap', e.target.value);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Store.resetFilters();
        if (brightnessSlider) brightnessSlider.value = 0;
        if (contrastSlider) contrastSlider.value = 0;
        if (zoomSlider) zoomSlider.value = 1.0;
        if (invertToggle) invertToggle.checked = false;
        if (roiToggle) roiToggle.checked = true;
        if (gridToggle) gridToggle.checked = false;
        if (colormapSelect) colormapSelect.value = 'grayscale';

        document.getElementById('val-brightness').textContent = '0%';
        document.getElementById('val-contrast').textContent = '0%';
        document.getElementById('val-zoom').textContent = '1.0x';

        Toast.show('Canvas display parameters reset to default.', 'info');
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `neuroscan-processed-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        Toast.show('Processed scan exported to PNG.', 'success');
      });
    }

    // Canvas Pan via Mouse Drag
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - Store.getState().canvasFilters.panX;
      this.dragStartY = e.clientY - Store.getState().canvasFilters.panY;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const panX = e.clientX - this.dragStartX;
      const panY = e.clientY - this.dragStartY;
      Store.setFilter('panX', panX);
      Store.setFilter('panY', panY);
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });
  },

  loadPreset(type) {
    const dataUrl = MRIPresets.generateScan(type);
    const img = new Image();
    img.onload = () => {
      this.sourceImage = img;
      Store.setState({
        activePresetKey: type,
        activeImageSource: dataUrl,
        currentDiagnosis: null // Clear previous until analyzed
      });
      this.redraw();
      Toast.show(`Loaded preset: ${type.toUpperCase()} MRI scan`, 'info', 2000);
    };
    img.src = dataUrl;
  },

  handleFileUpload(file) {
    const validation = Security.validateImageFile(file);
    if (!validation.isValid) {
      Toast.show(validation.error, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        this.sourceImage = img;
        Store.setState({
          activePresetKey: null,
          activeImageSource: dataUrl,
          currentDiagnosis: null
        });
        this.redraw();
        Toast.show(`Custom MRI Scan "${file.name}" loaded successfully!`, 'success');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  },

  redraw() {
    if (!this.canvas || !this.ctx || !this.sourceImage) return;

    const { canvasFilters, currentDiagnosis } = Store.getState();
    const { brightness, contrast, zoom, panX, panY, invert, colormap, showROI, showGrid } = canvasFilters;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Clear background
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = '#05070e';
    this.ctx.fillRect(0, 0, w, h);

    // 2. Save transform state for zoom and pan
    this.ctx.save();
    this.ctx.translate(w / 2 + panX, h / 2 + panY);
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-w / 2, -h / 2);

    // 3. Draw source image
    this.ctx.drawImage(this.sourceImage, 0, 0, w, h);

    // 4. Apply Pixel Manipulation (Brightness, Contrast, Invert, Colormap)
    if (brightness !== 0 || contrast !== 0 || invert || colormap !== 'grayscale') {
      const imgData = this.ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const bOffset = (brightness / 100) * 255;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r += bOffset;
        g += bOffset;
        b += bOffset;

        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Invert
        if (invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }

        // Colormaps
        if (colormap !== 'grayscale') {
          const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const [cr, cg, cb] = this._applyColormap(gray, colormap);
          r = cr;
          g = cg;
          b = cb;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      this.ctx.putImageData(imgData, 0, 0);
    }

    // 5. Draw ROI Heatmap Saliency Box if available and enabled
    if (showROI && currentDiagnosis && currentDiagnosis.roi && currentDiagnosis.roi.width > 0) {
      this._drawROIOverlay(currentDiagnosis.roi, currentDiagnosis.predictedClass);
    }

    // 6. Draw Spatial Grid Overlay
    if (showGrid) {
      this._drawGridOverlay(w, h);
    }

    this.ctx.restore();
  },

  _drawROIOverlay(roi, tumorType) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const rx = roi.x * w;
    const ry = roi.y * h;
    const rw = roi.width * w;
    const rh = roi.height * h;

    // Heatmap gradient glow
    const glow = this.ctx.createRadialGradient(rx + rw / 2, ry + rh / 2, 5, rx + rw / 2, ry + rh / 2, rw);
    glow.addColorStop(0, 'rgba(244, 63, 94, 0.7)'); // Red-hot center
    glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)'); // Amber mid
    glow.addColorStop(1, 'rgba(14, 165, 233, 0)'); // Cyan fade

    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(rx + rw / 2, ry + rh / 2, rw * 0.9, 0, Math.PI * 2);
    this.ctx.fill();

    // Bounding Box
    this.ctx.strokeStyle = '#f43f5e';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([6, 4]);
    this.ctx.strokeRect(rx, ry, rw, rh);
    this.ctx.setLineDash([]);

    // Corner targeting brackets
    const bracketSize = 10;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;

    // Top-Left
    this.ctx.beginPath();
    this.ctx.moveTo(rx, ry + bracketSize);
    this.ctx.lineTo(rx, ry);
    this.ctx.lineTo(rx + bracketSize, ry);
    this.ctx.stroke();

    // Bottom-Right
    this.ctx.beginPath();
    this.ctx.moveTo(rx + rw, ry + rh - bracketSize);
    this.ctx.lineTo(rx + rw, ry + rh);
    this.ctx.lineTo(rx + rw - bracketSize, ry + rh);
    this.ctx.stroke();

    // Label tag
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.fillRect(rx, ry - 22, rw, 20);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText(`AI ROI: ${tumorType.toUpperCase()}`, rx + 6, ry - 8);
  },

  _drawGridOverlay(w, h) {
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    this.ctx.lineWidth = 1;

    for (let x = 32; x < w; x += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }

    for (let y = 32; y < h; y += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }
  },

  _applyColormap(gray, mapName) {
    // gray is normalized 0.0 to 1.0
    if (mapName === 'jet') {
      const r = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(gray * 4 - 3))));
      const g = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(gray * 4 - 2))));
      const b = Math.min(255, Math.max(0, 255 * (1.5 - Math.abs(gray * 4 - 1))));
      return [r, g, b];
    } else if (mapName === 'viridis') {
      const r = Math.floor(gray * 68 + (1 - gray) * 30);
      const g = Math.floor(gray * 200 + (1 - gray) * 20);
      const b = Math.floor(gray * 100 + (1 - gray) * 120);
      return [r, g, b];
    } else if (mapName === 'turbo') {
      const r = Math.floor(255 * Math.sin(gray * Math.PI * 0.9));
      const g = Math.floor(255 * Math.sin(gray * Math.PI));
      const b = Math.floor(255 * Math.cos(gray * Math.PI * 0.5));
      return [r, g, b];
    }
    const val = Math.floor(gray * 255);
    return [val, val, val];
  }
};
