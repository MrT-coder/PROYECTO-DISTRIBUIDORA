"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Search, CheckCircle, XCircle, Clock, AlertCircle, RotateCw, PackageCheck, PackageSearch } from "lucide-react"
import { toast } from "sonner"

interface DispatchState {
  orderId: string
  hasStockConfirmation: boolean
  hasPaymentConfirmation: boolean
  status: string
  createdAt?: string
}

export function DispatchTab() {
  const [dispatchStates, setDispatchStates] = useState<DispatchState[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchDispatchStates = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8090/dispatch/states")
      if (response.ok) {
        const data = await response.json()
        setDispatchStates(data)
      } else {
        // Si la API falla pero no es un error de red, asumimos que puede estar vacía
        setDispatchStates([])
        toast.info("El servicio de despacho está disponible, pero no hay estados para mostrar.")
      }
    } catch (error) {
      console.error("Error fetching dispatch states:", error)
      setDispatchStates([]) // Limpiar estados si la API no está disponible
      toast.error("No se pudo conectar al servicio de despacho.", {
        description: "Asegúrate de que el microservicio esté en ejecución.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOrderState = async (orderId: string) => {
    const promise = fetch(`http://localhost:8090/dispatch/handle/${orderId}`, {
      method: "POST",
    })

    toast.promise(promise, {
      loading: `Procesando orden ${orderId}...`,
      success: (response) => {
        if (response.ok) {
          fetchDispatchStates() // Recargar los datos
          return "Estado de la orden procesado correctamente."
        }
        throw new Error("La respuesta del servidor no fue exitosa.")
      },
      error: "No se pudo procesar el estado de la orden.",
    })
  }

  useEffect(() => {
    fetchDispatchStates()
  }, [])

  const filteredStates = dispatchStates.filter((state) =>
    state.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ready_to_dispatch":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Listo para Despacho</Badge>
      case "waiting_confirmation":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Esperando Confirmación</Badge>
      case "dispatched":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Despachado</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status || "Desconocido"}</Badge>
    }
  }
  
  const getConfirmationDisplay = (confirmed: boolean) => {
    return confirmed ? (
        <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">Confirmado</span>
        </div>
    ) : (
        <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-amber-700">Pendiente</span>
        </div>
    );
  }

  const canBeDispatched = (state: DispatchState) => {
    return state.hasStockConfirmation && state.hasPaymentConfirmation && state.status !== 'dispatched'
  }
  
  const stats = {
      total: dispatchStates.length,
      ready: dispatchStates.filter(s => canBeDispatched(s)).length,
      waiting: dispatchStates.filter(s => !canBeDispatched(s) && s.status !== 'dispatched').length,
      dispatched: dispatchStates.filter(s => s.status === 'dispatched').length,
  };

  return (
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PackageCheck className="w-6 h-6 text-blue-500" />
                Servicio de Despacho
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
                Coordina y monitorea el estado de las órdenes listas para ser despachadas.
            </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
            {/* --- Sección de Estadísticas --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200/60"><CardHeader><CardTitle className="text-sm font-medium text-slate-500">Total de Órdenes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-slate-800">{stats.total}</div></CardContent></Card>
                <Card className="border-green-200/60 bg-green-50/50"><CardHeader><CardTitle className="text-sm font-medium text-green-600">Listas para Despacho</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-700">{stats.ready}</div></CardContent></Card>
                <Card className="border-amber-200/60 bg-amber-50/50"><CardHeader><CardTitle className="text-sm font-medium text-amber-600">En Espera</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-700">{stats.waiting}</div></CardContent></Card>
                <Card className="border-blue-200/60 bg-blue-50/50"><CardHeader><CardTitle className="text-sm font-medium text-blue-600">Ya Despachadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-700">{stats.dispatched}</div></CardContent></Card>
            </div>

            {/* --- Sección de la Tabla de Control --- */}
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                    placeholder="Buscar por ID de orden..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    />
                </div>
                <Button onClick={fetchDispatchStates} variant="outline" className="w-full sm:w-auto">
                    <RotateCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200/80 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-slate-600 font-semibold">ID Orden</TableHead>
                      <TableHead className="text-slate-600 font-semibold">Conf. Stock</TableHead>
                      <TableHead className="text-slate-600 font-semibold">Conf. Pago</TableHead>
                      <TableHead className="text-slate-600 font-semibold">Estado Despacho</TableHead>
                      <TableHead className="text-slate-600 font-semibold text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">Cargando estados...</TableCell></TableRow>
                    ) : filteredStates.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No se encontraron órdenes para despachar.</TableCell></TableRow>
                    ) : (
                      filteredStates.map((state) => (
                        <TableRow key={state.orderId} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-mono text-xs text-slate-700">{state.orderId}</TableCell>
                          <TableCell>{getConfirmationDisplay(state.hasStockConfirmation)}</TableCell>
                          <TableCell>{getConfirmationDisplay(state.hasPaymentConfirmation)}</TableCell>
                          <TableCell>{getStatusBadge(state.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleOrderState(state.orderId)}
                              disabled={!canBeDispatched(state)}
                              className="font-semibold disabled:bg-slate-200 disabled:text-slate-500 enabled:text-white enabled:bg-gradient-to-r from-blue-500 to-teal-400 hover:enabled:opacity-90 transition-all"
                            >
                              {state.status === 'dispatched' ? 'Despachado' : canBeDispatched(state) ? 'Despachar Ahora' : 'En Espera'}
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
  )
}