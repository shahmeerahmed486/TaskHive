import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWebSocketUrl } from '../api/contracts';
import { WebSocketMessage } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  type: 'chat' | 'system';
  from?: number;
  message: string;
  timestamp: Date;
}

const ContractChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !token || !user) {
      navigate('/jobs');
      return;
    }

    const contractId = parseInt(id);
    const wsUrl = getWebSocketUrl(contractId, token);

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setConnected(true);
      setError('');
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          message: 'Connected to chat',
          timestamp: new Date(),
        },
      ]);
    };

    websocket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === 'chat' && data.message) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'chat',
              from: data.from,
              message: data.message!,
              timestamp: new Date(),
            },
          ]);
        } else if (data.type === 'user_joined') {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              message: `User ${data.user_id} joined`,
              timestamp: new Date(),
            },
          ]);
        } else if (data.type === 'user_left') {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              message: `User ${data.user_id} left`,
              timestamp: new Date(),
            },
          ]);
        } else if (data.type === 'contract_created') {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              message: 'Contract created',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    websocket.onerror = () => {
      setError('WebSocket connection error');
    };

    websocket.onclose = () => {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          message: 'Disconnected from chat',
          timestamp: new Date(),
        },
      ]);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [id, token, user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !ws || !connected) return;

    try {
      ws.send(JSON.stringify({ message: messageInput }));
      setMessageInput('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/contracts" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Contracts
      </Link>
      <div className="bg-white shadow-md rounded-lg flex flex-col" style={{ height: '600px' }}>
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contract Chat</h1>
            <p className="text-sm text-gray-500">Contract #{id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === 'chat' && msg.from === user?.id
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.type === 'system'
                    ? 'bg-gray-100 text-gray-600 text-center w-full'
                    : msg.from === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {msg.type === 'chat' && msg.from !== user?.id && (
                  <div className="text-xs opacity-75 mb-1">User {msg.from}</div>
                )}
                <p className="break-words">{msg.message}</p>
                <div className="text-xs opacity-75 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!connected}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!connected || !messageInput.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractChat;
