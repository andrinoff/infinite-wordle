// --- DOM ELEMENT SELECTORS ---
const grid = document.getElementById('grid');
const keyboard = document.getElementById('keyboard');
const toast = document.getElementById('toast');

// --- GAME CONSTANTS & STATE ---
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
let targetWord = '';
let currentRow = 0;
let currentCol = 0;
let isGameOver = false;
let isProcessing = false; // Prevents input during guess evaluation

// --- WORD LISTS ---
// A small fallback list in case the random word API fails.
const FALLBACK_WORDS = [
    'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'CHAIR', 'CRANE', 'EARTH', 'FLOOR',
    'GHOST', 'HEART', 'HOUSE', 'JUICE', 'LIGHT', 'LUCKY', 'MONEY', 'MUSIC',
    'NIGHT', 'OCEAN', 'PAPER', 'PARTY', 'PIZZA', 'PLANT', 'POWER', 'QUIET',
    'RADIO', 'RIVER', 'SALAD', 'SHEEP', 'SMILE', 'SNAKE', 'SOUND', 'SPACE',
    'SUGAR', 'TABLE', 'TIGER', 'TRAIN', 'WATER', 'WHITE', 'WOMAN', 'WORLD'
];


// --- INITIALIZATION ---

/**
 * Creates the 6x5 grid of tiles.
 */
function createGrid() {
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile', 'relative');
            tile.innerHTML = `
                <div class="front absolute w-full h-full flex items-center justify-center"></div>
                <div class="back absolute w-full h-full flex items-center justify-center"></div>
            `;
            grid.appendChild(tile);
        }
    }
}

/**
 * Creates the on-screen keyboard and attaches event listeners.
 */
function createKeyboard() {
    const keys = [
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
        'enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'
    ];
    const keyRows = [keys.slice(0, 10), keys.slice(10, 19), keys.slice(19)];

    keyRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('flex', 'justify-center', 'gap-1.5', 'my-1');
        row.forEach(key => {
            const button = document.createElement('button');
            button.dataset.key = key;
            button.id = `key-${key}`;
            button.textContent = key === 'backspace' ? '⌫' : key;
            button.classList.add(
                'key', 'h-14', 'rounded-md', 'font-bold', 'uppercase', 'flex-1',
                'bg-gray-500', 'hover:bg-gray-600', 'active:bg-gray-700', 'transition-colors'
            );
            if (key === 'enter' || key === 'backspace') {
                button.classList.add('px-3', 'text-xs');
            }
            button.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(button);
        });
        keyboard.appendChild(rowDiv);
    });
}

/**
 * Fetches a new random 5-letter word from an API, with a fallback to a local list.
 */
async function fetchNewWord() {
    isProcessing = true;
    try {
        const response = await fetch('https://random-word-api.vercel.app/api?words=1&length=5');
        if (!response.ok) throw new Error('API response not OK');
        const data = await response.json();
        targetWord = data[0].toUpperCase();
    } catch (error) {
        console.error("API fetch failed, falling back to local list:", error);
        targetWord = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    }
    console.log(`Target word: ${targetWord}`);
    isProcessing = false;
}

/**
 * Main game initialization function.
 */
async function initGame() {
    isGameOver = false;
    currentRow = 0;
    currentCol = 0;
    grid.innerHTML = '';
    keyboard.innerHTML = '';
    createGrid();
    createKeyboard();
    await fetchNewWord();
}

// --- EVENT HANDLING ---

/**
 * Handles both physical and on-screen keyboard presses.
 * @param {string} key - The key that was pressed (e.g., 'a', 'Enter', 'Backspace').
 */
function handleKeyPress(key) {
    if (isGameOver || isProcessing) return;

    const lowerKey = key.toLowerCase();

    if (lowerKey === 'enter') {
        submitGuess();
    } else if (lowerKey === 'backspace') {
        deleteLetter();
    } else if (lowerKey.match(/^[a-z]$/)) {
        addLetter(lowerKey);
    }
}

/**
 * Adds a letter to the current tile in the grid.
 * @param {string} letter - The letter to add.
 */
function addLetter(letter) {
    if (currentCol < WORD_LENGTH) {
        const tile = getTile(currentRow, currentCol);
        const front = tile.querySelector('.front');
        front.textContent = letter;
        front.classList.add('pop');
        setTimeout(() => front.classList.remove('pop'), 100);
        currentCol++;
    }
}

/**
 * Deletes the last letter from the current guess.
 */
function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        const tile = getTile(currentRow, currentCol);
        const front = tile.querySelector('.front');
        front.textContent = '';
    }
}

