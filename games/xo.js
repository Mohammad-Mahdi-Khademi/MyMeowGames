let firebasePromise = null;

function getFirebase() {
    if (!firebasePromise) {
        firebasePromise = Promise.all([
            import("../firebase-config.js"),
            import("https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js")
        ]).then(([config, database]) => {
            return {
                ...config,
                database
            };
        });
    }

    return firebasePromise;
}

const roomCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode() {
    let code = "";

    for (let i = 0; i < 8; i++) {
        code += roomCharacters[
            Math.floor(Math.random() * roomCharacters.length)
        ];
    }

    return code;
}

function getRoomCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("room")?.toUpperCase() || "";
}

function setRoomCodeInURL(roomCode) {
    const url = new URL(window.location.href);

    url.searchParams.set("game", "xo");
    url.searchParams.set("room", roomCode);

    window.history.replaceState({}, "", url);
}

function removeRoomCodeFromURL() {
    const url = new URL(window.location.href);

    url.searchParams.delete("room");
    url.searchParams.delete("game");

    window.history.replaceState({}, "", url);
}

function normalizeBoard(board) {
    return Array.from({ length: 9 }, (_, index) => board?.[index] || "");
}

function createBoardHTML(board, player, turn, status) {
    const cells = normalizeBoard(board).map((value, index) => {
        const disabled =
            value ||
            status !== "playing" ||
            turn !== player;

        return `
            <button
                class="xo-cell ${value ? `filled ${value.toLowerCase()}` : ""}"
                data-index="${index}"
                aria-label="Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}${value ? `: ${value}` : ": empty"}"
                ${disabled ? "disabled" : ""}
            >
                ${value}
            </button>
        `;
    }).join("");

    return cells;
}

function getGameMessage(room, player) {
    if (room.status === "waiting") {
        return "Waiting for another player...";
    }

    if (room.winner === "draw") {
        return "It's a draw!";
    }

    if (room.winner === "X" || room.winner === "O") {
        return room.winner === player
            ? "You won! 🎉"
            : "You lost!";
    }

    return room.turn === player
        ? "Your turn"
        : "Opponent's turn";
}

function getWinner(board) {
    const combinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of combinations) {
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== "")) {
        return "draw";
    }

    return null;
}

