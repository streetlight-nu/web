(() => {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main > section[id]')];
  const nodes = [...document.querySelectorAll('.spine__nodes a')];
  const lamps = document.querySelector('.lamps');
  const now = document.querySelector('.spine__now');
  const last = sections.length - 1;

  const setActive = (idx) => {
    root.style.setProperty('--a', idx);
    root.classList.toggle('at-end', idx === last);
    root.classList.toggle('at-hero', idx === 0);
    if (now) now.textContent = nodes[idx].dataset.label;
    nodes.forEach((node, i) => {
      node.classList.toggle('is-lit', i <= idx);
      if (i === idx) node.setAttribute('aria-current', 'location');
      else node.removeAttribute('aria-current');
    });
    sections.forEach((section, i) => {
      if (i <= idx) section.classList.add('is-lit');
    });
  };

  setActive(0);

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-lit'));
    if (lamps) lamps.classList.add('in');
    return;
  }

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((section) => spy.observe(section));

  if (lamps) {
    const lightUp = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lamps.classList.add('in');
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    lightUp.observe(lamps);
  }
})();
