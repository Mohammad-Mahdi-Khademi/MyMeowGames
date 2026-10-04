const words = [
    "Pizza",
    "Beach",
    "Robot",
    "Mountain",
    "Football",
    "Coffee",
    "Hospital",
    "Airport",
    "School",
    "Cinema",
    "Castle",
    "Forest",
    "Desert",
    "Ocean",
    "Laptop",
    "Guitar",
    "Camera",
    "Rocket",
    "Dragon",
    "Library",
    "Restaurant",
    "Supermarket",
    "University",
    "Train",
    "Helicopter",
    "Telephone",
    "Birthday",
    "Wedding",
    "Christmas",
    "Summer",
    "Winter",
    "Doctor",
    "Police",
    "Firefighter",
    "Astronaut",
    "Pirate",
    "Detective",
    "Chef",
    "Teacher",
    "Engineer",
    "Museum",
    "Theater",
    "Park",
    "Zoo",
    "Island",
    "Volcano",
    "Rainbow",
    "Thunder",
    "Snow",
    "Chocolate",
    "Ice Cream",
    "Burger",
    "Pancake",
    "Popcorn",
    "Sandwich",
    "Watermelon",
    "Strawberry",
    "Banana",
    "Apple",
    "Orange",
    "Coconut",
    "Lemon",
    "Cake",
    "Cookie",
    "Donut",
    "Candy",
    "Car",
    "Motorcycle",
    "Bicycle",
    "Bus",
    "Subway",
    "Taxi",
    "Boat",
    "Submarine",
    "Airplane",
    "Spaceship",
    "Ambulance",
    "Fire Truck",
    "Tractor",
    "Bridge",
    "Tunnel",
    "Road",
    "Highway",
    "Hotel",
    "Apartment",
    "House",
    "Garden",
    "Kitchen",
    "Bedroom",
    "Bathroom",
    "Balcony",
    "Garage",
    "Elevator",
    "Stairs",
    "Window",
    "Door",
    "Mirror",
    "Clock",
    "Calendar",
    "Backpack",
    "Umbrella",
    "Wallet",
    "Key",
    "Glasses",
    "Watch",
    "Headphones",
    "Keyboard",
    "Mouse",
    "Monitor",
    "Printer",
    "Television",
    "Speaker",
    "Microphone",
    "Controller",
    "Computer",
    "Tablet",
    "Smartphone",
    "Internet",
    "Video Game",
    "Minecraft",
    "Basketball",
    "Tennis",
    "Baseball",
    "Volleyball",
    "Swimming",
    "Boxing",
    "Skateboard",
    "Gym",
    "Stadium",
    "Referee",
    "Goalkeeper",
    "Trophy",
    "Medal",
    "School Bus",
    "Classroom",
    "Exam",
    "Homework",
    "Professor",
    "Student",
    "Book",
    "Notebook",
    "Pencil",
    "Eraser",
    "Calculator",
    "Laboratory",
    "Science",
    "Physics",
    "Chemistry",
    "Mathematics",
    "History",
    "Art",
    "Music",
    "Guitar",
    "Piano",
    "Drums",
    "Violin",
    "Concert",
    "Singer",
    "Movie",
    "Actor",
    "Director",
    "Camera",
    "Theater",
    "Netflix",
    "Superhero",
    "Villain",
    "Princess",
    "King",
    "Queen",
    "Knight",
    "Wizard",
    "Witch",
    "Vampire",
    "Zombie",
    "Ghost",
    "Alien",
    "Monster",
    "Fairy",
    "Mermaid",
    "Unicorn",
    "Jungle",
    "Safari",
    "Forest",
    "River",
    "Lake",
    "Waterfall",
    "Mountain",
    "Cave",
    "Island",
    "Beach",
    "Desert",
    "Glacier",
    "Volcano",
    "Cloud",
    "Rain",
    "Snow",
    "Storm",
    "Lightning",
    "Rainbow",
    "Sun",
    "Moon",
    "Star",
    "Planet",
    "Galaxy",
    "Space",
    "Sunset",
    "Sunrise",
    "Tree",
    "Flower",
    "Rose",
    "Sunflower",
    "Cactus",
    "Mushroom",
    "Cat",
    "Dog",
    "Lion",
    "Tiger",
    "Elephant",
    "Giraffe",
    "Monkey",
    "Panda",
    "Bear",
    "Wolf",
    "Fox",
    "Rabbit",
    "Horse",
    "Cow",
    "Pig",
    "Chicken",
    "Penguin",
    "Dolphin",
    "Whale",
    "Shark",
    "Octopus",
    "Turtle",
    "Eagle",
    "Owl",
    "Parrot",
    "Butterfly",
    "Bee",
    "Ant",
    "Spider",
    "Snake",
    "Crocodile",
    "Frog",
    "Football Stadium",
    "Hospital Room",
    "Police Station",
    "Fire Station",
    "Train Station",
    "Airport Terminal",
    "Shopping Mall",
    "Amusement Park",
    "Water Park",
    "Theme Park",
    "Circus",
    "Zoo Keeper",
    "Movie Theater",
    "Coffee Shop",
    "Bakery",
    "Bookstore",
    "Barber Shop",
    "Hair Salon",
    "Gymnasium",
    "Swimming Pool",
    "Beach House",
    "Haunted House",
    "Castle Tower",
    "Treasure",
    "Pirate Ship",
    "Spacesuit",
    "Time Machine",
    "Secret Agent",
    "Spy",
    "Treasure Map",
    "Magic Wand",
    "Sword",
    "Shield",
    "Crown",
    "Diamond",
    "Gold",
    "Money",
    "Bank",
    "Casino",
    "Prison",
    "Court",
    "Judge",
    "Lawyer",
    "Detective",
    "Journalist",
    "Photographer",
    "Mechanic",
    "Electrician",
    "Plumber",
    "Farmer",
    "Pilot",
    "Sailor",
    "Driver",
    "Architect",
    "Scientist",
    "Programmer",
    "Designer",
    "Musician",
    "Artist",
    "Writer",
    "Journalist",
    "Dentist",
    "Surgeon",
    "Nurse",
    "Chef",
    "Waiter",
    "Baker",
    "Cashier",
    "Firefighter",
    "Astronaut",
    "Soldier",
    "Sculpture",
    "Painting",
    "Statue",
    "Museum",
    "Ancient Ruins",
    "Pyramid",
    "Temple",
    "Lighthouse",
    "Windmill",
    "Factory",
    "Warehouse",
    "Construction Site",
    "Office",
    "Meeting Room",
    "Conference",
    "Wedding",
    "Birthday Party",
    "Graduation",
    "Festival",
    "Concert",
    "Carnival",
    "Christmas",
    "Halloween",
    "Valentine",
    "New Year",
    "Fireworks",
    "Gift",
    "Balloon",
    "Confetti",
    "Party",
    "Adventure",
    "Camping",
    "Hiking",
    "Fishing",
    "Swimming",
    "Diving",
    "Skiing",
    "Snowboarding",
    "Surfing",
    "Running",
    "Cycling",
    "Dancing",
    "Singing",
    "Cooking",
    "Painting",
    "Photography",
    "Shopping",
    "Travel",
    "Vacation",
    "Passport",
    "Suitcase",
    "Hotel Room",
    "Map",
    "Compass",
    "Ticket",
    "Train Ticket",
    "Boarding Pass",
    "Tourist",
    "Backpack",
    "Tent",
    "Campfire",
    "Flashlight",
    "Binoculars",
    "Compass",
    "Treasure Island",
    "Secret Room",
    "Hidden Door",
    "Laboratory",
    "Secret Base",
    "Space Station",
    "Moon Landing",
    "Time Travel",
    "Robot Factory",
    "Alien Planet",
    "Dinosaur",
    "T-Rex",
    "Fossil",
    "Archaeologist",
    "Treasure Hunter",
    "Pirate",
    "Ninja",
    "Samurai",
    "Cowboy",
    "Detective",
    "Superhero",
    "Secret Agent",
    "Villain",
    "Monster",
    "Dragon",
    "Wizard",
    "Magic Castle",
    "Haunted Castle",
    "Ghost Town",
    "Dark Forest",
    "Lost City",
    "Underground Tunnel",
    "Secret Laboratory"
];

