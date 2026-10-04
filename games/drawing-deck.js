import { DRAWING_PROMPTS } from "./drawing-words.js";

export function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Each drawer owns a private deck: sharing an order or seed would let a former
// drawer predict future answers. Room-wide history filters every local deck.
export class DrawingDeck {
    constructor(pool = DRAWING_PROMPTS, random = Math.random) {
        this.pool = pool;
        this.random = random;
        this.cards = shuffle(pool, random);
    }

    next(history = {}, playerId) {
        const used = history.used || {};
        const personal = history.players?.[playerId] || {};
        const recent = new Set(history.recent || []);
        let available = this.pool.filter(p => !used[p.id] && !personal[p.id]);
        let cycle = history.cycle || 0;
        if (!available.length) {
            // Exhaustion starts another global cycle, but never repeats a card
            // for its previous drawer within this game.
            if (this.pool.some(p => !used[p.id])) {
                throw new Error("No unused prompts remain for this drawer. Start a new game.");
            }
            available = this.pool.filter(p => !personal[p.id] && p.id !== history.last);
            cycle++;
            this.cards = shuffle(this.pool, this.random);
        }
        if (!available.length) throw new Error("This drawer has drawn every prompt. Start a new game.");
        const fresh = available.filter(p => !recent.has(p.id));
        if (fresh.length) available = fresh;
        const different = available.filter(p => p.category !== history.category);
        if (different.length) available = different;
        // The curated pool is overwhelmingly easy/medium. Preserve a shuffled
        // deck rather than repeatedly sampling with replacement.
        const allowed = new Set(available.map(p => p.id));
        let index = this.cards.findIndex(p => allowed.has(p.id));
        if (index < 0) {
            this.cards = shuffle(this.pool, this.random);
            index = this.cards.findIndex(p => allowed.has(p.id));
        }
        const [prompt] = this.cards.splice(index, 1);
        return { prompt, history: {
            cycle,
            used: { ...(cycle === (history.cycle || 0) ? used : {}), [prompt.id]: true },
            players: { ...history.players, [playerId]: { ...personal, [prompt.id]: true } },
            recent: [...(history.recent || []), prompt.id].slice(-60),
            last: prompt.id,
            category: prompt.category
        } };
    }
}

export function normalizeGuess(value) {
    return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().replace(/^(a|an|the) /, "");
}
