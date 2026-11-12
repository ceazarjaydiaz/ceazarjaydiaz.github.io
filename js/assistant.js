(() => {
    'use strict';

    const refusal = "I can help with questions about Ceazar's experience, skills, projects, and professional background. That request is outside my scope, but I'd be happy to help you learn more about his work.";
    const unavailable = "That detail isn't included in Ceazar's public profile or CV. For an accurate answer, you're welcome to contact him directly.";
    const read = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
    const projects = [...document.querySelectorAll('[data-project]')].map(el => ({ ...el.dataset }));
    const overview = read('[data-profile-summary]');
    const education = `Ceazar holds a ${read('.profile-foundation > div:first-child h3')} from ${read('.profile-foundation > div:first-child p:not(.eyebrow)')} (${read('.profile-foundation > div:first-child small')}).`;
    const skills = [...document.querySelectorAll('.profile-pillars small, .toolkit span')].map(el => el.textContent.trim()).join(' · ');
    const experience = [...document.querySelectorAll('.experience-story')].map(el => {
        const copy = el.querySelector('.experience-copy') || el.lastElementChild;
        return `${copy.querySelector('h3').textContent} · ${copy.querySelector('h4').textContent}\n${copy.querySelector('.eyebrow').textContent}\n${copy.querySelector('p:not(.eyebrow)').textContent}`;
    }).join('\n\n');
    const experienceStart = document.querySelector('[data-experience-start]').dataset.experienceStart;
    const cvUrl = 'assets/ceazar-jay-diaz-cv.pdf';

    function experienceDuration(now = new Date()) {
        const [year, month] = experienceStart.split('-').map(Number);
        const months = Math.max(0, (now.getUTCFullYear() - year) * 12 + now.getUTCMonth() + 1 - month);
        const years = Math.floor(months / 12);
        const duration = years ? `${years}+ ${years === 1 ? 'year' : 'years'}` : `${months} ${months === 1 ? 'month' : 'months'}`;
        return `Ceazar has ${duration} of professional development experience, starting in March 2021. His work spans conversational AI, backend services, cloud applications, and full-stack delivery. His CV also includes an AI prototype project from August 2019.`;
    }

    const host = document.createElement('aside');
    host.className = 'ceazar-assistant';
    host.setAttribute('aria-label', 'Dice, Ceazar’s portfolio assistant');
    host.innerHTML = `
        <div class="assistant-invite" hidden>
            <button class="assistant-invite-open" type="button">Want to learn more about Ceazar? Ask me<span>Chat with Dice ↗</span></button>
            <button class="assistant-dismiss" type="button" aria-label="Dismiss invitation">×</button>
        </div>
        <section class="assistant-panel" id="ceazar-chat" role="region" aria-labelledby="assistant-title" hidden>
            <header class="assistant-header"><span class="assistant-status-dot" aria-hidden="true"></span><h2 id="assistant-title">Dice</h2><button class="assistant-hide-panel" type="button" aria-label="Hide Dice" title="Hide Dice">−</button><button class="assistant-close" type="button" aria-label="Close conversation">×</button></header>
            <div class="assistant-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" tabindex="0"></div>
            <div class="assistant-suggestions" aria-label="Suggested questions">
                <button type="button" data-question="Tell me about Ceazar">About Ceazar</button>
                <button type="button" data-question="How many years of experience?">Experience</button>
                <button type="button" data-question="What projects has he built?">His projects</button>
                <button type="button" data-question="How can I contact him?">Get in touch</button>
            </div>
            <form class="assistant-compose"><input aria-label="Ask a question about Ceazar" placeholder="Ask me about Ceazar…" maxlength="500" autocomplete="off" enterkeyhint="send" required><button class="assistant-send" type="submit" aria-label="Send question">↑</button></form>
            <p class="assistant-note">Based on Ceazar's profile and CV · Chat isn't saved</p>
        </section>
        <button class="assistant-hide" type="button" aria-label="Hide Dice" title="Hide Dice">×</button>
        <span class="assistant-drag-hint" id="dice-drag-hint">Drag to move Dice, or focus Dice and use the arrow keys. Click to chat.</span>
        <button class="assistant-restore" type="button" hidden>Show Dice</button>
        <button class="assistant-launcher" type="button" aria-label="Chat with Dice" aria-describedby="dice-drag-hint" title="Chat with Dice · Drag to move" aria-expanded="false" aria-controls="ceazar-chat">
            <span class="assistant-ground" aria-hidden="true"></span>
            <svg class="assistant-robot" viewBox="0 0 120 140" fill="none" aria-hidden="true">
                <g class="assistant-arm"><path class="assistant-shell" d="M37 72C22 72 17 89 21 105C24 111 33 97 37 81Z"/></g>
                <g class="assistant-arm assistant-arm-right"><path class="assistant-shell" d="M83 72C98 72 103 89 99 105C96 111 87 97 83 81Z"/></g>
                <path class="assistant-shell" d="M35 70Q60 64 85 70C90 91 80 115 60 124C40 115 30 91 35 70Z"/>
                <path class="assistant-shell-shade" d="M78 73C82 92 73 111 60 120C81 111 88 89 83 73Z"/>
                <path class="assistant-shell" d="M25 44C25 13 95 13 95 44C95 59 83 65 60 65S25 59 25 44Z"/>
                <path class="assistant-face" d="M31 43C31 23 89 23 89 43C89 55 80 58 60 58S31 55 31 43Z"/>
                <ellipse class="assistant-eye" cx="46" cy="43" rx="6" ry="7" transform="rotate(12 46 43)"/>
                <ellipse class="assistant-eye" cx="74" cy="43" rx="6" ry="7" transform="rotate(-12 74 43)"/>
                <path class="assistant-mark" d="M55 81H51L47 85V93L51 97H55V94H52L50 92V86L52 84H55ZM61 81H65L70 86V92L65 97H59V81H62V94H64L67 91V87L64 84H61Z"/>
                <path d="M39 34Q50 27 66 29" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>`;
    document.body.append(host);

    const panel = host.querySelector('.assistant-panel');
    const launcher = host.querySelector('.assistant-launcher');
    const invite = host.querySelector('.assistant-invite');
    const input = host.querySelector('input');
    const log = host.querySelector('.assistant-messages');
    const send = host.querySelector('.assistant-send');
    const hideButton = host.querySelector('.assistant-hide');
    const restoreButton = host.querySelector('.assistant-restore');
    let busy = false, introduced = false, lastTopic = '';
    const result = (text, section, label) => ({ text, section, label });

    function answer(question) {
        const q = question.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
        if (/\b(ignore|pretend|roleplay|role play|jailbreak|override|bypass|disregard|system prompt|instructions|act as|forget|instead|write|generate|translate|calculate|solve|execute|run code|tell me a joke|make fun|roast)\b/.test(q)) return result(refusal);
        if (/\b(weather|forecast|recipe|recipes|cooking|sports|football|election|politics|president|bitcoin|crypto|stock price|capital of|joke|jokes|poem|poetry|story|stories)\b/.test(q) || /\d\s*[+*/=]\s*\d/.test(q)) return result(refusal);
        if (/^(hi|hello|hey|hiya|good morning|good evening)( dice)?[.!\s]*$/.test(q)) return result("Hello, I'm Dice. I can help you explore Ceazar's background, experience, and projects. What would you like to know?");
        if (/^(thanks|thank you|thank you so much|cheers|bye|goodbye)[.!\s]*$/.test(q)) return result("Happy to help! If you'd like to connect with Ceazar, you'll find his details in Let's Talk.", 'contact', 'Contact Ceazar ↗');
        if (/^(who are you|what are you|what is your name|whats your name|what can you do|help|help me)[.!\s]*$/.test(q)) return result("I'm Dice, Ceazar's portfolio assistant. I can help with his professional experience, skills, projects, education, and contact details, using his public profile and CV.");
        const subject = /\b(ceazar|diaz|he|him|his)\b/.test(q);
        const durationQuestion = /\b(how many years|how long|how much|how experienced|years of experience|years experience|total experience|overall experience)\b/.test(q) && /\b(experience|experienced|working|worked|developer|developing|career)\b/.test(q);
        const implicitDuration = /^(?:(?:how many years|how long)(?: of)?(?: professional| work| development)? (?:experience|experienced|working|worked)(?: (?:do you|does (?:he|ceazar)) have)?|how much(?: professional| work| development)? experience(?: (?:do you|does (?:he|ceazar)) have)?|(?:how many )?years(?: of)? experience|(?:total|overall) experience)[.!\s]*$/.test(q);
        if (durationQuestion && (subject || implicitDuration)) { lastTopic = 'duration'; return result(experienceDuration(), 'experience', 'Explore his experience ↗'); }
        if (/\b(download|view|read|copy|latest|updated|get|see)\b/.test(q) && /\b(cv|resume)\b/.test(q) && !/\b(system|summariz|candidate|recruiter)\b/.test(q) || /^(cv|resume)[.!\s]*$/.test(q)) {
            return result("You can download Ceazar's latest CV below. It covers his AI + Full Stack Developer profile, professional experience, technical skills, education, and selected projects.", cvUrl, 'Download CV ↓');
        }
        if (/\b(age|old|birthday|born|married|wife|girlfriend|family|religion|salary|rate|rates|pricing|price|cost|available|availability|hobbies|hobby|favorite|favourite|nationality|citizenship|visa|address|password|secret|private|client name|clients name|real client|confidential|production architecture|certification|certifications|certified)\b/.test(q)) {
            return /\b(ceazar|diaz|his|he|him|client)\b/.test(q) ? result(unavailable, 'contact', 'Ask Ceazar directly ↗') : result(refusal);
        }
        const projectMatch = [
            [/\b(cv|resume|curriculum|recruitment|candidate|recruiter)\b/, 'resume'],
            [/\b(agentic|orchestration|orchestrate|multi-agent|agents)\b/, 'agents'],
            [/\b(contact center|patient engagement|caller|callers)\b/, 'contact'],
            [/\b(dashboard|monitoring|observability|pipeline metrics)\b/, 'monitoring']
        ].find(([pattern]) => pattern.test(q));
        let topic;
        if (/\b(contact|email|phone|linkedin|reach|hire|hiring|collaborate|connect with|work with|get in touch)\b/.test(q) && !/contact center/.test(q)) topic = 'get-in-touch';
        else if (/\b(education|degree|university|college|study|studied|graduate|graduated|school)\b/.test(q)) topic = 'education';
        else if (/\b(based|live|lives|location|located|abu dhabi)\b/.test(q) || /^where is (ceazar(?: jay diaz)?|he)[.!\s]*$/.test(q)) topic = 'location';
        else if (projectMatch) topic = projectMatch[1];
        else if (/\b(experience|career|worked|employment|employer|edera|healthcare|alexa|kugeltech|hackathon|award|awards)\b/.test(q)) topic = 'experience';
        else if (/\b(project|projects|portfolio|built|building|build|work)\b/.test(q)) topic = 'projects';
        else if (/\b(skill|skills|strengths|expertise|stack|toolkit|technology|technologies|languages|tools|python|react|node|typescript|javascript|aws|langchain|backend|full-stack|ai|specialize|specializes|specialization|offer|offers|services|capabilities)\b/.test(q)) topic = 'skills';
        else if (/\b(about|background|introduce|who|what does|what can)\b/.test(q) && /\b(ceazar|diaz|he|him|his)\b/.test(q)) topic = 'about';
        else if (/^(tell me more|more|go on|what else|can you elaborate)[.!\s]*$/.test(q) && lastTopic) topic = lastTopic === 'about' ? 'skills' : lastTopic;
        const shortTopic = /^(skills|projects|experience|education|contact|location|tech stack|about ceazar)[.!\s]*$/.test(q);
        const topicNoun = '(?:projects?|portfolio|experience|education|degree|university|contact(?: details)?|email|phone(?: number)?|linkedin|skills|tech stack|stack|toolkit|cv(?: system)?|resume(?: system)?|(?:agentic ai workflow |agent |workflow )?orchestration(?: system)?|contact center(?: automation)?|patient engagement|monitoring(?: dashboard)?|dashboard|edera|kugeltech|hackathon|awards)';
        const portfolioQuestion = new RegExp('^(?:(?:tell me|show me)(?: more)? about (?:the |your |this )?|(?:what|which) (?:are |is )?(?:the |your )?|what about (?:the )?)' + topicNoun + '(?: here| on (?:this |the )?(?:site|portfolio))?[.!\\s]*$').test(q);
        const followup = /^(tell me more|more|go on|what else|can you elaborate)[.!\s]*$/.test(q) && lastTopic;
        if (!topic || (!subject && !shortTopic && !portfolioQuestion && !followup)) return result(refusal);
        lastTopic = topic;
        const project = projects.find(p => p.project === topic);
        if (project) return result(`${project.title}\n\n${project.description}\n\nTechnologies: ${project.stack}\n\nYou can explore the public overview below. Client-specific implementations remain confidential.`, 'work', 'Explore selected work ↗');
        switch (topic) {
            case 'about': return result(`Ceazar Jay Diaz is based in Abu Dhabi, UAE. ${overview}`, 'capabilities', 'More about Ceazar ↗');
            case 'skills': return result(`Ceazar focuses on AI integration, backend engineering, and full-stack products, from custom interfaces and APIs to cloud deployment and monitoring.\n\nHis public toolkit includes: ${skills}`, 'capabilities', 'Explore his capabilities ↗');
            case 'projects': return result(`His selected work includes:\n\n${projects.map((p, i) => `${i + 1}. ${p.title}\n${p.description}`).join('\n\n')}\n\nAsk me about the CV system, orchestration, contact center, or monitoring dashboard.`, 'work', 'Explore selected work ↗');
            case 'experience': return result(experience, 'experience', 'See his experience ↗');
            case 'duration': return result(experienceDuration(), 'experience', 'Explore his experience ↗');
            case 'education': return result(education, 'capabilities', 'See his background ↗');
            case 'location': return result('Ceazar is based in Abu Dhabi, United Arab Emirates.', 'contact', 'Get in touch ↗');
            case 'get-in-touch': return result('You can reach Ceazar at ceazarjaydiaz@gmail.com, call +971503241745, or find him on LinkedIn via the contact section. Share your project objectives, requirements, and challenges to start a conversation.', 'contact', 'Contact Ceazar ↗');
            default: return result(unavailable, 'contact', 'Ask Ceazar directly ↗');
        }
    }

    function message(text, speaker = 'assistant', section, label) {
        const bubble = document.createElement('div');
        bubble.className = 'assistant-message';
        bubble.dataset.speaker = speaker;
        bubble.setAttribute('aria-label', speaker === 'user' ? 'You' : 'Dice');
        bubble.textContent = text;
        if (section) {
            const link = document.createElement('a');
            link.href = section === cvUrl ? cvUrl : `#${section}`; link.textContent = label;
            if (section === cvUrl) link.download = 'Ceazar Jay Diaz - AI + Full Stack Developer.pdf';
            link.addEventListener('click', () => setOpen(false));
            bubble.append(link);
        }
        log.append(bubble);
        while (log.childElementCount > 60) log.firstElementChild.remove();
        log.scrollTop = log.scrollHeight;
        return bubble;
    }

    function setOpen(open) {
        host.dataset.open = String(open);
        panel.hidden = !open;
        launcher.setAttribute('aria-expanded', String(open));
        launcher.setAttribute('aria-label', open ? 'Close conversation with Dice' : 'Chat with Dice');
        invite.hidden = true;
        if (open && !introduced) {
            message("Hello, I'm Dice, Ceazar's portfolio assistant. I can help you learn about his work as an AI + Full Stack Developer, his experience, and his projects. What would you like to know?");
            introduced = true;
        }
        if (open) { positionPanel(); log.scrollTop = log.scrollHeight; input.focus({ preventScroll: true }); }
        else launcher.focus({ preventScroll: true });
    }

    const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min, max)));
    function positionPanel() {
        if (panel.hidden) return;
        const robot = host.getBoundingClientRect();
        const viewport = window.visualViewport;
        const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
        const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
        panel.style.maxHeight = `${Math.max(120, height - 32)}px`;
        panel.style.minHeight = `${Math.min(240, Math.max(120, height - 32))}px`;
        const box = panel.getBoundingClientRect();
        panel.style.left = `${clamp(robot.right - box.width, left + 16, left + width - box.width - 16)}px`;
        panel.style.top = `${clamp(robot.top - box.height - 16, top + 16, top + height - box.height - 16)}px`;
    }

    let position, drag, suppressClick = false;
    function moveTo(x, y) {
        const box = host.getBoundingClientRect();
        position = { x: clamp(x, 12, innerWidth - box.width - 12), y: clamp(y, 36, innerHeight - box.height - 12) };
        host.dataset.positioned = 'true';
        host.style.left = `${position.x}px`; host.style.top = `${position.y}px`;
        positionPanel();
    }
    launcher.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        const box = host.getBoundingClientRect();
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: box.left, top: box.top, moved: false };
        suppressClick = false;
        launcher.setPointerCapture(event.pointerId);
    });
    launcher.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        drag.moved = true; host.dataset.dragging = 'true'; invite.hidden = true;
        moveTo(drag.left + dx, drag.top + dy);
    });
    const endDrag = event => {
        if (!drag || drag.id !== event.pointerId) return;
        suppressClick = drag.moved; drag = null; delete host.dataset.dragging;
        if (launcher.hasPointerCapture(event.pointerId)) launcher.releasePointerCapture(event.pointerId);
    };
    launcher.addEventListener('pointerup', endDrag);
    launcher.addEventListener('pointercancel', endDrag);
    launcher.addEventListener('lostpointercapture', () => { drag = null; delete host.dataset.dragging; });
    launcher.addEventListener('keydown', event => {
        const directions = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
        const step = directions[event.key];
        if (!step) return;
        event.preventDefault(); invite.hidden = true;
        const box = host.getBoundingClientRect(); moveTo(box.left + step[0], box.top + step[1]);
    });

    function setHidden(hidden, focus = true) {
        if (hidden) {
            panel.hidden = true; invite.hidden = true;
            host.dataset.open = 'false'; launcher.setAttribute('aria-expanded', 'false');
            launcher.setAttribute('aria-label', 'Chat with Dice');
        }
        host.dataset.hidden = String(hidden);
        launcher.hidden = hidden; hideButton.hidden = hidden; restoreButton.hidden = !hidden;
        try { sessionStorage.setItem('dice-hidden', String(hidden)); } catch {}
        if (!hidden && position) moveTo(position.x, position.y);
        if (focus) (hidden ? restoreButton : launcher).focus({ preventScroll: true });
    }
    host.querySelectorAll('.assistant-hide, .assistant-hide-panel').forEach(button => button.addEventListener('click', () => setHidden(true)));
    restoreButton.addEventListener('click', () => setHidden(false));
    try { if (sessionStorage.getItem('dice-hidden') === 'true') setHidden(true, false); } catch {}
    function fitViewport() {
        if (position && host.dataset.hidden !== 'true') moveTo(position.x, position.y);
        else positionPanel();
    }
    addEventListener('resize', fitViewport);
    window.visualViewport?.addEventListener('resize', fitViewport);
    window.visualViewport?.addEventListener('scroll', positionPanel);

    function submit(question) {
        question = question.trim().slice(0, 500);
        if (!question || busy) return;
        busy = true; send.disabled = true; host.dataset.thinking = 'true';
        message(question, 'user'); input.value = '';
        const typing = document.createElement('div');
        typing.className = 'assistant-message assistant-typing';
        typing.setAttribute('aria-hidden', 'true');
        typing.innerHTML = '<i></i><i></i><i></i>';
        log.append(typing); log.scrollTop = log.scrollHeight;
        const reply = answer(question);
        setTimeout(() => {
            typing.remove(); message(reply.text, 'assistant', reply.section, reply.label);
            busy = false; send.disabled = false; host.dataset.thinking = 'false';
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
    }

    launcher.addEventListener('click', event => {
        if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
        setOpen(panel.hidden);
    });
    host.querySelector('.assistant-invite-open').addEventListener('click', () => setOpen(true));
    host.querySelector('.assistant-close').addEventListener('click', () => setOpen(false));
    host.querySelector('.assistant-dismiss').addEventListener('click', () => { invite.hidden = true; });
    host.querySelector('form').addEventListener('submit', event => { event.preventDefault(); submit(input.value); });
    host.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => submit(button.dataset.question)));
    host.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    });
    host.addEventListener('cancel', event => event.preventDefault());

    const canPopover = typeof host.showPopover === 'function';
    if (canPopover) host.setAttribute('popover', 'manual');
    let activeDialog;
    const modalOrder = [];
    function syncLayer() {
        const open = [...document.querySelectorAll('dialog[open]')];
        for (let i = modalOrder.length - 1; i >= 0; i--) if (!open.includes(modalOrder[i])) modalOrder.splice(i, 1);
        open.forEach(dialog => { if (!modalOrder.includes(dialog)) modalOrder.push(dialog); });
        const current = modalOrder.at(-1);
        if (current !== activeDialog || !host.isConnected) {
            if (canPopover && host.matches(':popover-open')) host.hidePopover();
            (current || document.body).append(host); activeDialog = current;
        }
        if (canPopover && !document.documentElement.classList.contains('booting') && !host.matches(':popover-open')) host.showPopover();
        positionPanel();
    }
    const observer = new MutationObserver(records => {
        if (records.some(r => r.type === 'childList' && [...r.addedNodes].some(n => n.nodeName === 'DIALOG') || r.type === 'attributes' && r.target.nodeName === 'DIALOG')) syncLayer();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    function welcome() { syncLayer(); if (!introduced && host.dataset.hidden !== 'true') invite.hidden = false; }
    if (document.documentElement.classList.contains('booting')) addEventListener('district:ready', welcome, { once: true });
    else welcome();
})();
