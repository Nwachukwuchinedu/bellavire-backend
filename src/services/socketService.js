let io = null;

export const initializeSocket = (socketIO) => {
    io = socketIO;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    const socketIO = getIO();
    socketIO.to(`user-${userId}`).emit(event, data);
};

export const emitToChat = (chatId, event, data) => {
    const socketIO = getIO();
    socketIO.to(`chat-${chatId}`).emit(event, data);
};
