"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Bell, UserPlus, Flame, Send, Share2, X, Check, Activity, ChevronRight } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { NudgeModal } from "@/components/NudgeModal";
import { useFriends, useMe, postJSON, refreshAll } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { avatarStateFor } from "@/lib/scoring";
import { describeFeedEvent, formatRelativeTime } from "@/lib/friend-insights";
import { getChallenge } from "@/lib/challenges";
import type { FeedEvent } from "@/lib/types";

export default function FriendsPage() {
  return (
    <AppShell>
      <FriendsInner />
    </AppShell>
  );
}

function FriendsInner() {
  const { data: me } = useMe();
  const { data } = useFriends();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [nudgeFor, setNudgeFor] = useState<{ username: string; displayName: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!me || !data) return null;
  const u = me.user;

  const sendRequest = async () => {
    setBusy(true);
    try {
      const r = await postJSON<{ status: string }>("/api/friends/request", {
        username: newName.trim().toLowerCase(),
      });
      toast(r.status === "friends" ? "You're now friends!" : "Request sent", "success");
      setNewName("");
      setAddOpen(false);
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const accept = async (username: string) => {
    try {
      await postJSON("/api/friends/accept", { username });
      toast("Added!", "success");
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const decline = async (username: string) => {
    try {
      await postJSON("/api/friends/decline", { username });
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="px-5 pt-8 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Friends</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareOpen(true)}
            className="ee-card px-3 py-2 text-sm font-semibold flex items-center gap-1"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="ee-btn-mango !py-2 !px-4 text-sm flex items-center gap-1"
          >
            <UserPlus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Activity feed */}
      <div className="ee-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-leaf" />
          <div className="font-display text-base font-bold">Recent activity</div>
        </div>
        {data.feed.length === 0 ? (
          <div className="text-sm text-soft py-2 text-center">
            {data.friends.length === 0
              ? "Add friends to see their activity here."
              : "No recent activity. Send a nudge to your friends!"}
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {data.feed.slice(0, 12).map((ev, i) => (
              <FeedRow key={i} event={ev} />
            ))}
          </div>
        )}
      </div>

      {/* Pending requests */}
      {data.requestsIn.length > 0 && (
        <div className="ee-card p-5 mb-4">
          <div className="font-display text-base font-bold mb-3 flex items-center gap-2">
            <Bell size={16} /> Friend requests
          </div>
          <div className="space-y-2">
            {data.requestsIn.map((r) => (
              <div key={r.username} className="flex items-center gap-3 p-2 rounded-2xl bg-curd">
                <div className="w-10 h-10 rounded-2xl bg-mango/30 flex items-center justify-center font-bold text-charcoal">
                  {r.displayName[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{r.displayName}</div>
                  <div className="text-[11px] text-soft">@{r.username}</div>
                </div>
                <button
                  onClick={() => accept(r.username)}
                  className="w-9 h-9 rounded-full bg-leaf text-white flex items-center justify-center"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => decline(r.username)}
                  className="w-9 h-9 rounded-full bg-charcoal/10 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      {data.friends.length === 0 ? (
        <div className="ee-card p-6 text-center">
          <div className="text-3xl mb-2">👯</div>
          <div className="font-bold mb-1">No friends yet</div>
          <div className="text-sm text-soft mb-4">
            Add by username — they'll see your progress and you'll see theirs.
          </div>
          <button onClick={() => setAddOpen(true)} className="ee-btn-mango">
            Add a friend
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.friends.map((f) => (
            <Link
              key={f.username}
              href={`/friends/${f.username}`}
              className="ee-card p-4 flex items-start gap-4 active:scale-[0.99] transition"
            >
              <Avatar
                state={f.avatarState}
                level={f.avatarLevel}
                accessories={f.unlockedAccessories}
                size={64}
                showAura={false}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <div className="font-bold truncate">{f.displayName}</div>
                  <ChevronRight size={14} className="text-soft" />
                </div>
                <div className="text-[11px] text-soft truncate">@{f.username}</div>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="font-semibold">{f.todayScore}/100</span>
                  <span className="flex items-center gap-1 text-tomato">
                    <Flame size={12} /> {f.streak}
                  </span>
                  <span className="ee-pill !text-[10px]">{f.avatarState}</span>
                </div>
                {f.recap && (
                  <div className="text-[11px] text-soft italic mt-2 line-clamp-2">
                    {f.recap}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNudgeFor({ username: f.username, displayName: f.displayName });
                }}
                className="w-10 h-10 rounded-full bg-mango/20 flex items-center justify-center text-mango-dark shrink-0"
                aria-label="Nudge"
              >
                <Send size={16} />
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* Sent requests */}
      {data.requestsOut.length > 0 && (
        <div className="mt-4 ee-card p-4">
          <div className="text-xs uppercase tracking-wider text-soft font-semibold mb-2">
            Pending sent
          </div>
          <div className="flex flex-wrap gap-2">
            {data.requestsOut.map((r) => (
              <div key={r} className="ee-chip">
                @{r} · waiting
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add friend modal */}
      {addOpen && (
        <Modal onClose={() => setAddOpen(false)} title="Add a friend">
          <div className="text-sm text-soft mb-4">
            Enter their Eat Easy username (lowercase).
          </div>
          <input
            autoFocus
            value={newName}
            onChange={(e) =>
              setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            placeholder="username"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-charcoal/10 focus:outline-none focus:border-charcoal/30 font-medium"
          />
          <button
            onClick={sendRequest}
            disabled={!newName || busy}
            className="ee-btn-mango w-full mt-4 disabled:opacity-50"
          >
            {busy ? "…" : "Send request"}
          </button>
        </Modal>
      )}

      {/* Nudge modal */}
      {nudgeFor && (
        <NudgeModal
          username={nudgeFor.username}
          displayName={nudgeFor.displayName}
          onClose={() => setNudgeFor(null)}
        />
      )}

      {/* Share progress modal */}
      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} user={u} />}
    </div>
  );
}

function FeedRow({ event }: { event: FeedEvent }) {
  return (
    <Link
      href={`/friends/${event.from.username}`}
      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-curd transition"
    >
      <Avatar
        state="normal"
        level={event.from.avatarLevel}
        accessories={event.from.unlockedAccessories}
        size={36}
        showAura={false}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <span className="font-semibold">{event.from.displayName}</span>{" "}
          <span className="text-soft">{describeFeedEvent(event)}</span>
        </div>
        <div className="text-[10px] text-soft">{formatRelativeTime(event.timestamp)}</div>
      </div>
      {event.type === "meal" && (
        <div
          className={`text-xs font-semibold ${
            event.meal.scoreChange >= 0 ? "text-leaf" : "text-tomato"
          }`}
        >
          {event.meal.scoreChange >= 0 ? "+" : ""}
          {event.meal.scoreChange}
        </div>
      )}
      {event.type === "challenge" && <span className="text-leaf text-base">✓</span>}
    </Link>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="w-full max-w-[480px] mx-auto pointer-events-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-curd rounded-t-3xl p-6 pb-8"
          style={{ animation: "ee-slideUp 0.25s ease-out" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-xl font-bold">{title}</div>
            <button onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
      <style jsx>{`
        @keyframes ee-slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function ShareModal({ onClose, user }: { onClose: () => void; user: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#FFF8EC",
      });
      const link = document.createElement("a");
      link.download = `eat-easy-${user.username}.png`;
      link.href = dataUrl;
      link.click();
      toast("Card saved!", "success");
    } catch (e: any) {
      toast("Couldn't save card", "error");
    } finally {
      setBusy(false);
    }
  };

  const state = avatarStateFor(user.todayScore);

  return (
    <Modal onClose={onClose} title="Share your progress">
      <div
        ref={cardRef}
        className="rounded-3xl p-6 mb-4"
        style={{
          background: "linear-gradient(135deg, #FFF8EC 0%, #FFD976 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-charcoal text-mango flex items-center justify-center font-display font-bold">
            E
          </div>
          <div className="font-display font-bold">Eat Easy</div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar
            state={state}
            level={user.avatarLevel}
            accessories={user.unlockedAccessories}
            size={120}
            showAura={false}
          />
          <div>
            <div className="font-display text-2xl font-bold">{user.displayName}</div>
            <div className="text-soft text-xs">@{user.username}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-bold">{user.todayScore}/100</span>
              <span className="text-tomato">🔥 {user.streak}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/60 rounded-2xl p-2">
            <div className="text-[10px] text-soft">Today</div>
            <div className="font-bold">{user.todayScore}</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-2">
            <div className="text-[10px] text-soft">Streak</div>
            <div className="font-bold">{user.streak}d</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-2">
            <div className="text-[10px] text-soft">Coins</div>
            <div className="font-bold">{user.coins}</div>
          </div>
        </div>
        <div className="text-[10px] text-soft text-center mt-3">eat-easy.app</div>
      </div>
      <button
        onClick={download}
        disabled={busy}
        className="ee-btn-mango w-full disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save card to phone"}
      </button>
      <div className="text-[11px] text-soft text-center mt-2">
        Then share it on WhatsApp / Insta
      </div>
    </Modal>
  );
}
