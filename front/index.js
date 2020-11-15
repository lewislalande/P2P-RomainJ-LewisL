const BACKGROUND_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

// const socket = io('https://localhost:3000');
const socket = io('https://sleepy-island-33889.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const screen = document.getElementById('screen');
const initialScreen = document.getElementById('initialScreen');
const startGameBtn = document.getElementById('startGameButton');
const enterGameBtn = document.getElementById('enterGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

startGameBtn.addEventListener('click', startGame);
enterGameBtn.addEventListener('click', enterGame);


function startGame() {
    socket.emit('startGame');
    init();
}

function enterGame() {
    const code = gameCodeInput.value;
    socket.emit('enterGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    screen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOR);
    paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, COLOR) {
    const snake = playerState.snake;

    ctx.fillStyle = COLOR;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);

    gameActive = false;

    if (data.winner === playerNumber) {
        alert("Vous avez gagné. Appuyez sur OK pour revenir à l'accueil");
        reset();
    } else {
        alert("Vous avez perdu. Appuyez sur OK pour revenir à l'accueil")
        reset();
    }
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
    reset();
    alert('Code inconnue')
}

function handleTooManyPlayers() {
    reset();
    alert('Cette partie est déjà commencée');
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    screen.style.display = "none";
}