let playerCount = null;
let currentPlayer = null;
let currentWord = null;
let isSpy = false;
let wordVisible = false;
let timerInterval = null;

function readURLParameters() {
    const params = new URLSearchParams(window.location.search);

    const players = parseInt(params.get("players"));
    const player = parseInt(params.get("player"));

    if (
        players >= 3 &&
        players <= 10 &&
        player >= 1 &&
        player <= players
    ) {
        playerCount = players;
        currentPlayer = player;
        startGame();
        return true;
    }

    return false;
}

function hideAllScreens() {
    document.getElementById("gameSelection").classList.add("hidden");
    document.getElementById("playerCountScreen").classList.add("hidden");
    document.getElementById("playerSelectionScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
}

function showGameSelection() {
    hideAllScreens();

    document
        .getElementById("gameSelection")
        .classList.remove("hidden");
}

function showPlayerCount() {
    hideAllScreens();

    document
        .getElementById("playerCountScreen")
        .classList.remove("hidden");
}

function selectGame(game) {
    if (game !== "spy") {
        return;
    }

    hideAllScreens();

    document
        .getElementById("playerCountScreen")
        .classList.remove("hidden");
}

function choosePlayerCount(count) {
    playerCount = count;

    createPlayerButtons();

    hideAllScreens();

    document
        .getElementById("playerSelectionScreen")
        .classList.remove("hidden");
}

function createPlayerButtons() {
    const container =
        document.getElementById("playerButtons");

    container.innerHTML = "";

    for (let i = 1; i <= playerCount; i++) {

        const button =
            document.createElement("button");

        button.textContent = `Player ${i}`;

        button.onclick = function () {
            selectPlayer(i);
        };

        container.appendChild(button);
    }
}

function selectPlayer(player) {
    currentPlayer = player;

    const newURL =
        `${window.location.pathname}?players=${playerCount}&player=${player}`;

    window.history.replaceState(
        {},
        "",
        newURL
    );

    startGame();
}

function startGame() {
    hideAllScreens();

    document
        .getElementById("gameScreen")
        .classList.remove("hidden");

    document
        .getElementById("currentPlayer")
        .textContent = currentPlayer;

    calculateRound();

    updateGame();

    startTimer();
}

function getRoundNumber() {
    const now = Date.now();

    const fiveMinutes =
        5 * 60 * 1000;

    return Math.floor(
        now / fiveMinutes
    );
}

function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;

    return x - Math.floor(x);
}

