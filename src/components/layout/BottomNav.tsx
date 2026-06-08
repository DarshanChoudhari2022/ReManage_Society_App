"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Contact, Plus, MessageCircleMore, User as UserIcon } from "lucide-react";

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
  void userRole;
  void userId;
  void societyId;

  const pathname = usePathname();
  const homeActive = pathname === "/dashboard" || pathname === "/";
  const societyActive = pathname.startsWith("/directory") || pathname.startsWith("/members");
  const servicesActive = pathname.startsWith("/complaints");
  const profileActive = pathname.startsWith("/settings");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe lg:hidden max-w-[420px] mx-auto">
      <div className="flex h-16 items-center justify-around px-2 relative">
        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-16 gap-1 ${homeActive ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}>
          <Home className="w-[22px] h-[22px]" strokeWidth={homeActive ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        
        <Link href="/directory" className={`flex flex-col items-center justify-center w-16 gap-1 ${societyActive ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}>
          <Contact className="w-[22px] h-[22px]" strokeWidth={societyActive ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">My Society</span>
        </Link>
        
        {/* Center Floating Action Button */}
        <div className="relative w-16 flex justify-center -mt-8">
          <Link href="/complaints" aria-label="Create request" className="w-12 h-12 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-transform hover:scale-105 active:scale-95">
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Link>
        </div>
        
        <Link href="/complaints" className={`flex flex-col items-center justify-center w-16 gap-1 ${servicesActive ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}>
          <MessageCircleMore className="w-[22px] h-[22px]" strokeWidth={servicesActive ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Services</span>
        </Link>
        
        <Link href="/settings" className={`flex flex-col items-center justify-center w-16 gap-1 ${profileActive ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"}`}>
          <UserIcon className="w-[22px] h-[22px]" strokeWidth={profileActive ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
      </div>
    </div>
  );
}
