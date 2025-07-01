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
import { CreditCard, AlertTriangle, Search, RefreshCw, DollarSign, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface PaymentTransaction {
  transactionId: string
  orderId: string
  amount: number
  status: string
  createdAt?: string
}

interface PaymentData {
  orderId: string
  amount: number
}

export function PaymentsTab() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    orderId: "",
    amount: 0,
  })

  const fetchTransactions = async () => {
    setLoading(true)
    setApiError(null)
    const promise = fetch("http://localhost:8090/payments/transactions")

    toast.promise(promise, {
      loading: "Cargando transacciones...",
      success: async (response) => {
        if (response.ok) {
          const data = await response.json()
          setTransactions(Array.isArray(data) ? data : [])
          return "Transacciones cargadas correctamente."
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Error ${response.status}`)
        }
      },
      error: (error) => {
        const errorMessage = error instanceof TypeError ? "No se puede conectar al servidor." : error.message
        setApiError(errorMessage)
        return "Error al cargar transacciones."
      },
      finally: () => setLoading(false),
    })
  }
  
  const processPayment = async () => {
    if (!paymentData.orderId || paymentData.amount <= 0) {
      toast.error("El ID de la orden y un monto mayor a cero son requeridos.")
      return
    }

    const promise = fetch("http://localhost:8090/payments/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    })

    toast.promise(promise, {
      loading: "Procesando pago...",
      success: async (response) => {
        if (response.ok) {
          setIsProcessDialogOpen(false)
          setPaymentData({ orderId: "", amount: 0 })
          fetchTransactions() // Recargar la lista
          return "Pago procesado exitosamente."
        } else {
          const text = await response.text()
          throw new Error(text)
        }
      },
      error: (error) => `Error al procesar el pago: ${error.message}`,
    })
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completado</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Fallido</Badge>
      case "refunded":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Reembolsado</Badge>
      default:
        return <Badge variant="secondary">{status || "Desconocido"}</Badge>
    }
  }

  const stats = {
      totalProcessed: transactions.reduce((sum, t) => sum + (t.status === "completed" ? t.amount : 0), 0),
      successful: transactions.filter((t) => t.status === "completed").length,
      pending: transactions.filter((t) => t.status === "pending").length,
  }

  return (
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              Servicio de Pagos
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Visualiza y procesa transacciones de pago.
            </CardDescription>
          </div>
          <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                <CreditCard className="w-4 h-4 mr-2" />
                Procesar Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-slate-800">Procesar Nuevo Pago</DialogTitle>
                <DialogDescription>
                  Ingresa los detalles de la transacción para iniciar el proceso de pago.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="orderId" className="text-right text-slate-600">ID Orden</Label><Input id="orderId" value={paymentData.orderId} onChange={(e) => setPaymentData({ ...paymentData, orderId: e.target.value })} placeholder="orden-123" className="col-span-3" /></div>
                  <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="amount" className="text-right text-slate-600">Monto</Label><Input id="amount" type="number" step="0.01" min="0.01" value={paymentData.amount || ""} onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="col-span-3" /></div>
                  <Button onClick={processPayment} className="w-full mt-2 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                      Confirmar y Procesar Pago
                  </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* --- Sección de Estadísticas --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-green-200/60 bg-green-50/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-green-600">Total Procesado</CardTitle><DollarSign className="w-5 h-5 text-green-500"/></CardHeader><CardContent><div className="text-3xl font-bold text-green-700">${stats.totalProcessed.toFixed(2)}</div></CardContent></Card>
            <Card className="border-blue-200/60 bg-blue-50/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-blue-600">Transacciones Exitosas</CardTitle><CheckCircle className="w-5 h-5 text-blue-500"/></CardHeader><CardContent><div className="text-3xl font-bold text-blue-700">{stats.successful}</div></CardContent></Card>
            <Card className="border-amber-200/60 bg-amber-50/50"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-amber-600">Transacciones Pendientes</CardTitle><Clock className="w-5 h-5 text-amber-500"/></CardHeader><CardContent><div className="text-3xl font-bold text-amber-700">{stats.pending}</div></CardContent></Card>
        </div>

        {/* --- Sección de la Tabla de Transacciones --- */}
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
              <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      placeholder="Buscar por ID de transacción u orden..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                  />
              </div>
              <Button onClick={fetchTransactions} variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
              </Button>
          </div>
          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-slate-600 font-semibold">ID Transacción</TableHead>
                  <TableHead className="text-slate-600 font-semibold">ID Orden</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Monto</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Estado</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">Cargando transacciones...</TableCell></TableRow>
                ) : apiError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-red-600 bg-red-50/50">
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="w-6 h-6"/>
                          <span className="font-semibold">Error al cargar datos</span>
                          <span className="text-sm text-red-500">{apiError}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : filteredTransactions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No se encontraron transacciones.</TableCell></TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-700">{transaction.transactionId}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{transaction.orderId}</TableCell>
                      <TableCell className="font-medium text-slate-800">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-slate-600">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "-"}</TableCell>
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