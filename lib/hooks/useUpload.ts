import { useState } from "react";
import { toast } from "sonner";

interface UseUploadOptions {
  folder: string;
  onSuccess?: (url: string) => void;
  onError?: (error: any) => void;
}

export function useUpload({ folder, onSuccess, onError }: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload");
      }

      onSuccess?.(data.url);
      return data;
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload do arquivo");
      onError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
  };
}