function renderXO(container, state) {
    const {
        roomCode,
        room,
        player,
        errorMessage,
        loading
    } = state;

    if (loading) {
        container.innerHTML = `
            <div class="panel">
                <div class="loading-spinner"></div>
                <h2>Connecting...</h2>
                <p>Please wait a moment.</p>
            </div>
        `;

        return;
    }

    if (errorMessage) {
        container.innerHTML = `
            <div class="panel">
                <h2>Something went wrong</h2>
                <p>${errorMessage}</p>
                <button class="secondary-btn" id="backButton">
                    Back to Games
                </button>
            </div>
        `;

        container
            .querySelector("#backButton")
            .addEventListener("click", () => {
                window.showGameSelection();
            });

        return;
    }

    if (!room) {
        container.innerHTML = `
            <div class="panel">
                <h2>❌⭕ XO</h2>
                <p>Play Tic-Tac-Toe with a friend online.</p>

                <div class="xo-actions">
                    <button class="primary-btn" id="createRoomButton">
                        Create Room
                    </button>

                    <div class="divider">
                        <span>OR</span>
                    </div>

                    <input
                        id="roomCodeInput"
                        class="text-input"
                        aria-label="Room code"
                        maxlength="8"
                        placeholder="Enter room code"
                        autocomplete="off"
                        spellcheck="false"
                    >

                    <button class="secondary-btn" id="joinRoomButton">
                        Join Room
                    </button>
                </div>

                <p id="xoStatus" class="status-text"></p>

                <button class="secondary-btn" id="backButton">
                    Back to Games
                </button>
            </div>
        `;

        const createButton =
            container.querySelector("#createRoomButton");

        const joinButton =
            container.querySelector("#joinRoomButton");

        const roomInput =
            container.querySelector("#roomCodeInput");

        const status =
            container.querySelector("#xoStatus");

        createButton.addEventListener("click", () => {
            createRoom(container, state);
        });

        joinButton.addEventListener("click", () => {
            joinRoom(container, state);
        });

        roomInput.addEventListener("input", () => {
            roomInput.value = roomInput.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
        });

        roomInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                joinRoom(container, state);
            }
        });

        container
            .querySelector("#backButton")
            .addEventListener("click", () => {
                window.showGameSelection();
            });

        return;
    }

    container.innerHTML = `
        <div class="panel xo-panel">
            <div class="xo-header">
                <div>
                    <h2>❌⭕ XO</h2>
                    <p>Room: <strong>${roomCode}</strong></p>
                </div>

                <button class="secondary-btn" id="copyRoomButton">
                    Copy Code
                </button>
            </div>

            <div class="xo-players">
                <div class="player-card ${player === "X" ? "active" : ""}">
                    <span>❌</span>
                    <strong>Player X</strong>
                </div>

                <div class="player-card ${player === "O" ? "active" : ""}">
                    <span>⭕</span>
                    <strong>Player O</strong>
                </div>
            </div>

            <p class="xo-status" role="status" aria-live="polite">
                ${getGameMessage(room, player)}
            </p>

            <div class="xo-board">
                ${createBoardHTML(
                    room.board,
                    player,
                    room.turn,
                    room.status
                )}
            </div>

            <div class="xo-controls">
                ${
                    room.winner && player === "X"
                        ? `
                            <button class="primary-btn" id="rematchButton">
                                Rematch
                            </button>
                        `
                        : ""
                }

                <button class="secondary-btn" id="leaveRoomButton">
                    Leave Room
                </button>
            </div>
        </div>
    `;

    container
        .querySelectorAll(".xo-cell")
        .forEach(cell => {
            cell.addEventListener("click", () => {
                makeMove(
                    container,
                    state,
                    Number(cell.dataset.index)
                );
            });
        });

    container
        .querySelector("#copyRoomButton")
        .addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(roomCode);

                const button =
                    container.querySelector("#copyRoomButton");

                button.textContent = "Copied!";

                setTimeout(() => {
                    button.textContent = "Copy Code";
                }, 1500);
            } catch (error) {
                console.error(error);
            }
        });

    container
        .querySelector("#leaveRoomButton")
        .addEventListener("click", () => {
            window.showGameSelection();
        });

    const rematchButton =
        container.querySelector("#rematchButton");

    if (rematchButton) {
        rematchButton.addEventListener("click", () => {
            rematch(container, state);
        });
    }
}

async function waitForFirebase() {
    const firebase = await getFirebase();
    const user = await firebase.authReady;

    return {
        ...firebase,
        user
    };
}

async function createRoom(container, state) {
    const button =
        container.querySelector("#createRoomButton");

    const status =
        container.querySelector("#xoStatus");

    if (button) {
        button.disabled = true;
        button.textContent = "Creating...";
    }

    if (status) {
        status.textContent = "Connecting to game server...";
    }

    try {
        const {
            db,
            user,
            database
        } = await waitForFirebase();

        const {
            ref,
            set,
            onValue,
            onDisconnect
        } = database;

        let roomCode = generateRoomCode();
        let roomRef = ref(db, `rooms/${roomCode}`);
        let snapshot = await database.get(roomRef);

        while (snapshot.exists()) {
            roomCode = generateRoomCode();
            roomRef = ref(db, `rooms/${roomCode}`);
            snapshot = await database.get(roomRef);
        }

        const room = {
            host: user.uid,
            status: "waiting",
            turn: "X",
            winner: null,
            board: Array(9).fill(""),
            players: {
                X: user.uid,
                O: null
            }
        };

        await set(roomRef, room);

        onDisconnect(
            ref(db, `rooms/${roomCode}/players/X`)
        ).remove();

        setRoomCodeInURL(roomCode);

        state.roomCode = roomCode;
        state.player = "X";
        state.room = room;

        watchRoom(container, state);
    } catch (error) {
        console.error(error);

        state.errorMessage =
            error?.message || "Could not create the room.";

        renderXO(container, state);
    }
}

