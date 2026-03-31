import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ChevronRight, Users } from 'lucide-react';
import { Activity } from '../types';

interface ChatsViewProps {
  activities: Activity[];
  joinedActivities: Set<string>;
  onOpenChat: (activity: Activity) => void;
}

export const ChatsView: React.FC<ChatsViewProps> = ({
  activities,
  joinedActivities,
  onOpenChat,
}) => {
  const joinedList = activities.filter(a => joinedActivities.has(a.id));

  return (
    <div className="fixed inset-0 z-[1400] bg-[#0a0a0a] pt-24 px-6 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Chats</h1>
          <p className="text-gray-500 text-sm">
            {joinedList.length} active conversations from activities you've joined.
          </p>
        </header>

        {joinedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
              <MessageSquare className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active chats</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Join some activities to start chatting with other participants!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinedList.map((activity) => (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onOpenChat(activity)}
                className="w-full flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/5 rounded-[24px] hover:bg-[#222] hover:border-white/10 transition-all duration-300 group shadow-xl"
              >
                <div className="relative">
                  <img
                    src={activity.userAvatar}
                    alt={activity.userName}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-xs shadow-lg border border-black">
                    {activity.icon}
                  </div>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      <Users className="w-3 h-3" />
                      {activity.attendees + 1}
                    </div>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <span className="text-[11px] text-blue-500/80 font-bold uppercase tracking-wider">
                      {activity.category}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
