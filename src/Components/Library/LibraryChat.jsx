// src/Components/Library/LibraryChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/chatService';

const LibraryChat = ({ currentLang = 'en' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.chat(input, currentLang);
      const aiMessage = {
        type: 'assistant',
        content: response.answer,
        sources: response.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'error',
        content: currentLang === 'en' 
          ? 'An error occurred. Please try again.' 
          : 'Une erreur est survenue. Veuillez réessayer.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col h-[600px]">
      <h2 className="font-serif text-xl font-bold mb-4">
        {currentLang === 'en' 
          ? 'Chat with our knowledge base:' 
          : 'Dialoguez avec notre base de connaissances :'}
      </h2>

      <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100'
              }`}
            >
              <p>{message.content}</p>
              {message.sources && (
                <div className="text-xs mt-2 text-gray-600">
                  {currentLang === 'en' ? 'Sources:' : 'Sources :'} 
                  {message.sources.map((source, idx) => (
                    <p key={idx} className="italic">
                      {source.metadata.title} - {source.metadata.author}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentLang === 'en' 
            ? 'Ask a question...' 
            : 'Posez une question...'}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            currentLang === 'en' ? 'Send' : 'Envoyer'
          )}
        </button>
      </form>
    </div>
  );
};

export default LibraryChat;