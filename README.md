# Infinite Wordle

![GitHub language count](https://img.shields.io/github/languages/count/andrinoff/infinite-wordle?style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/andrinoff/infinite-wordle?style=for-the-badge&color=yellow)


A classic Wordle-style word guessing game that never ends. This project uses a random word API for a new challenge every time you play and a dictionary API to validate that your guesses are real words.

This was initially a task for a job interview. While I didn't get the job, I decided to complete the project and share it.

## 🚀 Features

* **Classic Wordle Gameplay:** Guess the 5-letter word in 6 tries or less.
* **Truly Infinite:** Fetches a new random word from the [Random Word API](https://random-word-api.vercel.app/api) every time you play.
* **Real Word Validation:** Uses the [Dictionary API](https://dictionaryapi.dev/) to ensure every guess is a valid English word.
* **Responsive Design:** Looks and plays great on both desktop and mobile devices.
* **Dynamic UI:**
    * On-screen keyboard that updates with correct, present, and absent letter hints.
    * Smooth, satisfying animations for tile flips and reveals.
    * Feedback for invalid inputs (e.g., word not in list, not enough letters).
* **Play Again:** Instantly start a new game after winning or losing.

## 🛠️ Technologies Used

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and custom CSS for animations.
* **APIs:**
    * [Random Word API](https://random-word-api.vercel.app/api) for generating the target word.
    * [Free Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/) for validating user guesses.

## 🎮 How to Play

1.  **Goal:** Guess the hidden 5-letter word.
2.  **Guesses:** You have 6 attempts. Type your guess and press `Enter`.
3.  **Feedback:** The tiles will change color to give you hints:
    * 🟩 **Green:** The letter is correct and in the right position.
    * 🟨 **Yellow:** The letter is in the word but in the wrong position.
    * ⬛ **Gray:** The letter is not in the word.
4.  **Win:** Guess the word correctly to win! Click "Play Again" for a new challenge.

## 📂 Project Structure

```
├── index.html       # Main HTML structure of the game
├── style.css        # Custom CSS for animations and styling
├── script.js        # Core game logic, API handling, and DOM manipulation
└── README.md        # You are here!
```

##  local-setup Local Setup

No complex setup is required. Simply clone the repository and open the `index.html` file in your web browser.

```bash
git clone [https://github.com/andrinoff/infinite-wordle.git](https://github.com/andrinoff/infinite-wordle.git)
cd infinite-wordle
# Open index.html in your browser
```

