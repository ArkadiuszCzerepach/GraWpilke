const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let redTeam = [];
let blueTeam = [];

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    radius: 6,
    owner: null
};

let score = { red: 0, blue: 0 };
let startingTeam = Math.random() < 0.5 ? 'red' : 'blue';
let gameStarted = false;

function createTeams() {
    redTeam = [
        { x: 150, y: 200, color: 'red', number: 2, role: 'DEF' },
        { x: 150, y: 400, color: 'red', number: 3, role: 'DEF' },
        { x: 300, y: 300, color: 'red', number: 6, role: 'MID' },
        { x: 450, y: 300, color: 'red', number: 10, role: 'ATT' }
    ];

    blueTeam = [
        { x: canvas.width - 150, y: 200, color: 'blue', number: 2, role: 'DEF' },
        { x: canvas.width - 150, y: 400, color: 'blue', number: 3, role: 'DEF' },
        { x: canvas.width - 300, y: 300, color: 'blue', number: 6, role: 'MID' },
        { x: canvas.width - 450, y: 300, color: 'blue', number: 10, role: 'ATT' }
    ];
}

function startGame() {
    createTeams();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    ball.owner = null;

    if (startingTeam === 'red') {
        ball.owner = redTeam[2]; // pomocnik
    } else {
        ball.owner = blueTeam[2];
    }
    gameStarted = true;
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

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Red ${score.red} - ${score.blue} Blue`, canvas.width / 2, 30);
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function updatePlayerAI(team, opponentGoalX) {
    team.forEach(player => {
        if (ball.owner === player) {
            // szuka najbliższego kolegi w przód
            let matesAhead = team.filter(p => p !== player && ((team[0].color === 'red') ? p.x > player.x : p.x < player.x));
            let target = matesAhead.sort((a, b) => distance(a, player) - distance(b, player))[0];

            if (!target) { // brak kolegi przed sobą, strzela
                let tx = opponentGoalX - ball.x;
                let ty = (canvas.height / 2) - ball.y;
                let tDist = Math.sqrt(tx * tx + ty * ty);
                ball.vx = (tx / tDist) * 4;
                ball.vy = (ty / tDist) * 4;
                ball.owner = null;
            } else { // podaje
                let dx = target.x - ball.x;
                let dy = target.y - ball.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                ball.vx = (dx / d) * 3;
                ball.vy = (dy / d) * 3;
                ball.owner = null;
            }
        } else {
            // pilnuje swojego sektora i tylko biegnie do piłki gdy blisko
            let zoneX = {
                'DEF': (team[0].color === 'red') ? 100 : canvas.width - 100,
                'MID': (team[0].color === 'red') ? 300 : canvas.width - 300,
                'ATT': (team[0].color === 'red') ? 500 : canvas.width - 500
            }[player.role];

            let targetX = zoneX;
            let targetY = player.y;

            // jeśli piłka w zasięgu 50 px
            if (distance(player, ball) < 50) {
                targetX = ball.x;
                targetY = ball.y;
            }

            let dx = targetX - player.x;
            let dy = targetY - player.y;
            let dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            let speed = 1.5;

            player.x += (dx / dist) * speed;
            player.y += (dy / dist) * speed;
        }
    });
}

function updateBall() {
    if (!ball.owner) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        if (Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) < 0.1) {
            ball.vx = 0;
            ball.vy = 0;
        }

        // sprawdź przejęcie piłki
        [redTeam, blueTeam].flat().forEach(player => {
            if (distance(player, ball) < 10 && !ball.owner) {
                ball.owner = player;
                ball.vx = 0;
                ball.vy = 0;
            }
        });

        // ograniczenia boiska
        if (ball.x < ball.radius) ball.x = ball.radius;
        if (ball.x > canvas.width - ball.radius) ball.x = canvas.width - ball.radius;
        if (ball.y < ball.radius) ball.y = ball.radius;
        if (ball.y > canvas.height - ball.radius) ball.y = canvas.height - ball.radius;
    } else {
        ball.x = ball.owner.x;
        ball.y = ball.owner.y;
    }

    checkGoal();
}

function checkGoal() {
    if (ball.y > canvas.height / 2 - 50 && ball.y < canvas.height / 2 + 50) {
        if (ball.x < 2) {
            score.blue++;
            startingTeam = 'red';
            startGame();
        } else if (ball.x > canvas.width - 2) {
            score.red++;
            startingTeam = 'blue';
            startGame();
        }
    }
}

function gameLoop() {
    if (gameStarted) {
        updatePlayerAI(redTeam, canvas.width);
        updatePlayerAI(blueTeam, 0);
        updateBall();
    }

    drawField();
    drawPlayers(redTeam);
    drawPlayers(blueTeam);
    drawBall();
    drawScore();

    requestAnimationFrame(gameLoop);
}

startGame();
gameLoop();
