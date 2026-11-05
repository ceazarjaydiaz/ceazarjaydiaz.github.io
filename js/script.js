const header = document.querySelector('[data-header]');
const menu = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const dialog = document.querySelector('[data-project-dialog]');
const contactForm = document.querySelector('[data-contact-form]');
document.documentElement.classList.add('js-enhanced');

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
        const projectContent = dialog.querySelector('.project-content');
        if (projectContent) projectContent.scrollTop = 0;
    });
});

dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const r=dialog.getBoundingClientRect(); if(event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close(); });

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const formData = new FormData(contactForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const interest = 'Project enquiry';
    const subject = `Project enquiry from ${name}`;
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
(() => {
 const ids=['work','capabilities','experience','contact'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.documentElement;
 const windowEl=document.createElement('dialog');
 windowEl.className='destination-window';
 windowEl.innerHTML='<button type="button" class="window-close" aria-label="Close Window">×</button><div class="window-content"></div><nav class="destination-controls" aria-label="Window Controls"><span>Explore at Your Own Pace</span><button type="button" data-home>← Back to City</button></nav>';
 document.body.append(windowEl);
 const content=windowEl.querySelector('.window-content');
 ids.forEach(id=>{const s=document.getElementById(id);s.classList.add('destination-panel');s.tabIndex=-1;s.hidden=true;content.append(s);});
 root.classList.add('immersive');
 let current='top',timer,origin;
 function navigate(id,push=true){
  if(!ids.includes(id))id='top';
  clearTimeout(timer);current=id;closeMenu();
  ids.forEach(key=>{const s=document.getElementById(key);s.hidden=true;s.classList.remove('arrived');});
  const home=id==='top';
  if(windowEl.open)windowEl.close();
  root.classList.toggle('destination-open',!home);root.classList.toggle('travelling',!home);
  document.querySelector('.hero-copy').inert=!home;
  document.querySelector('.city-landmarks').inert=!home;
  document.querySelectorAll('.site-nav a').forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  if(push)history.pushState({destination:id},'','#'+id);
  dispatchEvent(new CustomEvent('city:navigate',{detail:{destination:id}}));
  timer=setTimeout(()=>{
   root.classList.remove('travelling');
   if(home){origin?.isConnected&&origin.focus({preventScroll:true});return;}
   const s=document.getElementById(id);s.hidden=false;s.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));s.classList.add('arrived');
   windowEl.setAttribute('aria-labelledby',s.getAttribute('aria-labelledby'));
   const reveal=()=>{if(current!==id)return;windowEl.showModal();content.scrollTop=0;s.focus({preventScroll:true});};
   if(root.classList.contains('booting'))addEventListener('district:ready',reveal,{once:true});else reveal();
  },reduced.matches?0:650);
 }
 document.addEventListener('click',event=>{
  const a=event.target.closest('a[href^="#"]');if(!a||a.classList.contains('skip-link'))return;
  const id=a.hash.slice(1);if(id!=='top'&&id!=='experience'&&!ids.includes(id))return;
  event.preventDefault();if(current==='top')origin=a;navigate(id);
 });
 windowEl.querySelector('.window-close').addEventListener('click',()=>navigate('top'));
 windowEl.querySelector('[data-home]').addEventListener('click',()=>navigate('top'));
 let outsideDown=false;
 const outside=e=>{const r=windowEl.getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;};
 windowEl.addEventListener('pointerdown',e=>{outsideDown=e.target===windowEl&&outside(e);});
 windowEl.addEventListener('click',e=>{if(e.target===windowEl&&outsideDown&&outside(e))navigate('top');outsideDown=false;});
 windowEl.addEventListener('cancel',e=>{e.preventDefault();navigate('top');});
 addEventListener('popstate',()=>navigate(location.hash.slice(1),false));
 navigate(location.hash.slice(1),false);
})();
