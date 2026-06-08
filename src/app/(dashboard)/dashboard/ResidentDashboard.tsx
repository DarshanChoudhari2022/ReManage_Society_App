"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  UserCheck,
  CreditCard,
  Megaphone,
  AlertTriangle,
  Building2,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  ShoppingBag,
  Car,
  Phone,
  CheckCircle2,
  MoreHorizontal,
  User,
  Package,
  Wrench
} from "lucide-react";

export default function ResidentDashboard({ user, data, myBills }: any) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN - Main Content */}
        <div className="flex-1 space-y-6 w-full lg:w-2/3 xl:w-[70%]">
          
          {/* Hero Welcome Card */}
          <div className="rounded-[2rem] p-6 lg:p-8 shadow-sm flex items-center justify-between relative overflow-hidden bg-[#000328] min-h-[200px] lg:min-h-[220px]">
            {/* Background Image of Modern Society/Building */}
            <div className="absolute inset-0">
               <img   
                 src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80" 
                 alt="Society Building" 
                 className="w-full h-full object-cover opacity-60"
               />
            </div>
            {/* User Custom Gradient Overlay (Solid Left, Faint Right) */}
            <div 
              className="absolute inset-0" 
              style={{ background: 'linear-gradient(90deg, rgba(0,3,40,0.95) 0%, rgba(0,69,142,0.4) 100%)' }}
            />
            
            {/* Text Content */}
            <div className="relative z-10 max-w-lg">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-md">
                {greeting()}, <br className="hidden lg:block" />
                <span className="text-emerald-400">{user?.name?.split(" ")[0] || "Resident"}</span>
              </h1>
              <p className="text-white/70 mt-3 font-medium text-sm lg:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/50" />
                <span>{user?.societyName || "Smart Society"}</span>
                {user?.flatNumber && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                {user?.flatNumber && <span className="text-white font-semibold">Unit {user.flatNumber}</span>}
              </p>
            </div>

            {/* Clean, Modern User Avatar Integration (Increased Size) */}
            <div className="hidden sm:block relative z-10 shrink-0 right-2 lg:right-6">
               <div className="relative w-32 h-32 lg:w-44 lg:h-44 rounded-full p-2 bg-surface-raised/20 backdrop-blur-md border border-white/40 shadow-xl">
                 <img 
                   src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"} 
                   alt="Profile" 
                   className="w-full h-full object-cover rounded-full"
                 />
                 {/* Resident Tag Restored */}
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface-raised/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap border border-border">
                   <UserCheck className="w-4 h-4 text-emerald-600" />
                   <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Resident</span>
                 </div>
               </div>
            </div>
          </div>

          {/* 4 Priority Cards (My Bill, Staff, Deliveries, Emergency SOS) */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            
            {/* 1. My Bill */}
            <Link href="/my-bills" className="block col-span-1 group">
              <div className="rounded-[1.5rem_2rem_1.5rem_2rem] p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-900 card-float relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-emerald-400/50 dark:border-emerald-500/20">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-em" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-em)" />
                </svg>
                {/* Background Icon */}
                <CreditCard className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   {/* Left: Icon Box */}
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-surface-raised/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-surface-raised/30 transition-colors">
                     <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   
                   {/* Vertical Divider */}
                   <div className="w-px h-10 bg-surface-raised/20 shrink-0" />
                   
                   {/* Right: Text */}
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight truncate">My Bills</h3>
                     <p className="text-xs font-medium text-emerald-50 truncate">Due: ₹{myBills?.stats?.totalPending || 0}</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 2. Working Staff */}
            <Link href="/staff" className="block col-span-1 group">
              <div className="rounded-[2rem_1.5rem_2rem_1.5rem] p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-900 card-float relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-blue-400/50 dark:border-blue-500/20">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-bl" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-bl)" />
                </svg>
                {/* Background Icon */}
                <Wrench className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-surface-raised/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-surface-raised/30 transition-colors">
                     <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-surface-raised/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight truncate">My Staff</h3>
                     <p className="text-xs font-medium text-blue-50 truncate">Scheduled: 2</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 3. Deliveries */}
            <Link href="/my-visitors" className="block col-span-1 group">
              <div className="rounded-[1.5rem_2rem_1.5rem_2rem] p-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-900 card-float relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-purple-400/50 dark:border-purple-500/20">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-pu" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-pu)" />
                </svg>
                {/* Background Icon */}
                <Package className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-surface-raised/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-surface-raised/30 transition-colors">
                     <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-surface-raised/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight truncate">Deliveries</h3>
                     <p className="text-xs font-medium text-purple-50 truncate">Expected: 1</p>
                   </div>
                </div>
              </div>
            </Link>

            {/* 4. Emergency SOS */}
            <Link href="/emergency" className="block col-span-1 group">
              <div className="rounded-[2rem_1.5rem_2rem_1.5rem] p-4 bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-900 card-float relative overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 min-h-[110px] flex items-center border border-rose-400/50 dark:border-rose-500/20">
                {/* Decorative Dots */}
                <svg width="40" height="40" viewBox="0 0 40 40" className="absolute top-2 right-2 text-white opacity-20 pointer-events-none">
                  <pattern id="dots-ro" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern>
                  <rect width="40" height="40" fill="url(#dots-ro)" />
                </svg>
                {/* Background Icon */}
                <Phone className="absolute -bottom-2 -right-2 w-20 h-20 text-white opacity-[0.07] transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3 lg:gap-4 w-full">
                   <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-surface-raised/20 flex items-center justify-center border border-white/30 backdrop-blur-md shadow-sm shrink-0 group-hover:bg-surface-raised/30 transition-colors">
                     <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                   <div className="w-px h-10 bg-surface-raised/20 shrink-0" />
                   <div className="flex flex-col flex-1 min-w-0">
                     <h3 className="text-base lg:text-lg font-bold text-white tracking-tight pb-1 border-b border-white/20 mb-1 leading-tight truncate">Emergency</h3>
                     <p className="text-xs font-medium text-rose-50 truncate">Alert Security</p>
                   </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Split Section: Visitors & Discussion Forum */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Security & Visitors (Compact) */}
            <div className="bg-surface-raised rounded-[2rem_2.5rem_2rem_2.5rem] p-5 lg:p-6 border border-border card-float flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-text-primary tracking-tight">Visitors</h3>
                <Link href="/my-visitors" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-primary/5 px-3 py-1.5 rounded-full">Pre-approve</Link>
              </div>
              
              <div className="space-y-3 flex-1">
                 {/* Row 1 */}
                 <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-border hover:bg-surface-raised hover:shadow-sm hover:border-border transition-all cursor-pointer">
                   <div className="flex items-center gap-3 min-w-0">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                       <User className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm font-bold text-text-primary truncate">Amazon</p>
                       <p className="text-xs font-medium text-text-secondary truncate">Today, 2:00 PM</p>
                     </div>
                   </div>
                   <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest shrink-0 ml-2">Pending</span>
                 </div>
                 
                 {/* Row 2 */}
                 <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-border hover:bg-surface-raised hover:shadow-sm hover:border-border transition-all cursor-pointer">
                   <div className="flex items-center gap-3 min-w-0">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                       <UserCheck className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm font-bold text-text-primary truncate">Ramesh (Plumber)</p>
                       <p className="text-xs font-medium text-text-secondary truncate">Yesterday, 10:30 AM</p>
                     </div>
                   </div>
                   <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest shrink-0 ml-2">Entered</span>
                 </div>
              </div>
            </div>

            {/* Discussion Forum (Compact) */}
            <div className="bg-surface-raised rounded-[2.5rem_2rem_2.5rem_2rem] p-5 lg:p-6 border border-border card-float flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-text-primary tracking-tight">Discussions</h3>
                <Link href="/forum" className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">View All</Link>
              </div>
              
              <div className="space-y-3 flex-1">
                 {/* Forum Topic 1 */}
                 <div className="flex flex-col p-3.5 rounded-2xl bg-surface border border-border hover:bg-surface-raised hover:shadow-sm hover:border-border transition-all cursor-pointer">
                   <h4 className="text-sm font-bold text-text-primary line-clamp-1">Best broadband provider in our society?</h4>
                   <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                         <img src="https://i.pravatar.cc/100?img=12" alt="Avatar" className="w-full h-full object-cover" />
                       </div>
                       <span className="text-xs font-medium text-text-secondary">Rahul S.</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-text-secondary">
                       <MessageSquare className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold">12</span>
                     </div>
                   </div>
                 </div>

                 {/* Forum Topic 2 */}
                 <div className="flex flex-col p-3.5 rounded-2xl bg-surface border border-border hover:bg-surface-raised hover:shadow-sm hover:border-border transition-all cursor-pointer">
                   <h4 className="text-sm font-bold text-text-primary line-clamp-1">Yoga classes starting next week! 🧘‍♀️</h4>
                   <div className="flex items-center justify-between mt-2">
                     <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                         <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-full h-full object-cover" />
                       </div>
                       <span className="text-xs font-medium text-text-secondary">Priya M.</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-text-secondary">
                       <MessageSquare className="w-3.5 h-3.5" />
                       <span className="text-xs font-bold">5</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

          </div>

          {/* Quick Services Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Community Quick Links</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
               {[
                  { href: "/amenities", label: "Amenities", icon: Building2, bg: "from-teal-400 to-emerald-500", shadow: "shadow-emerald-500/30" },
                  { href: "/complaints", label: "Helpdesk", icon: AlertTriangle, bg: "from-rose-400 to-pink-500", shadow: "shadow-rose-500/30" },
                  { href: "/directory", label: "Directory", icon: BookOpen, bg: "from-violet-400 to-purple-500", shadow: "shadow-violet-500/30" },
                  { href: "/events", label: "Events", icon: CalendarCheck, bg: "from-amber-400 to-orange-500", shadow: "shadow-orange-500/30" },
                ].map((s, i) => (
                 <Link 
                   href={s.href} 
                   key={i} 
                   className={`group relative bg-surface-raised p-5 lg:p-6 border border-border hover:border-transparent card-float hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center overflow-hidden ${i % 2 === 0 ? 'rounded-[2rem_2.5rem_2rem_2.5rem]' : 'rounded-[2.5rem_2rem_2.5rem_2rem]'}`}
                 >
                   {/* Subtle background color shift on hover */}
                   <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                   
                   <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${s.bg} flex items-center justify-center shadow-lg ${s.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                     {/* Inner icon glow */}
                     <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
                     <s.icon className="relative w-7 h-7 text-white drop-shadow-sm z-10" />
                   </div>
                   
                   <span className="text-sm font-bold text-text-primary group-hover:text-text-primary transition-colors relative z-10">
                     {s.label}
                   </span>
                 </Link>
               ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Info & Alerts */}
        <div className="w-full lg:w-1/3 xl:w-[30%] flex flex-col gap-6">

          {/* Notice Board (Vertical Timeline List) */}
          <div className="bg-surface-raised rounded-[2rem_2.5rem_2rem_2.5rem] p-5 lg:p-6 border border-border card-float relative">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-text-primary tracking-tight">Notice Board</h3>
               <Link href="/notices" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-surface transition-colors">
                 <MoreHorizontal className="w-5 h-5 text-text-secondary"/>
               </Link>
             </div>

             {/* Constrained height container for the fade effect */}
             <div className="relative h-[160px] overflow-hidden">
               <div className="relative pl-4 border-l-2 border-border space-y-4">
                {/* Timeline item 1 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-raised" />
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Today, 09:00 AM</p>
                  <h4 className="text-sm font-bold text-text-primary">Water Supply Maintenance</h4>
                  <p className="text-sm font-medium text-text-secondary mt-1 line-clamp-2">Water supply will be interrupted in Block A from 2 PM to 5 PM today for routine maintenance.</p>
                </div>
                
                {/* Timeline item 2 */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-surface-raised" />
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Yesterday, 14:30 PM</p>
                  <h4 className="text-sm font-bold text-text-primary">Annual General Meeting</h4>
                  <p className="text-sm font-medium text-text-secondary mt-1 line-clamp-2">Please join the AGM meeting this Sunday at the clubhouse. All owners are requested to attend.</p>
                </div>

                {/* Timeline item 3 */}
                <div className="relative hidden lg:block">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-surface-raised" />
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Oct 12, 2025</p>
                  <h4 className="text-sm font-bold text-text-primary">Pest Control Drive</h4>
                  <p className="text-sm font-medium text-text-secondary mt-1 line-clamp-2">Quarterly pest control services will be active across all common areas.</p>
                </div>
             </div>
             </div>

             {/* Shadow Fade Effect & Button Overlay */}
             <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-surface-raised via-surface-raised to-transparent flex items-end justify-center pb-5 lg:pb-6 rounded-b-[2rem] pointer-events-none">
               <Link href="/notices" className="pointer-events-auto text-sm font-bold text-primary hover:text-primary-dark hover:underline underline-offset-4 transition-all">
                 View All Notices
               </Link>
             </div>
          </div>

          {/* Events Section */}
          <div className="bg-surface-raised rounded-[2.5rem_2rem_2.5rem_2rem] p-5 lg:p-6 border border-border card-float relative">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-text-primary tracking-tight">Events</h3>
               <Link href="/events" className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-surface transition-colors">
                 <CalendarCheck className="w-5 h-5 text-text-secondary"/>
               </Link>
             </div>

             {/* Constrained height container for the fade effect */}
             <div className="relative h-[160px] overflow-hidden">
               <div className="space-y-1">
                 
                 {/* Event Item 1 */}
                 <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border cursor-pointer group">
                   <div className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-xl bg-primary/10 border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                     <span className="text-[10px] font-bold text-primary uppercase leading-tight">Oct</span>
                     <span className="text-lg font-black text-primary leading-none">24</span>
                   </div>
                   <div className="min-w-0 flex-1">
                     <h4 className="text-sm font-bold text-text-primary truncate">Diwali Celebration</h4>
                     <p className="text-xs font-medium text-text-secondary mt-0.5 truncate">Clubhouse • 6:30 PM</p>
                   </div>
                 </div>

                 {/* Event Item 2 */}
                 <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border cursor-pointer group">
                   <div className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-xl bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                     <span className="text-[10px] font-bold text-text-secondary uppercase leading-tight">Nov</span>
                     <span className="text-lg font-black text-text-primary leading-none">05</span>
                   </div>
                   <div className="min-w-0 flex-1">
                     <h4 className="text-sm font-bold text-text-primary truncate">Blood Donation Camp</h4>
                     <p className="text-xs font-medium text-text-secondary mt-0.5 truncate">Community Hall • 10:00 AM</p>
                   </div>
                 </div>

                 {/* Event Item 3 */}
                 <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border cursor-pointer group">
                   <div className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-xl bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                     <span className="text-[10px] font-bold text-text-secondary uppercase leading-tight">Dec</span>
                     <span className="text-lg font-black text-text-primary leading-none">31</span>
                   </div>
                   <div className="min-w-0 flex-1">
                     <h4 className="text-sm font-bold text-text-primary truncate">New Year's Eve Bash</h4>
                     <p className="text-xs font-medium text-text-secondary mt-0.5 truncate">Main Lawn • 8:00 PM</p>
                   </div>
                 </div>

                 {/* Event Item 4 */}
                 <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border cursor-pointer group">
                   <div className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-xl bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                     <span className="text-[10px] font-bold text-text-secondary uppercase leading-tight">Jan</span>
                     <span className="text-lg font-black text-text-primary leading-none">15</span>
                   </div>
                   <div className="min-w-0 flex-1">
                     <h4 className="text-sm font-bold text-text-primary truncate">Kite Flying Festival</h4>
                     <p className="text-xs font-medium text-text-secondary mt-0.5 truncate">Terrace • 9:00 AM</p>
                   </div>
                 </div>

               </div>
             </div>

             {/* Shadow Fade Effect & Button Overlay */}
             <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-surface-raised via-surface-raised to-transparent flex items-end justify-center pb-5 lg:pb-6 rounded-b-[2rem] pointer-events-none">
               <Link href="/events" className="pointer-events-auto text-sm font-bold text-primary hover:text-primary-dark hover:underline underline-offset-4 transition-all">
                 View All Events
               </Link>
             </div>
          </div>

          {/* Parking & Vehicles Module */}
          <Link href="/parking" className="block relative group h-[220px] rounded-[2rem_2.5rem_2rem_2.5rem] overflow-hidden bg-surface-raised border border-border card-float hover:border-emerald-200 transition-all duration-500">
            {/* Faded car image — bottom right, like welcome card building */}
            <div className="absolute bottom-0 right-0 w-56 h-44 pointer-events-none z-0">
              <img
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80"
                alt="Car"
                className="w-full h-full object-cover object-center"
              />
              {/* Fade overlay from left and bottom using variable surface color */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--color-surface-raised) 0%, var(--color-surface-raised) 30%, transparent 100%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-surface-raised) 0%, transparent 60%)' }} />
            </div>

            {/* Content Layout */}
            <div className="absolute inset-0 z-10 p-6 lg:p-7 flex flex-col justify-between">
              
              {/* Header Row */}
              <div className="flex justify-between items-start">
                {/* Title + Badge stacked */}
                <div className="flex flex-col items-start gap-2">
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">My Parking</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Occupied</span>
                  </div>
                </div>

                {/* Single Car icon — top right */}
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-border shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors duration-500">
                  <Car className="w-5 h-5 text-text-secondary group-hover:text-emerald-600 transition-colors duration-500" />
                </div>
              </div>

              {/* Slot Number — bottom left */}
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Assigned Slot</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight font-mono">B-142</h3>
                  <span className="text-sm font-bold text-text-secondary pb-1 lg:pb-1.5">Basement 1</span>
                </div>
              </div>

            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
