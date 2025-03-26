// Global Variables
let POKEMON_LIST = [];
let dailyPokemon = null;
let guessCount = 0;
const MAX_GUESSES = 7;

// Load Pokémon data from JSON file
function loadPokemonData() {
  return fetch("./data/pokemonData.json")
    .then((res) => res.json())
    .then((data) => {
      POKEMON_LIST = data;
      
      // Select random daily Pokémon
      dailyPokemon = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
      console.log("Daily Pokemon is:", dailyPokemon.name);
      
      setupAutocomplete();
      
      return data;
    })
    .catch((err) => {
      console.error("Failed to load Pokemon data:", err);
    });
}

// Helper function to find a Pokémon by name
function findPokemonByName(name) {
  return POKEMON_LIST.find(
    (p) => p.name.toLowerCase() === name.toLowerCase().trim()
  );
}

// Compare Pokédex ID 
function getPokedexIdColor(daily, guess) {
  const diff = Math.abs(daily.pokedexId - guess.pokedexId);
  if (diff <= 10) return "green";
  if (diff <= 100) return "yellow";
  return "red";
}

// Compare types 
function getTypeColor(daily, guess) {
  const dailyTypes = daily.types;
  const guessTypes = guess.types;
  const commonTypes = dailyTypes.filter((t) => guessTypes.includes(t));

  if (commonTypes.length === 0) {
    return "red";
  }

  if (
    commonTypes.length === dailyTypes.length &&
    dailyTypes.length === guessTypes.length
  ) {
    return "green";
  }

  return "yellow";
}

// Compare generation
function getGenerationColor(daily, guess) {
  return daily.generation === guess.generation ? "green" : "red";
}

// Compare color 
function getColorColor(daily, guess) {
  return daily.color === guess.color ? "green" : "red";
}

// Compare evolution stage 
function getEvolutionColor(daily, guess) {
  if (daily.evolutionStage === guess.evolutionStage) {
    return "green";
  } else if (guess.evolutionStage < daily.evolutionStage) {
    return "yellow";
  } else {
    return "red";
  }
}

// Compare height 
function getHeightColor(daily, guess) {
  const diff = Math.abs(daily.height - guess.height);
  if (diff <= 0.2) return "green";
  if (diff <= 0.5) return "yellow";
  return "red";
}

// Compare mega evolution  
function getMegaColor(daily, guess) {
  return daily.hasMegaEvolution === guess.hasMegaEvolution ? "green" : "red";
}

