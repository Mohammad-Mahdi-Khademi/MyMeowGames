const words = [
    "Airport","Aquarium","Bakery","Beach","Bridge","Castle","Cinema","Circus","Classroom","Desert",
    "Factory","Farm","Forest","Garage","Garden","Hospital","Hotel","Island","Jungle","Kitchen",
    "Laboratory","Library","Market","Museum","Office","Palace","Park","Prison","Restaurant","School",
    "Stadium","Station","Supermarket","Theater","University","Zoo","Airport Security","Amusement Park",
    "Art Gallery","Bus Stop","Coffee Shop","Fire Station","Gas Station","Hair Salon","Ice Cream Shop",
    "Police Station","Shopping Mall","Train Station","Water Park","Wedding","Birthday","Concert",
    "Camping","Festival","Football Match","Graduation","Party","Picnic","Road Trip","Sleepover",
    "Swimming Pool","Vacation","Wedding Ceremony","Basketball Court","Boxing Ring","Gym","Skate Park",
    "Tennis Court","Volleyball Court","Bookstore","Computer Lab","Dentist","Doctor's Office","Bank",
    "Post Office","Pharmacy","Bakery Kitchen","Recording Studio","TV Studio","News Room","Space Station",
    "Moon","Mars","Rocket","Astronaut","Alien","Robot","Computer","Phone","Laptop","Camera",
    "Headphones","Keyboard","Mouse","Television","Clock","Mirror","Umbrella","Backpack","Suitcase",
    "Wallet","Watch","Glasses","Key","Door","Window","Chair","Table","Bed","Sofa","Lamp",
    "Fridge","Oven","Microwave","Washing Machine","Bicycle","Motorcycle","Car","Bus","Train","Airplane",
    "Helicopter","Boat","Submarine","Truck","Taxi","Ambulance","Fire Truck","Police Car","Dog","Cat",
    "Lion","Tiger","Elephant","Giraffe","Monkey","Bear","Wolf","Fox","Rabbit","Horse","Cow",
    "Pig","Chicken","Duck","Eagle","Owl","Shark","Whale","Dolphin","Octopus","Penguin","Snake",
    "Turtle","Crocodile","Butterfly","Bee","Ant","Spider","Apple","Banana","Orange","Watermelon",
    "Strawberry","Pineapple","Mango","Grape","Peach","Cherry","Lemon","Potato","Tomato","Carrot",
    "Onion","Pizza","Burger","Sandwich","Pasta","Rice","Soup","Salad","Cake","Chocolate","Cookie",
    "Ice Cream","Popcorn","Coffee","Tea","Juice","Milk","Bread","Cheese","Egg","Chicken Dinner",
    "Football","Basketball","Tennis","Baseball","Golf","Boxing","Swimming","Running","Cycling",
    "Skiing","Surfing","Chess","Cards","Dice","Guitar","Piano","Drums","Violin","Microphone",
    "Painting","Sculpture","Photography","Movie","Book","Game","Puzzle","Magic","Treasure","Pirate",
    "King","Queen","Knight","Wizard","Detective","Teacher","Student","Doctor","Engineer","Pilot",
    "Chef","Firefighter","Police Officer","Astronaut","Scientist","Artist","Singer","Actor","Dancer",
    "Superhero","Villain","Dragon","Vampire","Zombie","Ghost","Alien Planet","Time Machine","Secret Base",
    "Spy Headquarters","Treasure Island","Haunted House","Medieval Village","Future City","Underwater City",
    "Space Elevator","Volcano","Waterfall","Mountain","Cave","River","Lake","Ocean","Desert Camp",
    "Snowy Mountain","Rainforest","Farmhouse","Lighthouse","Windmill","Castle Tower","Ancient Temple",
    "Museum Hall","Science Fair","School Bus","Movie Theater","Restaurant Kitchen","Hotel Lobby",
    "Airport Lounge","Train Platform","Beach Party","Winter Resort","Summer Camp","Music Festival",
    "Carnival","Circus Tent","Football Stadium","Basketball Arena","Tennis Club","Swimming Center"
];

function seededRandom(seed) {
    let value = seed % 2147483647;

    if (value <= 0) {
        value += 2147483646;
    }

    return () => {
        value = value * 16807 % 2147483647;
        return (value - 1) / 2147483646;
    };
}

function getRoundNumber() {
    return Math.floor(Date.now() / (5 * 60 * 1000));
}

function calculateRound(playerCount) {
    const round = getRoundNumber();
    const random = seededRandom(round);

    const word = words[Math.floor(random() * words.length)];
    const spyCount = playerCount >= 7 ? 2 : 1;

    const players = Array.from(
        { length: playerCount },
        (_, index) => index + 1
    );

    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }

    return {
        round,
        word,
        spies: players.slice(0, spyCount)
    };
}

