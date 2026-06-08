"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/user-context";
import { usePersonaNav } from "@/lib/navigation/use-persona-nav";
import { getNavIcon } from "@/lib/navigation/nav-icons";

interface BottomNavProps {
  userRole?: string;
  userId?: string;
  societyId?: string;
}

export default function BottomNav({
  userRole = "member",
  userId,
  societyId,
}: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useUser();
  const personaNav = usePersonaNav(
    societyId || user.societyId
      ? {
          subject: userId || user.id || user.email || "user",
          societyId: societyId || user.societyId || "",
          role: userRole,
        }
      : null,
  );

  const navItems = personaNav?.bottomNav ?? [];

  if (navItems.length === 0) return null;

  return (
    <div
      data-persona={personaNav?.persona || "unknown"}
      className="fixed bottom-3 left-3 right-3 z-40 rounded-[1.75rem] border border-white/70 bg-white/95 px-2 pb-safe pt-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-300 dark:border-slate-700 dark:bg-[#0f172a]/95 lg:hidden"
    >
      <div className="mx-auto flex h-[60px] max-w-md items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = getNavIcon(item.iconKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-12 min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-surface hover:text-text-primary"
              }`}
            >
              <Icon className={`h-5 w-5 transition-all ${isActive ? "stroke-[2.5px]" : "stroke-[1.7px]"}`} />
              <span className={`max-w-full truncate px-1 text-[10px] leading-none transition-all ${isActive ? "font-black" : "font-semibold"}`}>
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
