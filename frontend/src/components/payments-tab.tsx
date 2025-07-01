"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, AlertTriangle, Search, RefreshCw, DollarSign, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface PaymentTransaction {
  transactionId: string
  ordenId: string
  monto: number
  status: string
}

export function PaymentsTab() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // --- Función fetchTransactions ACTUALIZADA ---
  const fetchTransactions = async () => {
    setLoading(true)
    setApiError(null)
    // --- Endpoint actualizado para coincidir con tu backend ---
    const promise = fetch("http://localhost:8090/api/cobros")

    toast.promise(promise, {
      loading: "Cargando cobros...",
      success: async (response) => {
        if (response.ok) {
          const data = await response.json()
          setTransactions(Array.isArray(data) ? data : [])
          return "Cobros cargados correctamente."
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Error ${response.status}`)
        }
      },
      error: (error) => {
        const errorMessage = error instanceof TypeError ? "No se puede conectar al servidor." : error.message
        setApiError(errorMessage)
        return "Error al cargar los cobros."
      },
      finally: () => setLoading(false),
    })
  }

  // --- ELIMINADO: La función processPayment() ya no es necesaria ---

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(
    (transaction) =>
      (transaction.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.ordenId?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
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
      totalProcessed: transactions.reduce((sum, t) => sum + (t.status === "completed" ? t.monto : 0), 0),
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
              Servicio de Cobros
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Visualiza el historial de cobros y transacciones.
            </CardDescription>
          </div>
          {/* --- ELIMINADO: Botón y modal para procesar pagos ya no existen --- */}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 space-y-6">

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">Cargando cobros...</TableCell></TableRow>
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
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No se encontraron cobros.</TableCell></TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-700">{transaction.transactionId}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{transaction.ordenId}</TableCell>
                      <TableCell className="font-medium text-slate-800">${(transaction.monto ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-slate-800">{getStatusBadge(transaction.status)}</TableCell>
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