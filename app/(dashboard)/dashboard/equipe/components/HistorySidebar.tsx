"use client";

import { XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const activities: Activity[] = [
  {
    id: "1",
    user: {
      name: "Kathryn Murphy",
      avatar:
        "https://ui-avatars.com/api/?name=Kathryn+Murphy&background=4FD1C5&color=fff",
    },
    action: "Criou novo orçamento",
  },
  {
    id: "2",
    user: {
      name: "James Harrid",
      avatar:
        "https://ui-avatars.com/api/?name=James+Harrid&background=6E2DFA&color=fff",
    },
    action: "Gerou um relatório",
  },
  {
    id: "3",
    user: {
      name: "Elon Melon",
      avatar:
        "https://ui-avatars.com/api/?name=Elon+Melon&background=4FD1C5&color=fff",
    },
    action: "Criou um novo orçamento",
  },
  {
    id: "4",
    user: {
      name: "Mia Smith",
      avatar:
        "https://ui-avatars.com/api/?name=Mia+Smith&background=6E2DFA&color=fff",
    },
    action: "Adicionou e editor despesas",
  },
];

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Atividades</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="relative flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
              <select className="appearance-none bg-transparent pr-8 text-sm font-medium text-gray-900 focus:outline-none">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {activity.user.name}
                  </h3>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
