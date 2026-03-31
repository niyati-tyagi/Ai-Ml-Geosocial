import React, { useState, useCallback, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { ActivityOverlay } from './components/ActivityOverlay';
import { SearchBar } from './components/SearchBar';
import { ChatModal } from './components/ChatModal';
import { ChatsView } from './components/ChatsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MOCK_ACTIVITIES, CATEGORIES } from './mockData';
import { Activity } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Bell, Map as MapIcon, Compass, LogIn, MessageSquare } from 'lucide-react';
import { cn } from './lib/utils';
import { auth, db } from './firebase';
import { GoogleGenAI } from "@google/genai";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment, 
  getDocFromServer,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { seedDatabase } from './services/firebaseService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [joinedActivities, setJoinedActivities] = useState<Set<string>>(new Set());
  const [selectedChatActivity, setSelectedChatActivity] = useState<Activity | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'discover' | 'chats'>('map');
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Use Gemini to get coordinates for the location
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the location query "${query}", return ONLY a JSON object with "lat" and "lng" coordinates in India. If it's not a location, return the coordinates for central India [20.5937, 78.9629]. Format: {"lat": number, "lng": number}`,
        config: { responseMimeType: "application/json" }
      });

      const coords = JSON.parse(response.text);
      if (coords.lat && coords.lng) {
        setMapCenter([coords.lat, coords.lng]);
        setMapZoom(12);
      }
    } catch (error) {
      console.error("Search Error:", error);
      // Fallback: simple string matching for mock data
      const cityMatch = MOCK_ACTIVITIES.find(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) || 
        a.description.toLowerCase().includes(query.toLowerCase())
      );
      if (cityMatch) {
        setMapCenter([cityMatch.lat, cityMatch.lng]);
        setMapZoom(14);
      }
    }
  };

  // Seed database and test connection
  useEffect(() => {
    async function init() {
      if (!isAuthReady) return;
      try {
        await seedDatabase();
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    init();
  }, [isAuthReady, user]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: currentUser.email === 'sharmaarnav5662@gmail.com' ? 'admin' : 'user',
              joinedActivities: []
            });
          }
        } catch (error) {
          console.error("Error syncing user document:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Activities Listener
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      
      if (fetchedActivities.length > 0) {
        setActivities(fetchedActivities);
      }
    }, (error) => {
      console.error("Firestore Error (activities):", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error?.code === 'auth/unauthorized-domain') {
        alert("Firebase Auth error: 'localhost' is not an authorized domain.\n\nTo enable full backend syncing, please go to your Firebase Console -> Authentication -> Settings -> Authorized domains, and add 'localhost'.\n\nThe app will continue to run in local-only mode.");
      } else {
        alert("Login failed: " + (error.message || String(error)));
      }
    }
  };

  const handleJoin = useCallback(async (id: string) => {
    const isJoining = !joinedActivities.has(id);
    
    // Optimistically update local state so the button visually works
    setJoinedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (!user) {
      handleLogin();
      return;
    }

    // Update Firestore attendees count
    try {
      const activityRef = doc(db, 'activities', id);
      await updateDoc(activityRef, {
        attendees: increment(isJoining ? 1 : -1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${id}`);
      // Revert local state if Firestore update fails
      setJoinedActivities((prev) => {
        const next = new Set(prev);
        if (isJoining) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }, [user, joinedActivities]);

  const openChat = useCallback((activity: Activity) => {
    setSelectedChatActivity(activity);
    setIsChatOpen(true);
  }, []);

  const center: [number, number] = [20.5937, 78.9629]; // Central India

  if (!isAuthReady) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative h-screen w-screen bg-[#0a0a0a] overflow-hidden font-sans">
        {/* Background Map */}
        <MapComponent
          activities={activities}
          onJoin={handleJoin}
          joinedActivities={joinedActivities}
          center={mapCenter}
          zoom={mapZoom}
        />

        {/* Floating UI Elements */}
        <SearchBar onSearch={handleSearch} />

        {/* Top Right Actions */}
        <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3">
          <button className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-black/80 transition-all duration-300 shadow-2xl">
            <Bell className="w-6 h-6" />
          </button>
          {user ? (
            <button className="p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-black/80 transition-all duration-300 shadow-2xl overflow-hidden">
              <img 
                src={user.photoURL || 'https://picsum.photos/seed/user/100/100'} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="p-3 bg-blue-600 border border-blue-500 rounded-2xl text-white hover:bg-blue-500 transition-all duration-300 shadow-2xl flex items-center gap-2"
            >
              <LogIn className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider pr-1">Login</span>
            </button>
          )}
        </div>

        {/* Main Overlay Panel */}
        {activeTab === 'discover' && (
          <ActivityOverlay
            activities={activities}
            onJoin={handleJoin}
            joinedActivities={joinedActivities}
            onOpenChat={openChat}
          />
        )}

        {/* Chats View */}
        {activeTab === 'chats' && (
          <ChatsView
            activities={activities}
            joinedActivities={joinedActivities}
            onOpenChat={openChat}
          />
        )}

        {/* Create Activity Button */}
        <button className="fixed bottom-32 right-6 z-[1600] w-16 h-16 bg-blue-600 hover:bg-blue-500 rounded-[24px] flex items-center justify-center text-white shadow-[0_10px_30px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-110 active:scale-95 group">
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1600] w-[90%] max-sm:max-w-sm">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-2xl">
            <button
              onClick={() => setActiveTab('map')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300",
                activeTab === 'map' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <MapIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
            </button>
            
            <div className="w-[1px] h-6 bg-white/10 mx-2" />
            
            <button
              onClick={() => setActiveTab('discover')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300",
                activeTab === 'discover' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Discover</span>
            </button>

            <div className="w-[1px] h-6 bg-white/10 mx-2" />

            <button
              onClick={() => setActiveTab('chats')}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300",
                activeTab === 'chats' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Chats</span>
            </button>
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal
          activity={selectedChatActivity}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        {/* Global Styles for Leaflet Popups */}
        <style>{`
          .custom-popup .leaflet-popup-content-wrapper {
            padding: 0;
            overflow: hidden;
          }
          .custom-popup .leaflet-popup-close-button {
            color: #666 !important;
            padding: 8px !important;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}

