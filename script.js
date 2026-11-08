const root = document.documentElement;
const nav = document.getElementById('nav');
const menuBtn = document.querySelector('.menu-btn');

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile menu */
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

/* Light mode only (dark mode removed) */
root.setAttribute('data-theme', 'light');
try { localStorage.removeItem('theme'); } catch (e) {}

/* Highlight the nav link for the section on screen */
const links = document.querySelectorAll('nav a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section').forEach((s) => observer.observe(s));

const MY_EMAIL = 'charlydomingo281@gmail.com';

/* Scroll progress bar and back-to-top button */
const progress = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  toTop.hidden = window.scrollY < 600;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Typing effect in the hero: change these roles */
const roles = ['Web developer', 'UI UX DESIGNER'];
const typed = document.getElementById('typed');
if (!typed) {
  /* no typing line in the hero */
} else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typed.textContent = roles[0];
} else {
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let wait = deleting ? 40 : 90;
    if (!deleting && c === word.length) { deleting = true; wait = 1400; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; wait = 300; }
    setTimeout(tick, wait);
  })();
}

/* Reveal sections as they scroll into view */
root.classList.add('js');
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('main section:not(.hero) > :not(h2):not(.deco)').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* Toast (snackbar): message, optional icon, sub text and action button */
const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message, opts) {
  const { icon = '', sub = '', action = null, duration = 2600 } = opts || {};
  toast.classList.remove('show');
  toast.textContent = '';
  toast.style.setProperty('--dur', duration + 'ms');

  if (icon) {
    const ico = document.createElement('span');
    ico.className = 'toast-ico';
    ico.innerHTML = icon;
    toast.appendChild(ico);
  }
  const text = document.createElement('span');
  text.className = 'toast-text';
  const strong = document.createElement('strong');
  strong.textContent = message;
  text.appendChild(strong);
  if (sub) {
    const small = document.createElement('small');
    small.textContent = sub;
    text.appendChild(small);
  }
  toast.appendChild(text);

  if (action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      clearTimeout(toastTimer);
      toast.classList.remove('show');
      action.onClick();
    });
    toast.appendChild(btn);
  }
  const bar = document.createElement('i');
  bar.className = 'toast-bar';
  toast.appendChild(bar);

  void toast.offsetWidth; /* restart the animations */
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* Snackbar for the mode switch: icon, message and an Undo button */
const ICON_SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
function themeToast(mode, prev) {
  const dark = mode === 'dark';
  showToast(dark ? 'Dark mode on' : 'Light mode on', {
    icon: dark ? ICON_MOON : ICON_SUN,
    sub: dark ? 'Easier on the eyes at night' : 'Bright and clear for daytime',
    duration: 3500,
    action: prev && prev !== mode ? {
      label: 'Undo',
      onClick: () => {
        applyTheme(prev);
        try { localStorage.setItem('theme', prev); } catch (e) {}
        showToast(prev === 'dark' ? 'Back to dark mode' : 'Back to light mode', { icon: prev === 'dark' ? ICON_MOON : ICON_SUN });
      }
    } : null
  });
}

/* Copy email button */
document.querySelector('.copy-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(MY_EMAIL);
    showToast('Email copied');
  } catch (e) {
    showToast('Copy failed. Email: ' + MY_EMAIL);
  }
});

/* Project filters: buttons are built from the tags on your projects */
const filterBar = document.querySelector('.filters');
const projectCards = [...document.querySelector('.projects').children];
const tagsOf = (card) => [...card.querySelectorAll('.tags li')].map((t) => t.textContent);
const allTags = [...new Set(projectCards.flatMap(tagsOf))];
['All', ...allTags].forEach((name, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = name;
  b.setAttribute('aria-pressed', i === 0);
  b.addEventListener('click', () => {
    filterBar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    projectCards.forEach((card) => { card.hidden = name !== 'All' && !tagsOf(card).includes(name); });
  });
  filterBar.appendChild(b);
});
filterBar.remove(); /* projects are shown one at a time with the Next button, so no filter bar */

/* Count-up numbers in About */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.querySelectorAll('.stats strong').forEach((el) => {
    const target = parseInt(el.textContent, 10);
    el.textContent = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      (function step(now) {
        const t = Math.min((now - start) / 1000, 1);
        el.textContent = Math.round(target * t);
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

try { localStorage.removeItem('accent'); } catch (e) {}

/* Skills strip: repeat the items so it loops without a gap */
const track = document.querySelector('.marquee-track');
[...track.children].forEach((el) => {
  const copy = el.cloneNode(true);
  copy.classList.add('clone');
  track.appendChild(copy);
});

/* Light that follows the mouse on project cards */
projectCards.forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Ripple effect when a button is pressed */
document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.classList.contains('loading')) return;
  const rect = btn.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.style.left = (e.clientX - rect.left - 20) + 'px';
  dot.style.top = (e.clientY - rect.top - 20) + 'px';
  btn.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
});

/* Headline: letters rise in one by one */
const heroTitle = document.querySelector('.hero h1');
if (heroTitle) {
  const text = heroTitle.textContent;
  let n = 0;
  heroTitle.setAttribute('aria-label', text);
  heroTitle.textContent = '';
  const greet = document.createElement('span');
  greet.className = 'greet';
  greet.setAttribute('aria-hidden', 'true');
  heroTitle.appendChild(greet);
  text.split(' ').forEach((w, wi, all) => {
    const word = document.createElement('span');
    word.className = 'word';
    word.setAttribute('aria-hidden', 'true');
    [...w].forEach((ch) => {
      const s = document.createElement('span');
      s.className = ch === '.' ? 'ch dot' : 'ch';
      s.textContent = ch;
      s.style.animationDelay = (n++ * 45) + 'ms';
      word.appendChild(s);
    });
    if (wi < all.length - 1) { greet.appendChild(word); greet.appendChild(document.createTextNode(' ')); }
    else heroTitle.appendChild(word);
  });
}

/* Mouse effects (mouse users only): tilting photo and magnetic hero buttons */
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  const avatar = document.querySelector('.hero-photo');
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  hero.addEventListener('pointermove', (e) => {
    const r = avatar.getBoundingClientRect();
    const x = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
    const y = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
    avatar.style.transform = 'perspective(500px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
  });
  hero.addEventListener('pointerleave', () => { avatar.style.transform = ''; });

  document.querySelectorAll('.actions .btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* Floating nav bar: stronger shadow after scrolling */
const siteHeader = document.querySelector('.site-header');
const markScrolled = () => siteHeader.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', markScrolled, { passive: true });
markScrolled();

/* Navigation: sliding highlight that follows the mouse and the current section */
const navPill = nav.querySelector('.nav-pill');
function placePill(link) {
  if (!link || getComputedStyle(navPill).display === 'none') return;
  navPill.style.width = link.offsetWidth + 'px';
  navPill.style.height = link.offsetHeight + 'px';
  navPill.style.transform = 'translate(' + link.offsetLeft + 'px,' + link.offsetTop + 'px)';
  navPill.style.opacity = 1;
}
function resetPill() {
  const current = nav.querySelector('a.active');
  if (current) placePill(current);
  else navPill.style.opacity = 0;
}
links.forEach((a) => {
  a.addEventListener('pointerenter', () => placePill(a));
  a.addEventListener('focus', () => placePill(a));
});
nav.addEventListener('pointerleave', resetPill);
nav.addEventListener('focusout', resetPill);
window.addEventListener('resize', resetPill);
window.addEventListener('load', resetPill);
new MutationObserver(resetPill).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });


