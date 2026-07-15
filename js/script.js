const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const dialog = document.querySelector('[data-lightbox-dialog]');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
}

function updateHeader() {
    header.classList.toggle('scrolled', scrollY > 24);
}

menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', open);
    nav.classList.toggle('open', open);
});

nav.addEventListener('click', closeMenu);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
}

document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
        const project = button.closest('.case-study');
        const copy = project.querySelector('.case-copy');
        const details = copy.querySelectorAll('dd');

        dialog.querySelector('img').src = button.dataset.lightbox;
        dialog.querySelector('img').alt = `Original project evidence for ${copy.querySelector('h3').textContent}`;
        dialog.querySelector('h2').textContent = copy.querySelector('h3').textContent;
        dialog.querySelector('[data-lightbox-description]').textContent = copy.querySelector(':scope > p:not(.case-kicker)').textContent;
        dialog.querySelector('[data-lightbox-focus]').textContent = details[0].textContent;
        dialog.querySelector('[data-lightbox-platform]').textContent = details[1].textContent;
        dialog.showModal();
    });
});

dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
});
