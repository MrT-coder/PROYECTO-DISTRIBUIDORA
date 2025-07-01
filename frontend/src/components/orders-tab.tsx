"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Eye, RotateCw } from "lucide-react"
import { toast } from "sonner"

interface Order {
  id: string
  clienteId: string
  montoTotal: number
  status: string
  createdAt?: string
}

interface OrderData {
  clienteId: string
  montoTotal: number
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newOrder, setNewOrder] = useState<OrderData>({
    clienteId: "",
    montoTotal: 0,
  })

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Nota: Simulación ya que no hay endpoint GET
      console.log("No hay endpoint GET para órdenes disponible. Mostrando data local.")
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("No se pudieron cargar las órdenes")
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async () => {
    if (!newOrder.clienteId || newOrder.montoTotal <= 0) {
      toast.error("Por favor completa todos los campos correctamente.")
      return
    }

    const promise = fetch("http://localhost:8090/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    })

    toast.promise(promise, {
      loading: "Creando orden...",
      success: (response) => {
        // Para manejar la respuesta, necesitamos consumirla como JSON aquí
        response.json().then(createdOrder => {
            const orderWithId = {
                ...newOrder,
                id: createdOrder.id || Date.now().toString(),
                status: "CREATED",
                createdAt: new Date().toISOString(),
            };
            setOrders((prev) => [orderWithId, ...prev]);
        });

        setIsCreateDialogOpen(false)
        setNewOrder({ clienteId: "", montoTotal: 0 })
        return "Orden creada correctamente"
      },
      error: (error) => `Error al crear la orden: ${error.message}`,
    })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clienteId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Creado</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    // Tarjeta principal con estilos refinados y efecto hover
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Gestión de Órdenes</CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Visualiza, busca y crea nuevas órdenes en el sistema.
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                {/* Botón principal con degradado y estilo moderno */}
              <Button className="font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-slate-800">Crear Nueva Orden</DialogTitle>
                <DialogDescription>
                  Completa los campos para registrar una orden.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clienteId" className="text-right text-slate-600">
                    Cliente ID
                  </Label>
                  <Input
                    id="clienteId"
                    value={newOrder.clienteId}
                    onChange={(e) => setNewOrder({ ...newOrder, clienteId: e.target.value })}
                    placeholder="ej. cliente-123"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="montoTotal" className="text-right text-slate-600">
                    Monto Total
                  </Label>
                  <Input
                    id="montoTotal"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newOrder.montoTotal || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, montoTotal: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="col-span-3"
                  />
                </div>
                <Button onClick={createOrder} className="w-full mt-2 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                   Confirmar y Crear Orden
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
            {/* Barra de búsqueda con ícono dentro del input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por ID de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={fetchOrders} variant="outline" className="w-full sm:w-auto">
            <RotateCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200/80 overflow-hidden">
          <Table>
            {/* Encabezado de tabla con fondo sutil */}
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-slate-600 font-semibold">ID Orden</TableHead>
                <TableHead className="text-slate-600 font-semibold">Cliente ID</TableHead>
                <TableHead className="text-slate-600 font-semibold">Monto Total</TableHead>
                <TableHead className="text-slate-600 font-semibold">Estado</TableHead>
                <TableHead className="text-slate-600 font-semibold">Fecha</TableHead>
                <TableHead className="text-slate-600 font-semibold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    Cargando órdenes...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron órdenes. ¡Crea una para comenzar!
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-700">{order.id}</TableCell>
                    <TableCell className="text-slate-600">{order.clienteId}</TableCell>
                    <TableCell className="font-medium text-slate-800">${order.montoTotal.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-200">
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Ver detalles</span>
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
  )
}