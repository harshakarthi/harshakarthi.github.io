// Case study pop-up: open from cards, close with Esc / ✕ / backdrop,
// step through with ← →, and give each case its own link (#kafka-migration).
(function () {
  const modal = document.getElementById('case-modal');
  const body = document.getElementById('modal-body');
  const cards = Array.from(document.querySelectorAll('.case'));
  const ids = cards.map(c => c.dataset.case);
  let current = -1;
  let opener = null;

  function show(index) {
    current = (index + ids.length) % ids.length;
    const card = cards[current];
    const article = document.getElementById(ids[current]);
    body.innerHTML = article.innerHTML;
    const title = body.querySelector('h3');
    if (title) title.id = 'modal-title';
    modal.style.setProperty('--c', card.style.getPropertyValue('--c') || 'var(--cobalt)');
    body.scrollTop = 0;
    try { history.replaceState(null, '', '#' + ids[current]); } catch (e) {}
  }

  function open(index, fromEl) {
    opener = fromEl || null;
    show(index);
    if (!modal.open) modal.showModal();
    document.body.classList.add('modal-open');
  }

  function close() {
    if (modal.open) modal.close();
  }

  modal.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (opener) opener.focus();
  });

  cards.forEach((card, i) => card.addEventListener('click', () => open(i, card)));

  // "Related work" buttons in Experience open the matching case study
  document.querySelectorAll('[data-open]').forEach(btn =>
    btn.addEventListener('click', () => {
      const i = ids.indexOf(btn.dataset.open);
      if (i > -1) open(i, btn);
    })
  );

  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelectorAll('.modal-nav').forEach(btn =>
    btn.addEventListener('click', () => show(current + Number(btn.dataset.step)))
  );

  // Click on the dark backdrop closes it
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });

  modal.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });

  // Open straight to a case study from a link like yoursite.com/#azure-migration
  const start = ids.indexOf(location.hash.slice(1));
  if (start > -1) open(start, cards[start]);

  // Copy email button
  document.querySelectorAll('button.copy').forEach(btn => {
    const label = btn.textContent;
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      const done = () => {
        btn.textContent = 'Copied';
        setTimeout(() => (btn.textContent = label), 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => selectEmail());
      } else {
        selectEmail();
      }
    });
  });

  function selectEmail() {
    const el = document.querySelector('.email');
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Show the name in the top bar only after the big hero name has scrolled out of view
  const topbar = document.querySelector('.topbar');
  const heroName = document.querySelector('.hero h1');
  if (topbar && heroName && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      topbar.classList.toggle('show-brand', !entry.isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(heroName);
  } else if (topbar) {
    topbar.classList.add('show-brand');
  }
})();
