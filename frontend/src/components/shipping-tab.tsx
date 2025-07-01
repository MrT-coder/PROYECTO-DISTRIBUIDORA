"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Search,
  Package2,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Shipment {
  id?: number;
  ordenId: string;
  status: string;
  trackingNumber?: string;
  createdAt?: string;
}

export function ShippingTab() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateOrderId, setUpdateOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // --- NUEVA: Función para cargar TODOS los envíos ---
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8090/api/shipping/list");
      if (!response.ok) throw new Error("Error del servidor al listar envíos.");
      const data: Shipment[] = await response.json();
      setShipments(data);
    } catch (error) {
      toast.error("No se pudieron cargar los envíos", {
        description:
          error instanceof Error ? error.message : "Error desconocido.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Cargar los envíos al montar el componente ---
  useEffect(() => {
    fetchShipments();
  }, []);

  // --- Función para actualizar un estado específico ---
  const actualizarEstado = async () => {
    if (!updateOrderId || !newStatus) {
      toast.error(
        "Debes proporcionar un ID de orden y seleccionar un nuevo estado."
      );
      return;
    }

    const promise = fetch(
      `http://localhost:8090/api/shipping/${updateOrderId}/status`, // URL Corregida
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    toast.promise(promise, {
      loading: `Actualizando estado para la orden ${updateOrderId}...`,
      success: async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Error del servidor al actualizar.");
        }
        // Actualizar el estado en la lista local para reflejar el cambio al instante
        setShipments((prev) =>
          prev.map((s) =>
            s.ordenId === updateOrderId ? { ...s, status: newStatus } : s
          )
        );
        setUpdateOrderId("");
        setNewStatus("");
        return "Estado del envío actualizado.";
      },
      error: (err) => err.message,
    });
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      (shipment.ordenId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.trackingNumber &&
        shipment.trackingNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s.includes("delivered") || s.includes("entregado"))
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Entregado
        </Badge>
      );
    if (s.includes("sent") || s.includes("enviado"))
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200"
        >
          Enviado
        </Badge>
      );
    if (s.includes("cancelled") || s.includes("cancelado"))
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200"
        >
          Cancelado
        </Badge>
      );
    return <Badge variant="secondary">{status || "Desconocido"}</Badge>;
  };

  const statusOptions = [
    { value: "CREATED", label: "Creado" },
    { value: "ENVIADO", label: "Enviado" },
    { value: "ENTREGADO", label: "Entregado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(
      (s) =>
        s.status?.toLowerCase().includes("transit") ||
        s.status?.toLowerCase().includes("transito")
    ).length,
    delivered: shipments.filter(
      (s) =>
        s.status?.toLowerCase().includes("delivered") ||
        s.status?.toLowerCase().includes("entregado")
    ).length,
  };

  return (
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-500" />
          Servicio de Envíos
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">
          Consulta y actualiza el estado de los envíos de las órdenes.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* --- Panel de Acciones: Simplificado a solo Actualizar Estado --- */}
        <Card className="border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">
              Actualizar Estado de Envío
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Modifica el estado de un envío existente usando su ID de orden.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <Label
                htmlFor="updateOrderId"
                className="font-medium text-slate-600"
              >
                ID de la Orden
              </Label>
              <Input
                id="updateOrderId"
                placeholder="orden-123"
                value={updateOrderId}
                onChange={(e) => setUpdateOrderId(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="newStatus" className="font-medium text-slate-600">
                Nuevo Estado
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado..." />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-black z-50">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={actualizarEstado}
              className="w-full md:col-span-1 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity"
            >
              Actualizar Estado
            </Button>
          </CardContent>
        </Card>

        {/* --- Tabla de Resultados --- */}
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por ID o Tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={fetchShipments}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar Lista
            </Button>
          </div>
          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-slate-600 font-semibold">
                    ID Orden
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Nº de Tracking
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-12 text-slate-500"
                    >
                      Cargando envíos...
                    </TableCell>
                  </TableRow>
                ) : filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-12 text-slate-500"
                    >
                      No se encontraron envíos en el sistema.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment, index) => (
                    <TableRow
                      key={shipment.ordenId || index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-700">
                        {shipment.ordenId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
