/**
 * CryptoVerse - GSAP ScrollTrigger Integration
 * Location: assets/js/scroll-story.js
 * Bridges page scroll to the Three.js continuous universe
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('crypto-stage-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // 1. Initialize Three.js WebGL Scene
  const scene = new CryptoUniverseScene(canvas);

  // 2. Tooltip display handling for 3D clicks
  const tooltipEl = document.getElementById('crypto-tooltip');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');
  const tooltipClose = document.getElementById('tooltip-close');

  scene.setTooltipCallback((title, info) => {
    if (tooltipEl && tooltipTitle && tooltipDesc) {
      tooltipTitle.textContent = title;
      tooltipDesc.textContent = info;
      tooltipEl.style.display = 'flex';
    }
  });

  if (tooltipClose && tooltipEl) {
    tooltipClose.addEventListener('click', () => {
      tooltipEl.style.display = 'none';
    });
  }

  // 3. Connect GSAP ScrollTrigger if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#scroll-story-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        scene.updateScrollProgress(self.progress);
      }
    });
  } else {
    // Fallback scroll listener if GSAP CDN is offline
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      scene.updateScrollProgress(progress);
    });
  }
});
