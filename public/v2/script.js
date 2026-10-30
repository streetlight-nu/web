// Ljuset: en ljuskälla som skyltarnas reflexfolie svarar på.
// Med mus följer den pekaren; på pekskärm står den still och skyltarna scrollar förbi den.
(() => {
  const root = document.documentElement;
  const skyltar = [...document.querySelectorAll('.skylt')];
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lx = innerWidth * 0.5;
  let ly = innerHeight * 0.32;
  let queued = false;

  const paint = () => {
    queued = false;
    root.style.setProperty('--lx', lx + 'px');
    root.style.setProperty('--ly', ly + 'px');
    for (const el of skyltar) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > innerHeight + 400) continue;
      el.style.setProperty('--sx', (lx - r.left) + 'px');
      el.style.setProperty('--sy', (ly - r.top) + 'px');
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };

  if (finePointer && !still) {
    addEventListener('pointermove', (e) => { lx = e.clientX; ly = e.clientY; queue(); }, { passive: true });
  }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => {
    if (!finePointer || still) { lx = innerWidth * 0.5; ly = innerHeight * 0.32; }
    queue();
  });
  paint();

  // 20 kantstolpar: reflexerna tänds en i taget när raden når ljuset
  const rad = document.querySelector('.kantstolpar');
  if (rad) {
    if (still || !('IntersectionObserver' in window)) {
      rad.classList.add('tand');
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { rad.classList.add('tand'); io.disconnect(); }
      }, { rootMargin: '0px 0px -25% 0px' });
      io.observe(rad);
    }
  }
})();
