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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Eye,
  RotateCw,
  Trash2,
  FilePenLine,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

// --- Interfaces para coincidir con el Backend de Spring Boot ---
interface ProductoItem {
  productoId: string;
  cantidad: number;
}

interface NewOrderData {
  ordenId: string;
  clienteId: string;
  montoTotal: number;
  productos: ProductoItem[];
}

interface Order {
  id: string;
  clienteId: string;
  montoTotal: number;
  status: string;
  productos?: ProductoItem[]; // Asumimos que la orden puede tener productos
  createdAt?: string;
}

// Estado inicial para el formulario, previene la repetición
const initialFormState = {
  clienteId: "",
  montoTotal: 0,
  productos: [],
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para manejar si estamos creando o editando
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Estado unificado para el formulario del modal
  const [orderForm, setOrderForm] =
    useState<Omit<NewOrderData, "ordenId">>(initialFormState);
  const [currentItem, setCurrentItem] = useState<ProductoItem>({
    productoId: "",
    cantidad: 1,
  });

  // --- NUEVA: Función para listar órdenes desde la API ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8090/api/orders/list");
      if (!response.ok)
        throw new Error("Error al obtener las órdenes del servidor.");
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error("No se pudieron cargar las órdenes", {
        description:
          error instanceof Error ? error.message : "Error desconocido.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes al iniciar el componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Funciones para manejar el formulario del modal ---
  const handleOpenModal = (order: Order | null) => {
    setEditingOrder(order); // Si es null, es modo creación. Si tiene un objeto, es modo edición.
    if (order) {
      // Modo Edición: Llenar el formulario con los datos de la orden
      setOrderForm({
        clienteId: order.clienteId,
        montoTotal: order.montoTotal,
        productos: order.productos || [], // Asegurarse de que productos no sea undefined
      });
    } else {
      // Modo Creación: Resetear el formulario
      setOrderForm(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!currentItem.productoId || currentItem.cantidad <= 0)
      return toast.error("Datos del producto inválidos.");
    if (
      orderForm.productos.some((p) => p.productoId === currentItem.productoId)
    )
      return toast.warning("El producto ya está en la lista.");

    setOrderForm((prev) => ({
      ...prev,
      productos: [...prev.productos, currentItem],
    }));
    setCurrentItem({ productoId: "", cantidad: 1 });
  };

  const handleRemoveItem = (productoId: string) => {
    setOrderForm((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.productoId !== productoId),
    }));
  };

  // --- Función para GUARDAR (Crear o Editar) ---
  const handleSaveOrder = () => {
    if (editingOrder) {
      // Lógica de Actualización
      const orderPayload: NewOrderData = {
        ...orderForm,
        ordenId: editingOrder.id, // Usamos el ID de la orden que se está editando
      };
      const promise = fetch(
        `http://localhost:8090/api/orders/${editingOrder.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        }
      );

      toast.promise(promise, {
        loading: `Actualizando orden ${editingOrder.id}...`,
        success: async (res) => {
          if (!res.ok) throw new Error(await res.text());
          const updatedOrder = await res.json();
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          );
          setIsModalOpen(false);
          return "Orden actualizada correctamente.";
        },
        error: (err) => `Error al actualizar: ${err.message}`,
      });
    } else {
      // Lógica de Creación
      const orderPayload: NewOrderData = {
        ...orderForm,
        ordenId: crypto.randomUUID(),
      };
      const promise = fetch("http://localhost:8090/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      toast.promise(promise, {
        loading: "Creando orden...",
        success: async (res) => {
          if (!res.ok) throw new Error(await res.text());
          const createdOrder = await res.json();
          setOrders((prev) => [createdOrder, ...prev]);
          setIsModalOpen(false);
          return "Orden creada correctamente.";
        },
        error: (err) => `Error al crear: ${err.message}`,
      });
    }
  };

  // --- NUEVA: Función para Eliminar una orden ---
  const handleDeleteOrder = (orderId: string) => {
    toast.error("¿Estás seguro de que quieres eliminar esta orden?", {
      action: {
        label: "Eliminar",
        onClick: () => {
          const promise = fetch(`http://localhost:8090/api/orders/${orderId}`, {
            method: "DELETE",
          });
          toast.promise(promise, {
            loading: `Eliminando orden ${orderId}...`,
            success: (res) => {
              if (!res.ok) throw new Error("Error del servidor al eliminar.");
              setOrders((prev) => prev.filter((o) => o.id !== orderId));
              return "Orden eliminada.";
            },
            error: (err) => `Error al eliminar: ${err.message}`,
          });
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {}, // Acción vacía para cumplir con la interfaz Action
      },
    });
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clienteId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Creado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Desconocido"}</Badge>;
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">
              Gestión de Órdenes
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Visualiza, busca y gestiona las órdenes del sistema.
            </CardDescription>
          </div>
          <Button
            onClick={() => handleOpenModal(null)}
            className="font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </CardHeader>

      {/* Modal Unificado para Crear y Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingOrder ? "Editar Orden" : "Crear Nueva Orden"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder
                ? `Editando la orden ${editingOrder.id}`
                : "Completa los datos y agrega los productos."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="clienteId"
                  className="font-medium text-slate-600"
                >
                  ID del Cliente
                </Label>
                <Input
                  id="clienteId"
                  value={orderForm.clienteId}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, clienteId: e.target.value })
                  }
                  placeholder="ej. cliente-123"
                />
              </div>
              <div>
                <Label
                  htmlFor="montoTotal"
                  className="font-medium text-slate-600"
                >
                  Monto Total
                </Label>
                <Input
                  id="montoTotal"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={orderForm.montoTotal || ""}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      montoTotal: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-4 rounded-md border p-4 bg-slate-50/50">
              <h4 className="font-semibold text-slate-700">
                Agregar Productos
              </h4>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Label htmlFor="productoId">ID Producto</Label>
                  <Input
                    id="productoId"
                    value={currentItem.productoId}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        productoId: e.target.value,
                      })
                    }
                    placeholder="SKU-001"
                  />
                </div>
                <div className="w-24">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={currentItem.cantidad}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        cantidad: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleAddItem}>
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold text-slate-700 mb-2">
              Productos en la Orden
            </h4>
            <div className="rounded-md border max-h-48 overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow>
                    <TableHead>ID Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderForm.productos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-slate-500 py-4"
                      >
                        Añade productos a la orden
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderForm.productos.map((item) => (
                      <TableRow key={item.productoId}>
                        <TableCell className="font-mono text-xs">
                          {item.productoId}
                        </TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500"
                            onClick={() => handleRemoveItem(item.productoId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <Button
            onClick={handleSaveOrder}
            className="w-full mt-4 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity"
          >
            {editingOrder ? "Guardar Cambios" : "Confirmar y Crear Orden"}
          </Button>
        </DialogContent>
      </Dialog>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por ID de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RotateCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
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
                  Cliente ID
                </TableHead>
                <TableHead className="text-slate-600 font-semibold">
                  Monto
                </TableHead>
                <TableHead className="text-slate-600 font-semibold">
                  Estado
                </TableHead>
                <TableHead className="text-slate-600 font-semibold text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-slate-500"
                  >
                    Cargando órdenes...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-slate-500"
                  >
                    No se encontraron órdenes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-slate-700">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {order.clienteId}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      ${order.montoTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-slate-600">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:bg-slate-200"
                        onClick={() => handleOpenModal(order)}
                      >
                        <FilePenLine className="w-4 h-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-100"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
