import { newRoom, join, move, rematch } from './xo-model.js';

export async function openXO(container) {
    container.innerHTML = '<div class="panel"><h2>XO · Vanishing marks</h2><p>Connecting…</p></div>';
    const [config, api] = await Promise.all([import('../firebase-config.js'), import('https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js')]);
    const user = await config.authReady;
    if (!container.textContent.includes('XO · Vanishing marks')) return;
    let room = null, code = '', unsubscribe = null, active = true, busy = false;
    const el = id => container.querySelector(`#${id}`);
    const observer = new MutationObserver(() => { if (!container.querySelector('.xo-panel')) cleanup(); });
    function cleanup() { active = false; unsubscribe?.(); observer.disconnect(); }
    function error(e) {
        if (!active || !el('xoError')) return;
        el('xoError').textContent = /permission.denied/i.test(e.message || e.code || '')
            ? 'Firebase denied access. Publish the updated database.rules.json in Realtime Database → Rules, and enable Anonymous sign-in in Authentication.'
            : e.message || String(e);
    }
    async function action(fn) {
        if (busy) return;
        busy = true; if (el('xoError')) el('xoError').textContent = '';
        try { await fn(); } catch (e) { error(e); } finally { busy = false; }
    }
    function render() {
        if (!active) return;
        const player = room?.players.X === user.uid ? 'X' : 'O';
        container.innerHTML = `<div class="panel xo-panel">
            <h2>XO <span class="xo-mode">Vanishing marks</span></h2>
            <p>Keep three marks. Your fourth removes your oldest. Make a line to win.</p>
            ${room ? `<div class="xo-header"><p>Room: <strong id="xoCode"></strong></p><button id="copyRoom" class="secondary-btn">Copy code</button></div>
                <div class="xo-players">${['X','O'].map(p => `<div class="player-card ${room.turn === p && room.status === 'playing' ? 'active' : ''}"><strong>${p}${p === player ? ' · You' : ''}</strong><span class="xo-score">${room.scores[p]}</span><small>wins</small></div>`).join('')}</div>
                <p class="xo-round">Round ${room.round} · Total completed: ${room.completed}</p>
                <p class="xo-status" role="status">${room.status === 'waiting' ? 'Share the code to invite your opponent.' : room.winner ? `${room.winner === player ? 'You win!' : 'Opponent wins!'} +1 point` : room.turn === player ? 'Your turn' : "Opponent’s turn"}</p>
                <div class="xo-board">${room.board.map((value, index) => {
                    const fading = value && room.moves >= 6 && room.ages[index] === room.moves - 5;
                    return `<button class="xo-cell ${value.toLowerCase()} ${fading ? 'fading' : ''}" data-index="${index}" aria-label="Row ${Math.floor(index/3)+1}, column ${index%3+1}: ${value || 'empty'}${fading ? ', disappears after the next move' : ''}" ${value || room.status !== 'playing' || room.turn !== player ? 'disabled' : ''}>${value}${fading ? '<small>fades next</small>' : ''}</button>`;
                }).join('')}</div>
                ${room.winner ? '<button id="rematch" class="primary-btn">Next round</button>' : ''}` : `
                <button id="createRoom" class="primary-btn">Create room</button>
                <label>Room code<input id="roomInput" class="text-input" maxlength="8" autocomplete="off" placeholder="Enter room code"></label>
                <button id="joinRoom" class="secondary-btn">Join room</button>`}
            <p id="xoError" class="status-text" role="alert"></p>
            <button id="xoBack" class="secondary-btn">Back to Games</button></div>`;
        el('xoBack').onclick = () => { cleanup(); const url = new URL(location.href); url.searchParams.delete('room'); url.searchParams.delete('game'); history.replaceState({}, '', url); window.showGameSelection(); };
        if (!room) {
            el('createRoom').onclick = () => action(async () => {
                for (let attempt = 0; attempt < 5; attempt++) {
                    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    const candidate = Array.from(crypto.getRandomValues(new Uint8Array(8)), n => alphabet[n % alphabet.length]).join('');
                    const result = await api.runTransaction(api.ref(config.db, `rooms/${candidate}`), current => current ? undefined : newRoom(user.uid), { applyLocally: false });
                    if (result.committed) { watch(candidate); return; }
                }
                throw new Error('Could not allocate a room. Try again.');
            });
            el('joinRoom').onclick = () => action(() => enter(el('roomInput').value.trim().toUpperCase()));
            el('roomInput').onkeydown = event => { if (event.key === 'Enter') el('joinRoom').click(); };
        } else {
            el('xoCode').textContent = code;
            el('copyRoom').onclick = () => action(async () => { await navigator.clipboard.writeText(code); el('copyRoom').textContent = 'Copied!'; });
            container.querySelectorAll('.xo-cell').forEach(cell => cell.onclick = () => action(async () => {
                const result = await api.runTransaction(api.ref(config.db, `rooms/${code}`), current => move(current, user.uid, Number(cell.dataset.index)), { applyLocally: false });
                if (!result.committed) throw new Error('That move is no longer available. Try again.');
            }));
            if (el('rematch')) el('rematch').onclick = () => action(async () => {
                const expectedRound = room.round;
                await api.runTransaction(api.ref(config.db, `rooms/${code}`), current => rematch(current, user.uid, expectedRound), { applyLocally: false });
            });
        }
    }
    async function enter(candidate) {
        if (!/^[A-Z0-9]{8}$/.test(candidate)) throw new Error('Enter an 8-character room code.');
        const target = api.ref(config.db, `rooms/${candidate}`);
        const snapshot = await api.get(target), current = snapshot.val();
        if (!current) throw new Error('Room not found.');
        if (!current.ages || !current.scores) throw new Error('This room uses the old XO version. Create a new room.');
        if (!Object.values(current.players).includes(user.uid)) {
            const result = await api.runTransaction(target, value => join(value, user.uid), { applyLocally: false });
            if (!result.committed) throw new Error('This room is full or has already started.');
        }
        watch(candidate);
    }
    function watch(candidate) {
        if (!active) return;
        unsubscribe?.(); code = candidate;
        const url = new URL(location.href); url.searchParams.set('game', 'xo'); url.searchParams.set('room', code); history.replaceState({}, '', url);
        unsubscribe = api.onValue(api.ref(config.db, `rooms/${code}`), snapshot => {
            if (!active) return;
            room = snapshot.val(); render();
            if (!room) error(new Error('This room no longer exists.'));
        }, error);
    }
    render(); observer.observe(container, { childList: true });
    const candidate = new URLSearchParams(location.search).get('room');
    if (candidate) await action(() => enter(candidate.toUpperCase()));
}
