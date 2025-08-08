"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, RefreshCw, Download, Upload, ExternalLink } from "lucide-react";
import { estadosBrasil } from "@/lib/constants/estados";
import { sindusconLinks } from "@/lib/constants/sinduscon-links";
import { SindusconValue } from "@/lib/db/schema";

interface SindusconData {
  estado: string;
  r1: number | null;
  pp4: number | null;
  r8: number | null;
  r16: number | null;
}

export default function AdminPage() {
  const [sindusconData, setSindusconData] = useState<SindusconData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Inicializar dados com todos os estados
  useEffect(() => {
    const initialData = estadosBrasil.map((estado) => ({
      estado: estado.sigla,
      r1: null,
      pp4: null,
      r8: null,
      r16: null,
    }));
    setSindusconData(initialData);
  }, []);

  const handleValueChange = (
    estado: string,
    field: keyof Omit<SindusconData, "estado">,
    value: string
  ) => {
    setSindusconData((prev) =>
      prev.map((item) =>
        item.estado === estado
          ? { ...item, [field]: value === "" ? null : parseFloat(value) }
          : item
      )
    );
  };

  const handleEstadoClick = (estado: string) => {
    const link = sindusconLinks[estado as keyof typeof sindusconLinks];
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/sinduscon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mes: currentMonth,
          ano: currentYear,
          values: sindusconData,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      toast.success("Valores salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os valores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/sinduscon?mes=${currentMonth}&ano=${currentYear}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const data = await response.json();

      // Mapear os dados carregados para o formato da interface
      const loadedData = estadosBrasil.map((estado) => {
        const savedData = data.find(
          (item: any) => item.estado === estado.sigla
        );
        return {
          estado: estado.sigla,
          r1: savedData?.r1 || null,
          pp4: savedData?.pp4 || null,
          r8: savedData?.r8 || null,
          r16: savedData?.r16 || null,
        };
      });

      setSindusconData(loadedData);
      toast.success("Dados carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar:", error);
      toast.error("Erro ao carregar os dados");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      "Estado,R1,PP4,R8,R-16",
      ...sindusconData.map(
        (row) =>
          `${row.estado},${row.r1 || ""},${row.pp4 || ""},${row.r8 || ""},${
            row.r16 || ""
          }`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sinduscon-${currentMonth}-${currentYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie os valores da Sinduscon por estado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {currentMonth}/{currentYear}
          </Badge>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Controles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="month">Mês:</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="year">Ano:</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleLoadData}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Carregar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Valores */}
      <Card>
        <CardHeader>
          <CardTitle>Valores da Sinduscon por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead className="w-[150px]">R1</TableHead>
                  <TableHead className="w-[150px]">PP4</TableHead>
                  <TableHead className="w-[150px]">R8</TableHead>
                  <TableHead className="w-[150px]">R-16</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sindusconData.map((row) => (
                  <TableRow key={row.estado}>
                    <TableCell className="font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleEstadoClick(row.estado)}
                      >
                        {row.estado}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.r1 || ""}
                        onChange={(e) =>
                          handleValueChange(row.estado, "r1", e.target.value)
                        }
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.pp4 || ""}
                        onChange={(e) =>
                          handleValueChange(row.estado, "pp4", e.target.value)
                        }
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.r8 || ""}
                        onChange={(e) =>
                          handleValueChange(row.estado, "r8", e.target.value)
                        }
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.r16 || ""}
                        onChange={(e) =>
                          handleValueChange(row.estado, "r16", e.target.value)
                        }
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
