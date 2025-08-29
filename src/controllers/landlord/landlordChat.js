import {
    sendMessage,
    getChatHistory,
    getChatHistoryPaginated,
    getUserChats,
    markMessagesAsRead,
    getUnreadCount
} from "../chatController.js";

// Re-export chat functions for landlord use
export {
    sendMessage,
    getChatHistory,
    getChatHistoryPaginated,
    getUserChats,
    markMessagesAsRead,
    getUnreadCount
};