// Feedback row for a guess
function buildFeedbackRow(guessPokemon, dailyPokemon) {
  // Evaluate color for each category
  const pokedexIdColor = getPokedexIdColor(dailyPokemon, guessPokemon);
  const typeColor = getTypeColor(dailyPokemon, guessPokemon);
  const generationColor = getGenerationColor(dailyPokemon, guessPokemon);
  const colorColor = getColorColor(dailyPokemon, guessPokemon);
  const evolutionColor = getEvolutionColor(dailyPokemon, guessPokemon);
  const heightColor = getHeightColor(dailyPokemon, guessPokemon);
  const megaColor = getMegaColor(dailyPokemon, guessPokemon);

  // Row container
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("feedback-row");

  // image
  const spriteBox = document.createElement("div");
  spriteBox.classList.add("feedback-box");
  spriteBox.style.backgroundColor = "#fff"; // neutral background
  if (guessPokemon.spriteUrl) {
    const img = document.createElement("img");
    img.src = guessPokemon.spriteUrl;
    img.alt = guessPokemon.name;
    img.classList.add("sprite-image");
    spriteBox.appendChild(img);
  } else {
    spriteBox.textContent = "No image";
  }
  rowDiv.appendChild(spriteBox);

  const nameBox = document.createElement("div");
  nameBox.classList.add("feedback-box");
  
  // Check to see if the name is correct
  const isCorrectName = guessPokemon.name.toLowerCase() === dailyPokemon.name.toLowerCase();
  nameBox.style.backgroundColor = isCorrectName ? "#2ecc71" : "#e74c3c"; // Green if correct, Red otherwise
  nameBox.style.color = "#fff"; // White text for better contrast on both red and green
  nameBox.textContent = guessPokemon.name;
  rowDiv.appendChild(nameBox);

  const idBox = document.createElement("div");
  idBox.classList.add("feedback-box", pokedexIdColor);
  
  // Direction arrow for Pokedex ID
  let idArrow = "";
  if (pokedexIdColor !== "green") {
    if (guessPokemon.pokedexId < dailyPokemon.pokedexId) {
      idArrow = " ↑"; // Higher
    } else {
      idArrow = " ↓"; // Lower
    }
  }
  
  idBox.textContent = `ID: ${guessPokemon.pokedexId}${idArrow}`;
  rowDiv.appendChild(idBox);

  const typeBox = document.createElement("div");
  typeBox.classList.add("feedback-box", typeColor);
  typeBox.textContent = `Types: ${guessPokemon.types.join(", ")}`;
  rowDiv.appendChild(typeBox);

  const genBox = document.createElement("div");
  genBox.classList.add("feedback-box", generationColor);
  
  // Arrow for Generation
  let genArrow = "";
  if (generationColor !== "green") {
    if (guessPokemon.generation < dailyPokemon.generation) {
      genArrow = " ↑"; // Higher
    } else {
      genArrow = " ↓"; // Lower
    }
  }
  
  genBox.textContent = `Gen: ${guessPokemon.generation}${genArrow}`;
  rowDiv.appendChild(genBox);

  const colorBox = document.createElement("div");
  colorBox.classList.add("feedback-box", colorColor);
  colorBox.textContent = `Color: ${guessPokemon.color}`;
  rowDiv.appendChild(colorBox);

  const evolBox = document.createElement("div");
  evolBox.classList.add("feedback-box", evolutionColor);
  
  // Arrow for Evolution
  let evolArrow = "";
  if (evolutionColor !== "green") {
    if (guessPokemon.evolutionStage < dailyPokemon.evolutionStage) {
      evolArrow = " ↑"; // Higher
    } else {
      evolArrow = " ↓"; // Lower
    }
  }
  
  evolBox.textContent = `Stage: ${guessPokemon.evolutionStage}${evolArrow}`;
  rowDiv.appendChild(evolBox);

  const heightBox = document.createElement("div");
  heightBox.classList.add("feedback-box", heightColor);
  
  // Arrow for Height
  let heightArrow = "";
  if (heightColor !== "green") {
    if (guessPokemon.height < dailyPokemon.height) {
      heightArrow = " ↑"; // Higher
    } else {
      heightArrow = " ↓"; // Lower
    }
  }
  
  heightBox.textContent = `Ht: ${guessPokemon.height}m${heightArrow}`;
  rowDiv.appendChild(heightBox);

  // Mega Evolution
  const megaBox = document.createElement("div");
  megaBox.classList.add("feedback-box", megaColor);
  megaBox.textContent = guessPokemon.hasMegaEvolution ? "Mega" : "No Mega";
  rowDiv.appendChild(megaBox);

  return rowDiv;
}
// Autocomplete for Pokemon names
function setupAutocomplete() {
  const input = document.getElementById('pokemon-guess');
  
  const autocompleteDropdown = document.createElement('div');
  autocompleteDropdown.id = 'autocomplete-dropdown';
  autocompleteDropdown.classList.add('autocomplete-dropdown');
  
  input.parentNode.insertBefore(autocompleteDropdown, input.nextSibling);
  
  autocompleteDropdown.style.display = 'none';
  
  input.addEventListener('input', function() {
    const searchText = this.value.toLowerCase().trim();
    
    autocompleteDropdown.innerHTML = '';
    
    // Only show dropdown if user has typed something
    if (searchText.length === 0) {
      autocompleteDropdown.style.display = 'none';
      return;
    }
    
    // Filter Pokémon list
    const matches = POKEMON_LIST.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchText)
    );
    
    const limitedMatches = matches.slice(0, 6);
    
    if (limitedMatches.length > 0) {
      // Suggestion items
      limitedMatches.forEach(pokemon => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('autocomplete-item');
        
        // Image element
        const imgElement = document.createElement('img');
        imgElement.src = pokemon.spriteUrl;
        imgElement.alt = pokemon.name;
        imgElement.classList.add('autocomplete-sprite');
        
        // Text element
        const textElement = document.createElement('span');
        textElement.textContent = pokemon.name;
        
        // Append to suggestion item
        suggestionItem.appendChild(imgElement);
        suggestionItem.appendChild(textElement);
        
        // Add click handler
        suggestionItem.addEventListener('click', function() {
          input.value = pokemon.name;
          autocompleteDropdown.style.display = 'none';
        });
        
        autocompleteDropdown.appendChild(suggestionItem);
      });
      
      autocompleteDropdown.style.display = 'block';
    } else {
      autocompleteDropdown.style.display = 'none';
    }
  });
  
  document.addEventListener('click', function(e) {
    if (e.target !== input && e.target !== autocompleteDropdown) {
      autocompleteDropdown.style.display = 'none';
    }
  });
  
  input.addEventListener('keydown', function(e) {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    
    if (items.length === 0) return;
    
    let selectedIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].classList.contains('selected')) {
        selectedIndex = i;
        break;
      }
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Remove previous selection
      if (selectedIndex >= 0) {
        items[selectedIndex].classList.remove('selected');
      }
      
      // Select next item or first if at end
      selectedIndex = (selectedIndex + 1) % items.length;
      items[selectedIndex].classList.add('selected');
    }
    
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Remove previous selection
      if (selectedIndex >= 0) {
        items[selectedIndex].classList.remove('selected');
      }
      
      // Select previous item or last if at beginning
      selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
      items[selectedIndex].classList.add('selected');
    }
    
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      input.value = items[selectedIndex].querySelector('span').textContent;
      autocompleteDropdown.style.display = 'none';
    }
  });
  
  // Focus on input should show dropdown if text exists
  input.addEventListener('focus', function() {
    const searchText = this.value.toLowerCase().trim();
    if (searchText.length > 0) {
      // Trigger the input event to show the dropdown
      const event = new Event('input');
      this.dispatchEvent(event);
    }
  });
}

