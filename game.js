const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const teamSize = 11;
let redTeam = [];
let blueTeam = [];

function createTeams() {
    // Rozstawienie graczy w kolumnach
    for (let i = 0; i < teamSize; i++) {
        redTeam.push({
            x: canvas.width * 0.25,
            y: (i + 1) * (canvas.height / (teamSize + 1)),
            color: 'red',
            number: i + 1
        });

        blueTeam.push({
            x: canvas.width * 0.75,
            y: (i + 1) * (canvas.height / (teamSize + 1)),
            color: 'blue',
            number: i + 1
        });
    }
}

function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // tło boiska
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

    // punkt na środku
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();

    // bramki
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    // lewa bramka
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 - 50);
    ctx.lineTo(0, canvas.height / 2 + 50);
    ctx.stroke();

    // prawa bramka
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height / 2 - 50);
    ctx.lineTo(canvas.width, canvas.height / 2 + 50);
    ctx.stroke();
}

function drawPlayers(team) {
    team.forEach(player => {
        // kółko gracza
        ctx.beginPath();
        ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // numer gracza
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.number, player.x, player.y);
    });
}

function gameLoop() {
    drawField();
    drawPlayers(redTeam);
    drawPlayers(blueTeam);
    requestAnimationFrame(gameLoop);
}

// start
createTeams();
gameLoop();
