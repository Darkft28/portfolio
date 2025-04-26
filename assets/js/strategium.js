// Strategium - Adaptation JavaScript du jeu Python original
// Code généré par une IA à partir du code Python original de Baptiste Nuytten

class Game {
    constructor(size) {
        this.size = size;
        this.board = Array(size).fill().map(() => Array(size).fill('0'));
        this.currentPlayer = 1;
        this.selected = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.initializeBoard();
    }

    initializeBoard() {
        // Placement des reines
        this.board[0][this.size - 1] = '1';  // Reine joueur 1
        this.board[this.size - 1][0] = '3';  // Reine joueur 2

        // Placement des pions
        const totalPieces = Math.floor((this.size ** 2) / 4) - 1;
        this.fillAreaWithPieces([0, this.size - 1], totalPieces, '2');  // Pions joueur 1
        this.fillAreaWithPieces([this.size - 1, 0], totalPieces, '4');  // Pions joueur 2
    }

    fillAreaWithPieces(startPosition, totalPieces, pieceType) {
        let [x, y] = startPosition;
        let layer = 1;
        let placedPieces = 0;

        while (placedPieces < totalPieces) {
            for (let i = x - layer; i <= x + layer; i++) {
                for (let j = y - layer; j <= y + layer; j++) {
                    if (i >= 0 && i < this.size && j >= 0 && j < this.size && this.board[i][j] === '0') {
                        this.board[i][j] = pieceType;
                        placedPieces++;
                        if (placedPieces === totalPieces) {
                            return;
                        }
                    }
                }
            }
            layer++;
        }
    }

    getValidMoves(pieceType, startPos) {
        const [y, x] = startPos;
        let directions = [];

        if (pieceType === '1' || pieceType === '3') {  // Reines
            directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]];
        } else if (pieceType === '2' || pieceType === '4') {  // Pions
            directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        }

        const validMoves = [];

        for (const [dy, dx] of directions) {
            let ny = y + dy;
            let nx = x + dx;

            while (ny >= 0 && ny < this.size && nx >= 0 && nx < this.size && this.board[ny][nx] === '0') {
                validMoves.push([ny, nx]);
                ny += dy;
                nx += dx;
            }
        }

        return validMoves;
    }

    movePiece(startY, startX, endY, endX) {
        const piece = this.board[startY][startX];
        this.board[startY][startX] = '0';
        this.board[endY][endX] = piece;

        // Vérifier les captures après déplacement
        this.checkAndCapture(this.currentPlayer);

        // Vérifier la victoire
        if (this.checkVictory()) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }
    }

    checkAndCapture(player) {
        const queenType = player === 1 ? '1' : '3';
        const opponentPawn = player === 1 ? '4' : '2';
        
        // Trouver la position de la reine du joueur actuel
        let queenPos = null;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === queenType) {
                    queenPos = [i, j];
                    break;
                }
            }
            if (queenPos) break;
        }

        const [qy, qx] = queenPos;

        // Vérifier les possibilités de capture en rectangle
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                // Vérifier si c'est une tour du joueur courant
                if ((this.board[i][j] === '2' && player === 1) || (this.board[i][j] === '4' && player === 2)) {
                    const [ty, tx] = [i, j];
                    
                    // Si la tour n'est pas sur la même ligne ni colonne que la reine
                    if (ty !== qy && tx !== qx) {
                        const corners = [[qy, tx], [ty, qx]]; // Les coins du rectangle
                        
                        for (const [cy, cx] of corners) {
                            if (cy >= 0 && cy < this.size && cx >= 0 && cx < this.size) {
                                if (this.board[cy][cx] === opponentPawn) {
                                    this.board[cy][cx] = '0'; // Capture
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    checkVictory() {
        let player1Pieces = 0;
        let player2Pieces = 0;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === '1' || this.board[i][j] === '2') {
                    player1Pieces++;
                } else if (this.board[i][j] === '3' || this.board[i][j] === '4') {
                    player2Pieces++;
                }
            }
        }

        return player1Pieces <= 1 || player2Pieces <= 1;
    }

    reset() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill('0'));
        this.currentPlayer = 1;
        this.selected = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.initializeBoard();
    }
}

