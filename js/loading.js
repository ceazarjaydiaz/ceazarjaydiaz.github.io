(() => {
    const screen = document.querySelector('.boot-screen');
    const root = document.documentElement;
    const status = screen.querySelector('.boot-status');
    const bar = screen.querySelector('[role="progressbar"]');
    const skip = screen.querySelector('.boot-skip');
    const regions = [...document.querySelectorAll('.site-header,main')];
    regions.forEach(el => el.inert = true);
    document.body.setAttribute('aria-busy', 'true');
    let finished = false, minimumElapsed = false, count = 0;
    const timers = [];
    const complete = label => {
        if (finished) return;
        count++;
        bar.setAttribute('aria-valuenow', String(Math.round(count / 4 * 100)));
        bar.style.setProperty('--progress', `${count / 4 * 100}%`);
        status.textContent = label;
        if (count === 4) enter();
    };
    function enter() {
        if (finished || !minimumElapsed) return;
        finished = true; observer.disconnect(); timers.forEach(clearTimeout);
        regions.forEach(el => el.inert = false);
        document.body.removeAttribute('aria-busy');
        root.classList.remove('booting');
        screen.classList.add('boot-complete');
        dispatchEvent(new Event('district:ready'));
        setTimeout(() => screen.remove(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800);
    }
    skip.addEventListener('click', enter);
    const city = document.querySelector('.city-world');
    const observer = new MutationObserver(() => {
        if (city.classList.contains('ready') || city.classList.contains('fallback')) {
            observer.disconnect(); complete('City renderer ready');
        }
    });
    observer.observe(city, { attributes: true, attributeFilter: ['class'] });
    const bounded = (promise, ms) => Promise.race([promise.catch(() => {}), new Promise(resolve => timers.push(setTimeout(resolve, ms)))]);
    bounded(document.fonts ? document.fonts.ready : Promise.resolve(), 2500).then(() => complete('Typography ready'));
    const portrait = document.querySelector('.profile-portrait img');
    bounded(portrait && portrait.decode ? portrait.decode() : Promise.resolve(), 3500).then(() => complete('Portrait ready'));
    requestAnimationFrame(() => requestAnimationFrame(() => complete('Interface ready')));
    timers.push(setTimeout(() => {
        minimumElapsed = true;
        skip.hidden = false;
        if (count === 4) enter();
    }, 3000));
    timers.push(setTimeout(enter, 6000));
})();
