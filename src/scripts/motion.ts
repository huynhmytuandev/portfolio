// Client-side behaviour for the TuanOS portfolio. Everything here is a
// progressive enhancement: the page is complete without it.
import { tenureLabel, type YearMonth } from '../lib/time.ts';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel as string) as T | null;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel as string)) as T[];
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const fineQuery = matchMedia('(hover: hover) and (pointer: fine)');
const desktopQuery = matchMedia('(min-width: 1024px)');
const mdQuery = matchMedia('(min-width: 768px)');
let reduced = reducedQuery.matches;

/* ------------------------------------------------------------------ banner */
const banner = $('[data-banner]');
const bannerText = $('[data-banner-text]');
const bannerLive = $('[data-banner-live]');
let bannerTimer: number | undefined;

function showBanner(text: string) {
  if (!banner || !bannerText || !bannerLive) return;
  bannerText.textContent = text;
  banner.dataset.show = 'true';
  bannerLive.textContent = '';
  // Re-set on the next frame so repeated messages are announced again.
  requestAnimationFrame(() => (bannerLive.textContent = text));
  clearTimeout(bannerTimer);
  bannerTimer = window.setTimeout(() => (banner.dataset.show = 'false'), 2500);
}

/* ---------------------------------------------------------- scroll effects */
const lock = $('[data-lock]');
const cue = $('[data-scroll-cue]');
const timeline = $('[data-timeline]');
const tlDots = timeline ? $$('[data-tl-dot]', timeline) : [];
const feli = $('.feli');

let tlGeom = { top: 0, height: 0, dots: [] as number[] };

// Layout offsets (not getBoundingClientRect) so in-flight entrance
// transforms on the rows can't skew the measurement.
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function measureTimeline() {
  if (!timeline || tlDots.length < 2) return;
  const centers = tlDots.map((d) => {
    const o = offsetWithin(d, timeline);
    return { x: o.x + d.offsetWidth / 2, y: o.y + d.offsetHeight / 2 };
  });
  const top = centers[0].y;
  const height = centers[centers.length - 1].y - top;
  tlGeom = { top, height, dots: centers.map((c) => c.y - top) };
  timeline.style.setProperty('--rail-x', `${centers[0].x - 1}px`);
  timeline.style.setProperty('--fill-top', `${top}px`);
  timeline.style.setProperty('--fill-h', `${height}px`);
}

let ticking = false;
function onFrame() {
  ticking = false;
  const vh = innerHeight;
  const y = scrollY;

  updateIsland(y);

  if (lock) {
    const progress = clamp(y / Math.max(1, lock.offsetHeight));
    lock.style.setProperty('--unlock', reduced ? '0' : progress.toFixed(4));
    cue?.setAttribute('data-hidden', String(progress > 0.1));
  }

  if (timeline && tlGeom.height > 0) {
    const r = timeline.getBoundingClientRect();
    // The line reaches each point as it passes 60% of the viewport height.
    const reached = reduced ? tlGeom.height : vh * 0.6 - (r.top + tlGeom.top);
    const fill = clamp(reached / tlGeom.height);
    timeline.style.setProperty('--fill', fill.toFixed(4));
    tlDots.forEach((d, i) => d.classList.toggle('is-lit', reduced || reached >= tlGeom.dots[i] - 1));
  }

  if (feli && desktopQuery.matches && !reduced) {
    const r = feli.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh + r.height));
    feli.style.setProperty('--par', ((0.5 - p) * 2).toFixed(4));
  } else feli?.style.setProperty('--par', '0');
}

function requestFrame() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onFrame);
  }
}

addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => {
  measureTimeline();
  measureIsland();
  measureBar();
  requestFrame();
});
reducedQuery.addEventListener('change', (e) => {
  reduced = e.matches;
  requestFrame();
});
document.fonts?.ready.then(() => {
  measureTimeline();
  measureIsland();
  measureBar();
  requestFrame();
});

