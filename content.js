const interestTones = new Set(['orange', 'plum', 'olive', 'blue', 'pink', 'gold']);
const projectTones = new Set(['ai', 'django', 'profile']);

function createContentElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
}

function setContentText(selector, value) {
    const element = document.querySelector(selector);
    if (element && typeof value === 'string') element.textContent = value;
}

function safeExternalUrl(value, fallback = '#') {
    try {
        const url = new URL(value);
        if (url.protocol === 'https:' || url.protocol === 'mailto:') return url.href;
    } catch (error) {
        // Некорректная ссылка не должна ломать страницу.
    }
    return fallback;
}

function materialIcon(name, className = 'material-symbols-rounded') {
    const icon = createContentElement('span', className, name || 'circle');
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}

function renderFocusChips(chips) {
    if (!Array.isArray(chips)) return;
    const container = document.querySelector('.hero > .chip-row');
    if (!container) return;
    container.replaceChildren(...chips.map((chip) => createContentElement('span', 'chip', chip)));
}

function renderAboutParagraphs(paragraphs) {
    if (!Array.isArray(paragraphs)) return;
    const container = document.querySelector('.about-card > div:last-child');
    if (!container) return;
    container.querySelectorAll(':scope > p:not(.eyebrow)').forEach((paragraph) => paragraph.remove());
    paragraphs.forEach((paragraph) => container.append(createContentElement('p', '', paragraph)));
}

function renderSkills(skills) {
    if (!Array.isArray(skills)) return;
    const container = document.querySelector('.skill-list');
    if (!container) return;

    const elements = skills.map((skill) => {
        const item = createContentElement('span', 'skill');
        item.append(materialIcon(skill.icon), document.createTextNode(String(skill.label || 'Навык')));
        return item;
    });
    container.replaceChildren(...elements);
}

function renderInterests(interests) {
    if (!Array.isArray(interests)) return;
    const container = document.querySelector('#interests .card-grid');
    if (!container) return;

    const cards = interests.map((interest) => {
        const tone = interestTones.has(interest.tone) ? interest.tone : 'pink';
        const card = createContentElement('article', `interest-card surface card-${tone}`);
        const topLine = createContentElement('div', 'card-topline');
        topLine.append(
            materialIcon(interest.icon, 'card-icon material-symbols-rounded'),
            createContentElement('span', 'chip chip-small', interest.badge || 'Интерес')
        );
        card.append(
            topLine,
            createContentElement('h3', '', interest.title || 'Без названия'),
            createContentElement('p', '', interest.description || '')
        );
        return card;
    });
    container.replaceChildren(...cards);
}

function renderProjects(projects) {
    if (!Array.isArray(projects)) return;
    const container = document.querySelector('#projects .project-grid');
    if (!container) return;

    const cards = projects.map((project) => {
        const tone = projectTones.has(project.tone) ? project.tone : 'profile';
        const card = createContentElement('article', `project-card surface project-${tone}`);
        const head = createContentElement('div', 'project-card-head');
        head.append(
            materialIcon(project.icon, 'project-icon material-symbols-rounded'),
            createContentElement('span', 'chip chip-small', project.status || 'Проект')
        );

        const tags = createContentElement('div', 'project-tags');
        tags.setAttribute('aria-label', 'Технологии проекта');
        (Array.isArray(project.tags) ? project.tags : []).forEach((tag) => {
            tags.append(createContentElement('span', '', tag));
        });

        const link = createContentElement('a', 'project-link');
        link.href = safeExternalUrl(project.url);
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.append(
            document.createTextNode(String(project.link_label || 'Открыть проект')),
            materialIcon('north_east')
        );

        card.append(
            head,
            createContentElement('p', 'eyebrow', project.eyebrow || ''),
            createContentElement('h3', '', project.title || 'Без названия'),
            createContentElement('p', '', project.description || ''),
            tags,
            link
        );
        return card;
    });
    container.replaceChildren(...cards);
}

function renderSocials(socials) {
    if (!Array.isArray(socials)) return;
    const container = document.querySelector('.social-links');
    if (!container) return;

    const links = socials.map((social) => {
        const link = createContentElement('a');
        link.href = safeExternalUrl(social.url);
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.append(
            createContentElement('span', '', social.label || 'Ссылка'),
            materialIcon('north_east')
        );
        return link;
    });
    container.replaceChildren(...links);
}

function updateStructuredData(data) {
    const schemaElement = document.querySelector('script[type="application/ld+json"]');
    if (!schemaElement) return;

    try {
        const schema = JSON.parse(schemaElement.textContent);
        if (data.identity?.display_name) schema.mainEntity.name = data.identity.display_name;
        if (data.identity?.description) schema.mainEntity.description = data.identity.description;
        if (Array.isArray(data.socials)) {
            schema.mainEntity.sameAs = data.socials
                .map((social) => safeExternalUrl(social.url, ''))
                .filter(Boolean);
        }
        schemaElement.textContent = JSON.stringify(schema);
    } catch (error) {
        // Валидная резервная JSON-LD разметка уже находится в HTML.
    }
}

function renderSiteContent(data) {
    const identity = data.identity || {};
    const contact = data.contact || {};
    const socialHeading = data.social_heading || {};

    setContentText('.brand-refresh > span:last-child', identity.display_name);
    setContentText('#hero-title', identity.display_name);
    setContentText('.hero-copy > .eyebrow', identity.hero_eyebrow);
    setContentText('.hero-tagline', identity.tagline);
    setContentText('.hero-description', identity.description);
    setContentText('.about-card .eyebrow', identity.about_eyebrow);
    setContentText('.about-card h3', identity.about_heading);
    setContentText('.footer-brand strong', identity.display_name);
    setContentText('.footer-brand p', identity.footer_tagline);
    setContentText('#footer-owner', identity.display_name);
    if (identity.display_name) {
        document.title = `${identity.display_name} — персональный сайт`;
        document.querySelector('.brand-refresh')?.setAttribute('aria-label', `${identity.display_name} — обновить страницу`);
    }
    renderAboutParagraphs(identity.about_paragraphs);

    renderFocusChips(data.focus_chips);
    renderSkills(data.skills);
    renderInterests(data.interests);
    setContentText('#projects .section-intro', data.projects_intro);
    renderProjects(data.projects);

    const contactCard = document.querySelector('.contact-feature');
    if (contactCard) contactCard.href = safeExternalUrl(contact.url, contactCard.href);
    const heroContact = document.querySelector('.hero-actions .button-tonal');
    if (heroContact) heroContact.href = safeExternalUrl(contact.url, heroContact.href);
    setContentText('.contact-feature .eyebrow', contact.eyebrow);
    setContentText('.contact-feature h3', contact.title);
    setContentText('.contact-feature p', contact.description);
    setContentText('.contact-feature strong', contact.handle);

    setContentText('.social-card .eyebrow', socialHeading.eyebrow);
    setContentText('.social-card h3', socialHeading.title);
    renderSocials(data.socials);
    updateStructuredData(data);
}

window.siteContentReady = fetch('content/site.json', { cache: 'no-store' })
    .then((response) => {
        if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
        return response.json();
    })
    .then((data) => {
        renderSiteContent(data);
        window.dispatchEvent(new CustomEvent('sitecontentready'));
        return data;
    })
    .catch((error) => {
        console.warn('Используется резервное содержимое из HTML.', error);
        window.dispatchEvent(new CustomEvent('sitecontentready'));
        return null;
    });
