const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const dialog = document.querySelector('[data-project-dialog]');
const contactForm = document.querySelector('[data-contact-form]');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('span').textContent = '＋';
    nav.classList.remove('open');
}

function updateHeader() { header.classList.toggle('scrolled', scrollY > 24); }

menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('span').textContent = open ? '−' : '＋';
    nav.classList.toggle('open', open);
});

nav.addEventListener('click', closeMenu);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
} else {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}

document.querySelectorAll('[data-project]').forEach((button) => {
    button.addEventListener('click', () => {
        const populateList = (selector, values) => {
            const list = dialog.querySelector(selector);
            list.replaceChildren(...values.split('|').map((value) => {
                const item = document.createElement('li');
                item.textContent = value;
                return item;
            }));
        };

        const diagram = dialog.querySelector('[data-dialog-diagram]');
        const layers = button.dataset.diagram.split('|').map((layer) => {
            const [title, items] = layer.split('::');
            const group = document.createElement('section');
            const label = document.createElement('h3');
            const nodes = document.createElement('div');
            label.textContent = title;
            nodes.className = 'diagram-nodes';
            items.split(',').forEach((name) => {
                const node = document.createElement('span');
                node.textContent = name;
                nodes.append(node);
            });
            group.className = 'diagram-layer';
            group.append(label, nodes);
            return group;
        });

        dialog.dataset.variant = button.dataset.project;
        dialog.querySelector('[data-dialog-title]').textContent = button.dataset.title;
        diagram.replaceChildren(...layers);
        diagram.setAttribute('aria-label', `Generalized architecture diagram for ${button.dataset.title}`);
        dialog.querySelector('[data-dialog-description]').textContent = button.dataset.description;
        dialog.querySelector('[data-dialog-type]').textContent = button.dataset.type;
        dialog.querySelector('[data-dialog-outcome]').textContent = button.dataset.outcome;
        dialog.querySelector('[data-dialog-stack]').textContent = button.dataset.stack;
        dialog.querySelector('[data-dialog-discuss]').textContent = button.dataset.discuss;
        dialog.querySelector('[data-dialog-boundary]').textContent = button.dataset.boundary;
        populateList('[data-dialog-steps]', button.dataset.steps);
        populateList('[data-dialog-proof]', button.dataset.proof);
        dialog.showModal();
    });
});

dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const interest = formData.get('interest');
    const subject = formData.get('subject').trim();
    const message = formData.get('message').trim();
    const body = [
        'Hello Ceazar,',
        '',
        message,
        '',
        '--- Project brief ---',
        `Name: ${name}`,
        `Email: ${email}`,
        `Project type: ${interest}`,
        '',
        'Sent from ceazarjaydiaz.github.io'
    ].join('\n');
    const mailto = `mailto:ceazarjaydiaz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    contactForm.querySelector('[data-form-status]').textContent = 'Opening your email app with the project brief…';
    window.location.href = mailto;
});
