"use client";

import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  configData: {
    title: string;
    subtitle: string;
    headerImage?: string;
  };
  tempConfigData: {
    title: string;
    subtitle: string;
    headerImage?: string;
  };
  onSave: () => void;
  onCancel: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

export default function ConfigModal({
  isOpen,
  configData,
  tempConfigData,
  onSave,
  onCancel,
  onImageUpload,
  onTitleChange,
  onSubtitleChange,
}: ConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Configurações
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Editar proposta */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Editar proposta
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={tempConfigData.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Proposta Comercial: Sérgio Pereira"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parágrafo
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={tempConfigData.subtitle}
                  onChange={(e) => onSubtitleChange(e.target.value)}
                  placeholder="Preparado por: Estúdio Meza"
                />
              </div>

              {/* Upload de imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload imagem
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        Clique para fazer upload
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG até 10MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer do modal */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1 text-sm sm:text-base"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
            onClick={onSave}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
