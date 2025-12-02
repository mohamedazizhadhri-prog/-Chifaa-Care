import { Card, Meld } from './card.types';

export interface Player {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  hand: Card[];
  melds: Meld[];
  score: number; // Total score across all rounds
  roundScore: number; // Score for current round
  isConnected: boolean;
  isReady: boolean;
}

export enum PlayerStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  DISCONNECTED = 'DISCONNECTED',
}

export interface PlayerSession {
  playerId: string;
  socketId: string;
  gameId: string | null;
  connectedAt: Date;
  lastActivity: Date;
}

export interface PlayerPublicInfo {
  id: string;
  username: string;
  avatar: string;
  cardCount: number; // Number of cards in hand
  meldCount: number; // Number of melds formed
  score: number;
  roundScore: number;
  isConnected: boolean;
  isReady: boolean;
}
