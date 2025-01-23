// services/chatService.js
class ChatService {
  constructor() {
    this.API_URL = 'http://localhost:3000/api/chat';
  }

  async chat(message, context = []) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.response,
        sources: [] // To be implemented with document retrieval
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();