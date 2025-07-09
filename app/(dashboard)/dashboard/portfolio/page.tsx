"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Pencil2Icon,
  UploadIcon,
  PlusIcon,
  TrashIcon,
  StarFilledIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useUpload } from "@/lib/hooks/useUpload";
import { useUser } from "@/hooks/useUser";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  images: Array<{
    id: string;
    url: string;
    is_cover: boolean;
  }>;
}

interface Testimonial {
  id: string;
  client_name: string;
  company: string;
  profession: string;
  testimonial: string;
  rating: number;
  photo_url: string;
}

export default function PortfolioPage() {
  const { user } = useUser();

  const [tab, setTab] = useState("marca");
  const [logoBgWhite, setLogoBgWhite] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [newTestimonial, setNewTestimonial] = useState({
    client_name: "",
    company: "",
    profession: "",
    testimonial: "",
  });

  // Estados para modais
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [scripts, setScripts] = useState({
    header_script: "",
    footer_script: "",
  });

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [about, setAbout] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const profileUpload = useUpload({
    folder: "profile",
    onSuccess: (url) => {
      setLogoUrl(url);
    },
  });

  const logoUpload = useUpload({
    folder: "logos",
    onSuccess: (url) => {
      setLogoUrl(url);
      toast.success("Logo atualizada com sucesso!");
    },
  });

  const projectImagesUpload = useUpload({
    folder: "projects",
    onSuccess: (url) => {
      // Adicionar nova imagem ao preview
      const newPreviewImages = [...previewImages, url];
      setPreviewImages(newPreviewImages);
      toast.success("Imagem adicionada com sucesso!");
    },
  });

  // Buscar projetos
  useEffect(() => {
    fetchProjects();
  }, []);

  // Buscar depoimentos
  useEffect(() => {
    if (tab === "depoimentos") {
      fetchTestimonials();
    }
  }, [tab]);

  // Buscar scripts
  useEffect(() => {
    if (tab === "apresentacao") {
      fetchScripts();
    }
  }, [tab]);

  useEffect(() => {
    fetchBrandInfo();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/portfolio/projects");
      if (!response.ok) throw new Error("Erro ao buscar projetos");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/portfolio/testimonials");
      if (!response.ok) throw new Error("Erro ao buscar depoimentos");
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Erro ao buscar depoimentos:", error);
      toast.error("Erro ao carregar depoimentos");
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch("/api/portfolio/scripts");
      if (!response.ok) throw new Error("Erro ao buscar scripts");
      const data = await response.json();
      setScripts(data);
    } catch (error) {
      console.error("Erro ao buscar scripts:", error);
      toast.error("Erro ao carregar scripts");
    }
  };

  const fetchBrandInfo = async () => {
    try {
      const response = await fetch("/api/portfolio/brand");
      const data = await response.json();
      if (data) {
        setAbout(data.about || "");
        setLogoUrl(data.logo_url || "");
      }
    } catch (error) {
      console.error("Erro ao buscar informações da marca:", error);
    }
  };

  // Função para criar novo projeto
  const handleCreateProject = () => {
    setSelectedProject({
      title: "",
      description: "",
      category: "",
      images: [],
    });
    setSelectedFiles([]);
    setPreviewImages([]);
    setIsEditModalOpen(true);
  };

  // Função para editar projeto
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    // Inicializar o preview com as imagens existentes
    setPreviewImages(project.images.map((img) => img.url));
    setSelectedFiles([]);
    setIsEditModalOpen(true);
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("about", about);
      formData.append("logo_url", ""); // Será atualizado quando houver upload

      const response = await fetch("/api/portfolio/brand", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      setIsEditingAbout(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar função de seleção de imagem do perfil
  const handleProfilePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const { url } = await profileUpload.upload(file);

      const formData = new FormData();
      formData.append("about", about);
      formData.append("logo_url", url);

      const response = await fetch("/api/portfolio/brand", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar foto");
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar função de seleção de logo
  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await logoUpload.upload(file);
      } catch (error) {
        console.error("Erro ao fazer upload da logo:", error);
      }
    }
  };

  // Atualizar função de seleção de imagens do projeto
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Upload de cada arquivo
      for (const file of newFiles) {
        try {
          await projectImagesUpload.upload(file);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
        }
      }
    }
  };

  // Função para remover imagem do preview
  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => {
      // Limpar URL do objeto
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Função para salvar projeto
  const handleSaveProject = async () => {
    try {
      setIsSaving(true);

      if (!selectedProject.title.trim()) {
        toast.error("O título é obrigatório");
        return;
      }

      const formData = new FormData();
      formData.append("title", selectedProject.title);
      formData.append("description", selectedProject.description);
      formData.append("category", selectedProject.category || "");
      formData.append(
        "images",
        JSON.stringify(
          previewImages.map((url) => ({
            url,
            is_cover: false,
          }))
        )
      );

      const response = await fetch("/api/portfolio/projects", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao salvar projeto");

      toast.success("Projeto criado com sucesso!");
      setIsEditModalOpen(false);
      fetchProjects();

      // Limpar estados
      setPreviewImages([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      toast.error("Erro ao salvar projeto");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para lidar com seleção de foto
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Função para salvar depoimento
  const handleSaveTestimonial = async () => {
    try {
      setIsSaving(true);

      if (!newTestimonial.client_name.trim()) {
        toast.error("O nome do cliente é obrigatório");
        return;
      }

      const formData = new FormData();
      formData.append("client_name", newTestimonial.client_name);
      formData.append("company", newTestimonial.company);
      formData.append("profession", newTestimonial.profession);
      formData.append("testimonial", newTestimonial.testimonial);
      formData.append("rating", rating.toString());

      // Gerar avatar usando DiceBear apenas se não houver foto selecionada
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newTestimonial.client_name}`;
      formData.append("photo_url", avatarUrl);

      const response = await fetch("/api/portfolio/testimonials", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao salvar depoimento");

      toast.success("Depoimento adicionado com sucesso!");
      setIsTestimonialModalOpen(false);
      fetchTestimonials();

      // Limpar estados
      setNewTestimonial({
        client_name: "",
        company: "",
        profession: "",
        testimonial: "",
      });
      setRating(5);
      setPhotoPreview("");
      setSelectedPhoto(null);
    } catch (error) {
      console.error("Erro ao salvar depoimento:", error);
      toast.error("Erro ao salvar depoimento");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar scripts
  const handleSaveScripts = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/portfolio/scripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scripts),
      });

      if (!response.ok) throw new Error("Erro ao salvar scripts");

      toast.success("Scripts salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar scripts:", error);
      toast.error("Erro ao salvar scripts");
    } finally {
      setIsSaving(false);
    }
  };

  // Switch customizado
  function SwitchCustom({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          checked ? "bg-primary" : "bg-muted"
        }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="sr-only">Alternar fundo</span>
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  // Renderizar o conteúdo com base na aba selecionada
  const renderContent = () => {
    switch (tab) {
      case "projetos":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Seus projetos</h2>
              <Button
                onClick={handleCreateProject}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Criar novo projeto
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando projetos...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={
                          project.images.find((img) => img.is_cover)?.url ||
                          project.images[0]?.url
                        }
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleEditProject(project)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      >
                        <Pencil2Icon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground uppercase">
                          {project.category}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditModalOpen(true);
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          <Pencil2Icon className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsImagesModalOpen(true);
                        }}
                      >
                        Ver imagens
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal de criação/edição de projeto */}
            {isEditModalOpen && selectedProject && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-lg mx-4">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">
                      Adicionando um novo projeto
                    </h3>
                    <button
                      onClick={() => {
                        setIsEditModalOpen(false);
                        previewImages.forEach((url) =>
                          URL.revokeObjectURL(url)
                        );
                        setPreviewImages([]);
                        setSelectedFiles([]);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Nome
                        </label>
                        <Input
                          value={selectedProject.title}
                          onChange={(e) =>
                            setSelectedProject({
                              ...selectedProject,
                              title: e.target.value,
                            })
                          }
                          placeholder=""
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={selectedProject.description}
                          onChange={(e) =>
                            setSelectedProject({
                              ...selectedProject,
                              description: e.target.value,
                            })
                          }
                          placeholder=""
                          className="w-full p-2 border rounded-md min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Upload de imagens
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {/* Botão de upload */}
                          <label className="relative border-2 border-dashed border-primary/40 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden">
                            {projectImagesUpload.isUploading ? (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <>
                                <UploadIcon className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs text-muted-foreground text-center">
                                  Arraste ou clique para buscar
                                </span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageSelect}
                                />
                              </>
                            )}
                          </label>

                          {/* Preview das imagens */}
                          {previewImages.map((image, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 p-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        previewImages.forEach((url) =>
                          URL.revokeObjectURL(url)
                        );
                        setPreviewImages([]);
                        setSelectedFiles([]);
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary/90"
                      onClick={handleSaveProject}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        "Adicionar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de imagens */}
            {isImagesModalOpen && selectedProject && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Imagens - {selectedProject.title}
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={() => setIsImagesModalOpen(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProject.images.map((image: any, index: number) => (
                      <div key={index} className="relative aspect-[4/3]">
                        <img
                          src={image.url}
                          alt={`${selectedProject.title} - ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "marca":
        return (
          <>
            {/* Perfil do escritório */}
            <section className="bg-white rounded-xl p-6 mb-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-base">
                  Seu perfil ou perfil do escritório
                </span>
                <Button variant="ghost" size="icon">
                  <Pencil2Icon className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg w-32 h-32 cursor-pointer bg-muted overflow-hidden">
                  {profileUpload.isUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : logoUrl ? (
                    <>
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoSelect}
                      />
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-xs text-muted-foreground text-center">
                        Arraste ou clique para buscar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoSelect}
                      />
                    </>
                  )}
                </label>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-semibold text-lg">{user?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {user?.profession}
                  </span>
                  <span className="font-semibold text-sm mt-2">Sobre</span>
                  {isEditingAbout ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="text-sm text-muted-foreground p-2 border rounded-md"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingAbout(false)}
                          disabled={isSaving}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveAbout}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          ) : null}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground flex-1">
                        {about ||
                          "Adicione uma descrição sobre você ou seu escritório"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-[-4px]"
                        onClick={() => setIsEditingAbout(true)}
                      >
                        <Pencil2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Logo */}
            <section className="bg-white rounded-xl p-6 mb-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-base">Logo</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shadow-sm border border-input"
                >
                  <Pencil2Icon className="w-5 h-5" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground mb-2">
                Adicione sua logo para o fundo branco e preto
              </span>
              <div className="flex items-center gap-4">
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg w-32 h-32 cursor-pointer bg-muted overflow-hidden">
                  {logoUpload.isUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-xs text-muted-foreground text-center">
                        Arraste ou clique para buscar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                    </>
                  )}
                </label>
                <div className="flex gap-4 items-center ml-4">
                  <div className="flex items-center gap-2">
                    <SwitchCustom
                      checked={logoBgWhite}
                      onChange={setLogoBgWhite}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={`w-20 h-16 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                        logoBgWhite ? "bg-white shadow-sm" : "bg-black"
                      }`}
                    >
                      {/* Imagem da logo preview */}
                      <span
                        className={`text-xs ${
                          logoBgWhite ? "text-black" : "text-white"
                        }`}
                      >
                        Fundo
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          logoBgWhite ? "text-black" : "text-white"
                        }`}
                      >
                        {logoBgWhite ? "Claro" : "Escuro"}
                      </span>
                    </div>
                    <div
                      className={`w-20 h-16 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                        !logoBgWhite ? "bg-white shadow-sm" : "bg-black"
                      }`}
                    >
                      {/* Imagem da logo preview */}
                      <span
                        className={`text-xs ${
                          !logoBgWhite ? "text-black" : "text-white"
                        }`}
                      >
                        Logo
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          !logoBgWhite ? "text-black" : "text-white"
                        }`}
                      >
                        {!logoBgWhite ? "Escura" : "Clara"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Rodapé */}
            <section className="bg-white rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-base">Rodapé</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shadow-sm border border-input"
                >
                  <Pencil2Icon className="w-5 h-5" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground mb-2">
                Informações do rodapé
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  disabled
                  placeholder="Nome completo do cliente"
                  className="bg-muted"
                />
                <Input
                  disabled
                  placeholder="Telefone do cliente"
                  className="bg-muted"
                />
                <Input
                  disabled
                  placeholder="999.999.999-99"
                  className="bg-muted"
                />
                <Input disabled placeholder="Link" className="bg-muted" />
              </div>
            </section>
          </>
        );
      case "depoimentos":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Seus depoimentos</h2>
              <Button
                onClick={() => setIsTestimonialModalOpen(true)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Adicionar depoimento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl p-6 shadow-sm relative"
                >
                  <button className="absolute top-4 right-4">
                    <Pencil2Icon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.photo_url}
                      alt={testimonial.client_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {testimonial.client_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.profession}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarFilledIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= testimonial.rating
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.testimonial}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    {testimonial.company}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal de criação de depoimento */}
            {isTestimonialModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-md relative">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">
                      Crie ou edite um cliente
                    </h3>
                    <button
                      onClick={() => {
                        setIsTestimonialModalOpen(false);
                        if (photoPreview) URL.revokeObjectURL(photoPreview);
                        setPhotoPreview("");
                        setSelectedPhoto(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Foto de perfil
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-[120px] h-[120px] rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                alt="Avatar padrão"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <span className="text-xs text-muted-foreground">
                              Upload de imagens estará disponível em breve
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nome completo
                        </label>
                        <Input
                          value={newTestimonial.client_name}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              client_name: e.target.value,
                            })
                          }
                          placeholder="Nome completo do cliente"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Empresa
                        </label>
                        <Input
                          value={newTestimonial.company}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              company: e.target.value,
                            })
                          }
                          placeholder="Nome da empresa"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Profissão
                        </label>
                        <Input
                          value={newTestimonial.profession}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              profession: e.target.value,
                            })
                          }
                          placeholder="Arquiteta"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Depoimento
                        </label>
                        <Textarea
                          value={newTestimonial.testimonial}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              testimonial: e.target.value,
                            })
                          }
                          placeholder="Adicione o que ele falou sobre você!"
                          className="min-h-[100px] resize-none"
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Avaliação
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                              disabled={isSaving}
                              type="button"
                            >
                              {star <= rating ? (
                                <StarFilledIcon className="w-5 h-5 text-yellow-400" />
                              ) : (
                                <StarIcon className="w-5 h-5 text-gray-200" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 p-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsTestimonialModalOpen(false);
                        if (photoPreview) URL.revokeObjectURL(photoPreview);
                        setPhotoPreview("");
                        setSelectedPhoto(null);
                      }}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary/90 min-w-[100px]"
                      onClick={handleSaveTestimonial}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Salvando...</span>
                        </div>
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case "apresentacao":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Seus scripts</h2>
              <p className="text-sm text-muted-foreground">
                Os scripts são aplicados em todas as páginas de orçamento
                geradas.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Script head
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted border-r border-input rounded-l-md flex flex-col">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div
                        key={num}
                        className="text-xs text-muted-foreground h-6 flex items-center justify-center"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={scripts.header_script}
                    onChange={(e) =>
                      setScripts((prev) => ({
                        ...prev,
                        header_script: e.target.value,
                      }))
                    }
                    className="w-full min-h-[240px] pl-10 font-mono text-sm rounded-md border border-input bg-background resize-none leading-6"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Script footer
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted border-r border-input rounded-l-md flex flex-col">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <div
                        key={num}
                        className="text-xs text-muted-foreground h-6 flex items-center justify-center"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={scripts.footer_script}
                    onChange={(e) =>
                      setScripts((prev) => ({
                        ...prev,
                        footer_script: e.target.value,
                      }))
                    }
                    className="w-full min-h-[240px] pl-10 font-mono text-sm rounded-md border border-input bg-background resize-none leading-6"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveScripts}
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Ajustes do portfólio</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="bg-muted p-1 rounded-lg flex gap-2 w-fit">
          <TabsTrigger
            value="marca"
            className="data-[state=active]:bg-primary data-[state=active]:text-white px-4 py-2 rounded-md"
          >
            Marca
          </TabsTrigger>
          <TabsTrigger value="projetos" className="px-4 py-2 rounded-md">
            Projetos
          </TabsTrigger>
          <TabsTrigger value="depoimentos" className="px-4 py-2 rounded-md">
            Depoimentos
          </TabsTrigger>
          <TabsTrigger value="apresentacao" className="px-4 py-2 rounded-md">
            Apresentação
          </TabsTrigger>
          <TabsTrigger value="outros" className="px-4 py-2 rounded-md">
            Outros
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {renderContent()}
    </div>
  );
}