// --- GAME LOGIC ---

/**
 * Submits the current guess, validating it with an API call first.
 */
async function submitGuess() {
    if (currentCol < WORD_LENGTH) {
        shakeRow();
        showToast('Not enough letters');
        return;
    }

    const guess = getCurrentGuess();
    isProcessing = true; // Block input while we validate

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess.toLowerCase()}`);

        if (!response.ok) {
            // Word is not in the dictionary
            shakeRow();
            showToast('Not in word list');
            isProcessing = false; // Re-enable input
            return;
        }

        // Word is valid, proceed with evaluation
        evaluateGuess(guess);

    } catch (error) {
        console.error("Dictionary API error:", error);
        showToast("Error checking word");
        isProcessing = false; // Re-enable input on network error
    }
}

/**
 * Evaluates the submitted guess against the target word and updates the UI.
 * @param {string} guess - The 5-letter word guessed by the user.
 */
function evaluateGuess(guess) {
    const tileRow = Array.from(grid.children).slice(currentRow * WORD_LENGTH, (currentRow + 1) * WORD_LENGTH);
    const tempTargetWord = targetWord.split('');
    const letterCounts = {};

    for (const letter of tempTargetWord) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    const evaluation = Array(WORD_LENGTH).fill(null);

    // First pass: Check for correct letters (green)
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guess[i] === tempTargetWord[i]) {
            evaluation[i] = 'correct';
            letterCounts[guess[i]]--;
        }
    }

    // Second pass: Check for present (yellow) and absent (gray) letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (evaluation[i] === null) {
            if (tempTargetWord.includes(guess[i]) && letterCounts[guess[i]] > 0) {
                evaluation[i] = 'present';
                letterCounts[guess[i]]--;
            } else {
                evaluation[i] = 'absent';
            }
        }
    }

    // Animate the flip and apply colors
    tileRow.forEach((tile, index) => {
        setTimeout(() => {
            const back = tile.querySelector('.back');
            const front = tile.querySelector('.front');
            back.textContent = front.textContent;

            tile.classList.add('flip');
            tile.classList.add(evaluation[index]);
            updateKeyboard(guess[index], evaluation[index]);
        }, index * 300);
    });

    setTimeout(() => {
        checkWinLoss(guess);
    }, WORD_LENGTH * 300);
}

/**
 * Checks if the game has been won or lost.
 * @param {string} guess - The last guess made.
 */
function checkWinLoss(guess) {
    if (guess === targetWord) {
        showToast('You got it!', 3000, true);
        isGameOver = true;
        setTimeout(showPlayAgain, 1000);
    } else if (currentRow === MAX_GUESSES - 1) {
        showToast(`Game Over! The word was ${targetWord}`, 5000, true);
        isGameOver = true;
        setTimeout(showPlayAgain, 1000);
    } else {
        currentRow++;
        currentCol = 0;
        isProcessing = false; // Turn is over, re-enable input
    }
}

// --- UI & HELPER FUNCTIONS ---

function getTile(row, col) {
    return grid.children[row * WORD_LENGTH + col];
}

function getCurrentGuess() {
    let guess = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        guess += getTile(currentRow, i).querySelector('.front').textContent;
    }
    return guess.toUpperCase();
}

function shakeRow() {
    const rowTiles = Array.from(grid.children).slice(currentRow * WORD_LENGTH, (currentRow + 1) * WORD_LENGTH);
    rowTiles.forEach(tile => tile.classList.add('shake'));
    setTimeout(() => {
        rowTiles.forEach(tile => tile.classList.remove('shake'));
    }, 500);
}

function updateKeyboard(letter, status) {
    const key = document.getElementById(`key-${letter.toLowerCase()}`);
    if (!key) return; // defensive check
    const currentStatus = key.classList;

    if (currentStatus.contains('correct')) return;
    if (currentStatus.contains('present') && status === 'absent') return;

    key.classList.remove('present', 'absent', 'bg-gray-500');
    key.classList.add(status);
}

let toastTimeout;
function showToast(message, duration = 1500, persistent = false) {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('opacity-100');
    if (!persistent) {
        toastTimeout = setTimeout(() => {
            toast.classList.remove('opacity-100');
        }, duration);
    }
}

function showPlayAgain() {
    toast.innerHTML = `<button id="play-again" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Play Again?</button>`;
    document.getElementById('play-again').addEventListener('click', () => {
        toast.classList.remove('opacity-100');
        initGame();
    });
}

// --- EVENT LISTENERS ---
document.addEventListener('keyup', (e) => handleKeyPress(e.key));

// --- START THE GAME ---
initGame();