/* Navigation: shows the name of the section you are reading */
const crumb = document.querySelector('.crumb');
function updateCrumb() {
  const current = nav.querySelector('a.active');
  const label = current ? current.textContent : '';
  if (crumb.textContent === label) return;
  crumb.textContent = label;
  crumb.classList.remove('swap');
  void crumb.offsetWidth;
  crumb.classList.add('swap');
}
new MutationObserver(updateCrumb).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });



/* About: photo tilts toward the mouse (mouse users only) */
const aboutHead = document.querySelector('.about-head');
const aboutAvatar = document.querySelector('.avatar.sm');
if (aboutHead && aboutAvatar && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const limit = (v) => Math.max(-1, Math.min(1, v));
  aboutHead.addEventListener('pointermove', (e) => {
    const r = aboutAvatar.getBoundingClientRect();
    const x = limit((e.clientX - (r.left + r.width / 2)) / (r.width * 2));
    const y = limit((e.clientY - (r.top + r.height / 2)) / (r.height * 2));
    aboutAvatar.style.transform = 'perspective(500px) rotateY(' + (x * 16) + 'deg) rotateX(' + (-y * 16) + 'deg)';
  });
  aboutHead.addEventListener('pointerleave', () => { aboutAvatar.style.transform = ''; });
}

/* About: soft light follows the mouse across the section */
const aboutSection = document.getElementById('about');
aboutSection.addEventListener('pointermove', (e) => {
  const r = aboutSection.getBoundingClientRect();
  aboutSection.style.setProperty('--gx', (e.clientX - r.left) + 'px');
  aboutSection.style.setProperty('--gy', (e.clientY - r.top) + 'px');
});

/* About: use the same photo as the home section inside the round frame */
const heroPhoto = document.querySelector('.hero-photo img');
const aboutCircle = document.querySelector('.avatar.sm');
function copyPhotoToAbout() {
  if (!heroPhoto || !aboutCircle || aboutCircle.querySelector('.avatar-crop')) return;
  const crop = document.createElement('span');
  crop.className = 'avatar-crop';
  const img = document.createElement('img');
  img.src = heroPhoto.dataset.avatar || heroPhoto.currentSrc || heroPhoto.src;
  img.alt = '';
  crop.appendChild(img);
  aboutCircle.appendChild(crop);
}
if (heroPhoto) {
  if (heroPhoto.complete && heroPhoto.naturalWidth > 0) copyPhotoToAbout();
  else heroPhoto.addEventListener('load', copyPhotoToAbout, { once: true });
}

