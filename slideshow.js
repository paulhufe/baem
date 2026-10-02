// Photo slideshows: arrows, swipe or arrow keys move between photos.
// With data-autoplay="5000" the photos also change on their own every 5 seconds. This pauses while the
// mouse is over the photo or it has keyboard focus, stops when "Pause" is pressed, and is off for
// visitors whose device asks for reduced motion.
document.querySelectorAll('.slideshow').forEach(function (show) {
    const slides = show.querySelectorAll('.slide');
    if (slides.length < 2) return;
    const caption = show.querySelector('.slide-caption');
    const count = show.querySelector('.slide-count');
    const prev = show.querySelector('.slide-prev');
    const next = show.querySelector('.slide-next');
    const pauseButton = show.querySelector('.slide-pause');
    const delay = parseInt(show.dataset.autoplay || '0', 10);
    let current = 0;
    let timer = null;
    let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let holding = false;

    function showSlide(i) {
        current = (i + slides.length) % slides.length;
        slides.forEach(function (slide, k) { slide.hidden = (k !== current); });
        slides[(current + 1) % slides.length].loading = 'eager';  // fetch the next photo in advance
        caption.textContent = slides[current].dataset.caption;
        count.textContent = '(' + (current + 1) + ' / ' + slides.length + ')';
    }

    function restartTimer() {
        clearInterval(timer);
        timer = null;
        if (delay && !paused && !holding) {
            timer = setInterval(function () { showSlide(current + 1); }, delay);
        }
    }

    function updatePauseButton() {
        pauseButton.textContent = paused ? '▶ Play' : '❚❚ Pause';
        pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    }

    prev.hidden = false;
    next.hidden = false;
    count.hidden = false;
    prev.addEventListener('click', function () { showSlide(current - 1); restartTimer(); });
    next.addEventListener('click', function () { showSlide(current + 1); restartTimer(); });
    show.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { showSlide(current - 1); restartTimer(); }
        if (e.key === 'ArrowRight') { showSlide(current + 1); restartTimer(); }
    });
    let startX = null;
    show.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', function (e) {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) { showSlide(current + (dx < 0 ? 1 : -1)); restartTimer(); }
        startX = null;
    });

    if (delay && pauseButton) {
        pauseButton.hidden = false;
        updatePauseButton();
        pauseButton.addEventListener('click', function () {
            paused = !paused;
            updatePauseButton();
            restartTimer();
        });
        const frame = show.querySelector('.slide-frame');
        frame.addEventListener('mouseenter', function () { holding = true; restartTimer(); });
        frame.addEventListener('mouseleave', function () { holding = false; restartTimer(); });
        show.addEventListener('focusin', function (e) {
            if (e.target.matches(':focus-visible')) { holding = true; restartTimer(); }
        });
        show.addEventListener('focusout', function () { holding = false; restartTimer(); });
    }

    showSlide(0);
    restartTimer();
});
