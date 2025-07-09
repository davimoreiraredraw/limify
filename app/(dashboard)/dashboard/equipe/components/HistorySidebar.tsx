"use client";

import { XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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

          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma atividade ainda
            </h3>
            <p className="text-sm text-gray-500">
              Quando houver atualizações na sua equipe, como novos membros ou
              alterações, elas aparecerão aqui.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
