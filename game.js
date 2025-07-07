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
    radius: 6,
    owner: null
};

let score = { red: 0, blue: 0 };
let startingTeam = Math.random() < 0.5 ? 'red' : 'blue';
let gameStarted = false;

function createTeams() {
    redTeam = [];
    blueTeam = [];

    redTeam.push({ x: 50, y: canvas.height / 2, color: 'red', number: 1, role: 'GK' });
    let redDefY = [100, 200, 300, 400];
    for (let i = 0; i < 4; i++)
        redTeam.push({ x: 150, y: redDefY[i], color: 'red', number: i + 2, role: 'DEF' });

    let redMidY = [80, 180, 320, 420];
    for (let i = 0; i < 4; i++)
        redTeam.push({ x: 300, y: redMidY[i], color: 'red', number: i + 6, role: 'MID' });

    redTeam.push({ x: 450, y: 180, color: 'red', number: 10, role: 'ATT' });
    redTeam.push({ x: 450, y: 320, color: 'red', number: 11, role: 'ATT' });

    blueTeam.push({ x: canvas.width - 50, y: canvas.height / 2, color: 'blue', number: 1, role: 'GK' });
    let blueDefY = [100, 200, 300, 400];
    for (let i = 0; i < 4; i++)
        blueTeam.push({ x: canvas.width - 150, y: blueDefY[i], color: 'blue', number: i + 2, role: 'DEF' });

    let blueMidY = [130, 250, 370];
    for (let i = 0; i < 3; i++)
        blueTeam.push({ x: canvas.width - 300, y: blueMidY[i], color: 'blue', number: i + 6, role: 'MID' });

    blueTeam.push({ x: canvas.width - 450, y: 100, color: 'blue', number: 9, role: 'ATT' });
    blueTeam.push({ x: canvas.width - 450, y: 250, color: 'blue', number: 10, role: 'ATT' });
    blueTeam.push({ x: canvas.width - 450, y: 400, color: 'blue', number: 11, role: 'ATT' });
}

function startGame() {
    createTeams();
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    ball.owner = null;

    if (startingTeam === 'red') {
        ball.owner = redTeam.find(p => p.role === 'MID');
    } else {
        ball.owner = blueTeam.find(p => p.role === 'MID');
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

function avoidOverlap(players) {
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            let p1 = players[i];
            let p2 = players[j];
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 10 && dist > 0) {
                let overlap = 10 - dist;
                let ox = (dx / dist) * (overlap / 2);
                let oy = (dy / dist) * (overlap / 2);
                p1.x -= ox;
                p1.y -= oy;
                p2.x += ox;
                p2.y += oy;
            }
        }
    }
}

function updatePlayerAI(team, opponentTeam, opponentGoalX) {
    team.forEach(player => {
        if (ball.owner === player) {
            let nearestMate = team
                .filter(p => p !== player)
                .sort((a, b) => distance(a, ball) - distance(b, ball))[0];

            if ((opponentGoalX < canvas.width / 2 && ball.x < 200) ||
                (opponentGoalX > canvas.width / 2 && ball.x > canvas.width - 200)) {
                let tx = opponentGoalX - ball.x;
                let ty = (canvas.height / 2) - ball.y;
                let tDist = Math.sqrt(tx * tx + ty * ty);
                ball.vx = (tx / tDist) * 5;
                ball.vy = (ty / tDist) * 5;
                ball.owner = null;
            } else {
                let dx = nearestMate.x - ball.x;
                let dy = nearestMate.y - ball.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                ball.vx = (dx / d) * 4;
                ball.vy = (dy / d) * 4;
                ball.owner = null;
            }
        } else {
            let d = distance(player, ball);
            if (d < 15 && ball.owner !== player) {
                ball.owner = player;
                ball.vx = 0;
                ball.vy = 0;
            } else {
                let target = ball.owner ? ball.owner : ball;
                let dx = target.x - player.x;
                let dy = target.y - player.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let speed = (player.role === 'GK') ? 1 : 1.5;
                player.x += (dx / dist) * speed;
                player.y += (dy / dist) * speed;
            }
        }
    });
}

function updateBall() {
    if (!ball.owner) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.96;
        ball.vy *= 0.96;

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
        updatePlayerAI(redTeam, blueTeam, canvas.width);
        updatePlayerAI(blueTeam, redTeam, 0);
        avoidOverlap(redTeam.concat(blueTeam));
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
