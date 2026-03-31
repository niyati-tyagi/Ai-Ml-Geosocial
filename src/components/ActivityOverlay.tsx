import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Clock, MapPin, ChevronUp, ChevronDown, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Activity } from '../types';
import { CATEGORIES } from '../mockData';
import { cn } from '../lib/utils';

interface ActivityOverlayProps {
  activities: Activity[];
  onJoin: (id: string) => void;
  joinedActivities: Set<string>;
  onOpenChat: (activity: Activity) => void;
}

export const ActivityOverlay: React.FC<ActivityOverlayProps> = ({
  activities,
  onJoin,
  joinedActivities,
  onOpenChat,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredActivities = activities.filter(
    (a) => activeCategory === 'All' || a.category === activeCategory
  );

  return (
    <motion.div
      initial={{ y: '70%' }}
      animate={{ y: isExpanded ? '10%' : '70%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[1500] bg-[#0f0f0f]/90 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col h-[90vh]"
    >
      {/* Handle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-4 flex flex-col items-center cursor-pointer group"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mb-2 group-hover:bg-white/40 transition-colors" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors">
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          Explore Activities
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-6 overflow-x-auto no-scrollbar flex items-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 border",
              activeCategory === cat
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20 scale-105"
                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="group relative bg-[#1a1a1a] border border-white/5 rounded-[32px] p-5 hover:bg-[#222] hover:border-white/10 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-start gap-4">
                {/* Avatar/Icon */}
                <div className="relative">
                  <img
                    src={activity.userAvatar}
                    alt={activity.userName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#2a2a2a] rounded-xl flex items-center justify-center text-sm shadow-md border border-white/10">
                    {activity.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-lg truncate group-hover:text-blue-400 transition-colors">
                      {activity.title}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-500/80 bg-blue-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                      {activity.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500/60" />
                      {activity.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-500/60" />
                      {joinedActivities.has(activity.id) ? activity.attendees + 1 : activity.attendees} attending
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-3">
                <button
                  onClick={() => onJoin(activity.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                    joinedActivities.has(activity.id)
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  )}
                >
                  {joinedActivities.has(activity.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Joined
                    </>
                  ) : (
                    "Join Activity"
                  )}
                </button>
                
                {joinedActivities.has(activity.id) && (
                  <button
                    onClick={() => onOpenChat(activity)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-blue-400 transition-all duration-300"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
