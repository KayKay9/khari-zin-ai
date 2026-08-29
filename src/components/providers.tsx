"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/context/locale-context";
import { TripProvider } from "@/context/trip-context";
import { ChatProvider } from "@/context/chat-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <TripProvider>
        <ChatProvider>{children}</ChatProvider>
      </TripProvider>
    </LocaleProvider>
  );
}
