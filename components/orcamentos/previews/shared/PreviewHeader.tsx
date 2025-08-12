"use client";

import { Button } from "@/components/ui/button";
import { Play, Upload, Settings, Edit3 } from "lucide-react";
import Image from "next/image";

interface PreviewHeaderProps {
  configData: {
    title: string;
    subtitle: string;
  };
  isPublishing: boolean;
  onPublish: () => void;
  onOpenConfig: () => void;
}

export default function PreviewHeader({
  configData,
  isPublishing,
  onPublish,
  onOpenConfig,
}: PreviewHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-2 sm:py-3 gap-3 sm:gap-0">
        {/* Logo e título */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
            <Image
              src="/short_logo.png"
              alt="Limify Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base">
              {configData.title}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Edit3 className="w-3 h-3" />
              <span>Editar proposta</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Prévia</span>
            <span className="sm:hidden">Prévia</span>
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">Publicando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Publicar</span>
                <span className="sm:hidden">Pub</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            onClick={onOpenConfig}
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Configurações</span>
            <span className="sm:hidden">Config</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
