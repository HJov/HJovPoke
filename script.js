// Global Variables
let POKEMON_LIST = [];
let dailyPokemon = null;
let guessCount = 0;
const MAX_GUESSES = 7;
const HELP_UNLOCK_THRESHOLD = 5;

// Load Pokémon data from JSON file
function loadPokemonData() {
  return fetch("./data/pokemonData.json")
    .then((res) => res.json())
    .then((data) => {
      window.ORIGINAL_POKEMON_LIST = data;
      POKEMON_LIST = data;
      
      // Select random daily Pokémon
      dailyPokemon = getDailyPokemon();
      console.log("Daily Pokemon is:", dailyPokemon.name);
      
      setupAutocomplete();
      
      return data;
    })
    .catch((err) => {
      console.error("Failed to load Pokemon data:", err);
    });
}

// Helper function to find a Pokemon by name
function findPokemonByName(name) {
  return POKEMON_LIST.find(
    (p) => p.name.toLowerCase() === name.toLowerCase().trim()
  );
}

// Compare Pokedex ID 
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
  
  //Add arrow for Generation
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
  
  //Add  arrow for Evolution
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
  
  //Add  arrow for Height
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
// Autocomplete 
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
        
        //Image element
        const imgElement = document.createElement('img');
        imgElement.src = pokemon.spriteUrl;
        imgElement.alt = pokemon.name;
        imgElement.classList.add('autocomplete-sprite');
        
        const textElement = document.createElement('span');
        textElement.textContent = pokemon.name;
        
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
    
    // Handle arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (selectedIndex >= 0) {
        items[selectedIndex].classList.remove('selected');
      }
      
    
      selectedIndex = (selectedIndex + 1) % items.length;
      items[selectedIndex].classList.add('selected');
    }
    
    // Handle arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
     
      if (selectedIndex >= 0) {
        items[selectedIndex].classList.remove('selected');
      }
      
      
      selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
      items[selectedIndex].classList.add('selected');
    }
    
    // Handle enter key
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      input.value = items[selectedIndex].querySelector('span').textContent;
      autocompleteDropdown.style.display = 'none';
    }
  });
  
  
  input.addEventListener('focus', function() {
    const searchText = this.value.toLowerCase().trim();
    if (searchText.length > 0) {
      const event = new Event('input');
      this.dispatchEvent(event);
    }
  });
}

// Guess history 
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

// Hint system
function setupHintSystem() {
  const hintBtn = document.createElement('button');
  hintBtn.id = 'hint-btn';
  hintBtn.textContent = 'Get Hint';
  hintBtn.classList.add('hint-button');
  
  const hintArea = document.createElement('div');
  hintArea.id = 'hint-area';
  hintArea.classList.add('hint-area');
  
  document.getElementById('game-area').appendChild(hintBtn);
  document.getElementById('game-area').appendChild(hintArea);
  
  // Hints array
  const hints = [
    pokemon => `This Pokémon is from Generation ${pokemon.generation}.`,
    pokemon => `This Pokémon is ${pokemon.color} colored.`,
    pokemon => `This Pokémon's ID is between ${Math.max(1, pokemon.pokedexId - 50)} and ${pokemon.pokedexId + 50}.`,
    pokemon => `This Pokémon ${pokemon.hasMegaEvolution ? 'has' : 'does not have'} a Mega Evolution.`,
    pokemon => `This Pokémon is a ${pokemon.types.join('/')} type.`,
    pokemon => `This Pokémon is ${pokemon.height}m tall.`,
    pokemon => `This Pokémon is at evolution stage ${pokemon.evolutionStage}.`
  ];
  
  
  let hintsUsed = 0;
  hintBtn.addEventListener('click', () => {
    if (!dailyPokemon) return;
    
    if (hintsUsed < hints.length) {
      const hint = hints[hintsUsed](dailyPokemon);
      const hintElement = document.createElement('p');
      hintElement.textContent = hint;
      hintArea.appendChild(hintElement);
      hintsUsed++;
      
      if (hintsUsed >= hints.length) {
        hintBtn.disabled = true;
        hintBtn.textContent = 'No More Hints';
      }
    }
  });
}


