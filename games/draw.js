import { DrawingDeck, normalizeGuess } from "./drawing-deck.js";
import { DRAWING_PROMPTS, CATEGORY_ICONS } from "./drawing-words.js";

export async function openDraw(container) {
    container.innerHTML = `<div class="panel"><h2>Draw & Guess</h2><p>Connecting…</p></div>`;
    const [config, api] = await Promise.all([
        import("../firebase-config.js"),
        import("https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js")
    ]);
    const user = await config.authReady;
    if (!container.isConnected || !container.textContent.includes("Connecting")) return;
    const { ref, get, set, push, onValue, runTransaction } = api;
    const at = path => ref(config.db, path);
    let code = "", room = null, secret = null, deck = new DrawingDeck();
    let active = true, busy = false, secretRound = 0, unsub = [], roundUnsub = [];
    let strokes = {}, guesses = {}, results = {}, stroke = null, offset = 0, lastFlush = 0;
    const handled = new Set();
    const stopRound = () => { roundUnsub.splice(0).forEach(fn => fn()); };
    const cleanup = () => {
        active = false;
        unsub.splice(0).forEach(fn => fn()); stopRound(); clearInterval(timer);
        observer.disconnect();
    };
    const observer = new MutationObserver(() => { if (!container.querySelector(".draw-game")) cleanup(); });
    const base = () => `drawingRooms/${code}`;
    const roundBase = () => `${base()}/rounds/${room.state.round}`;
    const isDrawer = () => room?.state?.drawer === user.uid;
    const now = () => Date.now() + offset;
    const error = e => { if (active) container.querySelector("#drawError").textContent = e.message || String(e); };
    async function action(fn) {
        if (busy) return;
        busy = true;
        container.querySelector("#drawError").textContent = "";
        try { await fn(); } catch (e) { error(e); } finally { busy = false; }
    }

    container.innerHTML = `<div class="panel draw-game">
        <h2>Draw & Guess <span aria-hidden="true">🎨</span></h2>
        <p>${DRAWING_PROMPTS.length.toLocaleString()} prompts. Terrible drawings welcome.</p>
        <div id="drawLobby">
            <label>Your name<input id="drawName" class="text-input" maxlength="24" placeholder="Your name" autocomplete="nickname"></label>
            <button id="drawCreate" class="primary-btn">Create room</button>
            <label>Room code<input id="drawCode" class="text-input" maxlength="8" placeholder="8-letter code" autocomplete="off"></label>
            <button id="drawJoin" class="secondary-btn">Join room</button>
        </div>
        <div id="drawRoom" class="hidden">
            <p>Room <strong id="drawRoomCode"></strong> · <span id="drawConnection">Connecting…</span></p>
            <div id="drawPlayers" class="draw-players"></div>
            <p id="drawStatus" role="status"></p>
            <div id="drawWord" class="draw-word" aria-live="polite">Drawer's word: ????</div>
            <div class="draw-tools"><label>Ink <input id="drawColor" type="color" value="#202030"></label>
                <label>Brush <select id="drawSize"><option value="3">Fine</option><option value="7" selected>Medium</option><option value="16">Thick</option><option value="32">Extra thick</option></select></label>
                <button id="drawClear" class="secondary-btn">Clear canvas</button></div>
            <canvas id="drawCanvas" width="800" height="500" aria-label="Shared drawing canvas"></canvas>
            <form id="drawGuessForm" class="draw-guess"><input id="drawGuess" class="text-input" maxlength="100" placeholder="Type your guess" aria-label="Your guess" autocomplete="off"><button class="primary-btn">Guess</button></form>
            <ol id="drawGuesses" class="draw-guesses" aria-live="polite"></ol>
            <button id="drawStart" class="primary-btn">Start game · 2 turns each</button>
            <button id="drawNext" class="secondary-btn">Next round</button>
        </div>
        <p id="drawError" class="status-text" role="alert"></p>
        <button id="drawBack" class="secondary-btn">Back to Games</button>
    </div>`;
    const el = id => container.querySelector(`#${id}`);
    observer.observe(container, { childList: true });
    unsub.push(onValue(at(".info/serverTimeOffset"), snap => { offset = snap.val() || 0; }));
    unsub.push(onValue(at(".info/connected"), snap => {
        if (active) el("drawConnection").textContent = snap.val() ? "Connected" : "Reconnecting…";
    }));
    const timer = setInterval(() => { if (room) renderStatus(); }, 500);
    el("drawBack").onclick = () => { cleanup(); window.showGameSelection(); };

    async function enter(create) {
        const name = el("drawName").value.trim();
        if (!name) throw new Error("Enter your name first.");
        code = create ? Array.from(crypto.getRandomValues(new Uint8Array(8)), n => "ABCDEFGHJKLMNPQRSTUVWXYZ"[n % 23]).join("") : el("drawCode").value.trim().toUpperCase();
        if (!/^[A-Z]{8}$/.test(code)) throw new Error("Enter an 8-letter room code.");
        if (create) {
            await set(at(`${base()}/public`), { host: user.uid, players: { [user.uid]: name }, state: { phase: "waiting", round: 0 } });
        } else {
            const snapshot = await get(at(`${base()}/public`));
            if (!snapshot.exists()) throw new Error("Room not found.");
            const current = snapshot.val();
            if (!current.players?.[user.uid]) {
                if (current.state.phase !== "waiting") throw new Error("This game has already started.");
                if (Object.keys(current.players || {}).length >= 10) throw new Error("This room is full.");
                await set(at(`${base()}/public/players/${user.uid}`), name);
            }
        }
        el("drawLobby").classList.add("hidden"); el("drawRoom").classList.remove("hidden");
        el("drawRoomCode").textContent = code;
        unsub.push(onValue(at(`${base()}/public`), snap => {
            if (!active) return;
            const previous = room?.state?.round;
            room = snap.val();
            if (!room) { error(new Error("Room is no longer available.")); return; }
            renderPlayers(); renderStatus();
            if (room.state.round !== previous && room.state.phase === "drawing") watchRound();
        }, error));
    }
    el("drawCreate").onclick = () => action(() => enter(true));
    el("drawJoin").onclick = () => action(() => enter(false));
    el("drawStart").onclick = () => action(async () => {
        const order = Object.keys(room.players).sort();
        if (order.length < 2) throw new Error("Invite at least one friend first.");
        await runTransaction(at(`${base()}/public/state`), state => {
            if (state?.phase !== "waiting") return;
            return { phase: "drawing", round: 1, drawer: order[0], order, total: order.length * 2, deadline: now() + 90000 };
        });
    });
    el("drawNext").onclick = () => action(async () => {
        await runTransaction(at(`${base()}/public/state`), state => {
            if (state?.phase !== "drawing" || state.round !== room.state.round) return;
            if (state.drawer !== user.uid && now() < state.deadline) return;
            if (state.round >= state.total) return { ...state, phase: "finished" };
            return { ...state, round: state.round + 1, drawer: state.order[state.round % state.order.length], deadline: now() + 90000 };
        });
    });

    function renderStatus() {
        const state = room.state, drawing = state.phase === "drawing";
        const remaining = Math.max(0, Math.ceil((state.deadline - now()) / 1000));
        el("drawStart").classList.toggle("hidden", state.phase !== "waiting" || room.host !== user.uid);
        el("drawNext").classList.toggle("hidden", !drawing || (!isDrawer() && !(room.host === user.uid && remaining === 0)));
        el("drawNext").textContent = state.round >= state.total ? "Finish game" : "Next round";
        el("drawStatus").textContent = state.phase === "waiting" ? "Share the room code. Gather 2–10 players, then start." : state.phase === "finished" ? "Game finished! Create a new room to play again." : `Round ${state.round}/${state.total} · ${room.players[state.drawer] || "Player"} is drawing · ${remaining}s`;
        el("drawWord").textContent = drawing && isDrawer() && secret ? `Your word: ${CATEGORY_ICONS[secret.category]} ${secret.word.toUpperCase()} · ${secret.difficulty}` : "Drawer's word: ????";
        el("drawGuessForm").classList.toggle("hidden", !drawing || isDrawer());
        el("drawGuessForm").querySelector("button").disabled = remaining === 0 || !!results[user.uid];
        el("drawClear").disabled = !drawing || !isDrawer() || remaining === 0;
        el("drawCanvas").classList.toggle("can-draw", drawing && isDrawer() && remaining > 0);
    }
    function renderPlayers() {
        el("drawPlayers").replaceChildren(...Object.entries(room.players).map(([uid, name]) => {
            const item = document.createElement("span");
            const score = Object.values(room.scores || {}).filter(round => round[uid]).length * 100;
            item.textContent = `${uid === room.state.drawer ? "✏️ " : ""}${name}${uid === user.uid ? " (you)" : ""} · ${score}`;
            return item;
        }));
    }
    async function loadSecret(round) {
        try {
            const result = await runTransaction(at(`${base()}/usedWords`), history => {
                history ||= {};
                if (history.current?.round === round) return history;
                const selected = deck.next(history, user.uid);
                return { ...selected.history, current: { round, id: selected.prompt.id } };
            });
            if (!active || room.state.round !== round || !isDrawer()) return;
            secret = DRAWING_PROMPTS.find(p => p.id === result.snapshot.val()?.current?.id);
            secretRound = round; renderStatus(); processGuesses();
        } catch (e) { error(e); }
    }
    function watchRound() {
        stopRound(); secret = null; secretRound = 0; strokes = {}; guesses = {}; results = {}; stroke = null; handled.clear(); paint(); renderGuesses();
        const round = room.state.round, path = roundBase();
        if (isDrawer()) loadSecret(round);
        roundUnsub.push(onValue(at(`${path}/strokes`), snap => { strokes = snap.val() || {}; paint(); }, error));
        // Guesses are readable only by their author and the current drawer.
        // Even a correct guess never appears in another guesser's network data.
        const guessPath = isDrawer() ? `${path}/guesses` : `${path}/guesses/${user.uid}`;
        roundUnsub.push(onValue(at(guessPath), snap => {
            guesses = isDrawer() ? snap.val() || {} : { [user.uid]: snap.val() || {} };
            renderGuesses(); processGuesses();
        }, error));
        roundUnsub.push(onValue(at(`${base()}/public/scores/${round}`), snap => { results = snap.val() || {}; renderStatus(); renderGuesses(); }, error));
        renderStatus();
    }
    async function processGuesses() {
        if (!isDrawer() || !secret || secretRound !== room.state.round) return;
        const round = room.state.round;
        for (const [uid, entries] of Object.entries(guesses)) {
            if (results[uid]) continue;
            for (const [id, entry] of Object.entries(entries)) {
                if (handled.has(id)) continue;
                handled.add(id);
                if (normalizeGuess(entry.text) === normalizeGuess(secret.word)) {
                    try { await set(at(`${base()}/public/scores/${round}/${uid}`), true); }
                    catch (e) { handled.delete(id); error(e); }
                    break;
                }
            }
        }
    }
    function renderGuesses() {
        const entries = Object.entries(guesses).flatMap(([uid, values]) => Object.values(values).map(v => ({ ...v, uid })));
        entries.sort((a, b) => a.time - b.time);
        el("drawGuesses").replaceChildren(...entries.slice(-20).map(entry => {
            const item = document.createElement("li");
            item.textContent = `${room.players[entry.uid] || "Player"}: ${entry.text}${results[entry.uid] ? " ✓" : ""}`;
            return item;
        }));
    }
    el("drawGuessForm").onsubmit = event => {
        event.preventDefault();
        action(async () => {
            const text = el("drawGuess").value.trim();
            if (!text || isDrawer() || now() >= room.state.deadline) return;
            await push(at(`${roundBase()}/guesses/${user.uid}`), { text, time: now() });
            el("drawGuess").value = "";
        });
    };
    const canvas = el("drawCanvas"), context = canvas.getContext("2d");
    function paint() {
        context.fillStyle = "#ffffff"; context.fillRect(0, 0, 800, 500);
        for (const line of [...Object.values(strokes), ...(stroke ? [stroke] : [])]) {
            const points = line.points;
            if (!Array.isArray(points) || !points.length) continue;
            context.strokeStyle = line.color; context.fillStyle = line.color; context.lineWidth = line.size;
            context.lineCap = "round"; context.lineJoin = "round";
            context.beginPath(); context.moveTo(points[0].x, points[0].y);
            points.forEach(p => context.lineTo(p.x, p.y)); context.stroke();
            if (points.length === 1) { context.beginPath(); context.arc(points[0].x, points[0].y, line.size / 2, 0, Math.PI * 2); context.fill(); }
        }
    }
    function point(event) {
        const bounds = canvas.getBoundingClientRect();
        return { x: Math.round(Math.max(0, Math.min(800, (event.clientX - bounds.left) * 800 / bounds.width))), y: Math.round(Math.max(0, Math.min(500, (event.clientY - bounds.top) * 500 / bounds.height))) };
    }
    function publishStroke() {
        if (!stroke) return;
        const line = stroke; stroke = null; lastFlush = performance.now();
        const target = push(at(`${roundBase()}/strokes`));
        strokes[target.key] = line; paint(); set(target, line).catch(error);
    }
    canvas.onpointerdown = event => {
        if (!isDrawer() || room.state.phase !== "drawing" || now() >= room.state.deadline || !secret || stroke) return;
        canvas.setPointerCapture(event.pointerId);
        stroke = { color: el("drawColor").value, size: Number(el("drawSize").value), points: [point(event)] }; paint();
    };
    canvas.onpointermove = event => {
        if (!stroke) return;
        if (now() >= room.state.deadline) { stroke = null; paint(); return; }
        stroke.points.push(point(event)); paint();
        if (stroke.points.length >= 40 || performance.now() - lastFlush >= 60) {
            const last = stroke.points.at(-1), color = stroke.color, size = stroke.size;
            publishStroke(); stroke = { color, size, points: [last] };
        }
    };
    canvas.onpointerup = publishStroke;
    canvas.onpointercancel = publishStroke;
    el("drawClear").onclick = () => action(() => set(at(`${roundBase()}/strokes`), null));
    paint();
}
