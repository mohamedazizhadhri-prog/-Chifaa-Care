// Tunisian Rami Client Logic with Lay-Off Feature

let socket = null;
let currentGameId = null;
let myPlayerId = null;
let myHand = [];
let selectedCardIds = [];
let drewFromDiscard = false;
let drawnCardId = null;
let currentPhase = 'lobby';
let allMelds = [];
let draggedCardId = null;
let cardOrder = {}; // Store card order: {cardId: position}
let inDiscardPhase = false;
let layoffMode = false;
let selectedCardForLayoff = null;
let hasCreatedFirstMeld = false;

function log(message, type = 'info') {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function updateStatus(connected) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = connected ? 'status connected' : 'status disconnected';
    statusDiv.textContent = connected ? '✅ Connected & Authenticated' : '⚠️ Disconnected';
}

function connectPlayer() {
    const serverUrl = document.getElementById('serverUrl').value;
    const playerId = document.getElementById('playerId').value;
    const playerName = document.getElementById('playerName').value;
    
    if (!playerId || !playerName) {
        alert('Please enter Player ID and Name');
        return;
    }
    
    myPlayerId = playerId;
    log(`Connecting to ${serverUrl}...`);
    socket = io(serverUrl);
    
    socket.on('connect', () => {
        log('Socket connected!', 'success');
        socket.emit('authenticate', {
            playerId,
            playerName,
            playerAvatar: `https://i.pravatar.cc/150?u=${playerId}`
        });
    });
    
    socket.on('authenticated', () => {
        log('✅ Authenticated successfully!', 'success');
        updateStatus(true);
        document.getElementById('gameSection').classList.add('active');
    });
    
    socket.on('disconnect', () => {
        log('Disconnected', 'error');
        updateStatus(false);
    });
    
    setupGameListeners();
}