// Cette fonction sera appelée quand le DOM sera chargé
function initStrategium() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const resetButton = document.getElementById('resetButton');
    const playerLabel = document.getElementById('playerLabel');
    const sizeSelector = document.getElementById('sizeSelector');
    const startButton = document.getElementById('startButton');
    const rulesButton = document.getElementById('rulesButton');
    const rulesModal = document.getElementById('rulesModal');
    const closeRules = document.getElementById('closeRules');
    const gameOverModal = document.getElementById('gameOverModal');
    const winnerSpan = document.getElementById('winner');
    const playAgainButton = document.getElementById('playAgain');
    const closeModal = document.getElementById('closeModal');

    let game = null;
    let cellSize = 0;

    // Initialiser le jeu avec la taille sélectionnée
    function initGame() {
        const size = parseInt(sizeSelector.value);
        game = new Game(size);
        cellSize = Math.floor(canvas.width / size);
        drawBoard();
        updatePlayerLabel();
        document.getElementById('gameContainer').style.display = 'block';
        document.getElementById('startContainer').style.display = 'none';
    }

    // Mettre à jour l'affichage du joueur actuel
    function updatePlayerLabel() {
        playerLabel.textContent = `Joueur ${game.currentPlayer}`;
        playerLabel.style.color = game.currentPlayer === 1 ? '#2563eb' : '#ef4444';
    }

    // Dessiner le plateau et les pièces
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dessiner le quadrillage
        for (let i = 0; i < game.size; i++) {
            for (let j = 0; j < game.size; j++) {
                const x = j * cellSize;
                const y = i * cellSize;
                
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(x, y, cellSize, cellSize);
                ctx.strokeStyle = '#94a3b8';
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }

        // Mettre en évidence les mouvements valides
        if (game.validMoves.length > 0) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
            for (const [y, x] of game.validMoves) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }

        // Mettre en évidence la pièce sélectionnée
        if (game.selected) {
            const [y, x] = game.selected;
            ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }

        // Dessiner les pièces
        for (let i = 0; i < game.size; i++) {
            for (let j = 0; j < game.size; j++) {
                const x = j * cellSize + cellSize / 2;
                const y = i * cellSize + cellSize / 2;
                const piece = game.board[i][j];
                
                if (piece !== '0') {
                    ctx.beginPath();
                    ctx.arc(x, y, cellSize * 0.4, 0, Math.PI * 2);
                    
                    // Couleurs selon le type de pièce
                    if (piece === '1') {        // Reine joueur 1
                        ctx.fillStyle = '#2563eb';
                    } else if (piece === '2') { // Pion joueur 1
                        ctx.fillStyle = '#93c5fd';
                    } else if (piece === '3') { // Reine joueur 2
                        ctx.fillStyle = '#ef4444';
                    } else if (piece === '4') { // Pion joueur 2
                        ctx.fillStyle = '#fca5a5';
                    }
                    
                    ctx.fill();
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    // Fonction pour gérer le clic sur le plateau
    function handleClick(event) {
        if (game.gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);

        if (x >= 0 && x < game.size && y >= 0 && y < game.size) {
            const piece = game.board[y][x];
            
            // Si aucune pièce n'est sélectionnée et qu'on clique sur une pièce du joueur actuel
            if (!game.selected && piece !== '0' && 
                ((game.currentPlayer === 1 && (piece === '1' || piece === '2')) || 
                 (game.currentPlayer === 2 && (piece === '3' || piece === '4')))) {
                
                game.selected = [y, x];
                game.validMoves = game.getValidMoves(piece, [y, x]);
                drawBoard();
            } 
            // Si une pièce est déjà sélectionnée et qu'on clique sur une case vide
            else if (game.selected) {
                const [sy, sx] = game.selected;
                
                // Vérifier si le mouvement est valide
                const isValidMove = game.validMoves.some(([my, mx]) => my === y && mx === x);
                
                if (isValidMove) {
                    game.movePiece(sy, sx, y, x);
                    game.selected = null;
                    game.validMoves = [];
                    
                    if (game.gameOver) {
                        showGameOver();
                    }
                    
                    updatePlayerLabel();
                } else {
                    // Annuler la sélection si on clique ailleurs
                    game.selected = null;
                    game.validMoves = [];
                }
                
                drawBoard();
            }
        }
    }

    // Afficher la modal de fin de jeu
    function showGameOver() {
        winnerSpan.textContent = game.winner;
        winnerSpan.style.color = game.winner === 1 ? '#2563eb' : '#ef4444';
        gameOverModal.style.display = 'flex';
    }

    // Événement pour le clic sur le plateau
    canvas.addEventListener('click', handleClick);

    // Événement pour le bouton de réinitialisation
    resetButton.addEventListener('click', function() {
        game.reset();
        drawBoard();
        updatePlayerLabel();
    });

    // Événement pour le bouton de démarrage
    startButton.addEventListener('click', initGame);

    // Événements pour les règles
    rulesButton.addEventListener('click', function() {
        rulesModal.style.display = 'flex';
    });

    closeRules.addEventListener('click', function() {
        rulesModal.style.display = 'none';
    });

    // Événements pour la modal de fin de jeu
    playAgainButton.addEventListener('click', function() {
        game.reset();
        drawBoard();
        updatePlayerLabel();
        gameOverModal.style.display = 'none';
    });

    closeModal.addEventListener('click', function() {
        gameOverModal.style.display = 'none';
    });

    // Fermer les modals si on clique en dehors
    window.addEventListener('click', function(event) {
        if (event.target === rulesModal) {
            rulesModal.style.display = 'none';
        }
        if (event.target === gameOverModal) {
            gameOverModal.style.display = 'none';
        }
    });
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', initStrategium);