/* ------------------------------------------------- anchors move the focus */
function focusTarget(hash: string) {
  const id = decodeURIComponent(hash.slice(1));
  const target = id === 'top' ? $('#intro') : document.getElementById(id);
  if (!target) return;
  const focusable =
    target.matches('[tabindex]') ? target : (target.querySelector<HTMLElement>('h2[tabindex="-1"]') ?? target);
  focusable.focus({ preventScroll: true });
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.hash.length < 2) return;
  closeIslandMenu(false);
  // Let the browser perform the (smooth or instant) scroll, then move focus.
  requestAnimationFrame(() => focusTarget(a.hash));
});

/* ------------------------------------------------------- dynamic island */
// Collapsed: a pill with the current section. Desktop expands on hover /
// focus (or tap on touch tablets) into the section links; mobile taps open
// a menu card. Widths are measured so the pill can spring between sizes.
const islandWrap = $('[data-island]');
const island = islandWrap ? $('.island', islandWrap) : null;
const islandHead = $<HTMLButtonElement>('[data-island-toggle]');
const islandLabel = $('[data-island-label]');
const islandNav = $('[data-island-nav]');
const islandMenu = $('#island-menu');
const islandLinks = $$<HTMLAnchorElement>('[data-island-link]');
const sectionNames: Record<string, string> = { glance: 'Home', work: 'Work', experience: 'Experience', about: 'About' };
let activeSection = 'glance';

function measureIsland() {
  if (!island || !islandHead || !islandLabel) return;
  const track = islandLabel.parentElement!;
  const labelW = islandLabel.scrollWidth;
  // Head width without the (possibly mid-transition) label track, plus the new label.
  // +2 for the island's 1px border (border-box sizing).
  const collapsed = islandHead.offsetWidth - track.offsetWidth + labelW + 2;
  track.style.setProperty('--w', `${labelW}px`);
  island.style.setProperty('--cw', `${collapsed}px`);
  if (islandNav) {
    island.style.setProperty('--ew', `${islandNav.scrollWidth + 2}px`);
    const current = islandNav.querySelector<HTMLElement>('[aria-current="true"]');
    if (current) {
      islandNav.style.setProperty('--hl-x', `${current.offsetLeft}px`);
      islandNav.style.setProperty('--hl-w', `${current.offsetWidth}px`);
    }
  }
}

