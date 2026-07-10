const floatingLayer = document.querySelector('.hero__floating-layer');

if (floatingLayer) {
  const heroSection = document.querySelector('.hero');
  const floatItems = [...document.querySelectorAll('.hero-float-item')];

  floatItems.forEach((item, index) => {
    const left = item.dataset.left || '0%';
    const top = item.dataset.top || '0%';
    const width = item.dataset.width || '160';
    const rotate = item.dataset.rotate || '0deg';
    const opacity = item.dataset.opacity || '0.9';
    const driftX = Number(item.dataset.driftX || 0);
    const driftY = Number(item.dataset.driftY || 0);
    const duration = Number(item.dataset.duration || 7);

    item.style.left = left;
    item.style.top = top;
    item.style.width = `${width}px`;
    item.style.setProperty('--float-rotate', rotate);
    item.style.setProperty('--float-opacity', opacity);

    const startOffset = index * 0.75;
    item.animate([
      { transform: `translate3d(0, 0, 0) rotate(${rotate})` },
      { transform: `translate3d(${driftX}px, ${driftY}px, 0) rotate(${rotate})` },
      { transform: `translate3d(0, 0, 0) rotate(${rotate})` }
    ], {
      duration: duration * 1000,
      iterations: Infinity,
      easing: 'ease-in-out',
      delay: startOffset * 1000
    });
  });

  const updateParallax = () => {
    const rect = heroSection?.getBoundingClientRect();
    if (!rect) return;

    const scrollProgress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));

    floatItems.forEach((item, index) => {
      const driftX = Number(item.dataset.driftX || 0);
      const driftY = Number(item.dataset.driftY || 0);
      const offset = scrollProgress * 24;
      const x = driftX * (1 - scrollProgress) - offset * (index % 2 === 0 ? 1 : -1);
      const y = driftY * (1 - scrollProgress) + offset * (index % 2 === 0 ? 0.4 : -0.4);
      item.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${item.style.getPropertyValue('--float-rotate') || '0deg'})`;
    });
  };

  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();
}
