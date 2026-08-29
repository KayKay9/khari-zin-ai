"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "@/context/locale-context";
import { useTrip } from "@/context/trip-context";
import { bi } from "@/i18n";
import { demoPayloadForMessage } from "@/lib/fallback";
import type { ChatPayload } from "@/lib/types";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  payload?: ChatPayload;
};

type ChatContextValue = {
  messages: ChatMessage[];
  loading: boolean;
  send: (text: string, retry?: boolean) => Promise<void>;
  lastUser: string;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const trip = useTrip();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUser, setLastUser] = useState("");
  const inFlight = useRef(false);

  const send = useCallback(
    async (text: string, retry = false) => {
      const message = text.trim();
      if (!message || inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      setLastUser(message);
      if (!retry) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", text: message },
        ]);
      }
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            locale,
            trip: trip.snapshot,
            retry,
          }),
        });
        const payload = (await res.json()) as ChatPayload;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: bi(locale, payload.reply),
            payload,
          },
        ]);
      } catch {
        const fallback = demoPayloadForMessage(message);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: bi(locale, fallback.reply),
            payload: fallback,
          },
        ]);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [locale, trip.snapshot],
  );

  return (
    <ChatContext.Provider
      value={{ messages, loading, send, lastUser }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