function setActiveSection(id: string) {
  if (!sectionNames[id] || id === activeSection) return;
  activeSection = id;
  for (const link of islandLinks) {
    if (link.dataset.islandLink === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  if (islandLabel) {
    islandLabel.textContent = sectionNames[id];
    if (!reduced && islandLabel.offsetParent !== null) {
      islandLabel.animate(
        [
          { transform: 'translateY(90%)', opacity: 0, filter: 'blur(4px)' },
          { transform: 'none', opacity: 1, filter: 'none' },
        ],
        { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  }
  measureIsland();
}

function isOpen() {
  return island?.dataset.open === 'true';
}

function openIsland() {
  if (!island || !islandHead) return;
  island.dataset.open = 'true';
  if (islandWrap) islandWrap.dataset.open = 'true';
  islandHead.setAttribute('aria-expanded', 'true');
  if (islandMenu) islandMenu.inert = false;
}

function closeIslandMenu(returnFocus: boolean) {
  if (!island || !islandHead || !isOpen()) return;
  island.dataset.open = 'false';
  if (islandWrap) islandWrap.dataset.open = 'false';
  islandHead.setAttribute('aria-expanded', 'false');
  if (islandMenu) islandMenu.inert = true;
  if (returnFocus) islandHead.focus();
}

// "bar": desktop top-of-page look that mirrors the Lock Screen nav pill
// (hidden on mobile). "island": the compact Dynamic Island.
const heroNav = $('[data-hero-nav]');
const islandBar = $('[data-island-bar]');
const statusBar = $('[data-statusbar]');
const ISLAND_TOP = 12;
let islandMode: 'bar' | 'island' = 'bar';
let barTop = 20;

function measureBar() {
  if (!island || !heroNav || !mdQuery.matches) return;
  const pill = heroNav.firstElementChild as HTMLElement | null;
  if (!pill) return;
  const r = pill.getBoundingClientRect();
  barTop = r.top + scrollY;
  island.style.setProperty('--bw', `${pill.offsetWidth}px`);
  island.style.setProperty('--bh', `${pill.offsetHeight}px`);
}

function setIslandMode(mode: 'bar' | 'island') {
  if (!islandWrap || mode === islandMode) return;
  islandMode = mode;
  islandWrap.dataset.mode = mode;
  const bar = mode === 'bar';
  if (islandBar) islandBar.inert = !bar;
  if (islandHead) islandHead.inert = bar;
  if (islandNav) islandNav.inert = bar;
  if (bar) closeIslandMenu(false);
  else measureIsland();
}

// Called every scroll frame: on desktop the bar rides with the page until it
// reaches the island position, then morphs; on mobile the island grows in
// once the status bar has scrolled away.
function updateIsland(y: number) {
  if (!islandWrap) return;
  if (mdQuery.matches) {
    islandWrap.style.setProperty('--y', `${Math.max(ISLAND_TOP, barTop - y)}px`);
    setIslandMode(y > 40 ? 'island' : 'bar');
    islandWrap.inert = false;
  } else {
    islandWrap.style.setProperty('--y', `${ISLAND_TOP}px`);
    const statusBottom = statusBar ? statusBar.offsetTop + statusBar.offsetHeight : 60;
    setIslandMode(y > statusBottom ? 'island' : 'bar');
    islandWrap.inert = islandMode === 'bar';
  }
}

islandHead?.addEventListener('click', () => (isOpen() ? closeIslandMenu(false) : openIsland()));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen()) closeIslandMenu(true);
});
document.addEventListener('pointerdown', (e) => {
  if (islandWrap && !islandWrap.contains(e.target as Node)) closeIslandMenu(false);
});

const spy = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
  },
  { rootMargin: '-50% 0px -50% 0px' },
);
for (const id of Object.keys(sectionNames)) {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
}
// Initialise aria-current for the default section.
activeSection = '';
setActiveSection('glance');

/* ------------------------------------------------------ app-launch pops */
const pops = $$('.pop');
const popObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      el.classList.add('is-in');
      popObserver.unobserve(el);
      // Drop the stagger delay once the entrance has played.
      const delay = parseFloat(getComputedStyle(el).getPropertyValue('--i') || '0') * 60;
      setTimeout(() => el.classList.add('is-done'), 900 + delay);
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
);
for (const el of pops) popObserver.observe(el);