// Game start
function startGame() {
  // Play the "Who's that Pokemon" audio
  const audio = document.getElementById('whos-that-pokemon');
  audio.play();
  
  
  const instructions = document.getElementById('instructions');
  const gameArea = document.getElementById('game-area');
  instructions.style.display = 'none';
  gameArea.style.display = 'block';
  
  
  document.getElementById('pokemon-guess').focus();
}


document.addEventListener('DOMContentLoaded', function() {
  loadPokemonData();
  
  
  document.getElementById('start-game').addEventListener('click', addGuessHistory);
  document.getElementById('start-game').addEventListener('click', setupHintSystem);
  document.getElementById('guess-btn').addEventListener('click', handleGuess);
  
  
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
});



function addGameInstructions() {
  const instructionsPanel = document.createElement('div');
  instructionsPanel.id = 'game-instructions';
  instructionsPanel.classList.add('game-instructions');
  
  
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggle-instructions';
  toggleButton.classList.add('toggle-instructions');
  toggleButton.textContent = 'How to Play';
  toggleButton.innerHTML = '<span>?</span> How to Play';
  
  
  toggleButton.addEventListener('click', function() {
    const panel = document.getElementById('instructions-content');
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      this.classList.add('active');
    } else {
      panel.style.display = 'none';
      this.classList.remove('active');
    }
  });
  
  
  const instructionsContent = document.createElement('div');
  instructionsContent.id = 'instructions-content';
  instructionsContent.style.display = 'none';
  
  // Instruction content
  instructionsContent.innerHTML = `
    <h3>How to Play Poké-Guess</h3>
    <p>Try to guess the hidden Pokémon with the fewest guesses possible!</p>
    <div class="instruction-grid">
      <div>
        <h4>Color Meanings</h4>
        <ul>
          <li><span class="green-dot"></span> Green: Exact match</li>
          <li><span class="yellow-dot"></span> Yellow: Close match</li>
          <li><span class="red-dot"></span> Red: No match</li>
        </ul>
      </div>
      <div>
        <h4>Arrow Indicators</h4>
        <ul>
          <li><strong>↑</strong>: The correct value is higher</li>
          <li><strong>↓</strong>: The correct value is lower</li>
        </ul>
      </div>
    </div>
    <table class="instruction-table">
      <tr>
        <th>Attribute</th>
        <th>How It's Matched</th>
      </tr>
      <tr>
        <td>Name</td>
        <td>Red until correct, then Green</td>
      </tr>
      <tr>
        <td>Pokédex ID</td>
        <td>Green if within 10, Yellow if within 100</td>
      </tr>
      <tr>
        <td>Types</td>
        <td>Green if exact match, Yellow if partial match</td>
      </tr>
      <tr>
        <td>Generation</td>
        <td>Green if exact match, Red otherwise</td>
      </tr>
      <tr>
        <td>Color</td>
        <td>Green if exact match, Red otherwise</td>
      </tr>
      <tr>
        <td>Evolution</td>
        <td>Green if exact, Yellow if lower, Red if higher</td>
      </tr>
      <tr>
        <td>Height</td>
        <td>Green if within 0.2m, Yellow if within 0.5m</td>
      </tr>
      <tr>
        <td>Mega</td>
        <td>Green if both have or don't have, Red otherwise</td>
      </tr>
    </table>
    <p class="instruction-tip">Tip: Use the "Get Hint" button if you're stuck!</p>
  `;
  
  instructionsPanel.appendChild(toggleButton);
  instructionsPanel.appendChild(instructionsContent);
  

  document.getElementById('game-area').appendChild(instructionsPanel);
}


document.getElementById('start-game').addEventListener('click', addGameInstructions);


function setupGuessCounter() {
  const counterContainer = document.createElement('div');
  counterContainer.id = 'guess-counter';
  counterContainer.classList.add('guess-counter');
  
  // Counter display
  updateGuessCounter(counterContainer);
  

  const gameArea = document.getElementById('game-area');
  gameArea.insertBefore(counterContainer, gameArea.firstChild);
  
  return counterContainer;
}