function calculateRound() {
    const round =
        getRoundNumber();

    const wordIndex =
        Math.floor(
            seededRandom(round * 100 + 17)
            * words.length
        );

    currentWord =
        words[wordIndex];

    const spyCount =
        playerCount >= 7
            ? 2
            : 1;

    let players = [];

    for (
        let i = 1;
        i <= playerCount;
        i++
    ) {
        players.push(i);
    }

    deterministicShuffle(
        players,
        round
    );

    const spies =
        players.slice(
            0,
            spyCount
        );

    isSpy =
        spies.includes(
            currentPlayer
        );

    document
        .getElementById("roundNumber")
        .textContent = round;

    wordVisible = false;

    updateWordDisplay();
}

function deterministicShuffle(array, seed) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const random =
            seededRandom(
                seed * 1000 + i
            );

        const j =
            Math.floor(
                random * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }
}

function updateGame() {
    calculateRound();
}

function updateWordDisplay() {
    const wordElement =
        document.getElementById("word");

    const instruction =
        document.getElementById("tapInstruction");

    if (!wordVisible) {
        wordElement.textContent = "?";

        wordElement.classList.add(
            "hidden-word"
        );

        instruction.textContent =
            "Tap to reveal";

        return;
    }

    if (isSpy) {
        wordElement.textContent = "SPY";
    } else {
        wordElement.textContent = currentWord;
    }

    wordElement.classList.remove(
        "hidden-word"
    );

    instruction.textContent =
        "Tap to hide";
}

function toggleWord() {
    wordVisible =
        !wordVisible;

    updateWordDisplay();
}

function startTimer() {
    if (timerInterval) {
        clearInterval(
            timerInterval
        );
    }

    updateTimer();

    timerInterval =
        setInterval(
            updateTimer,
            1000
        );
}

function updateTimer() {
    const now =
        Date.now();

    const fiveMinutes =
        5 * 60 * 1000;

    const nextRound =
        Math.ceil(
            now / fiveMinutes
        ) * fiveMinutes;

    let remaining =
        nextRound - now;

    if (remaining <= 0) {
        remaining =
            fiveMinutes;
    }

    const totalSeconds =
        Math.floor(
            remaining / 1000
        );

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const seconds =
        totalSeconds % 60;

    document
        .getElementById("timer")
        .textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const newRound =
        getRoundNumber();

    const displayedRound =
        parseInt(
            document
                .getElementById("roundNumber")
                .textContent
        );

    if (
        newRound !== displayedRound
    ) {
        calculateRound();
    }
}

function changePlayer() {
    showPlayerCount();

    if (playerCount) {
        createPlayerButtons();
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const hasURLPlayer =
            readURLParameters();

        if (!hasURLPlayer) {
            showGameSelection();
        }

    }
);