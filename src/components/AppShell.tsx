"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe, fetchNudges } from "@/lib/api";
import { BottomNav } from "./BottomNav";
import { ToastProvider, useToast } from "./Toast";

function NudgeWatcher() {
  const { toast } = useToast();
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const nudges = await fetchNudges();
      if (cancelled) return;
      nudges.forEach((n) => {
        toast(`💌 ${n.fromDisplayName}: ${n.message}`, "info");
      });
    };
    tick();
    const id = setInterval(tick, 25000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [toast]);
  return null;
}

export function AppShell({ children, requireAuth = true }: { children: React.ReactNode; requireAuth?: boolean }) {
  const router = useRouter();
  const { data, error, isLoading } = useMe();

  useEffect(() => {
    if (!requireAuth) return;
    if (error && (error as any).status === 401) {
      router.replace("/auth");
    }
  }, [error, requireAuth, router]);

  if (requireAuth && isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-soft text-sm">Loading…</div>
      </div>
    );
  }

  if (requireAuth && !data) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-soft text-sm">Redirecting…</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <NudgeWatcher />
      <div className="pb-28">{children}</div>
      <BottomNav />
    </ToastProvider>
  );
}
