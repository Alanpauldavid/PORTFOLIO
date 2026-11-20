document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const cursorLabel = document.querySelector('.cursor-label');
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // 1. MOUSE TRACKING & ACCURACY
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    if (!isMobile && cursor && cursorLabel) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            const easing = 0.2; 
            cursorX += (mouseX - cursorX) * easing;
            cursorY += (mouseY - cursorY) * easing;
            
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            cursor.style.transform = `translate(-50%, -50%)`;

            cursorLabel.style.left = `${cursorX}px`;
            cursorLabel.style.top = `${cursorY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // 2. DYNAMIC INTERACTION LABELS
    const interactables = document.querySelectorAll(
        'a, .logo, .close-modal, .archive-btn, .card, .gallery-item img, .resume-btn, .popup-trigger-card, .reel-item, .gallery-video-card, #designTrigger'
    );

    if (!isMobile && cursor && cursorLabel) {
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                cursorLabel.classList.add('active');
                
                if (el.id === 'designTrigger' || el.classList.contains('popup-trigger-card')) {
                    cursorLabel.innerText = "VIEW_GALLERY";
                } else if (el.tagName === 'IMG' || el.classList.contains('gallery-item')) {
                    cursorLabel.innerText = "ZOOM_VIEW";
                } else if (el.classList.contains('resume-btn')) {
                    cursorLabel.innerText = "GET_PDF";
                } else if (el.classList.contains('close-modal')) {
                    cursorLabel.innerText = "CLOSE";
                } else if (
                    el.classList.contains('card') || 
                    el.classList.contains('work-card') || 
                    el.classList.contains('reel-item') || 
                    el.classList.contains('gallery-video-card')
                ) {
                    cursorLabel.innerText = "WATCH_NOW";
                } else {
                    cursorLabel.innerText = "CLICK";
                }
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                cursorLabel.classList.remove('active');
            });
        });
    }

    // 3. SCROLL REVEAL OBSERVER & DIGITAL CLOCK
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .card, .showreel-wrapper').forEach(el => revealObserver.observe(el));

    const updateClock = () => {
        const clockEl = document.getElementById('digitalClock');
        if (clockEl) {
            clockEl.innerText = new Date().toLocaleTimeString('en-GB', { hour12: false });
        }
    };
    setInterval(updateClock, 1000);
    updateClock();

    // 3a. HERO BG PARALLAX
    (function heroParallax() {
        const bg = document.getElementById('heroBg');
        if (!bg || isMobile) return;
        window.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - 0.5) * -28;
            const y = (e.clientY / window.innerHeight - 0.5) * -18;
            bg.style.setProperty('--px', x.toFixed(1) + 'px');
            bg.style.setProperty('--py', y.toFixed(1) + 'px');
        });
    })();

    // 3b. PARTICLE NAME
    (function particleName() {
        const canvas = document.getElementById('particleCanvas');
        const wrap = document.getElementById('particleWrap');
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        const GREEN = '#00ff66';
        const WHITE = '#e8e8e8';
        let particles = [];
        let w = 0, h = 0, dpr = 1;
        const pointer = { x: -9999, y: -9999, active: false };

        function build() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = wrap.clientWidth;
            h = wrap.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const off = document.createElement('canvas');
            off.width = w; off.height = h;
            const o = off.getContext('2d');
            const lines = ['ALAN', 'CREATIVES'];
            // size font so the widest line fits
            let fs = h / 2.1;
            o.font = `900 ${fs}px "JetBrains Mono", "Courier New", monospace`;
            const widest = Math.max(...lines.map(l => o.measureText(l).width));
            if (widest > w * 0.98) fs *= (w * 0.98) / widest;
            o.font = `900 ${fs}px "JetBrains Mono", "Courier New", monospace`;
            o.textBaseline = 'middle';
            o.textAlign = 'left';
            const lh = fs * 0.95;
            const startY = h / 2 - lh / 2;
            o.fillStyle = '#fff';
            o.fillText(lines[0], 0, startY);
            o.fillText(lines[1], 0, startY + lh);

            const data = o.getImageData(0, 0, w, h).data;
            const gap = w < 600 ? 4 : 5;
            const next = [];
            for (let y = 0; y < h; y += gap) {
                for (let x = 0; x < w; x += gap) {
                    if (data[(y * w + x) * 4 + 3] > 128) {
                        // second line (CREATIVES) green, first line white
                        const isGreen = y > h / 2 - lh / 2 + lh * 0.45;
                        const prev = particles[next.length];
                        next.push({
                            x: prev ? prev.x : Math.random() * w,
                            y: prev ? prev.y : Math.random() * h,
                            ox: x, oy: y, vx: 0, vy: 0,
                            c: isGreen ? GREEN : WHITE,
                            s: 1 + Math.random() * 0.9
                        });
                    }
                }
            }
            particles = next;
        }

        const radius = () => (w < 600 ? 70 : 110);

        function frame() {
            ctx.clearRect(0, 0, w, h);
            const R = radius();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - pointer.x;
                const dy = p.y - pointer.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (pointer.active && d < R && d > 0.01) {
                    const f = (R - d) / R;
                    p.vx += (dx / d) * f * 6;
                    p.vy += (dy / d) * f * 6;
                }
                // spring back home
                p.vx += (p.ox - p.x) * 0.045;
                p.vy += (p.oy - p.y) * 0.045;
                p.vx *= 0.86;
                p.vy *= 0.86;
                p.x += p.vx;
                p.y += p.vy;
                ctx.fillStyle = p.c;
                ctx.fillRect(p.x, p.y, p.s + 0.6, p.s + 0.6);
            }
            requestAnimationFrame(frame);
        }

        function setPointer(cx, cy) {
            const r = canvas.getBoundingClientRect();
            pointer.x = cx - r.left;
            pointer.y = cy - r.top;
            pointer.active = true;
        }
        window.addEventListener('mousemove', e => setPointer(e.clientX, e.clientY));
        window.addEventListener('touchmove', e => { const t = e.touches[0]; setPointer(t.clientX, t.clientY); }, { passive: true });
        wrap.addEventListener('mouseleave', () => { pointer.active = false; });
        // click = burst
        wrap.addEventListener('click', e => {
            setPointer(e.clientX, e.clientY);
            particles.forEach(p => {
                const a = Math.random() * Math.PI * 2;
                const s = 8 + Math.random() * 14;
                p.vx += Math.cos(a) * s;
                p.vy += Math.sin(a) * s;
            });
        });

        let resizeT;
        window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(build, 150); });
        const start = () => { build(); frame(); };
        (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
    })();

    // 3c. RECENT WORKS: FILTER
    (function recentWorks() {
        const bar = document.getElementById('filterBar');
        const cards = document.querySelectorAll('.work-card');
        if (!bar) return;
        bar.addEventListener('click', e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            let n = 0;
            cards.forEach(r => {
                const show = f === 'all' || r.dataset.cat === f;
                r.classList.toggle('hide', !show);
                if (show) r.querySelector('.work-index').textContent = String(++n).padStart(2, '0');
            });
        });
        bar.querySelectorAll('.filter-btn').forEach(b => {
            b.addEventListener('mouseenter', () => { if (cursor) cursor.classList.add('hovering'); });
            b.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('hovering'); });
        });
    })();

    // 3c2. AUTO-SCROLLING REEL (pauses on hover / touch, drag-free, seamless loop)
    (function reelMarquee() {
        const marquee = document.getElementById('reelMarquee');
        const track = document.getElementById('reelTrack');
        if (!marquee || !track) return;
        const originals = Array.from(track.children);
        originals.forEach(el => {
            const c = el.cloneNode(true);
            c.setAttribute('aria-hidden', 'true');
            c.tabIndex = -1;
            track.appendChild(c);
        });
        if (cursor && cursorLabel) {
            track.querySelectorAll('.reel-item').forEach(el => {
                el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); cursorLabel.classList.add('active'); cursorLabel.innerText = el.classList.contains('slot-empty') ? 'EMPTY_SLOT' : 'WATCH_NOW'; });
                el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); cursorLabel.classList.remove('active'); });
            });
        }
        track.querySelectorAll('.slot-empty').forEach(a => a.addEventListener('click', e => e.preventDefault()));
        let x = 0, paused = false, last = performance.now();
        const speed = 40; // px per second
        const half = () => track.scrollWidth / 2;
        function tick(now) {
            const dt = Math.min(now - last, 50);
            last = now;
            if (!paused) {
                x -= speed * dt / 1000;
                if (-x >= half()) x += half();
                track.style.transform = `translate3d(${x}px,0,0)`;
            }
            requestAnimationFrame(tick);
        }
        marquee.addEventListener('mouseenter', () => { paused = true; });
        marquee.addEventListener('mouseleave', () => { paused = false; });
        marquee.addEventListener('touchstart', () => { paused = true; }, { passive: true });
        marquee.addEventListener('touchend', () => { paused = false; });
        // wheel nudges the reel while hovered
        marquee.addEventListener('wheel', e => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                x -= e.deltaX;
                if (-x >= half()) x += half();
                if (x > 0) x -= half();
                track.style.transform = `translate3d(${x}px,0,0)`;
            }
        }, { passive: false });
        requestAnimationFrame(tick);
    })();

    // 3c3. SHOWREEL: click thumbnail to load the player
    (function showreel() {
        const frame = document.getElementById('reelFrame');
        const btn = document.getElementById('reelPlay');
        if (!frame || !btn) return;
        if (cursor && cursorLabel) {
            btn.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); cursorLabel.classList.add('active'); cursorLabel.innerText = 'PLAY_REEL'; });
            btn.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); cursorLabel.classList.remove('active'); });
        }
        btn.addEventListener('click', () => {
            const f = document.createElement('iframe');
            f.src = 'https://www.youtube.com/embed/' + frame.dataset.vid + '?autoplay=1&rel=0&modestbranding=1';
            f.title = 'Showreel';
            f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
            f.allowFullscreen = true;
            f.referrerPolicy = 'strict-origin-when-cross-origin';
            frame.appendChild(f);
            btn.remove();
            if (cursor && cursorLabel) { cursor.classList.remove('hovering'); cursorLabel.classList.remove('active'); }
        });
    })();

    // 3d. MAGNETIC BUTTONS + CARD TILT (desktop only)
    if (!isMobile) {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
                const y = (e.clientY - (r.top + r.height / 2)) * 0.25;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transition = 'border-color 0.3s ease';
                card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease, border-color 0.3s ease';
                card.style.transform = '';
            });
        });
    }

    // 4. MODALS & POPUPS
    const designModal = document.getElementById('designModal');
    const designTrigger = document.getElementById('designTrigger');
    const closeDesignModal = document.querySelector('#designModal .close-modal');

    const nativeModal = document.getElementById('nativeMoreModal');
    const nativeTrigger = document.getElementById('nativeMoreTrigger');
    const closeNativeModal = document.getElementById('closeNativeModal');

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (cursorLabel) cursorLabel.classList.remove('active');
    }

    if (designTrigger) designTrigger.onclick = () => openModal(designModal);
    if (closeDesignModal) closeDesignModal.onclick = () => closeModal(designModal);

    if (nativeTrigger) nativeTrigger.onclick = () => openModal(nativeModal);
    if (closeNativeModal) closeNativeModal.onclick = () => closeModal(nativeModal);

    window.addEventListener('click', (e) => {
        if (e.target === designModal) closeModal(designModal);
        if (e.target === nativeModal) closeModal(nativeModal);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(designModal);
            closeModal(nativeModal);
        }
    });
});
