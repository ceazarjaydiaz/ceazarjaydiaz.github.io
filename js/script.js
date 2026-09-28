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
        dialog.dataset.variant = button.dataset.project;
        dialog.querySelector('[data-dialog-title]').textContent = button.dataset.title;
        dialog.querySelector('[data-dialog-visual]').textContent = button.dataset.title;
        dialog.querySelector('[data-dialog-description]').textContent = button.dataset.description;
        dialog.querySelector('[data-dialog-outcome]').textContent = button.dataset.outcome;
        dialog.querySelector('[data-dialog-stack]').textContent = button.dataset.stack;
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