function updateGuessCounter(container) {
  if (!container) {
    container = document.getElementById('guess-counter');
    if (!container) return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create title
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('counter-title');
  titleSpan.textContent = 'Guesses: ';
  container.appendChild(titleSpan);
  
  // Create guess indicator
  for (let i = 0; i < MAX_GUESSES; i++) {
    const indicator = document.createElement('span');
    indicator.classList.add('guess-indicator');
    
    if (i < guessCount) {
      indicator.classList.add('used');
    } else {
      indicator.classList.add('remaining');
    }
    
    container.appendChild(indicator);
  }
  
  
  if (guessCount >= HELP_UNLOCK_THRESHOLD && guessCount < MAX_GUESSES && !document.getElementById('special-help')) {
    addSpecialHelpOptions();
  }
}

// Add  help options after 5 guesses
function addSpecialHelpOptions() {
  const helpContainer = document.createElement('div');
  helpContainer.id = 'special-help';
  helpContainer.classList.add('special-help');
  
 
  const heading = document.createElement('h3');
  heading.textContent = 'Need extra help?';
  helpContainer.appendChild(heading);
  
  
  const helpText = document.createElement('p');
  helpText.textContent = 'You\'ve used 5 or more guesses. You can reveal one category to help you:';
  helpContainer.appendChild(helpText);
  
  // Add category reveal button 
  const categoryBtn = document.createElement('button');
  categoryBtn.textContent = 'Reveal One Category';
  categoryBtn.classList.add('special-help-btn');
  categoryBtn.addEventListener('click', function() {
    showCategoryRevealOptions();
    this.disabled = true;
    this.classList.add('used');
  });
  helpContainer.appendChild(categoryBtn);
  
  
  document.getElementById('game-area').appendChild(helpContainer);
}


// Show category reveal options
function showCategoryRevealOptions() {
  const modal = document.createElement('div');
  modal.id = 'category-modal';
  modal.classList.add('category-modal');
  
  
  const heading = document.createElement('h3');
  heading.textContent = 'Choose a category to reveal';
  modal.appendChild(heading);
  
  // Create category buttons
  const categories = [
    { id: 'pokedexId', name: 'Pokédex ID' },
    { id: 'types', name: 'Types' },
    { id: 'generation', name: 'Generation' },
    { id: 'color', name: 'Color' },
    { id: 'evolutionStage', name: 'Evolution Stage' },
    { id: 'height', name: 'Height' },
    { id: 'hasMegaEvolution', name: 'Mega Evolution' }
  ];
  
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('category-buttons');
  
  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.name;
    button.classList.add('category-btn');
    button.addEventListener('click', function() {
      revealCategory(category.id, category.name);
      document.body.removeChild(modal);
    });
    buttonContainer.appendChild(button);
  });
  
  modal.appendChild(buttonContainer);
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cancel';
  closeBtn.classList.add('category-close-btn');
  closeBtn.addEventListener('click', function() {
    document.body.removeChild(modal);
    
    
    const helpBtns = document.querySelectorAll('.special-help-btn');
    helpBtns.forEach(btn => {
      btn.disabled = false;
    });
  });
  modal.appendChild(closeBtn);
  
  
  document.body.appendChild(modal);
}

// Reveal a specific category
function revealCategory(categoryId, categoryName) {
  const value = dailyPokemon[categoryId];
  let displayValue = value;
  
  
  if (categoryId === 'types') {
    displayValue = value.join(', ');
  } else if (categoryId === 'hasMegaEvolution') {
    displayValue = value ? 'Yes' : 'No';
  } else if (categoryId === 'height') {
    displayValue = value + 'm';
  }
  
  // Create reveal container if it doesn't exist
  if (!document.getElementById('category-reveal')) {
    const revealContainer = document.createElement('div');
    revealContainer.id = 'category-reveal';
    revealContainer.classList.add('category-reveal');
    
    
    const heading = document.createElement('h3');
    heading.textContent = 'Category Revealed';
    revealContainer.appendChild(heading);
    
    
    const revealInfo = document.createElement('div');
    revealInfo.classList.add('reveal-info');
    revealInfo.innerHTML = `<strong>${categoryName}:</strong> <span class="reveal-value">${displayValue}</span>`;
    revealContainer.appendChild(revealInfo);
    
    
    const guessContainer = document.querySelector('.guess-container');
    document.getElementById('game-area').insertBefore(revealContainer, guessContainer);
  }
}