function setupGameListeners() {
    socket.on('game:created', ({ gameId, game }) => {
        log(`✅ Game created! ID: ${gameId}`, 'success');
        currentGameId = gameId;
        document.getElementById('gameIdInput').value = gameId;
    });
    
    socket.on('game:joined', ({ game }) => {
        log('✅ Joined game!', 'success');
        currentGameId = game.id;
    });
    
    socket.on('game:player_joined', ({ player }) => {
        log(`👤 ${player.name} joined the game`);
    });
    
    socket.on('player:all_ready', () => {
        log('✅ All players ready! Host can start the game.', 'success');
    });
    
    socket.on('game:started', (data) => {
        log('🎮 GAME STARTED!', 'success');
        currentPhase = data.phase;
        initializeCardOrder(data.myHand);
        updateGameState(data);
        document.getElementById('phaseIndicator').style.display = 'block';
        document.getElementById('handSection').style.display = 'block';
        document.getElementById('meldsSection').style.display = 'block';
        document.getElementById('scoresSection').style.display = 'block';
        document.getElementById('discardPreview').style.display = 'block';
        updateDiscardPile(data.discardPile);
    });
    
    socket.on('game:card_drawn', (data) => {
        if (data.myHand) {
            updateHandWithNewCard(data.myHand, data.card);
            currentPhase = data.phase;
            log(`🎴 You drew a card ${data.fromDiscard ? 'from discard pile' : 'from deck'}`, 'success');
            if (data.fromDiscard) {
                drewFromDiscard = true;
                drawnCardId = data.card.id;
                log('⚠️ You MUST use this card in a meld!', 'info');
            }
            document.getElementById('drawActions').style.display = 'none';
            document.getElementById('meldActions').style.display = 'block';
            document.getElementById('discardActions').style.display = 'none';
            document.getElementById('turnPhaseText').textContent = 'MELD PHASE (Create melds or lay off cards)';
            inDiscardPhase = false;
            updateMeldMode(); // Reset mode to appropriate default
        } else {
            log(`🎴 ${data.player.name} drew a card`);
            if (data.discardPile) {
                updateDiscardPile(data.discardPile);
            }
        }
        updatePhaseDisplay();
    });
    
    socket.on('game:meld_created', (data) => {
        log(`✨ ${data.player.name} created a ${data.meld.type} meld!`);
        if (data.myHand) {
            const meldedIds = data.meld.cards.map(c => c.id);
            meldedIds.forEach(id => delete cardOrder[id]);
            myHand = data.myHand;
            updateHand();
            
            selectedCardIds = [];
            updateSelectedCardsPreview();
            
            if (data.player.id === myPlayerId) {
                hasCreatedFirstMeld = true;
                log('✨ Meld created! You can create another meld, lay off cards, or finish melding.', 'success');
            }
        }
        if (data.allMelds) {
            allMelds = data.allMelds;
            updateMeldsDisplay();
        }
    });

    socket.on('game:card_laid_off', (data) => {
        log(`➕ ${data.player.name} laid off a card on ${data.targetPlayer.name}'s ${data.meldType} meld!`);
        if (data.myHand) {
            delete cardOrder[data.card.id];
            myHand = data.myHand;
            updateHand();
            
            if (data.player.id === myPlayerId) {
                log('✅ Card laid off successfully! You can lay off more cards or finish melding.', 'success');
                selectedCardForLayoff = null;
                updateSelectedCardForLayoffPreview();
            }
        }
        if (data.allMelds) {
            allMelds = data.allMelds;
            updateMeldsDisplay();
        }
    });
    
    socket.on('game:card_discarded', (data) => {
        if (data.discardedCard) {
            log(`🗑️ ${data.player.name} discarded ${data.discardedCard.rank} of ${data.discardedCard.suit || 'JOKER'}`);
        } else {
            log(`🗑️ ${data.player.name} discarded a card`);
        }
        if (data.myHand) {
            if (data.discardedCard) {
                delete cardOrder[data.discardedCard.id];
            }
            myHand = data.myHand;
            updateHand();
        }
        if (data.discardPile) {
            updateDiscardPile(data.discardPile);
        }
        currentPhase = data.phase;
        updatePhaseDisplay();
        checkIfMyTurn(data.currentPlayer.id);
        inDiscardPhase = false;
    });
    
    socket.on('game:round_end', (data) => {
        log(`🏆 Round ${data.nextRound - 1} ended! Winner: ${data.winnerName}`, 'success');
        log(`Scores this round:`, 'info');
        data.totalScores.forEach(s => {
            log(`  ${s.name}: ${s.roundScore > 0 ? '+' : ''}${s.roundScore} (Total: ${s.totalScore})`);
        });
        updateScores(data.totalScores);
    });
    
    socket.on('game:over', (data) => {
        log(`🎉 GAME OVER! Winner: ${data.winner.name} with ${data.winner.totalScore} points!`, 'success');
        log('Final scores:', 'info');
        data.finalScores.forEach(s => {
            log(`  ${s.name}: ${s.totalScore} points`);
        });
    });
    
    socket.on('game:error', (err) => {
        log(`❌ ${err.message}`, 'error');
    });
}

function updateGameState(data) {
    document.getElementById('currentTurn').textContent = data.currentPlayer.name;
    document.getElementById('deckSize').textContent = data.deckSize;
    document.getElementById('roundNumber').textContent = data.roundNumber;
    document.getElementById('currentPhase').textContent = data.phase.toUpperCase();
    
    myHand = data.myHand || [];
    updateHand();
    
    if (data.allMelds) {
        allMelds = data.allMelds;
        updateMeldsDisplay();
    }
    
    if (data.players) {
        updateScores(data.players.map(p => ({
            name: p.name,
            totalScore: p.totalScore
        })));
    }
    
    checkIfMyTurn(data.currentPlayer.id);
}

function checkIfMyTurn(currentPlayerId) {
    if (currentPlayerId === myPlayerId) {
        document.getElementById('turnActions').style.display = 'block';
        if (currentPhase === 'draw') {
            document.getElementById('drawActions').style.display = 'block';
            document.getElementById('meldActions').style.display = 'none';
            document.getElementById('discardActions').style.display = 'none';
            document.getElementById('turnPhaseText').textContent = 'DRAW PHASE';
            inDiscardPhase = false;
            hasCreatedFirstMeld = false; // Reset for new turn
            layoffMode = false;
            selectedCardForLayoff = null;
            log('🎯 YOUR TURN! Draw a card to start.', 'success');
        }
    } else {
        document.getElementById('turnActions').style.display = 'none';
    }
}