/* Skills cards: light follows the mouse */
document.querySelectorAll('.cap-card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Loading screen: fills a progress line, then reveals the page once everything has loaded */
(function () {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  const segs = [...loader.querySelectorAll('.seg-bar i')];
  const light = (pct) => { const n = Math.round(pct / 10); segs.forEach((s, i) => s.classList.toggle('on', i < n)); };
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = calm ? 300 : 1400;   /* shortest time the screen stays up */
  const MAX = 5000;                /* never get stuck if something loads slowly */
  const start = performance.now();
  let pageLoaded = document.readyState === 'complete';
  let finished = false;

  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => { pageLoaded = true; });

  function finish() {
    if (finished) return;
    finished = true;
    light(100);
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
      setTimeout(() => loader.remove(), 900);
    }, 250);
  }

  function tick(now) {
    if (finished) return;
    const t = now - start;
    /* Eases toward 90% while waiting, then completes once loaded and MIN has passed */
    const target = pageLoaded && t >= MIN ? 100 : Math.min(90, (t / MIN) * 90);
    const shown = Math.round(target);
    light(shown);
    if (shown >= 100 || t >= MAX) finish();
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Buttons: spotlight follows the mouse */
document.addEventListener('pointermove', (e) => {
  const btn = e.target.closest && e.target.closest('.btn');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  btn.style.setProperty('--bx', (e.clientX - r.left) + 'px');
  btn.style.setProperty('--by', (e.clientY - r.top) + 'px');
}, { passive: true });

/* About: card spotlight, live local time, copy email */
document.querySelectorAll('.ab-card').forEach((card, i) => {
  card.style.setProperty('--i', i);
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

(function () {
  const card = document.querySelector('.ab-time');
  if (!card) return;
  const TZ = 'Asia/Manila';
  function tickClock() {
    const now = new Date();
    document.getElementById('ab-clock').textContent = now.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
    document.getElementById('ab-date').textContent = now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' });
    const h = parseInt(now.toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }), 10) % 24;
    card.dataset.phase = h >= 6 && h < 18 ? 'day' : 'night';
    document.getElementById('ab-greet').textContent = h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
  }
  tickClock();
  setInterval(tickClock, 15000);
})();



/* Chat assistant: built-in answers about Charly (optionally connect a real AI through BOT_ENDPOINT) */
(function () {
  const BOT_ENDPOINT = '';   /* leave empty to use the built-in answers; set to your own server URL to use a real AI */
  const chat = document.getElementById('chat');
  const fab = chat.querySelector('.chat-fab');
  const panel = chat.querySelector('.chat-panel');
  const log = chat.querySelector('.chat-log');
  const chips = chat.querySelector('.chat-chips');
  const form = chat.querySelector('.chat-form');
  const input = form.elements.q;
  const history = [];
  let greeted = false, busy = false;

  const topics = [
    { re: /\b(hi|hello|hey|yo|good (morning|afternoon|evening))\b/, a: "Hi there! I'm Charly's assistant. Ask me about his skills, education, projects or how to get in touch." },
    { re: /skill|tech|stack|language|code|coding|html|css|javascript|typescript|dart|flutter|python|java|php|firebase|figma|tools/, a: 'Charly works with HTML, CSS, JavaScript, TypeScript, Dart, Flutter, Python, Java, PHP and Firebase, and designs in Figma. UI UX design is a growing focus for him.', link: ['See skills', '#skills'] },
    { re: /educat|study|school|student|course|degree|learn/, a: "He's a BS Information Technology student, and he keeps learning by practicing HTML, CSS, JavaScript and Dart through personal projects.", link: ['See education', '#education'] },
    { re: /project|portfolio|built|build|work|made|app|pawikan|mobile/, a: "His projects include this personal website and Pawikan, an offline mobile app built with Flutter and Dart that helps Filipinos build English sentences from Tagalog or Bisaya, with Pawi the sea turtle as their study buddy.", link: ['See projects', '#projects'] },
    { re: /contact|email|mail|phone|call|number|reach|hire|message|touch/, a: 'You can email charlydomingo281@gmail.com, call +63 9631 839 766.', link: ['Go to contact', '#contact'] },
    { re: /where|location|live|from|city|maragusan|davao/, a: 'Charly is based in Maragusan, Davao de Oro, in the Philippines.', link: ['See details', '#about'] },
    { re: /time|clock/, a: () => 'It is ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }) + ' in Maragusan right now.' },
    { re: /who|about|charly|yourself|you do|introduce/, a: 'Charly D. Domingo is a BS Information Technology student who builds websites and designs simple, user-friendly interfaces.', link: ['About Charly', '#about'] },
    { re: /thank|thanks|bye|great|cool|nice/, a: "You're welcome! Let me know if you want to know anything else." }
  ];
  const fallback = { a: "I'm not sure about that one. Try asking about skills, education, projects or contact, or reach Charly by email or phone.", link: ['Go to contact', '#contact'] };

  function add(who, text, link) {
    const row = document.createElement('div');
    row.className = 'msg ' + who;
    const b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = text;
    if (link) {
      const a = document.createElement('a');
      a.href = link[1]; a.textContent = link[0] + ' \u2192'; a.className = 'bubble-link';
      a.addEventListener('click', () => { if (matchMedia('(max-width: 640px)').matches) setOpen(false); });
      b.appendChild(a);
    }
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  async function answer(q) {
    if (BOT_ENDPOINT) {
      try {
        const res = await fetch(BOT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, history }) });
        const data = await res.json();
        if (data && data.reply) return { a: data.reply };
      } catch (e) { /* fall back to the built-in answers */ }
    }
    const t = topics.find((x) => x.re.test(q.toLowerCase())) || fallback;
    return { a: typeof t.a === 'function' ? t.a() : t.a, link: t.link };
  }

  async function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    busy = true;
    add('user', q);
    history.push({ role: 'user', content: q });
    chips.hidden = true;
    const typing = add('bot', '');
    typing.classList.add('typing');
    typing.firstChild.innerHTML = '<i></i><i></i><i></i>';
    const [r] = await Promise.all([answer(q), new Promise((ok) => setTimeout(ok, 700 + Math.random() * 500))]);
    typing.remove();
    add('bot', r.a, r.link);
    history.push({ role: 'assistant', content: r.a });
    busy = false;
  }

  ['What does Charly do?', 'Skills', 'Projects', 'Contact'].forEach((label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.addEventListener('click', () => ask(label === 'Skills' ? 'What skills does he have?' : label === 'Projects' ? 'Show me projects' : label === 'Contact' ? 'How can I contact him?' : label));
    chips.appendChild(b);
  });

  function setOpen(open) {
    chat.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open);
    fab.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if (open) {
      chat.classList.add('seen');
      if (!greeted) {
        greeted = true;
        setTimeout(() => add('bot', "Hi! I'm Charly's assistant. Ask me anything about his skills, education, projects or contact details."), 250);
      }
      setTimeout(() => input.focus({ preventScroll: true }), 250);
    }
  }
  fab.addEventListener('click', () => setOpen(!chat.classList.contains('open')));
  chat.querySelector('.chat-close').addEventListener('click', () => { setOpen(false); fab.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chat.classList.contains('open')) { setOpen(false); fab.focus(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
})();


/* Contact: rotating word, topic + method picker, save-contact card */
(function () {
  const root = document.getElementById('contact');
  if (!root) return;
  const PHONE = '+639631839766';

  /* rotating word in the headline */
  const word = root.querySelector('.ct-word');
  const words = ['websites', 'apps', 'designs', 'ideas', 'something together'];
  let wi = 0;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      word.classList.add('out');
      setTimeout(() => { wi = (wi + 1) % words.length; word.textContent = words[wi]; word.classList.remove('out'); }, 280);
    }, 2600);
  }

  /* topic chips + contact method -> one smart button */
  const topics = {
    internship: ['Internship opportunity', 'an internship opportunity'],
    freelance: ['Freelance project', 'a freelance project'],
    design: ['UI UX design inquiry', 'a UI UX design project'],
    collab: ['Collaboration idea', 'a collaboration idea']
  };
  const tagBtns = [...root.querySelectorAll('.ct-tags button')];
  const seg = root.querySelector('.ct-seg');
  const segBtns = [...seg.querySelectorAll('button')];
  const go = root.querySelector('.ct-go');
  const goLabel = go.querySelector('.ct-go-label');
  const note = document.getElementById('ct-note');
  let topic = '', method = 'email';

  function update() {
    if (method === 'email') {
      const subject = topic ? topics[topic][0] : 'Hello from your website';
      const body = 'Hi Charly,\n\n' + (topic ? "I'd like to talk about " + topics[topic][1] + '.\n\n' : '');
      go.href = 'mailto:' + MY_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      goLabel.textContent = 'Email me';
      note.textContent = topic ? 'Opens your email app with the subject "' + subject + '".' : 'Opens your email app with a ready-made message.';
    } else if (method === 'call') {
      go.href = 'tel:' + PHONE; goLabel.textContent = 'Call me';
      note.textContent = 'Starts a call to +63 9631 839 766.';
    } else {
      go.href = 'sms:' + PHONE; goLabel.textContent = 'Text me';
      note.textContent = 'Opens your messages app to +63 9631 839 766.';
    }
  }
  tagBtns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    tagBtns.forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', on);
    topic = on ? b.dataset.t : '';
    update();
  }));
  segBtns.forEach((b, i) => b.addEventListener('click', () => {
    segBtns.forEach((x) => x.setAttribute('aria-checked', x === b));
    seg.style.setProperty('--i', i);
    method = b.dataset.m;
    update();
  }));

  /* copy button: confirmation state */
  const copy = root.querySelector('.copy-btn');
  const copyHtml = copy.innerHTML;
  copy.addEventListener('click', () => {
    copy.classList.add('done');
    copy.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
    setTimeout(() => { copy.classList.remove('done'); copy.innerHTML = copyHtml; }, 1800);
  });

  /* save contact: downloads a vCard so it can be added to a phone */
  root.querySelector('.ct-vcard').addEventListener('click', () => {
    const vcf = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Domingo;Charly;D.;;', 'FN:Charly D. Domingo', 'TEL;TYPE=CELL:' + PHONE,
      'EMAIL:' + MY_EMAIL, 'ADR;TYPE=HOME:;;Maragusan;Davao de Oro;;;Philippines', 'END:VCARD'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    a.download = 'Charly-Domingo.vcf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast('Contact card saved', { sub: 'Open it to add Charly to your contacts' });
  });
})();


