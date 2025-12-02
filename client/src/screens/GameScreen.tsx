import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface Card {
  id: string;
  rank: string;
  suit: string | null;
  value: number;
}

function CardComponent({ 
  card, 
  onClick, 
  isSelected, 
  isDiscardable,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  style
}: { 
  card: Card; 
  onClick?: () => void; 
  isSelected?: boolean;
  isDiscardable?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  style?: React.CSSProperties;
}) {
  const getSuitSymbol = (suit: string | null) => {
    if (!suit) return '';
    const symbols: { [key: string]: string } = {
      'HEARTS': '♥',
      'DIAMONDS': '♦',
      'CLUBS': '♣',
      'SPADES': '♠'
    };
    return symbols[suit] || '';
  };

  const getSuitColor = (suit: string | null) => {
    if (!suit) return '#000';
    return ['HEARTS', 'DIAMONDS'].includes(suit) ? '#dc2626' : '#000';
  };

  const isJoker = card.rank === 'JOKER';

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      style={{
        width: 70,
        height: 100,
        border: isSelected ? '3px solid #3b82f6' : '2px solid #d1d5db',
        borderRadius: 8,
        background: isJoker ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : '#fff',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: (onClick || draggable) ? 'grab' : 'default',
        boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        opacity: isDiscardable ? 1 : (onClick ? 0.6 : 1),
        position: 'relative',
        userSelect: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick || draggable) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick || draggable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isSelected ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
    >
      <div style={{ 
        fontSize: isJoker ? 11 : 16, 
        fontWeight: 'bold', 
        color: isJoker ? '#fff' : getSuitColor(card.suit),
        textAlign: 'center'
      }}>
        {isJoker ? 'JOKER' : card.rank}
      </div>
      {!isJoker && (
        <div style={{ 
          fontSize: 28, 
          color: getSuitColor(card.suit),
          textAlign: 'center',
          lineHeight: 1
        }}>
          {getSuitSymbol(card.suit)}
        </div>
      )}
      <div style={{ 
        fontSize: isJoker ? 11 : 16, 
        fontWeight: 'bold', 
        color: isJoker ? '#fff' : getSuitColor(card.suit),
        textAlign: 'center'
      }}>
        {isJoker ? 'JOKER' : card.rank}
      </div>
      {isDiscardable && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: '#ef4444',
          color: '#fff',
          borderRadius: '50%',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
        }}>
          ×
        </div>
      )}
    </div>
  );
}

function DiscardPileCard({ card }: { card: Card }) {
  const getSuitSymbol = (suit: string | null) => {
    if (!suit) return '';
    const symbols: { [key: string]: string } = {
      'HEARTS': '♥',
      'DIAMONDS': '♦',
      'CLUBS': '♣',
      'SPADES': '♠'
    };
    return symbols[suit] || '';
  };

  const getSuitColor = (suit: string | null) => {
    if (!suit) return '#000';
    return ['HEARTS', 'DIAMONDS'].includes(suit) ? '#dc2626' : '#000';
  };

  const isJoker = card.rank === 'JOKER';

  return (
    <div
      style={{
        width: 70,
        height: 100,
        border: '2px solid #d1d5db',
        borderRadius: 8,
        background: isJoker ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : '#fff',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ 
        fontSize: isJoker ? 11 : 16, 
        fontWeight: 'bold', 
        color: isJoker ? '#fff' : getSuitColor(card.suit),
        textAlign: 'center'
      }}>
        {isJoker ? 'JOKER' : card.rank}
      </div>
      {!isJoker && (
        <div style={{ 
          fontSize: 28, 
          color: getSuitColor(card.suit),
          textAlign: 'center',
          lineHeight: 1
        }}>
          {getSuitSymbol(card.suit)}
        </div>
      )}
      <div style={{ 
        fontSize: isJoker ? 11 : 16, 
        fontWeight: 'bold', 
        color: isJoker ? '#fff' : getSuitColor(card.suit),
        textAlign: 'center'
      }}>
        {isJoker ? 'JOKER' : card.rank}
      </div>
    </div>
  );
}

