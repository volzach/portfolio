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
    const amplitude = Number(item.dataset.amplitude || 1);
    const image = item.querySelector('img');
    const altText = image?.getAttribute('alt')?.trim() || '';

    item.style.setProperty('--float-left', left);
    item.style.setProperty('--float-top', top);
    item.style.setProperty('--float-width', `${width}px`);
    item.style.setProperty('--float-rotate', rotate);
    item.style.setProperty('--float-opacity', opacity);
    item.style.setProperty('--float-drift-x', `${driftX * amplitude}px`);
    item.style.setProperty('--float-drift-y', `${driftY * amplitude}px`);
    item.style.setProperty('--float-duration', `${duration}s`);
    item.style.setProperty('--float-index', String(index));

    if (altText && !item.querySelector('.hero-float-tooltip')) {
      const tooltip = document.createElement('span');
      tooltip.className = 'hero-float-tooltip';
      tooltip.textContent = altText;
      item.appendChild(tooltip);
    }
  });

  let lastTime = 0;

  const updateMotion = (timestamp) => {
    const rect = heroSection?.getBoundingClientRect();
    const scrollProgress = rect
      ? Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight))
      : 0;

    const elapsed = (timestamp - (lastTime || timestamp)) / 1000;
    lastTime = timestamp;

    floatItems.forEach((item, index) => {
      const driftX = Number(item.dataset.driftX || 0);
      const driftY = Number(item.dataset.driftY || 0);
      const duration = Number(item.dataset.duration || 7);
      const amplitude = Number(item.dataset.amplitude || 1);
      const wave = Math.sin((timestamp / 1000 / duration) * Math.PI * 2 + index * 0.8);
      const parallaxX = scrollProgress * 24 * (index % 2 === 0 ? 1 : -1);
      const parallaxY = scrollProgress * 8 * (index % 2 === 0 ? 0.4 : -0.4);
      const x = driftX * amplitude * wave + parallaxX;
      const y = driftY * amplitude * Math.cos((timestamp / 1000 / duration) * Math.PI * 2 + index * 0.8) + parallaxY;

      item.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${item.style.getPropertyValue('--float-rotate') || '0deg'})`;
    });

    requestAnimationFrame(updateMotion);
  };

  requestAnimationFrame(updateMotion);
}
