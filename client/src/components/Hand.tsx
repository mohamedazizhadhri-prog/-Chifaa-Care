import React, { useState } from 'react';

interface CardLike {
  id: string;
  label?: string;
}

interface HandProps {
  cards: Array<CardLike | string>;
  /** Called when a card is clicked (before play/discard) */
  onCardClick?: (cardId: string) => void;
  /** Called when user chooses to play the selected card */
  onPlay?: (cardId: string) => void;
  /** Called when user chooses to discard the selected card */
  onDiscard?: (cardId: string) => void;
  /** Optional: render a custom label for a card */
  renderCard?: (c: CardLike | string) => React.ReactNode;
}

export default function Hand({ cards, onCardClick, onPlay, onDiscard, renderCard }: HandProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const normalizeId = (c: CardLike | string) => (typeof c === 'string' ? c : c.id);

  const handleCardClick = (c: CardLike | string) => {
    const id = normalizeId(c);
    setSelectedId((prev) => (prev === id ? null : id));
    onCardClick?.(id);
  };

  const handlePlay = () => {
    if (!selectedId) return;
    onPlay?.(selectedId);
    setSelectedId(null);
  };

  const handleDiscard = () => {
    if (!selectedId) return;
    onDiscard?.(selectedId);
    setSelectedId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: 8,
          alignItems: 'center',
        }}
      >
        {cards.map((c) => {
          const id = normalizeId(c);
          const selected = selectedId === id;
          return (
            <div
              key={id}
              onClick={() => handleCardClick(c)}
              role="button"
              aria-pressed={selected}
              style={{
                minWidth: 64,
                minHeight: 92,
                padding: 8,
                borderRadius: 6,
                border: selected ? '2px solid #2563eb' : '1px solid #ddd',
                boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.12)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {renderCard ? renderCard(c) : (typeof c === 'string' ? c : c.label ?? c.id)}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handlePlay} disabled={!selectedId}>
          Play
        </button>
        <button onClick={handleDiscard} disabled={!selectedId}>
          Discard
        </button>
      </div>
    </div>
  );
}
