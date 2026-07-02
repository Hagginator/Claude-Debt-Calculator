/* =========================================
   Debt Manager — confetti.js
   A small, dependency-free confetti burst
   celebrating when a debt hits £0.
========================================= */

function celebrateDebtPaidOff() {

    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.remove("hidden");

    const colors = ["#C4F000", "#00A650", "#00786A", "#F2F5F1", "#FFB800"];

    const particles = Array.from({ length: 140 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.4,
        size: 6 + Math.random() * 6,
        speedY: 2.5 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const duration = 3200;
    const startTime = performance.now();

    function frame(now) {

        const elapsed = now - startTime;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });

        if (elapsed < duration) {
            requestAnimationFrame(frame);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.classList.add("hidden");
        }
    }

    requestAnimationFrame(frame);
}
