export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES',
}

export enum Rank {
  ACE = 'ACE',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'JACK',
  QUEEN = 'QUEEN',
  KING = 'KING',
  JOKER = 'JOKER',
}

export interface Card {
  id: string;
  suit: Suit | null; // null for Joker
  rank: Rank;
  deckNumber: 1 | 2; // Which deck this card came from
}

export interface CardWithPosition extends Card {
  position: number; // Position in hand or meld
}

export type CardId = string;

export const RANK_VALUES: Record<Rank, number> = {
  [Rank.ACE]: 1,
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 10,
  [Rank.QUEEN]: 10,
  [Rank.KING]: 10,
  [Rank.JOKER]: 20,
};

export const RANK_ORDER: Rank[] = [
  Rank.ACE,
  Rank.TWO,
  Rank.THREE,
  Rank.FOUR,
  Rank.FIVE,
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
];

export interface Meld {
  id: string;
  type: 'SET' | 'RUN';
  cards: Card[];
}

export interface Set extends Meld {
  type: 'SET';
  rank: Rank; // All cards have this rank (except Jokers)
}

export interface Run extends Meld {
  type: 'RUN';
  suit: Suit; // All cards have this suit (except Jokers)
  startRank: Rank;
  endRank: Rank;
}
