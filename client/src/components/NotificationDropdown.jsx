import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-dark)] transition"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-dark)]/50">
            <h4 className="text-sm font-bold m-0 text-[var(--text-main)]">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`p-3.5 transition flex flex-col gap-1 ${n.isRead ? 'opacity-70 bg-[var(--bg-card)]' : 'bg-[var(--primary)]/5'}`}
                  onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-main)]">{n.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] m-0 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link 
                      to={n.link}
                      onClick={() => setIsOpen(false)}
                      className="mt-1 text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 w-fit"
                    >
                      View Details <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

