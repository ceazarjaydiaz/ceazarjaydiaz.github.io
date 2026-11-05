(() => {
    const root = document.documentElement;
    const mode = document.querySelector('.mode-switch');
    function setTheme(theme) {
        root.dataset.theme = theme === 'day' ? 'day' : 'night';
        const day = root.dataset.theme === 'day';
        root.style.colorScheme = day ? 'light' : 'dark';
        mode.setAttribute('aria-checked', String(day));
        mode.title = day ? 'Switch to Night Mode' : 'Switch to Day Mode';
        document.querySelector('meta[name="theme-color"]').content = day ? '#e8eef4' : '#080a0e';
        dispatchEvent(new Event('theme:change'));
    }
    let saved;
    try { saved = localStorage.getItem('district-theme'); } catch {}
    setTheme(saved === 'night' ? 'night' : 'day');
    let themeTimer;
    mode.addEventListener('click', () => {
        const change = () => {
            setTheme(root.dataset.theme === 'day' ? 'night' : 'day');
            try { localStorage.setItem('district-theme', root.dataset.theme); } catch {}
        };
        clearTimeout(themeTimer);root.classList.add('theme-changing');change();
        themeTimer=setTimeout(()=>root.classList.remove('theme-changing'),550);
    });

    const toggle = document.querySelector('[data-sound]');
    let context, master, enabled = false, timer, index = 0;
    const chords = [[130.81,196,293.66],[110,164.81,246.94],[87.31,130.81,196],[98,146.83,220]];
    function tone(frequency, start, duration, gain, type = 'sine') {
        const oscillator = context.createOscillator(), envelope = context.createGain();
        oscillator.type = type; oscillator.frequency.value = frequency;
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(gain, start + 1.2);
        envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(envelope); envelope.connect(master);
        oscillator.start(start); oscillator.stop(start + duration + .1);
    }
    function phrase() {
        if (!enabled || document.hidden) return;
        const t = context.currentTime + .1, chord = chords[index++ % chords.length];
        chord.forEach((f, i) => { tone(f, t + i * .12, 10, .14); tone(f * 1.002, t + i * .12, 10, .045); });
        [0, 2, 1].forEach((note, i) => tone(chord[note] * 4, t + 2 + i * 2, 3.5, .035));
    }
    function updateLabel() {
        toggle.setAttribute('aria-pressed', String(enabled));
        toggle.setAttribute('aria-label', enabled ? 'Turn Ambient Sound Off' : 'Turn Ambient Sound On');
        toggle.querySelector('span').textContent = enabled ? 'Sound On' : 'Sound Off';
    }
    toggle.addEventListener('click', async () => {
        toggle.disabled = true;
        try {
            if (!context) {
                const Audio = window.AudioContext || window.webkitAudioContext;
                if (!Audio) throw new Error('Audio unavailable');
                context = new Audio(); master = context.createGain(); master.gain.value = .18;
                const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1800;
                master.connect(filter); filter.connect(context.destination);
            }
            enabled = !enabled;
            if (enabled) { await context.resume(); phrase(); timer = setInterval(phrase, 8000); }
            else { clearInterval(timer); await context.suspend(); }
            updateLabel();
        } catch { enabled = false; updateLabel(); toggle.title = 'Audio is unavailable in this browser.'; }
        finally { toggle.disabled = false; }
    });
    document.addEventListener('visibilitychange', async () => {
        if (!context || !enabled) return;
        if (document.hidden) await context.suspend();
        else await context.resume();
    });
})();