function disableSpecialHelpButtons() {
  const helpBtns = document.querySelectorAll('.special-help-btn');
  helpBtns.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('used');
  });
}


// Reset the game for playing again
function resetGame() {
  guessCount = 0;
  
  // Select a new daily Pokémon
  dailyPokemon = getDailyPokemon();
  console.log("New Pokemon is:", dailyPokemon.name);
  
  // Clear feedback container
  document.getElementById('feedback-container').innerHTML = '';
  
  // Remove game over, silhouette, category reveal, and special help
  const elementsToRemove = ['game-over', 'pokemon-silhouette', 'category-reveal', 'special-help'];
  elementsToRemove.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });
  
  // Reenable guess input
  const guessInput = document.getElementById('pokemon-guess');
  const guessBtn = document.getElementById('guess-btn');
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessInput.value = '';
  guessInput.focus();
  
  // Reset guess counter
  updateGuessCounter();
  
  // Reset hint area 
  const hintArea = document.getElementById('hint-area');
  if (hintArea) hintArea.innerHTML = '';
  
  // Reset hint button 
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.disabled = false;
    hintBtn.textContent = 'Get Hint';
  }
  
  // Clear history list 
  const historyList = document.querySelector('.history-list');
  if (historyList) historyList.innerHTML = '';
}

// Modify the handleGuess function to use the guess counter
function handleGuess() {
  if (!dailyPokemon) {
    alert("Data not loaded yet. Please wait or refresh.");
    return;
  }
  
  // Check to see if game is already over
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

  // Find the guessed Pokemon in list
  const guessedPokemon = findPokemonByName(guessName);
  if (!guessedPokemon) {
    alert("Pokémon not found. Check spelling or see if it's missing from the data!");
    return;
  }

  // Increment guess counter
  guessCount++;
  updateGuessCounter();

  // Build feedback row
  const feedbackContainer = document.getElementById("feedback-container");
  const feedbackRow = buildFeedbackRow(guessedPokemon, dailyPokemon);
  feedbackContainer.appendChild(feedbackRow);

  // Check if correct
  const isCorrect = guessedPokemon.name.toLowerCase() === dailyPokemon.name.toLowerCase();
  
  if (isCorrect) {
    endGame(true);
  } else if (guessCount >= MAX_GUESSES) {
    endGame(false);
  }

  // Clear input
  guessInput.value = "";
}

// Initialize the guess counter on game start
function startGame() {
  guessCount = 0;
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
  document.getElementById('guess-btn').addEventListener('click', handleGuess);
  
  document.getElementById('pokemon-guess').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      handleGuess();
    }
  });
  
  
  const startGameBtn = document.getElementById('start-game');
  const existingClickHandler = startGameBtn.onclick;
  startGameBtn.onclick = function(event) {
    if (typeof existingClickHandler === 'function') {
      existingClickHandler.call(this, event);
    }
  
    
    startGame();
  };
});


// Global variables for filters
let activeFilters = {
  generations: [],
  types: [],
  colors: [],
  legendary: false
};

// Function to determine if a Pokemon is legendary
function isLegendary(pokemon) {
  // Legendary Pokemon by Pokedex ID ranges
  const legendaries = [
    // Gen 1 Legendaries
    144, 145, 146, 150, 151,
    // Gen 2 Legendaries
    243, 244, 245, 249, 250, 251,
    // Gen 3 Legendaries
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    // Gen 4 Legendaries
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    // Gen 5 Legendaries
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    // Gen 6 Legendaries
    716, 717, 718, 719, 720, 721,
    // Gen 7 Legendaries
    785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    // Gen 8 Legendaries
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    // Gen 9 Legendaries
    984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1022, 1023, 1024, 1025
  ];
  
  return legendaries.includes(pokemon.pokedexId);
}

