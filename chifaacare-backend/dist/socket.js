"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PATCH']
        }
    });
    io.on('connection', (socket) => {
        // Client should emit 'join' with their userId to receive direct events
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
            }
        });
        socket.on('disconnect', () => {
            // No-op for now
        });
    });
    return io;
}
function getIO() {
    if (!io)
        throw new Error('Socket.io has not been initialized');
    return io;
}
