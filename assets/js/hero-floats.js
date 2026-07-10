const floatingLayer = document.querySelector('.hero__floating-layer');

if (floatingLayer) {
  const floatItems = [
    {
      src: 'images/wesound classic.png',
      width: 180,
      height: 180,
      left: '8%',
      top: '18%',
      rotate: '-8deg',
      opacity: 0.92,
      driftX: 12,
      driftY: 8,
      duration: 7.5
    },
    {
      src: 'images/wesound toadBlue.png',
      width: 150,
      height: 150,
      left: '74%',
      top: '16%',
      rotate: '10deg',
      opacity: 0.9,
      driftX: -9,
      driftY: 10,
      duration: 8.2
    },
    {
      src: 'images/wesound classic.png',
      width: 140,
      height: 140,
      left: '20%',
      top: '68%',
      rotate: '6deg',
      opacity: 0.82,
      driftX: 6,
      driftY: -8,
      duration: 6.8
    },
    {
      src: 'images/wesound toadBlue.png',
      width: 130,
      height: 130,
      left: '64%',
      top: '64%',
      rotate: '-5deg',
      opacity: 0.84,
      driftX: -7,
      driftY: 6,
      duration: 7.2
    }
  ];

  const heroSection = document.querySelector('.hero');

  floatItems.forEach((item, index) => {
    const wrapper = document.createElement('figure');
    wrapper.className = 'hero-float-item';
    wrapper.style.left = item.left;
    wrapper.style.top = item.top;
    wrapper.style.width = `${item.width}px`;
    wrapper.style.setProperty('--float-rotate', item.rotate);
    wrapper.style.setProperty('--float-opacity', item.opacity);
    wrapper.dataset.driftX = item.driftX;
    wrapper.dataset.driftY = item.driftY;
    wrapper.dataset.duration = item.duration;
    wrapper.dataset.baseX = item.left;
    wrapper.dataset.baseY = item.top;

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    img.loading = 'lazy';

    wrapper.appendChild(img);
    floatingLayer.appendChild(wrapper);

    const startOffset = index * 0.75;
    wrapper.animate([
      { transform: `translate3d(0, 0, 0) rotate(${item.rotate})` },
      { transform: `translate3d(${item.driftX}px, ${item.driftY}px, 0) rotate(${item.rotate})` },
      { transform: `translate3d(0, 0, 0) rotate(${item.rotate})` }
    ], {
      duration: item.duration * 1000,
      iterations: Infinity,
      easing: 'ease-in-out',
      delay: startOffset * 1000
    });
  });

  const floatItemsNode = [...document.querySelectorAll('.hero-float-item')];

  const updateParallax = () => {
    const rect = heroSection?.getBoundingClientRect();
    if (!rect) return;

    const scrollProgress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));

    floatItemsNode.forEach((item, index) => {
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