// Function to filter the Pokemon list based on active filters
function filterPokemonList() {
  // Start with the full Pokemon list
  let filteredList = [...POKEMON_LIST];
  
  // Filter by generations if any are selected
  if (activeFilters.generations.length > 0) {
    filteredList = filteredList.filter(pokemon => 
      activeFilters.generations.includes(pokemon.generation)
    );
  }
  
  // Filter by types if any are selected
  if (activeFilters.types.length > 0) {
    filteredList = filteredList.filter(pokemon => 
      pokemon.types.some(type => activeFilters.types.includes(type))
    );
  }
  
  // Filter by colors if any are selected
  if (activeFilters.colors.length > 0) {
    filteredList = filteredList.filter(pokemon => 
      activeFilters.colors.includes(pokemon.color)
    );
  }
  
  // Filter by legendary status if selected
  if (activeFilters.legendary) {
    filteredList = filteredList.filter(pokemon => isLegendary(pokemon));
  }
  
  // Make sure we have at least one Pokemon after filtering
  if (filteredList.length === 0) {
    alert("No Pokemon match these filter criteria. Please select different filters.");
    return POKEMON_LIST;
  }
  
  return filteredList;
}

// Create and show the filter UI
function createFilterUI() {
  // Create the filter container
  const filterContainer = document.createElement('div');
  filterContainer.id = 'filter-container';
  filterContainer.classList.add('filter-container');
  
  // Add title
  const filterTitle = document.createElement('h3');
  filterTitle.textContent = 'Filter Pokemon';
  filterContainer.appendChild(filterTitle);
  
  // Create Generation filter
  const genContainer = document.createElement('div');
  genContainer.classList.add('filter-section');
  const genLabel = document.createElement('p');
  genLabel.textContent = 'Generation:';
  genContainer.appendChild(genLabel);
  
  const genOptions = document.createElement('div');
  genOptions.classList.add('filter-options');
  
  // Get unique generations
  const generations = [...new Set(POKEMON_LIST.map(p => p.generation))].sort((a, b) => a - b);
  
  generations.forEach(gen => {
    const checkbox = document.createElement('div');
    checkbox.classList.add('filter-checkbox');
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `gen-${gen}`;
    input.value = gen;
    input.addEventListener('change', function() {
      if (this.checked) {
        activeFilters.generations.push(parseInt(this.value));
      } else {
        activeFilters.generations = activeFilters.generations.filter(g => g !== parseInt(this.value));
      }
    });
    
    const label = document.createElement('label');
    label.htmlFor = `gen-${gen}`;
    label.textContent = `Gen ${gen}`;
    
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    genOptions.appendChild(checkbox);
  });
  
  genContainer.appendChild(genOptions);
  filterContainer.appendChild(genContainer);
  
  // Create Type filter
  const typeContainer = document.createElement('div');
  typeContainer.classList.add('filter-section');
  const typeLabel = document.createElement('p');
  typeLabel.textContent = 'Type:';
  typeContainer.appendChild(typeLabel);
  
  const typeOptions = document.createElement('div');
  typeOptions.classList.add('filter-options');
  
  // Get unique types
  const allTypes = POKEMON_LIST.flatMap(p => p.types);
  const types = [...new Set(allTypes)].sort();
  
  types.forEach(type => {
    const checkbox = document.createElement('div');
    checkbox.classList.add('filter-checkbox');
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `type-${type}`;
    input.value = type;
    input.addEventListener('change', function() {
      if (this.checked) {
        activeFilters.types.push(this.value);
      } else {
        activeFilters.types = activeFilters.types.filter(t => t !== this.value);
      }
    });
    
    const label = document.createElement('label');
    label.htmlFor = `type-${type}`;
    label.textContent = type;
    
    // Add type color styling based on the Pokemon type
    const typeColor = getPokemonTypeColor(type);    label.style.backgroundColor = typeColor;
    label.style.color = getContrastColor(typeColor);
    label.style.padding = '2px 8px';
    label.style.borderRadius = '4px';
    
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    typeOptions.appendChild(checkbox);
  });
  
  typeContainer.appendChild(typeOptions);
  filterContainer.appendChild(typeContainer);
  
  // Create Color filter
  const colorContainer = document.createElement('div');
  colorContainer.classList.add('filter-section');
  const colorLabel = document.createElement('p');
  colorLabel.textContent = 'Color:';
  colorContainer.appendChild(colorLabel);
  
  const colorOptions = document.createElement('div');
  colorOptions.classList.add('filter-options');
  
  // Get unique colors
  const colors = [...new Set(POKEMON_LIST.map(p => p.color))].sort();
  
  colors.forEach(color => {
    const checkbox = document.createElement('div');
    checkbox.classList.add('filter-checkbox');
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `color-${color}`;
    input.value = color;
    input.addEventListener('change', function() {
      if (this.checked) {
        activeFilters.colors.push(this.value);
      } else {
        activeFilters.colors = activeFilters.colors.filter(c => c !== this.value);
      }
    });
    
    const label = document.createElement('label');
    label.htmlFor = `color-${color}`;
    label.textContent = color;
    
    // Make the label colored based on the Pokemon color
    const colorValue = getPokemonColorValue(color);
    label.style.backgroundColor = colorValue;
    label.style.color = getContrastColor(colorValue);
    label.style.padding = '2px 8px';
    label.style.borderRadius = '4px';
    
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    colorOptions.appendChild(checkbox);
  });
  
  colorContainer.appendChild(colorOptions);
  filterContainer.appendChild(colorContainer);
  
  // Create Legendary filter
  const legendaryContainer = document.createElement('div');
  legendaryContainer.classList.add('filter-section');
  
  const legendaryCheckbox = document.createElement('div');
  legendaryCheckbox.classList.add('filter-checkbox');
  
  const legendaryInput = document.createElement('input');
  legendaryInput.type = 'checkbox';
  legendaryInput.id = 'legendary';
  legendaryInput.addEventListener('change', function() {
    activeFilters.legendary = this.checked;
  });
  
  const legendaryLabel = document.createElement('label');
  legendaryLabel.htmlFor = 'legendary';
  legendaryLabel.textContent = 'Legendary Pokémon Only';
  
  legendaryCheckbox.appendChild(legendaryInput);
  legendaryCheckbox.appendChild(legendaryLabel);
  
  legendaryContainer.appendChild(legendaryCheckbox);
  filterContainer.appendChild(legendaryContainer);
  
  // Create Apply button
  const applyButton = document.createElement('button');
  applyButton.id = 'apply-filters';
  applyButton.textContent = 'Apply Filters';
  applyButton.classList.add('filter-button');
  applyButton.addEventListener('click', function() {
    const filteredPokemon = filterPokemonList();
    if (filteredPokemon.length > 0) {
      // Update the Pokemon list and select a random Pokemon from the filtered list
      POKEMON_LIST = filteredPokemon;
      dailyPokemon = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
      console.log("New filtered Pokemon is:", dailyPokemon.name);
      
      // Close the filter and start a new game
      document.getElementById('filter-modal').style.display = 'none';
      resetGame();
      
      // Show the number of Pokémon that match the filter
      const matchCountEl = document.createElement('div');
      matchCountEl.id = 'match-count';
      matchCountEl.innerHTML = `<p>Playing with ${POKEMON_LIST.length} Pokémon that match your filters!</p>`;
      document.getElementById('game-area').prepend(matchCountEl);
      
      
      setTimeout(() => {
        if (document.getElementById('match-count')) {
          document.getElementById('match-count').classList.add('fade-out');
        }
      }, 5000);
    }
  });
  
  // Create Reset button
  const resetButton = document.createElement('button');
  resetButton.id = 'reset-filters';
  resetButton.textContent = 'Reset Filters';
  resetButton.classList.add('filter-button');
  resetButton.addEventListener('click', function() {
    document.querySelectorAll('#filter-container input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Reset the filter object
    activeFilters = {
      generations: [],
      types: [],
      colors: [],
      legendary: false
    };
  });
  
  
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('filter-buttons');
  buttonContainer.appendChild(resetButton);
  buttonContainer.appendChild(applyButton);
  filterContainer.appendChild(buttonContainer);
  
 
  const filterModal = document.createElement('div');
  filterModal.id = 'filter-modal';
  filterModal.classList.add('filter-modal');
  
  filterModal.appendChild(filterContainer);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', function() {
    filterModal.style.display = 'none';
  });
  
  filterContainer.appendChild(closeButton);
  
  document.body.appendChild(filterModal);
  
  // Filter button to show on the game screen
  const showFilterButton = document.createElement('button');
  showFilterButton.id = 'show-filter-button';
  showFilterButton.textContent = 'Filter Pokémon';
  showFilterButton.classList.add('show-filter-button');
  showFilterButton.addEventListener('click', function() {
    filterModal.style.display = 'block';
  });
  
  document.getElementById('game-area').appendChild(showFilterButton);
}

