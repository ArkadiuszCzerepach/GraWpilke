const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const teamSize = 11;
let redTeam = [];
let blueTeam = [];

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    radius: 6
};

function createTeams() {
    // Czerwona drużyna: 4-4-2
    redTeam.push({ x: 50, y: canvas.height / 2, color: 'red', number: 1, role: 'GK' }); // bramkarz

    let defendersY = [100, 200, 300, 400];
    for (let i = 0; i < 4; i++) {
        redTeam.push({ x: 150, y: defendersY[i], color: 'red', number: i + 2, role: 'DEF' });
    }

    let midfieldersY = [80, 180, 320, 420];
    for (let i = 0; i < 4; i++) {
        redTeam.push({ x: 300, y: midfieldersY[i], color: 'red', number: i + 6, role: 'MID' });
    }

    redTeam.push({ x: 450, y: 180, color: 'red', number: 10, role: 'ATT' });
    redTeam.push({ x: 450, y: 320, color: 'red', number: 11, role: 'ATT' });

    // Niebieska drużyna: 4-3-3
    blueTeam.push({ x: canvas.width - 50, y: canvas.height / 2, color: 'blue', number: 1, role: 'GK' });

    let blueDefY = [100, 200, 300, 400];
    for (let i = 0; i < 4; i++) {
        blueTeam.push({ x: canvas.width - 150, y: blueDefY[i], color: 'blue', number: i + 2, role: 'DEF' });
    }

    let blueMidY = [130, 250, 370];
    for (let i = 0; i < 3; i++) {
        blueTeam.push({ x: canvas.width - 300, y: blueMidY[i], color: 'blue', number: i + 6, role: 'MID' });
    }

    blueTeam.push({ x: canvas.width - 450, y: 100, color: 'blue', number: 9, role: 'ATT' });
    blueTeam.push({ x: canvas.width - 450, y: 250, color: 'blue', number: 10, role: 'ATT' });
    blueTeam.push({ x: canvas.width - 450, y: 400, color: 'blue', number: 11, role: 'ATT' });
}

function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 - 50);
    ctx.lineTo(0, canvas.height / 2 + 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height / 2 - 50);
    ctx.lineTo(canvas.width, canvas.height / 2 + 50);
    ctx.stroke();
}

function drawPlayers(team) {
    team.forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.number, player.x, player.y);
    });
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // opór powietrza
    ball.vx *= 0.98;
    ball.vy *= 0.98;

    // ograniczenia boiska
    if (ball.x < ball.radius) { ball.x = ball.radius; ball.vx *= -0.5; }
    if (ball.x > canvas.width - ball.radius) { ball.x = canvas.width - ball.radius; ball.vx *= -0.5; }
    if (ball.y < ball.radius) { ball.y = ball.radius; ball.vy *= -0.5; }
    if (ball.y > canvas.height - ball.radius) { ball.y = canvas.height - ball.radius; ball.vy *= -0.5; }
}

function updatePlayerAI(team, opponentGoalX) {
    team.forEach(player => {
        let dx = ball.x - player.x;
        let dy = ball.y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let speed = 1.5;

        // role ograniczają ruch
        if (player.role === 'GK') {
            // bramkarz porusza się tylko w swojej strefie bramkowej
            if (Math.abs(player.x - (opponentGoalX < canvas.width/2 ? 50 : canvas.width - 50)) < 100) {
                player.x += (dx / distance) * 0.5;
                player.y += (dy / distance) * 0.5;
            }
        } else if (player.role === 'DEF') {
            // obrońcy nie wychodzą ze swojej połowy
            if ((opponentGoalX < canvas.width/2 && player.x < canvas.width / 2) ||
                (opponentGoalX > canvas.width/2 && player.x > canvas.width / 2)) {
                player.x += (dx / distance) * speed;
                player.y += (dy / distance) * speed;
            }
        } else if (player.role === 'ATT') {
            // napastnicy trzymają się raczej ataku
            if ((opponentGoalX < canvas.width/2 && player.x > canvas.width / 4) ||
                (opponentGoalX > canvas.width/2 && player.x < canvas.width * 3/4)) {
                player.x += (dx / distance) * speed;
                player.y += (dy / distance) * speed;
            }
        } else {
            // pomocnicy biegają wszędzie
            player.x += (dx / distance) * speed;
            player.y += (dy / distance) * speed;
        }

        // jeśli dotknie piłki, kopie w stronę bramki przeciwnika
        if (distance < 14) {
            let tx = opponentGoalX - ball.x;
            let ty = (canvas.height / 2) - ball.y;
            let tDist = Math.sqrt(tx * tx + ty * ty);
            ball.vx += (tx / tDist) * 3;
            ball.vy += (ty / tDist) * 3;
        }
    });
}

function gameLoop() {
    updateBall();
    updatePlayerAI(redTeam, canvas.width);
    updatePlayerAI(blueTeam, 0);

    drawField();
    drawPlayers(redTeam);
    drawPlayers(blueTeam);
    drawBall();

    requestAnimationFrame(gameLoop);
}

createTeams();
gameLoop();

