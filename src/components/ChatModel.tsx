import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { Activity, Message } from '../types';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface ChatModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ activity, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activity || !isOpen) return;

    const q = query(
      collection(db, 'activities', activity.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderUid: data.senderUid,
          timestamp: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...'
        };
      }) as any[];
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [activity, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activity || !auth.currentUser) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'activities', activity.id, 'messages'), {
        text,
        sender: auth.currentUser.displayName || 'User',
        senderUid: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        activityId: activity.id
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!activity) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 border-bottom border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl">
                  {activity.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{activity.title}</h3>
                  <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Group Chat • {activity.attendees} members</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderUid === auth.currentUser?.uid ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {msg.senderUid === auth.currentUser?.uid ? 'You' : msg.sender}
                    </span>
                    <span className="text-[10px] text-gray-600">{msg.timestamp}</span>
                  </div>
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm",
                      msg.senderUid === auth.currentUser?.uid
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-black/40 border-t border-white/5">
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/10 focus-within:border-blue-500/50 transition-colors">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full py-2"
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
