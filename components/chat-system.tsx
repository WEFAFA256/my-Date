import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  image_url?: string;
};

type MatchWithProfile = {
  match_id: string;
  other_user: Profile;
  last_message?: string;
  last_message_time?: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function MatchesOverlay({ onClose, currentUser, onSelectMatch }: { 
  onClose: () => void; 
  currentUser: { id: string } | null;
  onSelectMatch: (match: MatchWithProfile) => void;
}) {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUser) return;
    
    async function fetchMatches() {
      // Fetch matches where user is user1 or user2
      const { data: matchData } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, created_at")
        .or(`user1_id.eq.${currentUser!.id},user2_id.eq.${currentUser!.id}`)
        .order("created_at", { ascending: false });

      if (!matchData || matchData.length === 0) {
        setLoading(false);
        return;
      }

      // Get profile info for the 'other' users
      const otherUserIds = matchData.map((m: any) => m.user1_id === currentUser!.id ? m.user2_id : m.user1_id);
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, image_url")
        .in("id", otherUserIds);

      // Now fetch latest message for each match
      const finalMatches: MatchWithProfile[] = await Promise.all(matchData.map(async (m: any) => {
        const otherId = m.user1_id === currentUser!.id ? m.user2_id : m.user1_id;
        const otherProfile = profilesData?.find((p: any) => p.id === otherId) || { id: otherId, full_name: "Unknown User" };
        
        const { data: msgData } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        return {
          match_id: m.id,
          other_user: otherProfile,
          last_message: msgData ? msgData.content : "New match! Say hi 👋",
          last_message_time: msgData ? msgData.created_at : m.created_at
        };
      }));

      // Sort by latest message time
      finalMatches.sort((a, b) => new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime());

      setMatches(finalMatches);
      setLoading(false);
    }
    fetchMatches();
  }, [currentUser, supabase]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full sm:max-w-[420px] sm:h-[90dvh] bg-[#0c0d10] flex flex-col p-6 sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-white/10 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black italic text-white">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-pink" size={32} /></div>
          ) : matches.length > 0 ? (
            matches.map((m) => (
              <motion.div
                key={m.match_id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => onSelectMatch(m)}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img src={m.other_user.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.other_user.id}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-base text-white">{m.other_user.full_name}</div>
                  <div className="text-sm text-gray-400 truncate font-medium">{m.last_message}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-primary-pink/50">
                <Search size={40} />
              </div>
              <p className="text-gray-500 font-medium italic">No matches just yet.<br/>Keep swiping!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function RealtimeChatOverlay({ match, onClose, currentUser }: { 
  match: MatchWithProfile;
  onClose: () => void; 
  currentUser: { id: string } | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUser || !match.match_id) return;

    // Fetch existing messages
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", match.match_id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    }
    loadMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`chat_${match.match_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${match.match_id}`
      }, (payload: any) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.match_id, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;
    
    const content = input.trim();
    setInput("");

    // Optimistic UI update could be added here, but relying on realtime subscription is safer
    
    await supabase.from("messages").insert({
      match_id: match.match_id,
      sender_id: currentUser.id,
      receiver_id: match.other_user.id,
      content: content
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full h-full sm:max-w-[420px] sm:h-[90dvh] bg-[#0c0d10] flex flex-col sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-white/10 overflow-hidden"
      >
        <div className="h-[70px] flex items-center px-6 border-b border-white/10 gap-4 shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img src={match.other_user.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.other_user.id}`} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white truncate text-base">{match.other_user.full_name}</div>
            <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Matched
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-10 italic">
              Break the ice! Send the first message.
            </div>
          )}
          {messages.map((m) => {
            const isMe = m.sender_id === currentUser?.id;
            const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <motion.div
                key={m.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] p-3.5 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                  isMe
                    ? "bg-gradient-to-br from-primary-orange to-primary-pink text-white rounded-tr-none"
                    : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                }`}>
                  {m.content}
                  <div className={`text-[9.5px] mt-1.5 font-bold uppercase tracking-tight opacity-50 ${isMe ? "text-right" : "text-left"}`}>
                    {timeStr}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0c0d10]/50 backdrop-blur-xl">
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full py-3.5 pl-6 pr-14 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-1.5 w-10 h-10 bg-primary-pink rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-pink/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