// Add guess history feature
function addGuessHistory() {
  const historyContainer = document.createElement('div');
  historyContainer.id = 'guess-history';
  historyContainer.classList.add('guess-history');
  historyContainer.innerHTML = '<h3>Your Guesses</h3><div class="history-list"></div>';
  
  document.getElementById('game-area').appendChild(historyContainer);
  
  // Update history when making a guess
  const originalEventListener = document.getElementById('guess-btn').onclick;
  document.getElementById('guess-btn').onclick = function() {
    const guessName = document.getElementById('pokemon-guess').value.trim();
    if (guessName) {
      const historyList = document.querySelector('.history-list');
      const historyItem = document.createElement('div');
      historyItem.textContent = guessName;
      historyItem.classList.add('history-item');
      historyList.prepend(historyItem);
    }
    
    if (typeof originalEventListener === 'function') {
      originalEventListener();
    }
  };
}

// function to create and update the guesses counter UI
function setupGuessCounter() {
  const counterContainer = document.createElement('div');
  counterContainer.id = 'guess-counter';
  counterContainer.classList.add('guess-counter');
  
  updateGuessCounter(counterContainer);
  
  const gameArea = document.getElementById('game-area');
  gameArea.insertBefore(counterContainer, gameArea.firstChild);
  
  return counterContainer;
}

// Update the guess counter display
function updateGuessCounter(container) {
  if (!container) {
    container = document.getElementById('guess-counter');
    if (!container) return;
  }
  
  container.innerHTML = '';
  
  // Create title
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('counter-title');
  titleSpan.textContent = 'Guesses: ';
  container.appendChild(titleSpan);
  
  // Create guess indicators
  for (let i = 0; i < MAX_GUESSES; i++) {
    const indicator = document.createElement('span');
    indicator.classList.add('guess-indicator');
    
    if (i < guessCount) {
      indicator.classList.add('used'); // Used guess
    } else {
      indicator.classList.add('remaining'); // Remaining guess
    }
    
    container.appendChild(indicator);
  }
}

// Handle the guess button click
function handleGuess() {
  if (!dailyPokemon) { // Make sure data is loaded first
    alert("Data not loaded yet.");
    return;
  }
  
  // Check if game is already over
  if (guessCount >= MAX_GUESSES) {
    alert("Game over! You've used all your guesses.");
    return;
  }
  
  const guessInput = document.getElementById("pokemon-guess");
  const guessName = guessInput.value.trim();
  if (!guessName) {
    alert("Please enter a Pokémon name!");
    return;
  }

  // Find the guessed Pokemon in  list
  const guessedPokemon = findPokemonByName(guessName);
  if (!guessedPokemon) {
    alert("Pokemon not found. Check spelling or try again");
    return;
  }

  // Increment guess counter
  guessCount++;
  updateGuessCounter();

  // Feedback row
  const feedbackContainer = document.getElementById("feedback-container");
  const feedbackRow = buildFeedbackRow(guessedPokemon, dailyPokemon);
  feedbackContainer.appendChild(feedbackRow);

  // Check if correct
  const isCorrect = guessedPokemon.name.toLowerCase() === dailyPokemon.name.toLowerCase();
  if (isCorrect) {
    endGame(true);  // Win condition
  } else if (guessCount >= MAX_GUESSES) {
    endGame(false); // Lose condition
  }

  guessInput.value = ""; // Clear input
}

