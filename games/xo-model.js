export const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function newRoom(uid) {
    return { host: uid, players: { X: uid }, status: 'waiting', turn: 'X', winner: '',
        board: Array(9).fill(''), ages: Array(9).fill(0), moves: 0, lastMove: -1,
        round: 1, completed: 0, scores: { X: 0, O: 0 } };
}
export function join(room, uid) {
    if (!room || room.status !== 'waiting' || room.players.O || room.players.X === uid) return;
    return { ...room, players: { ...room.players, O: uid }, status: 'playing' };
}
export function move(room, uid, index) {
    if (!room || room.status !== 'playing' || room.players[room.turn] !== uid || !Number.isInteger(index) || index < 0 || index > 8 || room.board[index]) return;
    const board = [...room.board], ages = [...room.ages], moves = room.moves + 1;
    const expired = ages.findIndex(age => age > 0 && age === moves - 6);
    if (expired >= 0) { board[expired] = ''; ages[expired] = 0; }
    board[index] = room.turn; ages[index] = moves;
    const winner = LINES.some(line => line.every(i => board[i] === room.turn)) ? room.turn : '';
    return { ...room, board, ages, moves, lastMove: index, winner,
        turn: winner ? room.turn : room.turn === 'X' ? 'O' : 'X',
        status: winner ? 'finished' : 'playing', completed: room.completed + (winner ? 1 : 0),
        scores: { ...room.scores, ...(winner ? { [winner]: room.scores[winner] + 1 } : {}) } };
}
export function rematch(room, uid, expectedRound) {
    if (!room || room.status !== 'finished' || room.round !== expectedRound || !Object.values(room.players).includes(uid)) return;
    return { ...room, board: Array(9).fill(''), ages: Array(9).fill(0), moves: 0, lastMove: -1,
        round: room.round + 1, winner: '', status: 'playing', turn: room.round % 2 ? 'O' : 'X' };
}
