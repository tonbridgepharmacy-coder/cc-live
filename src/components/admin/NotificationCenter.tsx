"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Calendar, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getRecentNotifications } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        const data = await getRecentNotifications();
        if (data.length > notifications.length) {
            setHasUnread(true);
        }
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setHasUnread(false);
                }}
                className={`relative p-2 rounded-full transition-all duration-300 group ${
                    isOpen ? "bg-primary text-white" : "text-slate-500 hover:text-primary hover:bg-primary/5"
                }`}
            >
                <div className={hasUnread && !isOpen ? "animate-bounce text-red-500" : ""}>
                    <Bell size={20} />
                </div>
                {notifications.length > 0 && (
                    <>
                        {hasUnread && !isOpen && (
                            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                        )}
                        <span className={`absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 ${isOpen ? 'border-primary' : 'border-white'}`}></span>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Notifications</h3>
                            {hasUnread && <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">{notifications.length} New</span>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto scrollbar-hide bg-white">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-3">
                                    <Bell size={24} />
                                </div>
                                <p className="text-xs font-bold text-slate-500">No new notifications</p>
                                <p className="text-[10px] text-slate-400 mt-1">Everything is up to date.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <Link 
                                        key={notif.id} 
                                        href={notif.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-start gap-4 p-4 hover:bg-slate-50/80 transition-all group"
                                    >
                                        <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 shadow-sm ${
                                            notif.type === "APPOINTMENT" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-600"
                                        }`}>
                                            {notif.type === "APPOINTMENT" ? <Calendar size={18} /> : <MessageSquare size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 line-clamp-1">{notif.title}</p>
                                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{notif.description}</p>
                                            <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1 font-bold">
                                                <Sparkles size={8} className="text-primary" />
                                                {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 self-center group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                            <button className="w-full py-2 text-[10px] font-black text-slate-500 hover:text-primary transition-colors text-center uppercase tracking-widest">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