function showPlayerSelection(container, playerCount) {
    container.innerHTML = `
        <div class="panel">
            <h2>Choose Your Player</h2>
            <p>Each player should choose their own number.</p>
            <div class="player-grid">
                ${Array.from(
                    { length: playerCount },
                    (_, index) => `
                        <button class="player-btn" data-player="${index + 1}">
                            Player ${index + 1}
                        </button>
                    `
                ).join("")}
            </div>
            <button class="secondary-btn" id="backButton">Back</button>
        </div>
    `;

    container.querySelectorAll(".player-btn").forEach(button => {
        button.addEventListener("click", () => {
            const player = Number(button.dataset.player);
            const params = new URLSearchParams(location.search);

            params.set("game", "spy");
            params.set("players", playerCount);
            params.set("player", player);

            history.replaceState({}, "", `${location.pathname}?${params}`);
            startSpy(container, playerCount, player);
        });
    });

    container.querySelector("#backButton").addEventListener("click", () => {
        openSpy(container);
    });
}

function startSpy(container, playerCount, currentPlayer) {
    let timerId;
    let round = getRoundNumber();
    let revealed = false;

    function render() {
        clearInterval(timerId);
        const result = calculateRound(playerCount);
        const isSpy = result.spies.includes(currentPlayer);

        container.innerHTML = `
            <div class="panel">
                <h2>Player ${currentPlayer}</h2>
                <p>Round ${result.round}</p>

                <button type="button" class="word-box" id="wordBox" aria-pressed="false">
                    TAP TO REVEAL
                </button>

                <div class="timer" id="timer"></div>

                <button class="secondary-btn" id="newPlayer">
                    Change Player
                </button>

                <button class="secondary-btn" id="homeButton">
                    Back to Games
                </button>
            </div>
        `;

        const wordBox = container.querySelector("#wordBox");

        wordBox.addEventListener("click", () => {
            revealed = !revealed;
            wordBox.setAttribute("aria-pressed", String(revealed));
            wordBox.classList.toggle("spy-word", revealed && isSpy);
            wordBox.classList.toggle("normal-word", revealed && !isSpy);

            if (!revealed) {
                wordBox.textContent = "TAP TO REVEAL";
                return;
            }

            wordBox.textContent = isSpy ? "SPY" : result.word;
        });

        container.querySelector("#newPlayer").addEventListener("click", () => {
            showPlayerSelection(container, playerCount);
        });

        container.querySelector("#homeButton").addEventListener("click", () => {
            history.replaceState({}, "", location.pathname);
            window.showGameSelection();
        });

        function updateTimer() {
            if (!wordBox.isConnected) {
                clearInterval(timerId);
                return;
            }
            const now = Date.now();
            const nextRound = (Math.floor(now / (5 * 60 * 1000)) + 1) * 5 * 60 * 1000;
            const remaining = nextRound - now;

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            const timer = container.querySelector("#timer");

            if (timer) {
                timer.textContent =
                    `New word in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            }

            const newRound = getRoundNumber();

            if (newRound !== round) {
                round = newRound;
                revealed = false;
                render();
            }
        }

        updateTimer();
        timerId = setInterval(updateTimer, 1000);
    }

    render();
}

function showPlayerCountSelection(container) {
    container.innerHTML = `
        <div class="panel">
            <h2>Spy</h2>
            <p>Choose the number of players.</p>

            <div class="choice-grid">
                ${Array.from(
                    { length: 8 },
                    (_, index) => {
                        const count = index + 3;

                        return `
                            <button class="choice-btn" data-count="${count}">
                                ${count}
                            </button>
                        `;
                    }
                ).join("")}
            </div>

            <button class="secondary-btn" id="backButton">
                Back
            </button>
        </div>
    `;

    container.querySelectorAll(".choice-btn").forEach(button => {
        button.addEventListener("click", () => {
            showPlayerSelection(
                container,
                Number(button.dataset.count)
            );
        });
    });

    container.querySelector("#backButton").addEventListener("click", () => {
        window.showGameSelection();
    });
}

export function openSpy(container) {
    const params = new URLSearchParams(location.search);
    const playerCount = Number(params.get("players"));
    const player = Number(params.get("player"));

    if (
        params.get("game") === "spy" &&
        playerCount >= 3 &&
        playerCount <= 10 &&
        player >= 1 &&
        player <= playerCount
    ) {
        startSpy(container, playerCount, player);
        return;
    }

    showPlayerCountSelection(container);
}