function updatePhaseDisplay() {
    document.getElementById('currentPhase').textContent = currentPhase.toUpperCase();
}

function updateHand() {
    const handDiv = document.getElementById('hand');
    handDiv.innerHTML = '';
    document.getElementById('handCount').textContent = myHand.length;
    
    const sortedHand = sortHandByOrder();
    
    sortedHand.forEach((card, index) => {
        const cardDiv = createCardElement(card, () => handleCardClick(card.id));
        if (selectedCardIds.includes(card.id)) {
            cardDiv.classList.add('selected');
        }
        if (selectedCardForLayoff === card.id) {
            cardDiv.classList.add('highlighted');
        }
        if (drewFromDiscard && card.id === drawnCardId) {
            cardDiv.classList.add('highlighted');
        }
        
        cardDiv.draggable = true;
        cardDiv.setAttribute('data-card-id', card.id);
        cardDiv.setAttribute('data-card-index', index);
        
        cardDiv.addEventListener('dragstart', handleDragStart);
        cardDiv.addEventListener('dragend', handleDragEnd);
        cardDiv.addEventListener('dragover', handleDragOver);
        cardDiv.addEventListener('drop', handleDrop);
        cardDiv.addEventListener('dragenter', handleDragEnter);
        cardDiv.addEventListener('dragleave', handleDragLeave);
        
        handDiv.appendChild(cardDiv);
    });
    
    updateSelectedCardsPreview();
}

function sortHandByOrder() {
    return [...myHand].sort((a, b) => {
        const orderA = cardOrder[a.id] !== undefined ? cardOrder[a.id] : 9999;
        const orderB = cardOrder[b.id] !== undefined ? cardOrder[b.id] : 9999;
        return orderA - orderB;
    });
}

function handleCardClick(cardId) {
    if (inDiscardPhase) {
        discardCard(cardId);
    } else if (layoffMode) {
        selectCardForLayoff(cardId);
    } else {
        toggleCardSelection(cardId);
    }
}

function selectCardForLayoff(cardId) {
    selectedCardForLayoff = cardId;
    updateSelectedCardForLayoffPreview();
    updateMeldsDisplay();
    updateHand();
    log('📌 Card selected. Now click a meld below to lay it off.', 'info');
}

function updateSelectedCardForLayoffPreview() {
    const preview = document.getElementById('selectedCardForLayoff');
    if (!selectedCardForLayoff) {
        preview.textContent = 'No card selected. Click a card in your hand to select it.';
        preview.style.background = '#fff';
        preview.style.fontWeight = 'normal';
    } else {
        const card = myHand.find(c => c.id === selectedCardForLayoff);
        if (card) {
            preview.textContent = `Selected: ${card.rank}${card.suit ? ' of ' + card.suit : ''}`;
            preview.style.background = '#d4edda';
            preview.style.fontWeight = '600';
        }
    }
}

function updateMeldMode() {
    const mode = document.querySelector('input[name="meldAction"]:checked')?.value || 'createMeld';
    layoffMode = (mode === 'layoff');
    
    // Can only lay off if player has created at least one meld
    if (layoffMode && !hasCreatedFirstMeld) {
        log('⚠️ You must create your first meld before you can lay off cards!', 'info');
        // Switch back to create meld mode
        document.querySelector('input[name="meldAction"][value="createMeld"]').checked = true;
        layoffMode = false;
    }
    
    if (layoffMode) {
        document.getElementById('createMeldUI').style.display = 'none';
        document.getElementById('layoffUI').style.display = 'block';
        selectedCardIds = [];
        selectedCardForLayoff = null;
        updateSelectedCardForLayoffPreview();
    } else {
        document.getElementById('createMeldUI').style.display = 'block';
        document.getElementById('layoffUI').style.display = 'none';
        selectedCardForLayoff = null;
    }
    
    updateHand();
    updateMeldsDisplay();
}

function cancelLayoff() {
    selectedCardForLayoff = null;
    updateSelectedCardForLayoffPreview();
    updateMeldsDisplay();
    updateHand();
    log('Lay off cancelled.', 'info');
}

