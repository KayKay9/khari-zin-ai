import type { Locale, Bilingual } from "@/lib/types";
import en, { type MessageKey } from "./en";
import my from "./my";

const dictionaries = { en, my } as const;

export function t(locale: Locale, key: MessageKey): string {
  return dictionaries[locale][key];
}

export function bi(locale: Locale, value: Bilingual): string {
  return value[locale] || value.en;
}

export type { MessageKey };
