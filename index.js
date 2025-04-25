const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('#statusText');
const restartButton = document.querySelector('#restartBtn');
const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
let options = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";
let running = false;

initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    restartButton.addEventListener('click', restartGame);
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
}

function cellClicked(){
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] !== "" || !running) {
        return;
    }
    updateCell(this, cellIndex);

    checkWinner();
}

function updateCell(cell, index){
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function changePlayer() {
    if (!running) return; // Stop if the game is over

    currentPlayer = (currentPlayer === "X") ? "O" : "X";

    if (currentPlayer === "O" && running) {
        setTimeout(getBestMove, 200); // AI makes its move with a slight delay
    } else {
        statusText.textContent = `${currentPlayer}'s turn`;
    }
}

function checkWinner() {
    let roundWon = false;

    for (let i = 0; i < winConditions.length; i++) {
        const condition = winConditions[i];
        const cellA = options[condition[0]];
        const cellB = options[condition[1]];
        const cellC = options[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }
        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} wins!`;
        running = false; // Stop the game
    } else if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        running = false; // Stop the game
    } else if (running) {
        changePlayer(); // Continue the game
    }
}

function restartGame(){
    currentPlayer = "X";
    options = ["", "", "", "", "", "", "", "", ""];
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
    cells.forEach(cell => {
        cell.textContent = "";
    });
    running = true;
}

//Alpha Beta Pruning Algorithm

function getBestMove() {
    if (!running) return; // Stop if the game is over

    // Introduce randomness: 20% chance to make a random move
    const makeRandomMove = Math.random() < 0.2;

    if (makeRandomMove) {
        // Make a random move
        let availableMoves = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i] === "") {
                availableMoves.push(i);
            }
        }
        const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        options[randomMove] = "O";
        cells[randomMove].textContent = "O";
        checkWinner();
        return;
    }

    // Otherwise, make the best move using Minimax
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < options.length; i++) {
        if (options[i] === "") {
            options[i] = "O"; // AI's move
            let score = minimax(options, 0, false, -Infinity, Infinity);
            options[i] = ""; // Undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    // Make the best move
    options[move] = "O";
    cells[move].textContent = "O";
    checkWinner(); // Check for winner
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    let winner = checkWinnerForMinimax();
    if (winner !== null){
        if(winner === "O") return 10 - depth; // AI wins
        if(winner === "X") return depth - 10; // Human wins
        return 0; // Draw
    }

    if(isMaximizing){
        let maxEval = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let eval = minimax(board, depth + 1, false, alpha, beta);
                board[i] = "";
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break; // Prune
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let eval = minimax(board, depth + 1, true, alpha, beta);
                board[i] = "";
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break; // Prune
            }
        }
        return minEval;
    }
}

function checkWinnerForMinimax() {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (options[a] && options[a] === options[b] && options[a] === options[c]) {
            return options[a];
        }
    }
    return options.includes("") ? null : "Draw";
}
