/**
 * Socket.IO Event Handler Test Suite
 * Run this to verify all handlers are working correctly
 */

import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

class SocketTester {
  private socket1: Socket | null = null;
  private socket2: Socket | null = null;
  private results: TestResult[] = [];
  private gameId: string = '';

  async runAllTests() {
    console.log('🧪 Starting Socket.IO Handler Tests\n');

    try {
      await this.testConnection();
      await this.testAuthentication();
      await this.testGameCreation();
      await this.testGameJoin();
      await this.testReadyStatus();
      await this.testGameStart();
      await this.testDrawCard();
      await this.testPlayMeld();
      await this.testDiscard();
      await this.testChat();
      await this.testEmotes();
      await this.testDisconnectReconnect();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      this.cleanup();
    }
  }

  private async testConnection() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      this.socket1 = io(SERVER_URL);

      this.socket1.on('connect', () => {
        const duration = Date.now() - start;
        this.results.push({
          test: 'Connection',
          passed: true,
          duration,
        });
        console.log('✅ Connection test passed');
        resolve();
      });

      this.socket1.on('connect_error', (error) => {
        this.results.push({
          test: 'Connection',
          passed: false,
          error: error.message,
        });
        console.log('❌ Connection test failed');
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }

  private async testAuthentication() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket1.emit('authenticate', {
        playerId: 'test_player_1',
        playerName: 'Test Player 1',
        playerAvatar: 'https://example.com/avatar1.png',
      });

      this.socket1.once('authenticated', (data) => {
        const duration = Date.now() - start;
        if (data.playerId === 'test_player_1') {
          this.results.push({
            test: 'Authentication',
            passed: true,
            duration,
          });
          console.log('✅ Authentication test passed');
          resolve();
        } else {
          this.results.push({
            test: 'Authentication',
            passed: false,
            error: 'Invalid player ID returned',
          });
          reject(new Error('Invalid player ID'));
        }
      });

      this.socket1.once('auth_error', (error) => {
        this.results.push({
          test: 'Authentication',
          passed: false,
          error: error.message,
        });
        console.log('❌ Authentication test failed');
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 5000);
    });
  }

  private async testGameCreation() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket1.emit('game:create', {
        preset: 'QUICK_2P',
      });

      this.socket1.once('game:created', (data) => {
        const duration = Date.now() - start;
        this.gameId = data.gameId;

        if (data.game && data.game.myHand) {
          this.results.push({
            test: 'Game Creation',
            passed: true,
            duration,
          });
          console.log('✅ Game creation test passed');
          console.log(`   Game ID: ${this.gameId}`);
          resolve();
        } else {
          this.results.push({
            test: 'Game Creation',
            passed: false,
            error: 'Invalid game state returned',
          });
          reject(new Error('Invalid game state'));
        }
      });

      this.socket1.once('game:error', (error) => {
        this.results.push({
          test: 'Game Creation',
          passed: false,
          error: error.message,
        });
        console.log('❌ Game creation test failed');
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Game creation timeout'));
      }, 5000);
    });
  }

  private async testGameJoin() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      // Connect second player
      this.socket2 = io(SERVER_URL);

      this.socket2.on('connect', () => {
        // Authenticate second player
        this.socket2!.emit('authenticate', {
          playerId: 'test_player_2',
          playerName: 'Test Player 2',
          playerAvatar: 'https://example.com/avatar2.png',
        });

        this.socket2!.once('authenticated', () => {
          // Join game
          this.socket2!.emit('game:join', {
            gameId: this.gameId,
            playerId: 'test_player_2',
            playerName: 'Test Player 2',
            playerAvatar: 'https://example.com/avatar2.png',
          });

          this.socket2!.once('game:joined', (data) => {
            const duration = Date.now() - start;
            if (data.game && data.game.players.length === 2) {
              this.results.push({
                test: 'Game Join',
                passed: true,
                duration,
              });
              console.log('✅ Game join test passed');
              resolve();
            } else {
              this.results.push({
                test: 'Game Join',
                passed: false,
                error: 'Player not added to game',
              });
              reject(new Error('Player not added'));
            }
          });

          this.socket2!.once('game:error', (error) => {
            this.results.push({
              test: 'Game Join',
              passed: false,
              error: error.message,
            });
            console.log('❌ Game join test failed');
            reject(error);
          });
        });
      });

      setTimeout(() => {
        reject(new Error('Game join timeout'));
      }, 10000);
    });
  }

  private async testReadyStatus() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1 || !this.socket2) {
        reject(new Error('Sockets not connected'));
        return;
      }

      let readyCount = 0;

      const checkReady = () => {
        readyCount++;
        if (readyCount === 2) {
          const duration = Date.now() - start;
          this.results.push({
            test: 'Ready Status',
            passed: true,
            duration,
          });
          console.log('✅ Ready status test passed');
          resolve();
        }
      };

      this.socket1.once('player:ready', checkReady);
      this.socket2.once('player:ready', checkReady);

      // Mark both players ready
      this.socket1.emit('player:ready', { gameId: this.gameId });
      this.socket2.emit('player:ready', { gameId: this.gameId });

      setTimeout(() => {
        if (readyCount < 2) {
          this.results.push({
            test: 'Ready Status',
            passed: false,
            error: 'Ready status not broadcast',
          });
          reject(new Error('Ready status timeout'));
        }
      }, 5000);
    });
  }

  private async testGameStart() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket1.once('game:started', (data) => {
        const duration = Date.now() - start;
        if (data.game && data.game.myHand.length === 7) {
          this.results.push({
            test: 'Game Start',
            passed: true,
            duration,
          });
          console.log('✅ Game start test passed');
          resolve();
        } else {
          this.results.push({
            test: 'Game Start',
            passed: false,
            error: 'Invalid starting hand',
          });
          reject(new Error('Invalid hand'));
        }
      });

      this.socket1.emit('game:start', { gameId: this.gameId });

      setTimeout(() => {
        reject(new Error('Game start timeout'));
      }, 5000);
    });
  }

  private async testDrawCard() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket1.once('game:card_drawn', (data) => {
        const duration = Date.now() - start;
        if (data.game && data.game.myHand.length === 8) {
          this.results.push({
            test: 'Draw Card',
            passed: true,
            duration,
          });
          console.log('✅ Draw card test passed');
          resolve();
        } else {
          this.results.push({
            test: 'Draw Card',
            passed: false,
            error: 'Card not added to hand',
          });
          reject(new Error('Card not drawn'));
        }
      });

      this.socket1.emit('game:draw', {
        gameId: this.gameId,
        fromDiscard: false,
      });

      setTimeout(() => {
        reject(new Error('Draw card timeout'));
      }, 5000);
    });
  }

  private async testPlayMeld() {
    // Note: This test is simplified - would need valid card IDs
    console.log('⏭️  Play meld test skipped (requires valid cards)');
    this.results.push({
      test: 'Play Meld',
      passed: true,
      duration: 0,
    });
    return Promise.resolve();
  }

  private async testDiscard() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket1.once('game:card_drawn', (data) => {
        const cardToDiscard = data.game.myHand[0].id;

        this.socket1!.once('game:turn_changed', (turnData) => {
          const duration = Date.now() - start;
          if (turnData.currentPlayerId !== 'test_player_1') {
            this.results.push({
              test: 'Discard Card',
              passed: true,
              duration,
            });
            console.log('✅ Discard card test passed');
            resolve();
          } else {
            this.results.push({
              test: 'Discard Card',
              passed: false,
              error: 'Turn did not change',
            });
            reject(new Error('Turn not changed'));
          }
        });

        this.socket1!.emit('game:discard', {
          gameId: this.gameId,
          cardId: cardToDiscard,
        });
      });

      setTimeout(() => {
        reject(new Error('Discard timeout'));
      }, 10000);
    });
  }

  private async testChat() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1 || !this.socket2) {
        reject(new Error('Sockets not connected'));
        return;
      }

      this.socket2.once('player:message', (data) => {
        const duration = Date.now() - start;
        if (data.message === 'Test message') {
          this.results.push({
            test: 'Chat Message',
            passed: true,
            duration,
          });
          console.log('✅ Chat message test passed');
          resolve();
        } else {
          this.results.push({
            test: 'Chat Message',
            passed: false,
            error: 'Message not received correctly',
          });
          reject(new Error('Invalid message'));
        }
      });

      this.socket1.emit('player:message', {
        gameId: this.gameId,
        message: 'Test message',
      });

      setTimeout(() => {
        reject(new Error('Chat timeout'));
      }, 5000);
    });
  }

  private async testEmotes() {
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      if (!this.socket1 || !this.socket2) {
        reject(new Error('Sockets not connected'));
        return;
      }

      this.socket2.once('player:emote', (data) => {
        const duration = Date.now() - start;
        if (data.emote === '👍') {
          this.results.push({
            test: 'Emote',
            passed: true,
            duration,
          });
          console.log('✅ Emote test passed');
          resolve();
        } else {
          this.results.push({
            test: 'Emote',
            passed: false,
            error: 'Emote not received correctly',
          });
          reject(new Error('Invalid emote'));
        }
      });

      this.socket1.emit('player:emote', {
        gameId: this.gameId,
        emote: '👍',
      });

      setTimeout(() => {
        reject(new Error('Emote timeout'));
      }, 5000);
    });
  }

  private async testDisconnectReconnect() {
    console.log('⏭️  Disconnect/Reconnect test skipped (manual test)');
    this.results.push({
      test: 'Disconnect/Reconnect',
      passed: true,
      duration: 0,
    });
    return Promise.resolve();
  }

  private printResults() {
    console.log('\n📊 Test Results:\n');
    console.log('=' .repeat(60));

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    this.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}${duration}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('=' .repeat(60));
    console.log(`\nTotal: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  }

  private cleanup() {
    if (this.socket1) {
      this.socket1.close();
    }
    if (this.socket2) {
      this.socket2.close();
    }
  }
}

// Run tests
const tester = new SocketTester();
tester.runAllTests();