// Helper function to get Pokemon type colors
function getPokemonTypeColor(type) {
  const typeColors = {
    'Normal': '#A8A878',
    'Fire': '#F08030',
    'Water': '#6890F0',
    'Electric': '#F8D030',
    'Grass': '#78C850',
    'Ice': '#98D8D8',
    'Fighting': '#C03028',
    'Poison': '#A040A0',
    'Ground': '#E0C068',
    'Flying': '#A890F0',
    'Psychic': '#F85888',
    'Bug': '#A8B820',
    'Rock': '#B8A038',
    'Ghost': '#705898',
    'Dragon': '#7038F8',
    'Dark': '#705848',
    'Steel': '#B8B8D0',
    'Fairy': '#EE99AC'
  };
  
  return typeColors[type] || '#888888';
}

// Helper function to get Pokemon color values
function getPokemonColorValue(color) {
  const colorValues = {
    'Black': '#303030',
    'Blue': '#3B5BA7',
    'Brown': '#A0522D',
    'Gray': '#919191',
    'Green': '#3F9B35',
    'Pink': '#FF8AD2',
    'Purple': '#A040A0',
    'Red': '#E64D3D',
    'White': '#EEEEEE',
    'Yellow': '#FCCF00'
  };
  
  return colorValues[color] || '#888888';
}

