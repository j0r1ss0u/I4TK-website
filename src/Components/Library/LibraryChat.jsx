// ================ IMPORTS ================
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { chatService } from '../../services/chatService';

// ================ COMPONENT ================
const LibraryChat = ({ currentLang = 'en' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.chat(input);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.answer,
        sources: response.sources
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: currentLang === 'en' 
          ? 'An error occurred. Please try again.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col h-[600px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-white text-green-800'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.sources?.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-semibold">
                      {currentLang === 'en' ? 'Sources:' : 'Sources :'}
                    </p>
                    <div className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <p key={idx} className="italic">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {source.title}
                          </a>
                          {source.authors?.length > 0 && ` - ${source.authors.join(', ')}`}
                          {source.programme && ` (${source.programme})`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentLang === 'en' 
                ? 'Ask about our research documents...'
                : 'Posez une question sur nos documents...'}
              className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                currentLang === 'en' ? 'Send' : 'Envoyer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryChat;