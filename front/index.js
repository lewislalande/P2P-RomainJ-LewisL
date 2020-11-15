const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

//Connection à la socket
const socket = io('https://sleepy-island-33889.herokuapp.com/');

//Recupération des données envoyé par le socket
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

//Recupération des données lié au element du code HTML
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

//Recupération des données des bouton de partie
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;
// Initialisation de l'écran de partie
function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

//Récupération des données emise par les touches du clavier
function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

//Coloration de la grille de la partie
function paintGame(state) {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, 'red');
}

//Coloration des serpents
function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

//Les fonctions suivantes s'occupent des gérer les données emise par le socket
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


//Fonction pour revenir a une configuration vierge
function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}