"use client";

import { Languages } from "lucide-react";
import { LANGUAGE_OPTIONS, useI18n } from "@/lib/i18n";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label
      className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white/80 px-2 text-text-secondary shadow-sm backdrop-blur transition-colors hover:text-text-primary dark:bg-slate-900/80"
      title={t("Language")}
    >
      <Languages className="h-4 w-4 shrink-0" />
      <select
        aria-label={t("Language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        className="h-8 cursor-pointer rounded-lg bg-transparent text-xs font-black uppercase tracking-wider text-text-primary outline-none"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
