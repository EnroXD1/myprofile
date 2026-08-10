const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageLoader = document.querySelector('.page-loader');
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeColor = document.querySelector('meta[name="theme-color"]');

function hidePageLoader() {
    if (!pageLoader || pageLoader.classList.contains('is-hidden')) return;

    const minimumDisplayTime = prefersReducedMotion ? 80 : 650;
    const remainingTime = Math.max(0, minimumDisplayTime - performance.now());

    window.setTimeout(() => {
        pageLoader.classList.add('is-hidden');
        pageLoader.setAttribute('aria-hidden', 'true');
    }, remainingTime);
}

if (document.readyState === 'complete') hidePageLoader();
else window.addEventListener('load', hidePageLoader, { once: true });

function applyTheme(theme, persist = true) {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    themeIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeColor.setAttribute('content', isDark ? '#19120f' : '#fff8f5');

    if (persist) {
        try {
            localStorage.setItem('enroxd-theme', root.dataset.theme);
        } catch (error) {
            // Сайт продолжит работать, даже если хранилище браузера недоступно.
        }
    }
}

applyTheme(root.dataset.theme, false);
themeButton.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const sectionLinks = [...document.querySelectorAll('a[href^="#"]')].filter((link) => {
    const target = document.getElementById(link.hash.slice(1));
    return target?.matches('section[id]');
});
let navigationLock = null;
let navigationReleaseTimer = 0;
let scrollTicking = false;

function setActiveSection(sectionId) {
    navLinks.forEach((link) => {
        const isActive = link.hash === `#${sectionId}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function getCurrentSectionId() {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        return sections.at(-1)?.id || 'home';
    }

    const marker = window.scrollY + Math.min(window.innerHeight * 0.32, 240);
    let current = sections[0]?.id || 'home';

    sections.forEach((section) => {
        if (section.offsetTop <= marker) current = section.id;
    });

    return current;
}

function releaseNavigationLock() {
    if (!navigationLock) return;
    const selectedSection = navigationLock;
    navigationLock = null;
    window.clearTimeout(navigationReleaseTimer);
    setActiveSection(selectedSection);
}

function scrollToSection(target, sectionId) {
    navigationLock = sectionId;
    setActiveSection(sectionId);

    const topbar = document.querySelector('.topbar');
    const topbarOffset = (topbar?.offsetHeight || 72) + (window.innerWidth <= 620 ? 28 : 44);
    const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - topbarOffset);

    window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    window.clearTimeout(navigationReleaseTimer);
    navigationReleaseTimer = window.setTimeout(releaseNavigationLock, prefersReducedMotion ? 50 : 1200);
}

sectionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const sectionId = link.hash.slice(1);
        const target = document.getElementById(sectionId);
        if (!target) return;

        event.preventDefault();
        if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
        scrollToSection(target, sectionId);
    });
});

window.addEventListener('scroll', () => {
    if (navigationLock || scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
        setActiveSection(getCurrentSectionId());
        scrollTicking = false;
    });
}, { passive: true });

if ('onscrollend' in window) {
    window.addEventListener('scrollend', releaseNavigationLock, { passive: true });
}

window.addEventListener('popstate', () => {
    const sectionId = window.location.hash.slice(1) || 'home';
    const target = document.getElementById(sectionId);
    if (target) scrollToSection(target, sectionId);
});

setActiveSection(getCurrentSectionId());

if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}

const rippleTargets = document.querySelectorAll([
    '.button',
    '.nav-link',
    '.theme-toggle',
    '.brand',
    '.skill',
    '.interest-card',
    '.contact-feature',
    '.social-links a'
].join(','));

rippleTargets.forEach((element) => {
    element.classList.add('md-ripple-surface');
    element.addEventListener('pointerdown', (event) => {
        if (prefersReducedMotion || event.button !== 0) return;

        const bounds = element.getBoundingClientRect();
        const size = Math.max(bounds.width, bounds.height) * 1.7;
        const ripple = document.createElement('span');
        ripple.className = 'md-ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - bounds.left - size / 2}px`;
        ripple.style.top = `${event.clientY - bounds.top - size / 2}px`;
        element.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
});

const bubblePositions = [
    [{ x: '82%', y: '35%' }, { x: '90%', y: '48%' }, { x: '78%', y: '28%' }],
    [{ x: '92%', y: '68%' }, { x: '84%', y: '76%' }, { x: '94%', y: '57%' }],
    [{ x: '74%', y: '83%' }, { x: '69%', y: '69%' }, { x: '80%', y: '88%' }]
];

document.querySelectorAll('.material-bubble').forEach((bubble, bubbleIndex) => {
    let positionIndex = 0;

    bubble.addEventListener('click', () => {
        if (bubble.classList.contains('is-popping') || bubble.classList.contains('is-waiting')) return;

        bubble.classList.add('is-popping');
        bubble.disabled = true;

        window.setTimeout(() => {
            bubble.classList.remove('is-popping');
            bubble.classList.add('is-waiting');
        }, prefersReducedMotion ? 80 : 380);

        window.setTimeout(() => {
            positionIndex = (positionIndex + 1) % bubblePositions[bubbleIndex].length;
            const nextPosition = bubblePositions[bubbleIndex][positionIndex];
            bubble.style.setProperty('--bubble-x', nextPosition.x);
            bubble.style.setProperty('--bubble-y', nextPosition.y);
            bubble.classList.remove('is-waiting');
            bubble.classList.add('is-returning');
            bubble.disabled = false;

            window.setTimeout(() => bubble.classList.remove('is-returning'), prefersReducedMotion ? 80 : 460);
        }, prefersReducedMotion ? 320 : 1500);
    });
});

document.getElementById('year').textContent = new Date().getFullYear();