/* ------------------------------------------------- hover tilt & spotlight */
document.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !fineQuery.matches || reduced) return;
  const target = e.target as Element;
  const tile = target.closest<HTMLElement>('[data-tile]');
  if (tile) {
    const r = tile.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tile.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`);
    tile.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
  }
  const card = target.closest<HTMLElement>('[data-spotlight]');
  if (card) {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
});
for (const tile of $$('[data-tile]')) {
  tile.addEventListener('pointerleave', () => {
    tile.style.removeProperty('--rx');
    tile.style.removeProperty('--ry');
  });
}

/* ------------------------------------------------ stack jiggle easter egg */
const stack = $('[data-stack]');
const stackDone = $<HTMLButtonElement>('[data-stack-done]');
const tiles = $$<HTMLButtonElement>('[data-tile]');
let editTimer: number | undefined;
let pressTimer: number | undefined;
let pressStart: { x: number; y: number } | null = null;
let lastPointerType = '';

function enterEditMode(fromKeyboard: boolean) {
  if (!stack || !stackDone) return;
  stack.dataset.editing = 'true';
  stackDone.classList.remove('hidden');
  if (fromKeyboard) stackDone.focus();
  clearTimeout(editTimer);
  editTimer = window.setTimeout(() => exitEditMode(), 6000);
}

function exitEditMode() {
  if (!stack || !stackDone || stack.dataset.editing !== 'true') return;
  const hadFocus = document.activeElement === stackDone;
  stack.dataset.editing = 'false';
  stackDone.classList.add('hidden');
  clearTimeout(editTimer);
  if (hadFocus) tiles[0]?.focus();
}

function cancelPress() {
  clearTimeout(pressTimer);
  pressStart = null;
}

for (const tile of tiles) {
  tile.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pressStart = { x: e.clientX, y: e.clientY };
    clearTimeout(pressTimer);
    pressTimer = window.setTimeout(() => {
      pressStart = null;
      enterEditMode(false);
    }, 500);
  });
  tile.addEventListener('pointermove', (e) => {
    if (pressStart && Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 8) cancelPress();
  });
  tile.addEventListener('pointerup', cancelPress);
  tile.addEventListener('pointercancel', cancelPress);
  tile.addEventListener('pointerleave', cancelPress);
  tile.addEventListener('dblclick', () => enterEditMode(false));
  // `detail === 0` means the click came from the keyboard (Enter / Space).
  tile.addEventListener('click', (e) => {
    if (e.detail === 0) enterEditMode(true);
  });
  tile.addEventListener('contextmenu', (e) => {
    if (lastPointerType === 'touch') e.preventDefault();
  });
}
stackDone?.addEventListener('click', exitEditMode);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') exitEditMode();
});
document.addEventListener('pointerdown', (e) => {
  if (stack && !stack.contains(e.target as Node)) exitEditMode();
});

/* -------------------------------------------------- FeliCash carousel */
const carousel = $('[data-carousel]');
const slides = carousel ? $$('[data-slide]', carousel) : [];
const dots = $$<HTMLButtonElement>('[data-dot]');

if (carousel && slides.length) {
  const setDot = (index: number) =>
    dots.forEach((d, i) => (i === index ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  const slideObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setDot(slides.indexOf(entry.target as HTMLElement));
    },
    { root: carousel, threshold: 0.6 },
  );
  slides.forEach((s) => slideObserver.observe(s));
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      const s = slides[i];
      carousel.scrollTo({
        left: s.offsetLeft - (carousel.clientWidth - s.offsetWidth) / 2,
        behavior: reduced ? 'auto' : 'smooth',
      });
    }),
  );
}

/* ------------------------------------------------------- live details */
function countUp(el: HTMLElement, from: number, to: number, duration: number, format: (n: number) => string) {
  if (reduced) {
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = clamp((now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const nf = new Intl.NumberFormat('en-US');
const countObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      countObserver.unobserve(el);
      if (el.dataset.countTo) {
        const to = Number(el.dataset.countTo);
        const suffix = el.dataset.suffix ?? '';
        countUp(el, 0, to, 1200, (n) => nf.format(n) + suffix);
      }
    }
  },
  { threshold: 0.6 },
);

for (const el of $$('[data-count-to]')) countObserver.observe(el);

// Current job tenure stays right between rebuilds.
for (const el of $$('[data-tenure]')) el.textContent = tenureLabel(el.dataset.tenure as YearMonth);

/* -------------------------------------------------------- copy email */
for (const el of $$<HTMLAnchorElement>('[data-copy-email]')) {
  el.addEventListener('click', async (e) => {
    if (!navigator.clipboard || !window.isSecureContext) return; // fall back to mailto
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(el.dataset.copyEmail ?? '');
      showBanner('Email copied');
    } catch {
      location.href = el.href;
    }
  });
}

/* --------------------------------------------------------------- init */
measureTimeline();
measureIsland();
measureBar();
onFrame();
