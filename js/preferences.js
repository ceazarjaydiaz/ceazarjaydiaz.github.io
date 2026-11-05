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
    let context, master, output, timer, suspendTimer, step = 0, nextTime = 0;
    let enabled = true;
    try { enabled = localStorage.getItem('district-sound') !== 'off'; } catch {}
    const beat = 60 / 72;
    const roots = [146.83, 164.81, 220, 196];
    function stopTicker() {
        if (timer) clearInterval(timer);
        timer = undefined;
    }
    function updateLabel() {
        const playing = enabled && context?.state === 'running' && !document.hidden;
        toggle.dataset.playback = !enabled ? 'muted' : playing ? 'playing' : 'ready';
        toggle.setAttribute('aria-pressed', String(enabled));
        toggle.setAttribute('aria-label', enabled ? 'Turn Music Off' : 'Turn Music On');
        toggle.querySelector('span').textContent = enabled ? 'Sound On' : 'Sound Off';
        toggle.title = !enabled ? 'Enable the orbital soundscape' : playing
            ? 'Original orbital soundscape · Evolving tones and spatial shimmer'
            : 'Sound is enabled and will start when your browser allows playback';
    }
    function note(frequency, time, duration, level, type = 'sine', attack = .08, pan = 0, detune = 0) {
        const oscillator = context.createOscillator(), envelope = context.createGain(), spatial = context.createStereoPanner();
        oscillator.type = type; oscillator.frequency.value = frequency; oscillator.detune.value = detune;
        envelope.gain.setValueAtTime(.0001, time);
        envelope.gain.exponentialRampToValueAtTime(level, time + attack);
        envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
        spatial.pan.setValueAtTime(pan, time);
        spatial.pan.linearRampToValueAtTime(-pan, time + duration);
        oscillator.connect(envelope); envelope.connect(spatial); spatial.connect(master);
        oscillator.start(time); oscillator.stop(time + duration + .04);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); spatial.disconnect(); };
    }
    function scheduleStep(time) {
        const root = roots[Math.floor(step / 32) % roots.length], position = step % 32;
        if (!position) [1, 1.5, 2, 3].forEach((ratio, i) => {
            const pan = [-.65, .55, -.3, .35][i];
            note(root * ratio, time + i * .11, beat * 17, .038 - i * .005, 'sine', 2.2, pan, i % 2 ? 3 : -3);
            note(root * ratio * 1.0015, time + i * .11, beat * 17, .009, 'sine', 2.8, -pan);
        });
        const orbit = step % 12;
        if ([0, 3, 7, 10].includes(orbit)) {
            const ratios = [4, 6, 3, 8, 4.5, 6, 4, 9];
            const n = Math.floor(step / 3) % ratios.length, pan = Math.sin(step * .63) * .75;
            const frequency = root * ratios[n];
            note(frequency, time, 3.6, .048, 'sine', .06, pan);
            note(frequency * 2.002, time + .02, 1.6, .007, 'sine', .025, -pan);
        }
        if (step % 4 === 0) note(root / 2, time, 1.2, .026, 'sine', .16, 0);
        step++;
    }
    function startTicker() {
        if (!enabled || document.hidden || context?.state !== 'running' || timer) return;
        nextTime = context.currentTime + .06;
        const tick = () => {
            if (!enabled || document.hidden || context.state !== 'running') { stopTicker(); return; }
            if (nextTime < context.currentTime) nextTime = context.currentTime + .02;
            while (nextTime < context.currentTime + .15) {
                scheduleStep(nextTime);
                nextTime += beat / 2;
            }
        };
        tick(); timer = setInterval(tick, 40);
    }
    function ensureContext() {
        if (context) return true;
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) {
            enabled = false; updateLabel(); toggle.disabled = true;
            toggle.title = 'Audio is unavailable in this browser';
            return false;
        }
        context = new Audio();
        master = context.createGain(); master.gain.value = .32;
        output = context.createGain(); output.gain.value = 1;
        const filter = context.createBiquadFilter(), limiter = context.createDynamicsCompressor();
        filter.type = 'lowpass'; filter.frequency.value = 4200;
        limiter.threshold.value = -18; limiter.ratio.value = 2;
        master.connect(filter); filter.connect(limiter); limiter.connect(output); output.connect(context.destination);
        const air = context.createConvolver(), wet = context.createGain(), tailFilter = context.createBiquadFilter();
        const impulse = context.createBuffer(2, Math.ceil(context.sampleRate * 2.6), context.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const samples = impulse.getChannelData(channel);
            for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3) * .35;
        }
        air.buffer = impulse; wet.gain.value = .32;
        tailFilter.type = 'lowpass'; tailFilter.frequency.value = 3000;
        master.connect(air); air.connect(tailFilter); tailFilter.connect(wet); wet.connect(limiter);
        const echo = context.createDelay(2), feedback = context.createGain(), echoTone = context.createBiquadFilter(), echoLevel = context.createGain();
        echo.delayTime.value = beat * .75; feedback.gain.value = .24; echoLevel.gain.value = .15;
        echoTone.type = 'lowpass'; echoTone.frequency.value = 2200;
        master.connect(echo); echo.connect(echoTone); echoTone.connect(feedback); feedback.connect(echo);
        echoTone.connect(echoLevel); echoLevel.connect(limiter);
        context.addEventListener('statechange', () => {
            if (context.state === 'running') startTicker(); else stopTicker();
            updateLabel();
        });
        return true;
    }
    function unlock() {
        if (!enabled || document.hidden) return;
        try {
            if (!ensureContext()) return;
            clearTimeout(suspendTimer);
            output.gain.cancelScheduledValues(context.currentTime);
            output.gain.setTargetAtTime(1, context.currentTime, .08);
            if (context.state === 'running') { startTicker(); updateLabel(); }
            else context.resume().then(() => { startTicker(); updateLabel(); }).catch(updateLabel);
        } catch { toggle.title = 'Music could not start. Try the sound control again.'; }
    }
    function mute() {
        stopTicker();
        if (!context) return;
        output.gain.cancelScheduledValues(context.currentTime);
        output.gain.setTargetAtTime(0, context.currentTime, .02);
        suspendTimer = setTimeout(() => { if (!enabled) context.suspend().catch(() => {}); }, 100);
    }
    toggle.addEventListener('click', () => {
        enabled = !enabled;
        try { localStorage.setItem('district-sound', enabled ? 'on' : 'off'); } catch {}
        if (enabled) unlock(); else mute();
        updateLabel();
    });
    const firstInteraction = event => {
        if (event.target.closest?.('[data-sound]')) return;
        if (event.type === 'keydown' && (event.ctrlKey || event.altKey || event.metaKey)) return;
        unlock();
    };
    document.addEventListener('pointerdown', firstInteraction, { passive: true });
    document.addEventListener('keydown', firstInteraction);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { stopTicker(); if (context) context.suspend().catch(() => {}); }
        else unlock();
        updateLabel();
    });
    updateLabel();
    if (enabled) unlock();
})();