import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Send, X, Minimize2, Maximize2, Gift, Medal, Award, Plus } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  id: string;
  sender: string;
  address: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
  reactions?: Record<string, Reaction>;
}

interface GMChatWindowProps {
  currentUserAddress?: string;
  onSendSound?: () => void;
  onHoverSound?: () => void;
}

// Common emoji reactions
const commonEmojis = ['👍', '❤️', '🎉', '🔥', '💯', '🙌', '👏', '😎', '🚀', 'gm☀️'];

const GMChatWindow = forwardRef<any, GMChatWindowProps>(({ 
  currentUserAddress, 
  onSendSound,
  onHoverSound
}, ref) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'WOGA',
      address: '0x1234...5678',
      content: 'GM frens! Welcome to the GM chat!',
      timestamp: Date.now() - 300000, // 5 minutes ago
      reactions: {
        '👋': { emoji: '👋', count: 3, users: ['0xabcd...efgh', '0x8765...4321', '0x0000...0000'] }
      }
    },
    {
      id: '2',
      sender: 'NFTCultist',
      address: '0xabcd...efgh',
      content: 'GM world! Loving the new collection!',
      timestamp: Date.now() - 120000, // 2 minutes ago
      reactions: {
        '🚀': { emoji: '🚀', count: 2, users: ['0x1234...5678', '0x8765...4321'] }
      }
    },
    {
      id: '3',
      sender: 'VibeBaron',
      address: '0x8765...4321',
      content: 'GM to everyone except paper hands 😎',
      timestamp: Date.now() - 60000, // 1 minute ago
      reactions: {
        '😎': { emoji: '😎', count: 1, users: ['0x1234...5678'] },
        '💯': { emoji: '💯', count: 2, users: ['0xabcd...efgh', '0x0000...0000'] }
      }
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    addSystemMessage: (content: string) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        sender: 'System',
        address: 'system',
        content,
        timestamp: Date.now(),
        isSystem: true,
        reactions: {} // Initialize empty reactions
      };
      setMessages(prev => [...prev, systemMessage]);
      
      // Auto-expand the chat when system message arrives
      if (isMinimized) {
        setIsMinimized(false);
      }
    }
  }));

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (showEmojiPicker) {
      const handleClickOutside = () => setShowEmojiPicker(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Play sound if provided
    if (onSendSound) onSendSound();
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUserAddress ? `User ${currentUserAddress.slice(0, 4)}` : 'Anonymous',
      address: currentUserAddress || '0x0000...0000',
      content: inputValue.trim(),
      timestamp: Date.now(),
      reactions: {} // Initialize empty reactions
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  // Add or update reaction to a message
  const handleReaction = (messageId: string, emoji: string) => {
    if (!currentUserAddress) return;
    
    if (onHoverSound) onHoverSound();
    
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === messageId) {
          // Ensure reactions object exists
          const updatedReactions = message.reactions ? { ...message.reactions } : {};
          
          // If this emoji reaction already exists
          if (updatedReactions[emoji]) {
            const reaction = updatedReactions[emoji];
            
            // If user already reacted with this emoji, remove their reaction
            if (reaction.users.includes(currentUserAddress)) {
              const updatedUsers = reaction.users.filter(user => user !== currentUserAddress);
              
              // If no users left for this reaction, remove it entirely
              if (updatedUsers.length === 0) {
                delete updatedReactions[emoji];
              } else {
                updatedReactions[emoji] = {
                  ...reaction,
                  count: updatedUsers.length,
                  users: updatedUsers
                };
              }
            } 
            // Add user's reaction
            else {
              updatedReactions[emoji] = {
                ...reaction,
                count: reaction.count + 1,
                users: [...reaction.users, currentUserAddress]
              };
            }
          } 
          // Create new reaction
          else {
            updatedReactions[emoji] = {
              emoji,
              count: 1,
              users: [currentUserAddress]
            };
          }
          
          return {
            ...message,
            reactions: updatedReactions
          };
        }
        return message;
      })
    );
    
    // Close emoji picker after selecting
    setShowEmojiPicker(null);
  };

  // Add reaction to system message (daily claim)
  const handleSystemReaction = (messageId: string, emoji: string) => {
    if (!currentUserAddress) return;
    
    if (onHoverSound) onHoverSound();
    
    // Just call the main reaction handler
    handleReaction(messageId, emoji);
  };

  // Toggle emoji picker for a specific message
  const toggleEmojiPicker = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation(); // Prevent closing immediately due to document click
    setShowEmojiPicker(prev => prev === messageId ? null : messageId);
  };

  // Quick responses for congratulating milestone and daily claims
  const sendQuickCongrats = () => {
    if (!currentUserAddress) return;
    
    if (onSendSound) onSendSound();
    
    const congratsMessages = [
      "🎉 Congrats on the streak!",
      "Nice streak! Keep it up! 🔥",
      "Way to go! 👏",
      "Awesome streak! GM! ☀️",
      "WAGMI! Streak looking good! 💪"
    ];
    
    const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUserAddress ? `User ${currentUserAddress.slice(0, 4)}` : 'Anonymous',
      address: currentUserAddress || '0x0000...0000',
      content: randomMessage,
      timestamp: Date.now(),
      reactions: {}
    };
    
    setMessages([...messages, newMessage]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${isMinimized ? 'h-12' : 'h-96'} w-72 bg-black/90 backdrop-blur-md border border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Chat header */}
      <div className="bg-zinc-800 p-3 flex items-center justify-between border-b border-zinc-700">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <h3 className="text-sm font-bold text-white">GM Chat</h3>
          <span className="text-xs text-zinc-400 ml-2">{messages.length} messages</span>
        </div>
        <div className="flex">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            onMouseEnter={onHoverSound}
            className="text-zinc-400 hover:text-white mr-2"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>
      </div>
      
      {/* Message container (hidden when minimized) */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex flex-col ${
                  message.isSystem 
                    ? 'items-center' 
                    : message.address === currentUserAddress 
                      ? 'items-end' 
                      : 'items-start'
                }`}
              >
                {!message.isSystem && (
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-semibold text-yellow-400">{message.sender}</span>
                    <span className="text-xs text-zinc-500 ml-2">{formatTime(message.timestamp)}</span>
                  </div>
                )}
                
                <div className="relative">
                  <div className={`max-w-[90%] p-2 rounded-lg ${
                    message.isSystem 
                      ? 'bg-yellow-600/30 text-yellow-200 text-xs border border-yellow-600/40 w-full text-center' 
                      : message.address === currentUserAddress 
                        ? 'bg-purple-600/60 text-white' 
                        : 'bg-zinc-800 text-zinc-200'
                  }`}>
                    {message.content}
                  </div>
                  
                  {/* System message action buttons - now placed OUTSIDE the message box */}
                  {message.isSystem && message.content.includes('claimed') && currentUserAddress && (
                    <div className="flex gap-1 justify-center mt-1.5 w-full">
                      <button 
                        onClick={sendQuickCongrats}
                        onMouseEnter={onHoverSound}
                        className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded transition-colors"
                      >
                        👏 Congrats!
                      </button>
                      
                      <button 
                        onClick={(e) => toggleEmojiPicker(e, message.id)}
                        onMouseEnter={onHoverSound}
                        className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded transition-colors flex items-center"
                      >
                        <Plus size={12} className="mr-1" /> React
                      </button>
                    </div>
                  )}
                  
                  {/* Display reactions for system messages */}
                  {message.isSystem && message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 justify-center">
                      {Object.values(message.reactions).map(reaction => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          onMouseEnter={onHoverSound}
                          className={`text-xs rounded-full px-1.5 py-0.5 flex items-center gap-1 transition-colors ${
                            currentUserAddress && reaction.users.includes(currentUserAddress)
                              ? 'bg-zinc-600/80 hover:bg-zinc-600' 
                              : 'bg-zinc-800/60 hover:bg-zinc-700/60'
                          }`}
                          title={`${reaction.users.length} reaction${reaction.users.length !== 1 ? 's' : ''}: ${
                            currentUserAddress && reaction.users.includes(currentUserAddress) 
                              ? 'Click to remove your reaction' 
                              : 'Click to add your reaction'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-zinc-300">{reaction.count}</span>
                        </button>
                      ))}
                      
                      {/* Add reaction button */}
                      <button 
                        onClick={(e) => toggleEmojiPicker(e, message.id)}
                        onMouseEnter={onHoverSound}
                        className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 rounded-full px-1.5 py-0.5 text-zinc-400"
                        title="Add a reaction"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                  
                  {/* Display reactions for regular messages */}
                  {!message.isSystem && message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.values(message.reactions).map(reaction => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReaction(message.id, reaction.emoji)}
                          onMouseEnter={onHoverSound}
                          className={`text-xs rounded-full px-1.5 py-0.5 flex items-center gap-1 transition-colors ${
                            currentUserAddress && reaction.users.includes(currentUserAddress)
                              ? 'bg-zinc-600/80 hover:bg-zinc-600' 
                              : 'bg-zinc-800/60 hover:bg-zinc-700/60'
                          }`}
                          title={`${reaction.users.length} reaction${reaction.users.length !== 1 ? 's' : ''}: ${
                            currentUserAddress && reaction.users.includes(currentUserAddress) 
                              ? 'Click to remove your reaction' 
                              : 'Click to add your reaction'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-zinc-300">{reaction.count}</span>
                        </button>
                      ))}
                      
                      {/* Add reaction button */}
                      <button 
                        onClick={(e) => toggleEmojiPicker(e, message.id)}
                        onMouseEnter={onHoverSound}
                        className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 rounded-full px-1.5 py-0.5 text-zinc-400"
                        title="Add a reaction"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                  
                  {/* Add first reaction if none exist (regular messages only) */}
                  {(!message.reactions || Object.keys(message.reactions).length === 0) && !message.isSystem && (
                    <div className="flex mt-1 justify-end">
                      <button 
                        onClick={(e) => toggleEmojiPicker(e, message.id)}
                        onMouseEnter={onHoverSound}
                        className="text-xs bg-zinc-800/60 hover:bg-zinc-700/60 rounded-full px-1.5 py-0.5 text-zinc-400 flex items-center"
                      >
                        <Plus size={10} className="mr-0.5" /> React
                      </button>
                    </div>
                  )}
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker === message.id && (
                    <div 
                      className="absolute top-full mt-1 left-0 bg-zinc-800 rounded-lg border border-zinc-700 p-1 z-10 shadow-xl flex flex-wrap gap-1 max-w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {commonEmojis.map(emoji => (
                        <button 
                          key={emoji} 
                          className="hover:bg-zinc-700 rounded p-1 text-sm transition-colors"
                          onClick={() => handleReaction(message.id, emoji)}
                          onMouseEnter={onHoverSound}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-3 border-t border-zinc-700">
            <div className="flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type GM..."
                className="flex-1 bg-zinc-800 text-white text-sm rounded-l-lg px-3 py-2 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                onMouseEnter={onHoverSound}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-r-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

GMChatWindow.displayName = 'GMChatWindow';

export default GMChatWindow; 