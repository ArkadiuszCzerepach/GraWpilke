const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // boisko
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // linie boiska
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2;

    // linia środkowa
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // koło środkowe
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // punkty na środku
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();
}

function gameLoop() {
    drawField();
    requestAnimationFrame(gameLoop);
}

gameLoop();