/* Projects: show one at a time, Previous and Next move between them */
(function () {
  const slides = [...document.querySelectorAll('.projects > .featured')];
  if (slides.length < 2) return;
  let i = 0;
  function go(step, btnClass) {
    i = (i + step + slides.length) % slides.length;
    slides.forEach((x, k) => { x.hidden = k !== i; });
    const cur = slides[i];
    cur.classList.remove('slide-in', 'slide-back'); void cur.offsetWidth;
    cur.classList.add(step > 0 ? 'slide-in' : 'slide-back');
    cur.querySelector(btnClass).focus({ preventScroll: true });
  }
  slides.forEach((s) => {
    s.querySelector('.proj-next').addEventListener('click', () => go(1, '.proj-next'));
    s.querySelector('.proj-prev').addEventListener('click', () => go(-1, '.proj-prev'));
  });
})();


/* About: analog clock, copy buttons, clickable "Currently" rows, years studying */
(function () {
  const about = document.getElementById('about');
  if (!about) return;

  /* years studying, calculated from the start year */
  const since = about.querySelector('[data-since]');
  if (since) since.textContent = Math.max(0, new Date().getFullYear() - Number(since.dataset.since));

  /* analog clock (Maragusan time) */
  const hr = about.querySelector('.hand.hr'), mn = about.querySelector('.hand.mn'), sc = about.querySelector('.hand.sc');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  function tick() {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).filter((x) => x.type !== 'literal').map((x) => [x.type, +x.value]));
    hr.style.transform = 'rotate(' + (((p.hour % 12) + p.minute / 60) * 30) + 'deg)';
    mn.style.transform = 'rotate(' + ((p.minute + p.second / 60) * 6) + 'deg)';
    sc.style.transform = 'rotate(' + (p.second * 6) + 'deg)';
  }
  if (hr) { tick(); setInterval(tick, 1000); }

  /* copy buttons on contact rows */
  const contact = [...about.querySelectorAll('.ab-card')].find((c) => c.querySelector('.ab-title') && c.querySelector('.ab-title').textContent.trim() === 'Contact details');
  if (contact) contact.querySelectorAll('.ab-list li').forEach((li) => {
    const src = li.querySelector('a') || li.querySelector('div span');
    const label = li.querySelector('strong').textContent;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'copy-mini'; b.setAttribute('aria-label', 'Copy ' + label.toLowerCase());
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    b.addEventListener('click', async () => {
      const v = src.textContent.trim();
      try { await navigator.clipboard.writeText(v); showToast(label + ' copied', { sub: v, duration: 2000 }); }
      catch (e) { showToast('Could not copy', { sub: v }); }
    });
    li.appendChild(b);
  });

  /* "Currently" rows jump to the matching section */
  const now = [...about.querySelectorAll('.ab-card')].find((c) => c.querySelector('.ab-title.live'));
  if (now) now.querySelectorAll('.ab-list li').forEach((li, i) => {
    const target = ['#projects', '#skills', '#education'][i];
    if (!target) return;
    li.classList.add('go'); li.tabIndex = 0; li.setAttribute('role', 'link');
    const go = () => document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
})();

/* Phones: the back-to-top button hides while scrolling down, so it never covers the text */
(function () {
  const t = document.querySelector('.to-top');
  if (!t) return;
  const phone = window.matchMedia('(max-width: 640px)');
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (phone.matches && y > last + 4) t.classList.add('away');
    else if (y < last - 4 || !phone.matches) t.classList.remove('away');
    last = y;
  }, { passive: true });
})();

