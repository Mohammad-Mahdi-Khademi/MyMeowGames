import { manuals } from "./games/manuals.js";
import { openSpy } from "./games/spy.js";

const gameSelection = document.getElementById("gameSelection");
const gameContainer = document.getElementById("gameContainer");

const gameManual = document.getElementById("gameManual");

const games = {
    spy: () => openSpy(gameContainer),
    xo: async () => {
        const { openXO } = await import("./games/xo.js");
        openXO(gameContainer);
    }
};

window.openGame = async function(game) {
    const gameFunction = games[game];

    if (!gameFunction) {
        return;
    }

    gameSelection.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    gameContainer.innerHTML = "";
    document.body.classList.add("in-game");
    gameManual.innerHTML = manuals[game];
    gameManual.classList.remove("hidden");

    try {
        await gameFunction();
    } catch (error) {
        console.error(error);

        gameContainer.innerHTML = `
            <div class="panel">
                <h2>Something went wrong</h2>
                <p>Could not load this game.</p>
                <button class="secondary-btn" id="backButton">
                    Back to Games
                </button>
            </div>
        `;

        gameContainer
            .querySelector("#backButton")
            .addEventListener("click", () => {
                window.showGameSelection();
            });
    }
};

window.showGameSelection = function() {
    document.body.classList.remove("in-game");
    gameManual.classList.add("hidden");
    gameContainer.innerHTML = "";
    gameContainer.classList.add("hidden");
    gameSelection.classList.remove("hidden");
};