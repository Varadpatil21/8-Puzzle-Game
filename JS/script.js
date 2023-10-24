document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("puzzle-board");
    const successMessage = document.getElementById("success-message");
    const moveCount = document.getElementById("move-count");
    const goalboard = document.getElementById("goal-matrix");
    const hintButton = document.getElementById("btn");

    let movecount = 0;
    let start = getMatrixFromPrompt("Enter the Start Matrix (e.g., 1,2,3,4,5,6,7,8,):");
    let goal = getMatrixFromPrompt("Enter the Goal Matrix (e.g., 1,2,3,4,5,6,7,8,):");

    createTiles(start);
    createTilesg(goal);

    board.addEventListener("click", handleTileClick);
    hintButton.addEventListener("click", provideHint);

    function getMatrixFromPrompt(promptText) {
        const input = prompt(promptText);
        const values = input.split(",").map(value => (value.trim() === "") ? "" : parseInt(value));
        const matrix = [];
        for (let i = 0; i < 3; i++) {
            const row = values.slice(i * 3, i * 3 + 3);
            matrix.push(row);
        }
        return matrix;
    }

    function provideHint() {
        const childStates = generateChildStates(start);
        const hValues = childStates.map(childState => {
            const h = calculateH(childState.state, goal);
            return { h, move: childState.move };
        });

        const minH = Math.min(...hValues.map(item => item.h));
        const minHMove = hValues.find(item => item.h === minH)?.move;

        if (minHMove) {
            alert(`Recommended move: ${minHMove}`);
        } else {
            alert("No hints available. You might have reached a local minimum.");
        }
    }

    function generateChildStates(state) {
        const childStates = [];
        const emptyTile = findEmptyTile(state);

        if (emptyTile) {
            const row = emptyTile.row;
            const col = emptyTile.col;

            const moves = [
                { row: -1, col: 0, move: 'up' },
                { row: 1, col: 0, move: 'down' },
                { row: 0, col: -1, move: 'left' },
                { row: 0, col: 1, move: 'right' },
            ];

            for (const move of moves) {
                const newRow = row + move.row;
                const newCol = col + move.col;

                if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
                    if (canTileMove(newRow, newCol)) {
                        const childState = [...state.map(row => [...row])];
                        [childState[row][col], childState[newRow][newCol]] = [childState[newRow][newCol], childState[row][col]];
                        childStates.push({ state: childState, move: move.move });
                    }
                }
            }
        } else {
            console.error("Empty tile not found in state:", state);
        }

        return childStates;
    }

    function createTiles(matrix) {
        board.innerHTML = "";
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.textContent = matrix[i][j];
                tile.setAttribute("data-row", i);
                tile.setAttribute("data-col", j);
                board.appendChild(tile);
            }
        }
    }

    function createTilesg(matrix) {
        goalboard.innerHTML = "";
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.textContent = matrix[i][j];
                goalboard.appendChild(tile);
            }
        }
    }

    function handleTileClick(event) {
        const clickedTile = event.target;
        const row = Number(clickedTile.getAttribute("data-row"));
        const col = Number(clickedTile.getAttribute("data-col"));
        let childs = generateChildStates(start);
        const hValues = childs.map(childState => {
            const h = calculateH(childState.state, goal);
            return { h, move: childState.move };
        });

        const minH = Math.min(...hValues);
        if (canTileMove(row, col)) {
            moveTile(row, col);
            createTiles(start);
            checkSuccess();
        }
    }

    function canTileMove(row, col) {
        const emptyRowCol = findEmptyTile();
        return (
            (Math.abs(row - emptyRowCol.row) === 1 && col === emptyRowCol.col) ||
            (Math.abs(col - emptyRowCol.col) === 1 && row === emptyRowCol.row)
        );
    }

    function moveTile(row, col) {
        const emptyRowCol = findEmptyTile();
        start[emptyRowCol.row][emptyRowCol.col] = start[row][col];
        start[row][col] = "";
        movecount++;
        moveCount.textContent = movecount;
    }

    function findEmptyTile() {
        for (let i = 0; i < start.length; i++) {
            for (let j = 0; j < start[i].length; j++) {
                if (start[i][j] === "") {
                    return { row: i, col: j };
                }
            }
        }
    }

    function checkSuccess() {
        const isSolved = JSON.stringify(start) === JSON.stringify(goal);
        if (isSolved) {
            successMessage.textContent = "Puzzle Solved!";
        }
    }
});

function calculateH(state, goal) {
    let h = 0;
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
            if (state[i][j] !== goal[i][j]) {
                h++;
            }
        }
    }
    return h;
}