/* Project screenshot gallery: arrow buttons switch between screenshots */
document.querySelectorAll('.gallery').forEach((g) => {
  const imgs = [...g.querySelectorAll('.gal-stage img')];
  const count = g.querySelector('.gal-count');
  const names = ['Sign in', 'Inventory'];
  let i = 0;
  function show(n) {
    i = (n + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    if (count) count.textContent = (i + 1) + ' / ' + imgs.length + (names[i] ? ' \u00b7 ' + names[i] : '');
  }
  g.querySelector('.gal-prev').addEventListener('click', () => show(i - 1));
  g.querySelector('.gal-next').addEventListener('click', () => show(i + 1));
});

/* Chat window status bar: shows "Typing..." while the assistant answers */
(function () {
  const log = document.querySelector('.chat-log');
  const st = document.querySelector('.win-ready');
  if (!log || !st) return;
  new MutationObserver(() => { st.textContent = log.querySelector('.typing') ? 'Typing...' : 'Ready'; }).observe(log, { childList: true, subtree: true });
})();

/* ===================== Ladder + pixel climber =====================
   A ladder runs down the left side from About to the bottom of the page.
   Above About he stands on a ledge; scroll down and he jumps onto the ladder, grabs it, and climbs
   hand over hand with your scrolling (one pose per rung). Stop scrolling and he rests and looks at the page;
   reach the bottom and he steps off; scroll up and he climbs back and hops onto the ledge. */
(function () {
  const ladder = document.querySelector('.ladder');
  const ledge = document.querySelector('.ledge');
  const guy = document.querySelector('.climber');
  const about = document.getElementById('about');
  const scene = document.querySelector('.end-scene');
  if (!ladder || !guy || !about) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = window.matchMedia('(min-width: 1240px)');
  const LW = 55;                          /* ladder width */
  const OFF = (767 - 587) * 0.22;         /* ladder middle inside the climbing sprites */
  const CLIMB_H = 119, STAND_H = 106, STAND_W = 83, RUNG = 16.5, STEP = RUNG * 2.5;   /* one pose every 2.5 rungs = slower climb */
  const CYCLE = ['a', 'b', 'am', 'b'];    /* right hand up → both up → left hand up → both up */
  let top = 0, bottom = 0, left = 0, state = 'stand', jumping = false, curY = null, raf = 0;
  let landUntil = 0, lastMove = 0, idleTimer = 0, bottomSince = 0;

  function layout() {
    const docH = document.documentElement.scrollHeight;
    const r = about.getBoundingClientRect();
    top = Math.round(r.top + window.scrollY + 40);
    bottom = docH - 74;            /* ground level: the ending platform sits here */
    const vw = document.documentElement.clientWidth;
    let edge = vw;
    document.querySelectorAll('main section:not(.hero) > *, .site-header').forEach((el) => {
      const rr = el.getBoundingClientRect(); if (rr.width && rr.width < vw - 4) edge = Math.min(edge, rr.left);
    });
    const room = edge - 26 - LW - 22;
    left = Math.round(Math.min(edge - 26 - LW, Math.max(116, 22 + Math.max(0, room / 2))));
    const fits = left >= 100;
    [ladder, ledge, guy, scene].forEach((el) => el && el.classList.toggle('no-room', !fits));
    ladder.style.left = left + 'px'; ladder.style.top = top + 'px'; ladder.style.height = (bottom - top) + 'px';
    ledge.style.left = '0px'; ledge.style.width = Math.max(0, left - 16) + 'px'; ledge.style.top = top + 'px';
    placeScene();
  }
  const standPos = () => ({ x: left - 16 - STAND_W + 2, y: top - CLIMB_H + 2 });
  function climbPos() {
    /* he rides at ~45% of the screen, then in the last screen of scrolling he climbs all the way to the bottom */
    const vh = window.innerHeight, maxY = document.documentElement.scrollHeight - vh;
    const endT = Math.min(1, Math.max(0, (window.scrollY - (maxY - vh)) / vh));
    const anchor = window.scrollY + vh * (0.45 + 0.55 * endT);
    const y = Math.min(bottom - CLIMB_H, Math.max(top + 6, anchor - CLIMB_H / 2));
    return { x: left + LW / 2 - OFF, y };
  }
  const place = (p) => { guy.style.left = p.x + 'px'; guy.style.top = p.y + 'px'; };
  const pose = (p) => { if (guy.dataset.pose !== p) guy.dataset.pose = p; };

  function jump(from, to, dir, done) {
    if (calm || !guy.animate) { done(); return; }
    jumping = true; guy.dataset.state = 'jump'; guy.dataset.dir = dir; place(from);
    const dx = to.x - from.x, dy = to.y - from.y;
    const a = guy.animate([
      { transform: 'translate(0,0)' },
      { transform: 'translate(' + dx * .5 + 'px,' + (Math.min(0, dy) * .5 - 46) + 'px)', offset: .45 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px)' },
    ], { duration: 520, easing: 'cubic-bezier(.3,.6,.4,1)' });
    a.onfinish = () => { jumping = false; done(); update(); };
  }


  /* ---------- ending scene: ground, chest, speech bubble ---------- */
  const eGround = scene && scene.querySelector('.end-ground');
  const eGuy = scene && scene.querySelector('.end-guy');
  const eKneel = scene && scene.querySelector('.end-kneel');
  const eBubble = scene && scene.querySelector('.end-bubble');
  const eText = eBubble && eBubble.querySelector('span');
  const chest = scene && scene.querySelector('.end-chest');
  function placeScene() {
    if (!scene) return;
    const gx = left - 18, standX = left + LW + 10, chestX = left + LW + 10 + 83 + 26;
    eGround.style.left = gx + 'px'; eGround.style.top = (bottom - 6) + 'px';
    eGuy.style.left = standX + 'px'; eGuy.style.top = (bottom - 98) + 'px';
    chest.style.left = chestX + 'px'; chest.style.top = (bottom - 87) + 'px';
    eBubble.style.left = (standX + 22) + 'px'; eBubble.style.top = (bottom - 98 - 108) + 'px';
    /* kneeling picture: line its chest up with the real chest */
    eKneel.style.left = (chestX + 13.75 - 71.8) + 'px'; eKneel.style.top = (bottom - 87 + 86 - 144.6) + 'px';
  }
  function toGround(on) {
    if (!scene) return;
    scene.classList.toggle('at-ground', on);
    guy.classList.toggle('off-ladder', on);
  }
  if (chest) chest.addEventListener('click', (e) => {
    if (chest.dataset.state === 'open') return;             /* already open: let the link download the CV */
    e.preventDefault();
    if (chest.dataset.state !== 'closed') return;
    const atGround = scene.classList.contains('at-ground');
    const finish = () => {
      scene.classList.remove('kneeling');
      chest.dataset.state = 'half';
      if (atGround) eGuy.dataset.pose = 'cheer';
      setTimeout(() => {
        chest.dataset.state = 'open';
        chest.setAttribute('aria-label', 'Download my CV (PDF)');
        eText.textContent = "You found my CV! Click the chest 📄";
        toGround(true);
      }, calm ? 0 : 320);
    };
    if (atGround && !calm) { scene.classList.add('kneeling'); setTimeout(finish, 750); } else finish();
  });

  /* ---------- Skills loot box ----------
     When he climbs past "What I Can Do" he pulls out a box, throws it onto the tech grid,
     it lands with a puff, pops open, the keycaps fly out into their slots, and the box vanishes. Once per visit. */
  const techList = document.querySelector('#skills ul.tech');
  const lootBox = document.querySelector('.loot');
  const L = lootBox ? {
    fly: lootBox.querySelector('.lt-fly'), closed: lootBox.querySelector('.lt-closed'), pop: lootBox.querySelector('.lt-pop'),
    open: lootBox.querySelector('.lt-open'), dust: lootBox.querySelector('.lt-dust'), poof: lootBox.querySelector('.lt-poof'),
  } : null;
  let lootDone = !techList || !lootBox || calm || !guy.animate, looting = false;
  const lootReady = () => wide.matches && !guy.classList.contains('no-room');
  if (!lootDone) techList.classList.add('loot-wait');
  function revealKeys() {             /* plain fallback when the climber is not around */
    if (!techList.classList.contains('loot-wait')) return;
    lootDone = true;
    techList.querySelectorAll('li').forEach((li, i) => {
      li.classList.add('got');
      if (li.animate && !calm) li.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 300, delay: i * 40, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' });
    });
    techList.classList.remove('loot-wait');
  }
  if (!lootDone && 'IntersectionObserver' in window) {
    new IntersectionObserver((en) => {
      if (!en[0].isIntersecting || lootDone) return;
      if (!lootReady()) revealKeys();
      else setTimeout(() => { if (!lootDone && !looting) revealKeys(); }, 3500);   /* safety net if he never gets there */
    }, { threshold: .4 }).observe(techList);
  }
  wide.addEventListener && wide.addEventListener('change', () => { if (!lootReady() && !looting) revealKeys(); });
  function lootTime() {
    if (lootDone || looting || state !== 'climb' || !lootReady()) return false;
    const r = techList.getBoundingClientRect(), vh = window.innerHeight;
    return r.top < vh * .6 && r.bottom > vh * .3;
  }
  function sprite(img, cx, by, show) {     /* place a loot picture by its bottom-centre */
    img.style.left = (cx - img.width / 2) + 'px'; img.style.top = (by - img.height) + 'px';
    img.classList.toggle('show', show !== false);
  }
  function playLoot() {
    looting = true; lootDone = true;
    const gx = parseFloat(guy.style.left), gy = parseFloat(guy.style.top);
    /* landing spot: the empty space after the last keycap (or under the grid if the last row is full) */
    const tr = techList.getBoundingClientRect(), keys = techList.querySelectorAll('li'), last = keys[keys.length - 1].getBoundingClientRect();
    const roomRight = tr.right - last.right > 90;
    const lx = (roomRight ? (last.right + tr.right) / 2 : tr.left + tr.width / 2) + window.scrollX;
    const ly = (roomRight ? last.bottom : tr.bottom + 70) + window.scrollY;
    const at = (ms, fn) => setTimeout(fn, ms);
    lootBox.classList.add('on');
    pose('hold');
    /* 1. throw */
    at(650, () => {
      pose('throw');
      const sx = gx + 100, sy = gy + 72;
      sprite(L.fly, sx, sy);
      const dx = lx - sx, dy = ly - sy;
      L.fly.animate([
        { transform: 'translate(0,0) rotate(-20deg) scale(.42)' },
        { transform: 'translate(' + dx * .5 + 'px,' + (Math.min(0, dy) - 120) + 'px) rotate(160deg) scale(.75)', offset: .5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(340deg) scale(1)' },
      ], { duration: 620, easing: 'cubic-bezier(.35,.5,.6,1)' });
    });
    /* 2. land with a puff of dust */
    at(1270, () => {
      L.fly.classList.remove('show');
      sprite(L.closed, lx, ly);
      L.closed.animate([{ transform: 'scale(1.25,.7)', transformOrigin: '50% 100%' }, { transform: 'scale(.9,1.12)', transformOrigin: '50% 100%', offset: .5 }, { transform: 'none', transformOrigin: '50% 100%' }], { duration: 300 });
      sprite(L.dust, lx, ly + 4);
      L.dust.animate([{ opacity: 1, transform: 'scale(.6,.8)' }, { opacity: 1, transform: 'scale(1)', offset: .5 }, { opacity: 0, transform: 'scale(1.15)' }], { duration: 450, fill: 'forwards' })
        .onfinish = () => L.dust.classList.remove('show');
      setTimeout(() => { pose('idle'); }, 300);
    });
    /* 3. wiggle, then pop */
    at(1650, () => {
      L.closed.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0)' }],
        { duration: 380, easing: 'steps(5)' });
    });
    at(2080, () => {
      L.closed.classList.remove('show');
      sprite(L.pop, lx, ly);
      L.pop.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 220 });
      /* 4. keycaps fly out of the box into their slots */
      const ox = lx, oy = ly - 30;
      techList.querySelectorAll('li').forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const dx = ox - (r.left + r.width / 2 + window.scrollX), dy = oy - (r.top + r.height / 2 + window.scrollY);
        li.classList.add('got');
        li.animate([
          { opacity: 0, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.25)' },
          { opacity: 1, transform: 'translate(' + dx * .45 + 'px,' + (dy * .45 - 70) + 'px) scale(.8)', offset: .45 },
          { opacity: 1, transform: 'translate(0,-6px) scale(1.06)', offset: .82 },
          { opacity: 1, transform: 'translate(0,4px) scale(1)', offset: .92 },
          { opacity: 1, transform: 'none' },
        ], { duration: 560, delay: i * 75, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      });
    });
    at(2400, () => { L.pop.classList.remove('show'); sprite(L.open, lx, ly); });
    /* 5. the empty box vanishes in a poof */
    at(2080 + 75 * 10 + 500, () => {
      L.open.classList.remove('show');
      sprite(L.poof, lx, ly + 16);
      L.poof.animate([{ opacity: 1, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1.05)', offset: .4 }, { opacity: 0, transform: 'scale(1.2)' }], { duration: 520, fill: 'forwards' })
        .onfinish = () => { L.poof.classList.remove('show'); lootBox.classList.remove('on'); };
      techList.classList.remove('loot-wait');
      looting = false; lastMove = performance.now() - 1000; req();
    });
  }

  /* ---------- Education scenes ----------
     School history: he puts on a graduation cap, tosses it, it lands on the BS IT file and the progress bar fills.
     Training: certificates pop out of each timeline item and fly to him; the counter goes up to 5/5. */
  const fx = document.querySelector('.edu-fx');
  const capImg = fx && fx.querySelector('.fx-cap'), bubble = fx && fx.querySelector('.fx-bubble');
  const curFile = document.querySelector('.ft-file.is-current');
  const schoolCard = curFile && curFile.closest('.ab-card');
  const nodes = [...document.querySelectorAll('.gtl .gtl-node')];
  const trainCard = nodes.length ? nodes[0].closest('.ab-card') : null;
  const counter = document.querySelector('.cert-count'), counterNum = counter && counter.querySelector('b');
  const docXY = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }; };
  const after = (ms, fn) => setTimeout(fn, ms);

  /* progress to graduation: Aug 2022 → Apr 2027 */
  const START = new Date(2022, 7, 1), END = new Date(2027, 3, 30);
  const PCT = Math.max(0, Math.min(100, Math.round((Date.now() - START) / (END - START) * 100)));
  function fillBar(animated) {
    if (!curFile) return;
    const segs = curFile.querySelectorAll('.fp-bar i'), out = curFile.querySelector('.fp-pct');
    const full = Math.floor(PCT / 10), half = PCT % 10 >= 5;
    segs.forEach((seg, i) => {
      const set = () => { seg.classList.toggle('on', i < full); seg.classList.toggle('half', i === full && half);
        if (out) out.textContent = Math.min(PCT, (i + 1) * 10) + '%'; };
      animated ? after(i * 90, set) : set();
    });
    if (out) animated ? after(segs.length * 90, () => { out.textContent = PCT + '%'; }) : (out.textContent = PCT + '%');
  }
  function putCap() {
    if (!curFile || curFile.querySelector('.ft-cap')) return;
    const c = new Image(); c.src = capImg ? capImg.src : 'images/climber/gradcap.png'; c.className = 'ft-cap'; c.alt = ''; c.setAttribute('aria-hidden', 'true');
    curFile.appendChild(c); return c;
  }
  function setCount(n) {
    if (!counter) return;
    counterNum.textContent = n >= nodes.length ? nodes.length + '/' + nodes.length + ' collected ✓' : n + '/' + nodes.length;
    counter.classList.toggle('done', n >= nodes.length);
    counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
  }

  const scenes = [];
  if (curFile && schoolCard && fx) scenes.push({
    el: schoolCard, done: false,
    when: (r, vh) => r.top < vh * .5 && r.bottom > vh * .45,
    finish() { this.done = true; putCap(); fillBar(false); },
    play() {
      const gx = parseFloat(guy.style.left), gy = parseFloat(guy.style.top);
      pose('capon');
      bubble.style.left = (gx + 120) + 'px'; bubble.style.top = (gy - 18) + 'px'; bubble.classList.add('show');
      after(1000, () => {
        pose('cheer');
        const sx = gx + 46 + 12, sy = gy - 8;                  /* cap leaves his head */
        const cr = curFile.getBoundingClientRect();
        const tx = cr.right + window.scrollX - 10 - 44, ty = cr.top + window.scrollY - 14;
        capImg.style.left = sx + 'px'; capImg.style.top = sy + 'px'; capImg.classList.add('show');
        const dx = tx - sx, dy = ty - sy;
        capImg.animate([
          { transform: 'translate(0,0) rotate(0) scale(1.1)' },
          { transform: 'translate(' + dx * .35 + 'px,' + (Math.min(0, dy) - 190) + 'px) rotate(380deg) scale(1)', offset: .45 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(730deg) scale(.79)' },
        ], { duration: 1050, easing: 'cubic-bezier(.3,.55,.55,1)' }).onfinish = () => {
          capImg.classList.remove('show');
          const c = putCap();
          if (c && c.animate) c.animate([{ transform: 'rotate(10deg) translateY(-6px) scale(1.15,.8)' }, { transform: 'rotate(10deg)' }], { duration: 220, easing: 'steps(3)' });
          curFile.classList.add('ping'); after(1300, () => curFile.classList.remove('ping'));
          fillBar(true);
        };
      });
      after(2100, () => { bubble.classList.remove('show'); pose('idle'); });
      after(2900, () => { this.done = true; looting = false; lastMove = performance.now() - 1000; req(); });
    },
  });
  if (trainCard && fx && counter) scenes.push({
    el: trainCard, done: false,
    when: (r, vh) => r.top < vh * .55 && r.bottom > vh * .4,
    finish() { this.done = true; nodes.forEach((n) => n.classList.add('got')); setCount(nodes.length); },
    play() {
      const gx = parseFloat(guy.style.left), gy = parseFloat(guy.style.top);
      const hx = gx + 32 + 74, hy = gy + 9 + 30;             /* his open hand */
      pose('reach');
      let got = 0;
      nodes.forEach((n, i) => after(250 + i * 420, () => {
        const p = docXY(n), cert = new Image();
        cert.src = 'images/climber/cert.png'; cert.className = 'fx-cert show'; cert.alt = '';
        const sx = p.x + p.w / 2 - 21.5, sy = p.y + p.h / 2 - 14.5;
        cert.style.left = sx + 'px'; cert.style.top = sy + 'px'; fx.appendChild(cert);
        n.classList.add('got');
        const dx = hx - 21.5 - sx, dy = hy - 14.5 - sy;
        const a = cert.animate([
          { transform: 'translate(0,0) scale(0)' },
          { transform: 'translate(0,-26px) scale(1.15)', offset: .22 },
          { transform: 'translate(0,-26px) scale(1)', offset: .32 },
          { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 120) + 'px) rotate(-14deg) scale(.9)', offset: .66 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-24deg) scale(.6)' },
        ], { duration: 900, easing: 'cubic-bezier(.3,.6,.5,1)' });
        a.onfinish = () => { cert.remove(); setCount(++got); };
      }));
      const end = 250 + (nodes.length - 1) * 420 + 920;
      after(end, () => pose('certs'));
      after(end + 1400, () => { this.done = true; looting = false; lastMove = performance.now() - 1000; req(); });
    },
  });
  /* Projects: when the visitor clicks Previous or Next, he points his remote and "presses" it for them */
  const projList = document.querySelector('.projects');
  const zap = fx && fx.querySelector('.fx-zap'), clickTag = fx && fx.querySelector('.fx-click');
  let remoteOn = false, remoteTimer = 0;
  if (projList && zap && !calm && guy.animate) projList.addEventListener('click', (e) => {
    const hit = e.target.closest('.proj-next, .proj-prev');
    if (!hit || !e.isTrusted) return;
    if (!lootReady() || state !== 'climb' || jumping || (looting && !remoteOn)) return;
    /* the slider has already switched; aim at the same button on the card now showing */
    const cur = [...projList.querySelectorAll(':scope > .featured')].find((x) => !x.hidden);
    const btn = (cur && cur.querySelector(hit.classList.contains('proj-next') ? '.proj-next' : '.proj-prev')) || hit;
    const gx = parseFloat(guy.style.left), gy = parseFloat(guy.style.top);
    const tipX = gx + 62, tipY = gy + 46;           /* front of the remote */
    const bb = docXY(btn), bx = bb.x + bb.w / 2, by = bb.y + bb.h / 2;
    remoteOn = true; looting = true; clearTimeout(remoteTimer);
    pose('press');
    zap.getAnimations().forEach((an) => an.cancel());
    zap.style.left = tipX + 'px'; zap.style.top = tipY + 'px'; zap.classList.add('show');
    const ang = Math.atan2(by - tipY, bx - tipX) * 180 / Math.PI;
    zap.animate([
      { transform: 'translate(0,0) rotate(' + ang + 'deg)' },
      { transform: 'translate(' + (bx - tipX) + 'px,' + (by - tipY) + 'px) rotate(' + ang + 'deg)' },
    ], { duration: 300, easing: 'steps(8)' }).onfinish = () => {
      zap.classList.remove('show');
      clickTag.style.left = (bx - 22) + 'px'; clickTag.style.top = (bb.y - 26) + 'px';
      clickTag.classList.remove('show'); void clickTag.offsetWidth; clickTag.classList.add('show');
    };
    setTimeout(() => { if (remoteOn) pose('remote'); }, 450);
    remoteTimer = setTimeout(() => { remoteOn = false; looting = false; lastMove = performance.now() - 1000; req(); }, 1300);
  });

  /* Contact: when the visitor picks Email, Call or Text he acts it out and points them to the send button.
     The first time Contact comes into view he does it once on his own for the method that is selected. */
  const ctCard = document.querySelector('.ct-main');
  const ctGo = ctCard && ctCard.querySelector('.ct-go');
  const plane = fx && fx.querySelector('.fx-plane'), say = fx && fx.querySelector('.fx-say');
  let ctOn = false, ctTimers = [];
  function ctAct(mode) {
    if (!ctGo || !plane) return false;
    if (!lootReady() || state !== 'climb' || jumping || (looting && !ctOn)) return false;
    ctTimers.forEach(clearTimeout); ctTimers = [];
    const later = (ms, fn) => ctTimers.push(setTimeout(fn, ms));
    ctOn = true; looting = true;
    plane.getAnimations().forEach((an) => an.cancel()); plane.classList.remove('show');
    const gx = parseFloat(guy.style.left), gy = parseFloat(guy.style.top);
    const g = docXY(ctGo), bx = g.x + g.w / 2, by = g.y + g.h / 2;
    const talk = (txt) => { say.textContent = txt; say.style.left = (gx + 70) + 'px'; say.style.top = (gy - 22) + 'px';
      say.classList.remove('show'); void say.offsetWidth; say.classList.add('show'); };
    const poke = (txt) => {
      clickTag.textContent = txt; clickTag.style.left = (bx - 22) + 'px'; clickTag.style.top = (g.y - 26) + 'px';
      clickTag.classList.remove('show'); void clickTag.offsetWidth; clickTag.classList.add('show');
      ctGo.classList.remove('ct-poked'); void ctGo.offsetWidth; ctGo.classList.add('ct-poked');
    };
    let done = 1500;
    if (mode === 'email') {
      pose('plane'); say.classList.remove('show');
      const sx = gx + 49, sy = gy + 45;
      plane.style.left = (sx - 24) + 'px'; plane.style.top = (sy - 15) + 'px'; plane.classList.add('show');
      const dx = bx - sx, dy = by - sy;
      plane.animate([
        { transform: 'translate(0,0) rotate(-10deg) scale(.7)' },
        { transform: 'translate(' + dx * .45 + 'px,' + (Math.min(0, dy) * .45 - 110) + 'px) rotate(8deg) scale(1)', offset: .5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(28deg) scale(.8)' },
      ], { duration: 950, easing: 'cubic-bezier(.35,.4,.55,1)' }).onfinish = () => { plane.classList.remove('show'); poke('SENT!'); };
      later(1050, () => talk('Check your inbox! ✉️'));
      done = 2300;
    } else if (mode === 'call') {
      pose('calling'); talk('Ring ring! 📞');
      later(700, () => poke('CALL!'));
      later(1500, () => talk('Hello? 👋'));
      done = 2400;
    } else {
      pose('texting'); talk('.');
      ['..', '...', '.', '..', '...'].forEach((t, i) => later(200 + i * 200, () => { say.textContent = t; }));
      later(1250, () => { talk('Text me! 💬'); poke('TEXT!'); });
      done = 2300;
    }
    later(done, () => { say.classList.remove('show'); clickTag.textContent = 'CLICK!'; ctOn = false; looting = false; lastMove = performance.now() - 1000; req(); });
    return true;
  }
  if (ctCard && !calm && guy.animate) {
    ctCard.addEventListener('click', (e) => {
      const b = e.target.closest('.ct-seg button[data-m]');
      if (b && e.isTrusted) ctAct(b.dataset.m);
    });
    scenes.push({
      el: ctCard, done: false,
      when: (r, vh) => r.top < vh * .5 && r.bottom > vh * .55,
      finish() { this.done = true; },
      play() {
        const sel = ctCard.querySelector('.ct-seg button[aria-checked="true"]');
        looting = false;                           /* ctAct takes the lock itself */
        if (!ctAct(sel ? sel.dataset.m : 'email')) { looting = false; }
        this.done = true;
      },
    });
  }

  if (calm || !guy.animate) scenes.forEach((sc) => sc.finish());
  if ('IntersectionObserver' in window) scenes.forEach((sc) => {
    new IntersectionObserver((en) => {
      if (!en[0].isIntersecting || sc.done) return;
      if (!lootReady()) sc.finish();
      else {                                     /* safety net if he never gets there */
        const net = () => { if (sc.done || sc.playing) return; if (looting) { setTimeout(net, 1500); return; } sc.finish(); };
        setTimeout(net, 6000);
      }
    }, { threshold: .35 }).observe(sc.el);
  });
  wide.addEventListener && wide.addEventListener('change', () => { if (!lootReady()) scenes.forEach((sc) => { if (!sc.playing && !sc.done) sc.finish(); }); });
  function sceneTime() {
    if (looting || state !== 'climb' || !lootReady()) return null;
    const vh = window.innerHeight;
    return scenes.find((sc) => !sc.done && !sc.playing && sc.when(sc.el.getBoundingClientRect(), vh)) || null;
  }

  function update() {
    raf = 0;
    if (!wide.matches || jumping) return;
    const now = performance.now();
    const wantClimb = window.scrollY + window.innerHeight * 0.45 > top + 40;
    if (wantClimb && state === 'stand') {
      state = 'climb';
      jump(standPos(), climbPos(), 'right', () => {
        guy.dataset.state = 'climb'; const c = climbPos(); curY = c.y; place(c);
        pose('land'); landUntil = performance.now() + 450; setTimeout(req, 470);
      });
      return;
    }
    if (!wantClimb && state === 'climb') {
      state = 'stand';
      jump(climbPos(), standPos(), 'left', () => { guy.dataset.state = 'stand'; place(standPos()); });
      return;
    }
    if (state !== 'climb') { guy.dataset.state = 'stand'; place(standPos()); curY = null; return; }

    guy.dataset.state = 'climb';
    if (looting) return;
    const p = climbPos();
    if (curY !== null && Math.abs(p.y - curY) < 24 && lootTime()) { playLoot(); return; }
    if (curY !== null && Math.abs(p.y - curY) < 24) {
      const sc = sceneTime();
      if (sc) { looting = true; sc.playing = true; sc.play(); return; }
    }
    guy.style.left = p.x + 'px';
    if (curY === null) curY = p.y;
    const before = curY;
    curY += (p.y - curY) * (calm ? 1 : 0.12);           /* glide after the scroll */
    if (Math.abs(p.y - curY) < 0.4) curY = p.y;
    guy.style.top = curY.toFixed(2) + 'px';
    const moving = Math.abs(curY - before) > 0.15;
    if (moving) { lastMove = now; bottomSince = 0; toGround(false); }

    if (now < landUntil) { pose('land'); }
    else if (curY >= bottom - CLIMB_H - 0.5 && !moving) {
      if (!bottomSince) bottomSince = now;
      if (now - bottomSince > 650) { toGround(true); } else { pose('bottom'); toGround(false); setTimeout(req, 680); }
    }
    else if (moving || now - lastMove < 450) {
      /* one pose per rung passed, so his hands keep pace with the scroll (reverses when scrolling up) */
      pose(CYCLE[((Math.floor((curY - top) / STEP) % 4) + 4) % 4]);
    } else {
      /* resting: turn and look at the page, now and then reach for the next rung */
      pose(Math.floor((now - lastMove) / 2200) % 2 ? 'idle2' : 'idle');
    }

    if (curY !== p.y || now < landUntil) req();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(req, now - lastMove < 450 ? 470 : 2210);
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };

  layout(); update();
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', () => { layout(); req(); });
  window.addEventListener('load', () => { layout(); req(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); req(); }).observe(document.body);
})();