export default function GameScreen() {
  const {
    game,
    drawCard,
    discardCard,
    formMeld,
    loading,
    error,
  } = useGame();

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localHand, setLocalHand] = useState<Card[]>([]);
  const [layOffMode, setLayOffMode] = useState(false);
  const [layOffCardId, setLayOffCardId] = useState<string | null>(null);

  // Extract myHand from the game object
  const myHand = (game as any)?.myHand || [];
  
  // Update local hand when game hand changes
  useEffect(() => {
    if (myHand && myHand.length > 0) {
      setLocalHand(myHand);
    }
  }, [myHand]);

  if (!game) return <div style={{ padding: 16 }}>Not in a game</div>;

  const legal = (game as any).myLegalMoves || null;
  const currentPhase = (game as any).phase || game.phase || 'draw';
  const currentPlayerId = (game as any).currentPlayer?.id || game.currentPlayerId;
  const myPlayerId = (game as any).myPlayerId || (game as any).id;
  const isMyTurn = currentPlayerId === myPlayerId;

  const handleCardClick = (cardId: string) => {
    if (currentPhase === 'meld' && isMyTurn) {
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    }
  };

  const handleDiscard = (cardId: string) => {
    if (currentPhase === 'meld' && isMyTurn) {
      discardCard(cardId);
      setSelectedCards([]);
    }
  };

  const handleFormMeld = () => {
    if (selectedCards.length >= 3) {
      formMeld(selectedCards as any);
      setSelectedCards([]);
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string, index: number) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    
    // Make it look like dragging
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.cursor = 'grab';
    }
    setDraggedCardId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedCardId) return;

    const draggedIndex = localHand.findIndex(c => c.id === draggedCardId);
    
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedCardId(null);
      return;
    }

    const newHand = [...localHand];
    const [draggedCard] = newHand.splice(draggedIndex, 1);
    newHand.splice(targetIndex, 0, draggedCard);

    setLocalHand(newHand);
    setDraggedCardId(null);
  };

  const topDiscardCard = ((game as any).discardPile?.[((game as any).discardPile?.length - 1)] || 
                         (game as any).topDiscardCard) as Card | null;

  const tableMelds = (game as any).tableMelds || (game as any).myMelds || [];

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        maxWidth: 1400,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: '#1f2937' }}>Tunisian Rami</h1>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Game ID: {game.id} • Round: {(game as any).roundNumber || game.round || 1}
            </div>
          </div>
          <div style={{ 
            background: isMyTurn ? '#10b981' : '#6b7280',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            fontWeight: 600
          }}>
            {isMyTurn ? '🎯 Your Turn' : '⏳ Waiting...'}
          </div>
        </div>

        {/* Debug Info */}
        <details style={{ marginBottom: 16, fontSize: 12, color: '#6b7280' }}>
          <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Debug Info</summary>
          <pre style={{ background: '#f9fafb', padding: 8, borderRadius: 4, marginTop: 8, overflow: 'auto' }}>
            {JSON.stringify({
              myHandLength: localHand.length,
              currentPhase,
              isMyTurn,
              currentPlayerId,
              myPlayerId,
              hasTopDiscard: !!topDiscardCard,
              tableMeldsCount: tableMelds.length
            }, null, 2)}
          </pre>
        </details>

        {/* Game Area */}
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Main Play Area */}
          <div style={{ flex: 1 }}>
            {/* Deck and Discard Pile */}
            <div style={{ 
              display: 'flex', 
              gap: 32, 
              marginBottom: 24,
              background: '#f9fafb',
              padding: 20,
              borderRadius: 12
            }}>
              {/* Deck */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                  Draw Deck
                </div>
                <button
                  onClick={() => drawCard('deck')}
                  disabled={!isMyTurn || currentPhase !== 'draw' || loading}
                  style={{
                    width: 70,
                    height: 100,
                    border: '3px dashed #9ca3af',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    cursor: (isMyTurn && currentPhase === 'draw') ? 'pointer' : 'not-allowed',
                    fontSize: 24,
                    color: '#fff',
                    fontWeight: 'bold',
                    opacity: (isMyTurn && currentPhase === 'draw') ? 1 : 0.5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (isMyTurn && currentPhase === 'draw') {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  🃏
                </button>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
                  {(game as any).deckSize || 0} cards
                </div>
              </div>

              {/* Discard Pile */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                  Discard Pile {topDiscardCard && '(Click to draw)'}
                </div>
                {topDiscardCard ? (
                  <div
                    onClick={() => {
                      if (isMyTurn && currentPhase === 'draw' && !loading) {
                        drawCard('discard');
                      }
                    }}
                    style={{
                      cursor: (isMyTurn && currentPhase === 'draw') ? 'pointer' : 'default',
                      display: 'inline-block',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (isMyTurn && currentPhase === 'draw') {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <DiscardPileCard card={topDiscardCard} />
                  </div>
                ) : (
                  <div style={{
                    width: 70,
                    height: 100,
                    border: '2px dashed #d1d5db',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: 12,
                  }}>
                    Empty
                  </div>
                )}
              </div>
            </div>

            {/* Your Hand */}
            <section style={{ marginBottom: 24 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>
                  Your Hand ({localHand.length} cards)
                </h3>
                {currentPhase === 'meld' && isMyTurn && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    💡 Click cards to select • Drag to reorder or lay off
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 8, 
                flexWrap: 'wrap',
                background: '#f9fafb',
                padding: 16,
                borderRadius: 12,
                minHeight: 120
              }}>
                {localHand.length === 0 ? (
                  <div style={{ 
                    width: '100%', 
                    textAlign: 'center', 
                    color: '#9ca3af',
                    padding: 32
                  }}>
                    No cards in hand
                  </div>
                ) : (
                  localHand.map((card, index) => (
                    <div
                      key={card.id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{ position: 'relative' }}
                    >
                      <CardComponent
                        card={card}
                        onClick={currentPhase === 'meld' ? () => handleCardClick(card.id) : undefined}
                        isSelected={selectedCards.includes(card.id)}
                        isDiscardable={currentPhase === 'meld' && isMyTurn}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, card.id, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          opacity: draggedCardId === card.id ? 0.5 : 1,
                        }}
                      />
                      {dragOverIndex === index && draggedCardId !== card.id && (
                        <div style={{
                          position: 'absolute',
                          left: -4,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: '#3b82f6',
                          borderRadius: 2,
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {currentPhase === 'meld' && isMyTurn && (
                <div style={{ marginTop: 16 }}>
                  {selectedCards.length > 0 && (
                    <div style={{
                      background: '#dbeafe',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                      border: '2px solid #3b82f6'
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>
                        {selectedCards.length} card(s) selected
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {selectedCards.length >= 3 && (
                          <button
                            onClick={handleFormMeld}
                            disabled={loading}
                            style={{
                              flex: 1,
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            Create Meld with Selected Cards
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCards([])}
                          style={{
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Clear Selection
                        </button>
                      </div>
                      {selectedCards.length >= 3 && (
                        <div style={{ fontSize: 12, color: '#1e40af', marginTop: 8 }}>
                          ✨ You can create multiple melds!
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Lay Off Section */}
                  <div style={{
                    background: '#f3f4f6',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: '2px solid #d1d5db'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                      🎯 Lay Off on Existing Meld
                    </div>
                    
                    {!layOffMode ? (
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                          Add a card from your hand to an existing meld on the table
                        </div>
                        <button
                          onClick={() => setLayOffMode(true)}
                          disabled={loading || tableMelds.length === 0}
                          style={{
                            background: tableMelds.length === 0 ? '#9ca3af' : '#0ea5e9',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: 6,
                            cursor: tableMelds.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Lay Off Card
                        </button>
                        {tableMelds.length === 0 && (
                          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                            No melds on table yet
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 12, color: '#0284c7', marginBottom: 8, fontWeight: 600 }}>
                          Step 1: Click a card below • Step 2: Drag it to a meld on the table
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: 8, 
                          flexWrap: 'wrap',
                          marginBottom: 8
                        }}>
                          {localHand.map((card) => (
                            <div
                              key={card.id}
                              onClick={() => {
                                setLayOffCardId(card.id);
                              }}
                              style={{
                                cursor: 'pointer',
                                opacity: layOffCardId === card.id ? 1 : 0.5,
                                transform: layOffCardId === card.id ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s',
                              }}
                            >
                              <CardComponent
                                card={card}
                                draggable={layOffCardId === card.id}
                                onDragStart={(e) => {
                                  if (layOffCardId === card.id) {
                                    e.dataTransfer.setData('text/plain', card.id);
                                    e.dataTransfer.setData('layoff', 'true');
                                  }
                                }}
                                onDragEnd={() => {
                                  setLayOffMode(false);
                                  setLayOffCardId(null);
                                }}
                                style={{
                                  border: layOffCardId === card.id ? '3px solid #0ea5e9' : undefined,
                                  boxShadow: layOffCardId === card.id ? '0 4px 12px rgba(14, 165, 233, 0.4)' : undefined,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setLayOffMode(false);
                            setLayOffCardId(null);
                          }}
                          style={{
                            background: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Cancel Lay Off
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                    Finish Melding (Move to Discard)
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    Click a card to discard it and end your turn
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: 8, 
                    flexWrap: 'wrap',
                    background: '#fef3c7',
                    padding: 12,
                    borderRadius: 8,
                    border: '2px dashed #f59e0b'
                  }}>
                    {localHand.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => handleDiscard(card.id)}
                        disabled={loading}
                        style={{
                          background: '#fff',
                          border: '2px solid #f59e0b',
                          borderRadius: 6,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#92400e',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fbbf24';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.color = '#92400e';
                        }}
                      >
                        Discard {card.rank}{card.suit ? ` ${card.suit.charAt(0)}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Table Melds */}
            <section>
              <h3 style={{ marginBottom: 12, color: '#1f2937' }}>
                Table Melds {currentPhase === 'meld' && isMyTurn && '(Drag cards here to lay off)'}
              </h3>
              <div style={{ 
                background: '#f9fafb',
                borderRadius: 12,
                padding: 16,
                minHeight: 100
              }}>
                {(!tableMelds || tableMelds.length === 0) ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#9ca3af',
                    padding: 32
                  }}>
                    No melds on the table yet
                  </div>
                ) : (
                  tableMelds.map((m: any) => (
                    <div 
                      key={m.id} 
                      style={{ 
                        padding: 16, 
                        background: currentPhase === 'meld' && isMyTurn ? '#e0f2fe' : '#fff',
                        borderRadius: 8,
                        marginBottom: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: currentPhase === 'meld' && isMyTurn ? '2px dashed #0ea5e9' : '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                      onDragOver={(e) => {
                        if (currentPhase === 'meld' && isMyTurn) {
                          e.preventDefault();
                          e.currentTarget.style.background = '#bae6fd';
                          e.currentTarget.style.borderColor = '#0284c7';
                        }
                      }}
                      onDragLeave={(e) => {
                        if (currentPhase === 'meld' && isMyTurn) {
                          e.currentTarget.style.background = '#e0f2fe';
                          e.currentTarget.style.borderColor = '#0ea5e9';
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = '#e0f2fe';
                        e.currentTarget.style.borderColor = '#0ea5e9';
                        
                        const cardId = e.dataTransfer.getData('text/plain');
                        const isLayOff = e.dataTransfer.getData('layoff');
                        
                        if (isLayOff === 'true' && cardId) {
                          console.log(`Laying off card ${cardId} on meld ${m.id}`);
                          // TODO: Call layOff function from game context
                          // layOff(cardId, m.id);
                          
                          setLayOffMode(false);
                          setLayOffCardId(null);
                        }
                      }}
                    >
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: 600,
                        color: '#6b7280',
                        marginBottom: 8
                      }}>
                        {m.ownerId === myPlayerId ? '👤 Your meld' : `🎭 ${m.ownerId}'s meld`}
                        {currentPhase === 'meld' && isMyTurn && (
                          <span style={{ color: '#0284c7', marginLeft: 8 }}>
                            (Drop cards here)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(m.meld?.cards || m.cards || []).map((c: Card) => (
                          <CardComponent key={c.id} card={c} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Side Panel */}
          <aside style={{ 
            width: 280,
            background: '#f9fafb',
            borderRadius: 12,
            padding: 20
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                CURRENT PHASE
              </div>
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: '#1f2937',
                textTransform: 'uppercase'
              }}>
                {currentPhase}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                CURRENT PLAYER
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                {(game as any).currentPlayer?.name || currentPlayerId || 'Unknown'}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                INSTRUCTIONS
              </div>
              <div style={{ 
                fontSize: 13, 
                color: '#4b5563',
                lineHeight: 1.6,
                background: '#fff',
                padding: 12,
                borderRadius: 8
              }}>
                {currentPhase === 'draw' && isMyTurn && (
                  <>📥 Draw a card from the deck or discard pile</>
                )}
                {currentPhase === 'meld' && isMyTurn && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      ✨ <strong>Create Meld:</strong> Select 3+ cards and click "Create Meld"
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      🎯 <strong>Lay Off:</strong> Click a card in the lay off section, then drag it to a meld
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      🗑️ <strong>Discard:</strong> Click a card to discard it and end your turn
                    </div>
                    <div>
                      🔄 <strong>Tip:</strong> Drag cards to reorder your hand
                    </div>
                  </>
                )}
                {!isMyTurn && (
                  <>⏳ Wait for your turn</>
                )}
              </div>
            </div>

            {error && (
              <div style={{ 
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                marginTop: 20
              }}>
                {error}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
