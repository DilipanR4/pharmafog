import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Check,
  Eye
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'High') return n.priority === 'High';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Alert Center</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for high-risk polypharmacy collisions, geriatric flags, and pending clinician actions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4 mr-1.5 text-teal-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['All', 'Unread', 'High'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === tab
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'High' ? 'High Priority' : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No alerts in this category</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition-all bg-white shadow-sm flex items-start justify-between gap-4 ${
                !n.read ? 'border-teal-300 bg-teal-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="shrink-0 mt-0.5">
                  {n.priority === 'High' ? (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                  ) : n.priority === 'Moderate' ? (
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-xs font-bold ${!n.read ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                      {n.title}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        n.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : n.priority === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 inline-block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                {n.relatedPatient && (
                  <button
                    onClick={() => navigate(`/patients/${n.relatedPatient._id || n.relatedPatient}`)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="View Patient Record"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