async function joinRoom(container, state) {
    const input =
        container.querySelector("#roomCodeInput");

    const button =
        container.querySelector("#joinRoomButton");

    const status =
        container.querySelector("#xoStatus");

    const roomCode =
        input?.value.trim().toUpperCase();

    if (!roomCode || roomCode.length !== 8) {
        if (status) {
            status.textContent =
                "Please enter an 8-character room code.";
        }

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Joining...";
    }

    if (status) {
        status.textContent = "Connecting to game server...";
    }

    try {
        const {
            db,
            user,
            database
        } = await waitForFirebase();

        const {
            ref,
            get,
            update,
            onDisconnect
        } = database;

        const roomRef = ref(db, `rooms/${roomCode}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
            throw new Error("Room not found.");
        }

        const room = snapshot.val();

        if (room.status !== "waiting") {
            throw new Error("This room is already in use.");
        }

        if (room.players?.O) {
            throw new Error("This room is full.");
        }

        await update(roomRef, {
            "players/O": user.uid,
            status: "playing"
        });

        await onDisconnect(
            ref(db, `rooms/${roomCode}/players/O`)
        ).remove();

        setRoomCodeInURL(roomCode);

        state.roomCode = roomCode;
        state.player = "O";
        state.room = {
            ...room,
            status: "playing",
            players: {
                ...room.players,
                O: user.uid
            }
        };

        watchRoom(container, state);
    } catch (error) {
        console.error(error);

        state.errorMessage =
            error?.message || "Could not join the room.";

        renderXO(container, state);
    }
}

function watchRoom(container, state) {
    getFirebase()
        .then(firebase => {
            const {
                db,
                database
            } = {
                ...firebase,
                database: firebase.database
            };

            const roomRef =
                database.ref(db, `rooms/${state.roomCode}`);

            database.onValue(roomRef, snapshot => {
                if (!snapshot.exists()) {
                    state.room = null;
                    state.errorMessage = "Room no longer exists.";
                    renderXO(container, state);
                    return;
                }

                state.room = snapshot.val();
                renderXO(container, state);
            });
        })
        .catch(error => {
            console.error(error);

            state.errorMessage =
                error?.message || "Could not connect to the room.";

            renderXO(container, state);
        });
}

async function makeMove(container, state, index) {
    if (!state.room) {
        return;
    }

    if (state.room.status !== "playing") {
        return;
    }

    if (state.room.turn !== state.player) {
        return;
    }

    if (state.room.board[index]) {
        return;
    }

    try {
        const {
            db,
            database
        } = await waitForFirebase();

        const board = normalizeBoard(state.room.board);

        board[index] = state.player;

        const winner = getWinner(board);

        const nextTurn =
            state.player === "X" ? "O" : "X";

        const roomRef =
            database.ref(db, `rooms/${state.roomCode}`);

        await database.update(roomRef, {
            board,
            turn: winner ? state.player : nextTurn,
            winner: winner || null,
            status: winner ? "finished" : "playing"
        });
    } catch (error) {
        console.error(error);
    }
}

async function rematch(container, state) {
    if (!state.room) {
        return;
    }

    if (state.player !== "X") {
        return;
    }

    try {
        const {
            db,
            database
        } = await waitForFirebase();

        const roomRef =
            database.ref(db, `rooms/${state.roomCode}`);

        await database.update(roomRef, {
            board: Array(9).fill(""),
            turn: "X",
            winner: null,
            status: "playing"
        });
    } catch (error) {
        console.error(error);
    }
}

export function openXO(container) {
    const state = {
        roomCode: getRoomCodeFromURL(),
        room: null,
        player: null,
        errorMessage: null,
        loading: false
    };

    renderXO(container, state);

    if (state.roomCode) {
        state.loading = true;
        renderXO(container, state);

        joinExistingRoom(container, state);
    }
}

async function joinExistingRoom(container, state) {
    try {
        const {
            db,
            user,
            database
        } = await waitForFirebase();

        const {
            ref,
            get
        } = database;

        const roomRef =
            ref(db, `rooms/${state.roomCode}`);

        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
            removeRoomCodeFromURL();
            state.roomCode = "";
            state.loading = false;
            renderXO(container, state);
            return;
        }

        const room = snapshot.val();

        if (room.players?.X === user.uid) {
            state.player = "X";
        } else if (room.players?.O === user.uid) {
            state.player = "O";
        } else if (
            room.status === "waiting" &&
            !room.players?.O
        ) {
            await database.update(roomRef, {
                "players/O": user.uid,
                status: "playing"
            });

            state.player = "O";
        } else {
            throw new Error(
                "This room is not available for you."
            );
        }

        state.loading = false;
        state.room = room;

        watchRoom(container, state);
    } catch (error) {
        console.error(error);

        state.loading = false;
        state.errorMessage =
            error?.message || "Could not connect to the room.";

        renderXO(container, state);
    }
}