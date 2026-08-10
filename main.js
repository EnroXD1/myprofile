const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeColor = document.querySelector('meta[name="theme-color"]');

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

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.forEach((item) => item.classList.toggle('active', item.hash === link.hash));
    });
});

const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
        const isActive = link.hash === `#${visible.target.id}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: [0, 0.2, 0.6]
});

sections.forEach((section) => sectionObserver.observe(section));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

document.getElementById('year').textContent = new Date().getFullYear();