function createCardElement(card, onClick) {
    const div = document.createElement('div');
    div.className = 'card';
    div.onclick = onClick;
    
    const rank = document.createElement('div');
    rank.className = 'card-rank';
    rank.textContent = card.rank === 'JOKER' ? '🃏' : card.rank;
    
    const suit = document.createElement('div');
    suit.className = 'card-suit';
    const suitSymbols = { HEARTS: '♥️', DIAMONDS: '♦️', CLUBS: '♣️', SPADES: '♠️' };
    suit.textContent = suitSymbols[card.suit] || '';
    
    div.appendChild(rank);
    div.appendChild(suit);
    return div;
}

function toggleCardSelection(cardId) {
    if (currentPhase !== 'meld') return;
    
    const index = selectedCardIds.indexOf(cardId);
    if (index > -1) {
        selectedCardIds.splice(index, 1);
    } else {
        selectedCardIds.push(cardId);
    }
    updateHand();
}

function updateSelectedCardsPreview() {
    const preview = document.getElementById('selectedCardsPreview');
    if (selectedCardIds.length === 0) {
        preview.textContent = 'No cards selected. Click cards in your hand to select them.';
    } else {
        const selected = myHand.filter(c => selectedCardIds.includes(c.id));
        preview.textContent = selected.map(c => 
            `${c.rank}${c.suit ? ' of ' + c.suit : ''}`
        ).join(', ');
    }
}

function updateMeldsDisplay() {
    const meldsDiv = document.getElementById('allMelds');
    meldsDiv.innerHTML = '';
    
    if (allMelds.length === 0) {
        meldsDiv.textContent = 'No melds yet';
        return;
    }
    
    allMelds.forEach(meld => {
        const meldDiv = document.createElement('div');
        meldDiv.className = 'meld';
        
        // Make clickable if in layoff mode and card is selected
        if (layoffMode && selectedCardForLayoff && hasCreatedFirstMeld) {
            meldDiv.classList.add('can-layoff');
            meldDiv.onclick = () => attemptLayoff(meld.id);
        }
        
        const header = document.createElement('div');
        header.className = 'meld-header';
        header.textContent = `${meld.playerName}'s ${meld.type}`;
        
        // Add layoff indicator
        if (layoffMode && selectedCardForLayoff && hasCreatedFirstMeld) {
            const indicator = document.createElement('span');
            indicator.className = 'layoff-indicator';
            indicator.textContent = '➕ Click to lay off';
            header.appendChild(indicator);
        }
        
        meldDiv.appendChild(header);
        
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'meld-cards';
        meld.cards.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'meld-card';
            cardDiv.textContent = `${card.rank}${card.suit ? '\n' : ''}${card.suit || ''}`;
            cardsDiv.appendChild(cardDiv);
        });
        meldDiv.appendChild(cardsDiv);
        meldsDiv.appendChild(meldDiv);
    });
}

function attemptLayoff(meldId) {
    if (!selectedCardForLayoff) {
        alert('Please select a card from your hand first');
        return;
    }
    
    if (!hasCreatedFirstMeld) {
        alert('You must create your first meld before you can lay off cards');
        return;
    }
    
    log(`Attempting to lay off card on meld...`);
    socket.emit('game:layoff', {
        gameId: currentGameId,
        cardId: selectedCardForLayoff,
        meldId: meldId
    });
}

function updateDiscardPile(discardPile) {
    if (!discardPile || discardPile.length === 0) {
        document.getElementById('discardPreview').style.display = 'none';
        return;
    }
    
    document.getElementById('discardPreview').style.display = 'block';
    const topCard = discardPile[discardPile.length - 1];
    
    const rankDiv = document.querySelector('#discardCard .card-rank');
    const suitDiv = document.querySelector('#discardCard .card-suit');
    
    if (topCard.rank === 'JOKER') {
        rankDiv.textContent = '🎃';
        suitDiv.textContent = 'JOKER';
    } else {
        rankDiv.textContent = topCard.rank;
        const suitSymbols = { HEARTS: '♥️', DIAMONDS: '♦️', CLUBS: '♣️', SPADES: '♠️' };
        suitDiv.textContent = suitSymbols[topCard.suit] || topCard.suit;
    }
}