// End game when out of guesses
function endGame(won = false) {
  // Disable guess input
  const guessInput = document.getElementById('pokemon-guess');
  const guessBtn = document.getElementById('guess-btn');
  guessInput.disabled = true;
  guessBtn.disabled = true;
  
  // Create game over message
  const gameOver = document.createElement('div');
  gameOver.id = 'game-over';
  gameOver.classList.add('game-over');
  
  if (won) {
    gameOver.innerHTML = `
      <h2 class="win-message">Correct</h2>
      <p>Good Job, You correctly guessed ${dailyPokemon.name} in ${guessCount} guesses.</p>
    `;
  } else {
    gameOver.innerHTML = `
      <h2 class="lose-message">Game Over!</h2>
      <p>You've used all ${MAX_GUESSES} guesses.</p>
      <p>The correct Pokemon was <strong>${dailyPokemon.name}</strong>!</p>
      <img src="${dailyPokemon.spriteUrl}" alt="${dailyPokemon.name}" class="reveal-pokemon">
    `;
  }
  
  // Add play again button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.textContent = 'Play Again';
  playAgainBtn.classList.add('play-again-btn');
  playAgainBtn.addEventListener('click', resetGame);
  gameOver.appendChild(playAgainBtn);
  
  document.getElementById('game-area').prepend(gameOver);
}

// Reset the game for playing again
function resetGame() {
  guessCount = 0; // Reset guess count
  
  // Select a new daily Pokémon
  dailyPokemon = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
  console.log("New Pokemon is:", dailyPokemon.name);
  
  // Clear feedback 
  document.getElementById('feedback-container').innerHTML = '';
  
  // Remove game over element if it exists
  const gameOver = document.getElementById('game-over');
  if (gameOver) gameOver.remove();
  
  // Enable back guess input
  const guessInput = document.getElementById('pokemon-guess');
  const guessBtn = document.getElementById('guess-btn');
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.value = '';
  guessInput.focus();
  
  updateGuessCounter(); // Reset guess counter
  
  // Clear history list if it exists
  const historyList = document.querySelector('.history-list');
  if (historyList) historyList.innerHTML = '';
}

// Initialize the guess counter on game start
function startGame() {
  guessCount = 0; // Reset guess count and setup counter
  setupGuessCounter();
  
  // Play the "Who's that Pokemon" audio
  const audio = document.getElementById('whos-that-pokemon');
  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.play().catch(error => {
    console.error("Audio playback failed:", error);
  });
  
  // Hide instructions and show game
  const instructions = document.getElementById('instructions');
  const gameArea = document.getElementById('game-area');
  instructions.style.display = 'none';
  gameArea.style.display = 'block';
  
  document.getElementById('pokemon-guess').focus();
}

document.addEventListener('DOMContentLoaded', function() {
  loadPokemonData(); // Load Pokémon data
  
  // Set up button clicks
  document.getElementById('start-game').addEventListener('click', addGuessHistory);
  document.getElementById('guess-btn').addEventListener('click', handleGuess);
  
  // Enable Enter key for submitting guesses
  document.getElementById('pokemon-guess').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('guess-btn').click();
    }
  });
  
  const gameArea = document.getElementById('game-area');
  const guessContainer = document.querySelector('.guess-container');
  const feedbackContainer = document.getElementById('feedback-container');
  
  if (gameArea && guessContainer && feedbackContainer) {
    if (guessContainer.parentNode === document.body) {
      document.body.removeChild(guessContainer);
      gameArea.appendChild(guessContainer);
    }
    
    if (feedbackContainer.parentNode === document.body) {
      document.body.removeChild(feedbackContainer);
      gameArea.appendChild(feedbackContainer);
    }
  }
  
  // Update the start game event listener
  const startGameBtn = document.getElementById('start-game');
  const existingClickHandler = startGameBtn.onclick;
  startGameBtn.onclick = function(event) {
    if (typeof existingClickHandler === 'function') { // Call the existing handler if there is one
      existingClickHandler.call(this, event);
    }
    
    // Call startGame function
    startGame();
  };
});