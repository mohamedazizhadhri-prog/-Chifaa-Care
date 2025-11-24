import React from 'react';
import { useGame } from '../context/GameContext';

function SmallCard({ id }: { id: string }) {
  return (
    <div
      style={{
        padding: 6,
        border: '1px solid #ddd',
        borderRadius: 6,
        background: '#fff',
        marginRight: 6,
        display: 'inline-block',
      }}
    >
      {id}
    </div>
  );
}

export default function GameScreen() {
  const {
    game,
    drawCard,
    discardCard,
    formMeld,
    addToMeld,
    sortHand,
    loading,
    error,
  } = useGame();

  if (!game) return <div style={{ padding: 16 }}>Not in a game</div>;

  const legal = (game as any).myLegalMoves || null;

  const firstMeldOption: string[] | null =
    (legal && ((legal.meld && ((legal.meld as any).possibleSets?.[0] || (legal.meld as any).possibleRuns?.[0])))) || null;

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2>Game</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Game:</strong> {game.id}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Phase:</strong> {game.phase} • <strong>Round:</strong> {game.round}
          </div>

          <section style={{ marginTop: 12 }}>
            <h4>Your Hand</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(game.myHand || []).map((c: any) => (
                <SmallCard key={c.id || c} id={c.id || c} />
              ))}
            </div>
          </section>

          <section style={{ marginTop: 12 }}>
            <h4>Table Melds</h4>
            <div>
              {(game.tableMelds || []).map((m: any) => (
                <div key={m.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <div style={{ fontSize: 13 }}>
                    <strong>{m.ownerId}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {(m.meld?.cards || []).map((c: any) => (
                      <SmallCard key={c.id || c} id={c.id || c} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ width: 280 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>Current Player:</strong> {game.currentPlayerId}
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>Top Discard:</strong>
            <div style={{ marginTop: 8 }}>{game.topDiscardCard ? <SmallCard id={(game.topDiscardCard as any).id || 'card'} /> : <em>None</em>}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              {legal?.draw?.canDrawFromDeck && (
                <button onClick={() => drawCard('deck')} disabled={loading} style={{ marginRight: 6 }}>
                  Draw Deck
                </button>
              )}
              {legal?.draw?.canDrawFromDiscard && (
                <button onClick={() => drawCard('discard')} disabled={loading}>
                  Draw Discard
                </button>
              )}
            </div>

            {legal?.discard?.availableCards && legal.discard.availableCards.length > 0 && (
              <div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>Discard</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {legal.discard.availableCards.map((cid: string) => (
                    <button key={cid} onClick={() => discardCard(cid)} disabled={loading}>
                      {cid}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                onClick={() => {
                  if (firstMeldOption) formMeld(firstMeldOption as any);
                }}
                disabled={!firstMeldOption || loading}
              >
                Form Meld
              </button>
            </div>

            <div>
              <button onClick={() => sortHand('rank')} disabled={loading}>
                Sort Hand
              </button>
            </div>
          </div>
        </aside>
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