function updateScores(scores) {
    const scoresDiv = document.getElementById('scoresList');
    scoresDiv.innerHTML = '';
    scores.forEach(s => {
        const row = document.createElement('div');
        row.className = 'score-row';
        row.innerHTML = `<span>${s.name}</span><span><strong>${s.totalScore}</strong> points</span>`;
        scoresDiv.appendChild(row);
    });
}

function createGame() {
    if (!socket) { alert('Please connect first!'); return; }
    log('Creating game...');
    socket.emit('game:create', {});
}

function joinGame() {
    const gameId = document.getElementById('gameIdInput').value;
    if (!gameId) { alert('Enter Game ID'); return; }
    log(`Joining game: ${gameId}...`);
    socket.emit('game:join', {
        gameId,
        playerId: myPlayerId,
        playerName: document.getElementById('playerName').value,
        playerAvatar: `https://i.pravatar.cc/150?u=${myPlayerId}`
    });
}

function markReady() {
    if (!currentGameId) { alert('Join a game first!'); return; }
    log('Marking ready...');
    socket.emit('player:ready', { gameId: currentGameId });
}

function startGame() {
    if (!currentGameId) { alert('Create a game first!'); return; }
    log('Starting game...');
    socket.emit('game:start', { gameId: currentGameId });
}

function drawCard(fromDiscard) {
    log(`Drawing from ${fromDiscard ? 'discard pile' : 'deck'}...`);
    socket.emit('game:draw', { gameId: currentGameId, fromDiscard });
}

function createMeld() {
    if (selectedCardIds.length < 3) {
        alert('Select at least 3 cards for a meld');
        return;
    }
    
    if (drewFromDiscard && !selectedCardIds.includes(drawnCardId)) {
        alert('You drew from discard pile - you MUST use that card in this meld!');
        return;
    }
    
    log('Creating meld...');
    socket.emit('game:create_meld', {
        gameId: currentGameId,
        cardIds: selectedCardIds
    });
    
    if (drewFromDiscard) {
        drewFromDiscard = false;
        drawnCardId = null;
    }
}

function clearSelection() {
    selectedCardIds = [];
    updateHand();
}

function finishMelding() {
    log('Finished melding. Click a card to discard it.');
    document.getElementById('meldActions').style.display = 'none';
    document.getElementById('discardActions').style.display = 'block';
    document.getElementById('turnPhaseText').textContent = 'DISCARD PHASE';
    inDiscardPhase = true;
    selectedCardIds = [];
    selectedCardForLayoff = null;
    layoffMode = false;
    drewFromDiscard = false;
    drawnCardId = null;
    updateHand();
}

function discardCard(cardId) {
    if (!inDiscardPhase) return;
    
    const card = myHand.find(c => c.id === cardId);
    if (!card) return;
    
    log(`Discarding ${card.rank} of ${card.suit || 'JOKER'}...`);
    socket.emit('game:discard', { gameId: currentGameId, cardId });
    drewFromDiscard = false;
    drawnCardId = null;
    inDiscardPhase = false;
}

// Drag and Drop handlers
function handleDragStart(e) {
    draggedCardId = e.target.getAttribute('data-card-id');
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.classList.contains('card')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('card')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const targetCardId = e.target.closest('.card')?.getAttribute('data-card-id');
    
    if (draggedCardId && targetCardId && draggedCardId !== targetCardId) {
        const sortedHand = sortHandByOrder();
        const draggedIndex = sortedHand.findIndex(c => c.id === draggedCardId);
        const targetIndex = sortedHand.findIndex(c => c.id === targetCardId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newOrder = [...sortedHand];
            const draggedCard = newOrder[draggedIndex];
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, draggedCard);
            
            newOrder.forEach((card, index) => {
                cardOrder[card.id] = index;
            });
            
            updateHand();
            log('✓ Cards reordered', 'info');
        }
    }
    
    return false;
}

function initializeCardOrder(hand) {
    cardOrder = {};
    if (hand) {
        hand.forEach((card, index) => {
            cardOrder[card.id] = index;
        });
    }
}

function updateHandWithNewCard(newHand, drawnCard) {
    const maxOrder = Math.max(...Object.values(cardOrder), -1);
    if (drawnCard) {
        cardOrder[drawnCard.id] = maxOrder + 1;
    }
    myHand = newHand;
    updateHand();
}

log('Ready to connect! Fill in your details and click Connect.', 'info');
