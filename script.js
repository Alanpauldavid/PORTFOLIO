document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor');
    const cursorLabel = document.querySelector('.cursor-label');
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // 1. MOUSE TRACKING (SMOOTH & PRECISE)
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

    // 2. DYNAMIC INTERACTION LABELS (INCLUDES MODAL ELEMENTS)
    const interactables = document.querySelectorAll(
        'a, .logo, .graphic-trigger, .close-modal, .archive-btn, .card, .gallery-item img, .resume-btn, .popup-trigger-card, .reel-item, .gallery-video-card'
    );

    if (!isMobile && cursor && cursorLabel) {
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                cursorLabel.classList.add('active');
                
                if (el.classList.contains('graphic-trigger') || el.classList.contains('popup-trigger-card')) {
                    cursorLabel.innerText = "VIEW_GALLERY";
                } else if (el.tagName === 'IMG' || el.classList.contains('gallery-item')) {
                    cursorLabel.innerText = "ZOOM_VIEW";
                } else if (el.classList.contains('resume-btn')) {
                    cursorLabel.innerText = "GET_PDF";
                } else if (el.classList.contains('close-modal')) {
                    cursorLabel.innerText = "CLOSE";
                } else if (
                    el.classList.contains('card') || 
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

    // 3. SCROLL REVEAL OBSERVER & CLOCK
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .card').forEach(el => revealObserver.observe(el));

    const updateClock = () => {
        const clockEl = document.getElementById('digitalClock');
        if (clockEl) {
            clockEl.innerText = new Date().toLocaleTimeString('en-GB', { hour12: false });
        }
    };
    setInterval(updateClock, 1000);
    updateClock();

    // 4. MODAL LOGIC (ESC KEY & OUTSIDE CLICK SUPPORT)
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

    // Close on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target === designModal) closeModal(designModal);
        if (e.target === nativeModal) closeModal(nativeModal);
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(designModal);
            closeModal(nativeModal);
        }
    });
});
