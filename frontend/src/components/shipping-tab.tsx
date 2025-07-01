"use client";

import { useState } from "react";
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
  orderId: string;
  status: string;
  trackingNumber?: string;
  createdAt?: string;
}

export function ShippingTab() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [consultOrderId, setConsultOrderId] = useState("");
  const [updateOrderId, setUpdateOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const consultarEnvio = async (orderIdToConsult: string) => {
    if (!orderIdToConsult.trim()) {
      toast.error("Por favor, ingresa un ID de orden válido.");
      return;
    }
    setLoading(true);
    const promise = fetch(
      `http://localhost:8090/api/envio/${orderIdToConsult}`
    );

    toast.promise(promise, {
      loading: `Consultando envío para la orden ${orderIdToConsult}...`,
      success: async (response) => {
        if (response.ok) {
          const data = await response.json();
          setShipments((prev) => {
            const existingIndex = prev.findIndex(
              (s) => s.orderId === data.orderId
            );
            if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = data;
              return updated;
            }
            return [data, ...prev];
          });
          setConsultOrderId(""); // Limpiar input tras éxito
          return `Envío encontrado: ${data.status}`;
        }
        if (response.status === 404) {
          throw new Error("No se encontró un envío para esta orden.");
        }
        const errorText = await response.text();
        throw new Error(errorText || "Error del servidor.");
      },
      error: (err) => err.message,
      finally: () => setLoading(false),
    });
  };

  const actualizarEstado = async () => {
    if (!updateOrderId || !newStatus) {
      toast.error(
        "Debes proporcionar un ID de orden y seleccionar un nuevo estado."
      );
      return;
    }

    const promise = fetch(
      `http://localhost:8090/api/envio/${updateOrderId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    toast.promise(promise, {
      loading: `Actualizando estado para la orden ${updateOrderId}...`,
      success: async (response) => {
        if (response.ok) {
          setShipments((prev) =>
            prev.map((s) =>
              s.orderId === updateOrderId ? { ...s, status: newStatus } : s
            )
          );
          setUpdateOrderId("");
          setNewStatus("");
          return "Estado del envío actualizado.";
        }
        const errorText = await response.text();
        throw new Error(errorText || "Error del servidor al actualizar.");
      },
      error: (err) => err.message,
    });
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (s.includes("transit") || s.includes("transito"))
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200"
        >
          En Tránsito
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
    if (s.includes("created") || s.includes("creado"))
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200"
        >
          Creado
        </Badge>
      );
    return <Badge variant="secondary">{status || "Desconocido"}</Badge>;
  };

  const statusOptions = [
    { value: "CREATED", label: "Creado" },
    { value: "IN_TRANSIT", label: "En Tránsito" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "CANCELLED", label: "Cancelado" },
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
        {/* --- Sección de Estadísticas --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-blue-200/60 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                Total de Envíos
              </CardTitle>
              <Package2 className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200/60 bg-amber-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">
                En Tránsito
              </CardTitle>
              <Truck className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">
                {stats.inTransit}
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200/60 bg-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Entregados
              </CardTitle>
              <MapPin className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {stats.delivered}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Panel de Acciones --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Consultar Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label
                htmlFor="consultOrderId"
                className="font-medium text-slate-600"
              >
                ID de la Orden
              </Label>
              <Input
                id="consultOrderId"
                placeholder="orden-123"
                value={consultOrderId}
                onChange={(e) => setConsultOrderId(e.target.value)}
              />
              <Button
                onClick={() => consultarEnvio(consultOrderId)}
                className="w-full font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Consultando..." : "Consultar"}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">
                Actualizar Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Label htmlFor="newStatus" className="font-medium text-slate-600">
                Nuevo Estado
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={actualizarEstado}
                className="w-full font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity"
              >
                Actualizar Estado
              </Button>
            </CardContent>
          </Card>
        </div>

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
                  <TableHead className="text-right text-slate-600 font-semibold">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-slate-500"
                    >
                      No hay envíos para mostrar. Realiza una consulta para
                      comenzar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment, index) => (
                    <TableRow
                      key={shipment.orderId || index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-700">
                        {shipment.orderId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {shipment.trackingNumber || "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => consultarEnvio(shipment.orderId)}
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Actualizar
                        </Button>
                      </TableCell>
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