function getContrastColor(hexColor) {
  hexColor = hexColor.replace('#', '');
  
  
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
 
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function startGame() {
  const audio = document.getElementById('whos-that-pokemon');
  audio.currentTime = 0;
  audio.volume = 0.5;
  audio.play().catch(error => {
    console.error("Audio playback failed:", error);
  });
  
  
  const instructions = document.getElementById('instructions');
  const gameArea = document.getElementById('game-area');
  instructions.style.display = 'none';
  gameArea.style.display = 'block';
  
 
  createFilterUI();
  
  
  guessCount = 0;
  setupGuessCounter();
  
  document.getElementById('pokemon-guess').focus();
}

// Hook into the reset game function to handle filtered Pokemon
const originalResetGame = resetGame;
resetGame = function() {
  originalResetGame();
  
  // Select a new daily Pokémon from the filtered list
  dailyPokemon = POKEMON_LIST[Math.floor(Math.random() * POKEMON_LIST.length)];
  console.log("New Pokemon is:", dailyPokemon.name);
}

const styleElement = document.createElement('style');
styleElement.textContent = `
.filter-modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
}

.filter-container {
  background-color: #fff;
  margin: 15% auto;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section p {
  font-weight: bold;
  margin-bottom: 8px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  margin-right: 10px;
  margin-bottom: 5px;
}

.filter-checkbox label {
  margin-left: 5px;
  cursor: pointer;
}

.filter-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.filter-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#apply-filters {
  background-color: #3498db;
  color: white;
}

#reset-filters {
  background-color: #e74c3c;
  color: white;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.show-filter-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 100;
}

#match-count {
  background-color: #f0f8ff;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border-left: 4px solid #3498db;
  transition: opacity 1s ease-out;
}

.fade-out {
  opacity: 0;
}

@media (max-width: 768px) {
  .filter-container {
    width: 90%;
    margin: 10% auto;
    padding: 15px;
  }
  
  .filter-options {
    gap: 5px;
  }
}
`;

document.head.appendChild(styleElement);

function getDailyPokemon() {
  // Generate a random Pokémon
  const randomIndex = Math.floor(Math.random() * POKEMON_LIST.length);
  return POKEMON_LIST[randomIndex];
}

// Create sharable results
function generateShareText() {
  const today = new Date();
  const dateString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  
  let shareText = `PokeWordle ${dateString} - ${guessCount}/${MAX_GUESSES}\n\n`;
  
  const feedbackRows = document.querySelectorAll('.feedback-row');
  
  // Create representation for each guess
  feedbackRows.forEach(row => {
    const boxes = row.querySelectorAll('.feedback-box');
    
    for (let i = 2; i < boxes.length; i++) {
      if (boxes[i].classList.contains('green')) {
        shareText += '🟩'; // Green square for correct
      } else if (boxes[i].classList.contains('yellow')) {
        shareText += '🟨'; // Yellow square for close
      } else if (boxes[i].classList.contains('red')) {
        shareText += '🟥'; // Red square for wrong
      }
    }
    shareText += '\n';
  });
  
  // Add URL to play
  shareText += '\nPlay at [your-game-url]';
  
  return shareText;
}

// Add share button to the game over screen
const shareButton = document.createElement('button');
shareButton.textContent = 'Share Results';
shareButton.classList.add('share-button');
shareButton.addEventListener('click', function() {
  const shareText = generateShareText();
  
  // Create a results display 
  const resultsDisplay = document.createElement('div');
  resultsDisplay.classList.add('share-results-display');
  
  resultsDisplay.innerHTML = `
    <h3>Your PokeWordle Results</h3>
    <pre>${shareText}</pre>
    <div class="share-options">
      <button id="copy-results">Copy to Clipboard</button>
      <button id="close-results">Close</button>
    </div>
  `;
  
  document.getElementById('game-area').appendChild(resultsDisplay);
  
  
  document.getElementById('copy-results').addEventListener('click', async function() {
    try {
      await navigator.clipboard.writeText(shareText);
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = 'Copy to Clipboard';
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.textContent = 'Copied!';
      setTimeout(() => {
        this.textContent = 'Copy to Clipboard';
      }, 2000);
    }
  });
  
  document.getElementById('close-results').addEventListener('click', function() {
    resultsDisplay.remove();
  });
});

function endGame(won = false) {
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
      <h2 class="win-message">You got it! 🎉</h2>
      <p>Congratulations! You correctly guessed ${dailyPokemon.name} in ${guessCount} guesses.</p>
    `;
  } else {
    gameOver.innerHTML = `
      <h2 class="lose-message">Game Over!</h2>
      <p>You've used all ${MAX_GUESSES} guesses.</p>
      <p>The Pokémon was <strong>${dailyPokemon.name}</strong>!</p>
      <img src="${dailyPokemon.spriteUrl}" alt="${dailyPokemon.name}" class="reveal-pokemon">
    `;
  }
  
  // Add play again button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.textContent = 'Play Again';
  playAgainBtn.classList.add('play-again-btn');
  playAgainBtn.addEventListener('click', resetGame);
  gameOver.appendChild(playAgainBtn);
  
  // Add share button with visual display 
  if (won || guessCount >= MAX_GUESSES) {
    const shareButton = document.createElement('button');
    shareButton.textContent = 'Share Results';
    shareButton.classList.add('share-button');
    shareButton.addEventListener('click', function() {
      const shareText = generateShareText();
      
      // Create a results display container
      const resultsDisplay = document.createElement('div');
      resultsDisplay.classList.add('share-results-display');
      
      // Add formatted results
      resultsDisplay.innerHTML = `
        <h3>Your PokeWordle Results</h3>
        <pre>${shareText}</pre>
        <div class="share-options">
          <button id="copy-results">Copy to Clipboard</button>
          <button id="close-results">Close</button>
        </div>
      `;
      
      
      document.getElementById('game-area').appendChild(resultsDisplay);
      
      
      document.getElementById('copy-results').addEventListener('click', async function() {
        try {
          await navigator.clipboard.writeText(shareText);
          this.textContent = 'Copied!';
          setTimeout(() => {
            this.textContent = 'Copy to Clipboard';
          }, 2000);
        } catch (err) {
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.textContent = 'Copied!';
          setTimeout(() => {
            this.textContent = 'Copy to Clipboard';
          }, 2000);
        }
      });
      
      document.getElementById('close-results').addEventListener('click', function() {
        resultsDisplay.remove();
      });
    });
    
    // Add button after play again button
    gameOver.appendChild(shareButton);
  }
  
  // Add to game area
  document.getElementById('game-area').prepend(gameOver);
}

function loadPokemonData() {
  return fetch("./data/pokemonData.json")
    .then((res) => res.json())
    .then((data) => {
      window.ORIGINAL_POKEMON_LIST = data;
      POKEMON_LIST = data;
      
      
      dailyPokemon = getDailyPokemon();
      console.log("Daily Pokemon is:", dailyPokemon.name);
      
      setupAutocomplete();
      return data;
    })
    .catch((err) => {
      console.error("Failed to load Pokemon data:", err);
    });
}