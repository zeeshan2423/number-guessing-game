const readline = require('readline');
const { randomInt } = require('crypto');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const HIGH_SCORE_FILE = path.join(__dirname, 'high_scores.json');

// Load high scores
let highScores = {};
if (fs.existsSync(HIGH_SCORE_FILE)) {
    highScores = JSON.parse(fs.readFileSync(HIGH_SCORE_FILE));
}

const difficulties = {
    1: { name: "Easy", chances: 10 },
    2: { name: "Medium", chances: 5 },
    3: { name: "Hard", chances: 3 }
};

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function playGame() {
    console.log("\nWelcome to the Number Guessing Game!");
    console.log("I'm thinking of a number between 1 and 100.");
    
    console.log("\nPlease select the difficulty level:");
    console.log("1. Easy (10 chances)");
    console.log("2. Medium (5 chances)");
    console.log("3. Hard (3 chances)");

    let difficultyChoice;
    while (true) {
        difficultyChoice = await askQuestion("Enter your choice: ");
        if (difficulties[difficultyChoice]) break;
        console.log("Invalid choice, please enter 1, 2, or 3.");
    }

    const { name, chances } = difficulties[difficultyChoice];
    console.log(`\nGreat! You have selected the ${name} difficulty level. You have ${chances} chances.`);
    console.log("Let's start the game!");
    
    const secretNumber = randomInt(1, 101);
    let attempts = 0;
    let startTime = Date.now();

    while (attempts < chances) {
        let guess = parseInt(await askQuestion("Enter your guess: "));
        attempts++;
        
        if (guess === secretNumber) {
            let timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`Congratulations! You guessed the correct number in ${attempts} attempts and ${timeTaken} seconds.`);
            
            if (!highScores[name] || attempts < highScores[name]) {
                highScores[name] = attempts;
                fs.writeFileSync(HIGH_SCORE_FILE, JSON.stringify(highScores, null, 2));
                console.log(`New high score for ${name} difficulty!`);
            }
            break;
        } else {
            console.log(guess < secretNumber ? "Incorrect! The number is greater." : "Incorrect! The number is smaller.");
        }
    }

    if (attempts === chances) {
        console.log(`Sorry, you've run out of attempts! The correct number was ${secretNumber}.`);
    }

    let playAgain = await askQuestion("Do you want to play again? (yes/no): ");
    if (playAgain.toLowerCase() === 'yes') {
        await playGame();
    } else {
        console.log("Thanks for playing! Goodbye.");
        rl.close();
    }
}

playGame();

// Test cases
if (require.main === module) {
    module.exports = { playGame };
}
