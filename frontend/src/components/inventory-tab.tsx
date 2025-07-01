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
import { Search, Package, AlertTriangle, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Product {
  sku: string
  stock: number
  nombre?: string
}

interface NewProduct {
  sku: string
  stock: number
  nombre: string
}

export function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<NewProduct>({
    sku: "",
    stock: 0,
    nombre: "",
  })

  const fetchProducts = async () => {
    setLoading(true)
    setApiError(null)
    const promise = fetch("http://localhost:8090/api/inventario/productos")

    toast.promise(promise, {
      loading: "Cargando productos...",
      success: async (response) => {
        if (response.ok) {
          const data = await response.json()
          setProducts(Array.isArray(data) ? data : [])
          return "Inventario cargado correctamente."
        } else {
          const errorText = await response.text()
          throw new Error(errorText || `Error ${response.status}`)
        }
      },
      error: (error) => {
        const errorMessage = error instanceof TypeError ? "No se puede conectar al servidor." : error.message
        setApiError(errorMessage)
        return "Error al cargar el inventario."
      },
      finally: () => {
        setLoading(false)
      },
    })
  }

  const addProduct = async () => {
    if (!newProduct.sku || !newProduct.nombre || newProduct.stock < 0) {
      toast.error("Por favor completa los campos SKU, Nombre y Stock correctamente.")
      return
    }

    const promise = fetch("http://localhost:8090/api/inventario/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })

    toast.promise(promise, {
      loading: "Agregando producto...",
      success: async (response) => {
        if (response.ok) {
          setIsAddDialogOpen(false)
          setNewProduct({ sku: "", stock: 0, nombre: "" })
          fetchProducts() // Recargar la lista
          return "Producto agregado exitosamente."
        } else {
          // Es importante consumir el texto del error para mostrarlo
          const text = await response.text();
          throw new Error(text);
        }
      },
      error: (error) => `Error al agregar: ${error.message}`,
    })
  }
  
  // Carga inicial de productos
  useEffect(() => {
    fetchProducts();
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.nombre && product.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Sin Stock</Badge>
    if (stock < 10) return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Stock Bajo</Badge>
    return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">En Stock</Badge>
  }
  
  return (
    <Card className="border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Package className="w-6 h-6 text-blue-500" />
                      Gestión de Inventario
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-500">
                      Consulta, busca y agrega nuevos productos al stock.
                  </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                      <Button className="font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Producto
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                      <DialogHeader>
                          <DialogTitle className="text-slate-800">Agregar Nuevo Producto</DialogTitle>
                          <DialogDescription>
                              Ingresa los detalles del producto para añadirlo al inventario.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sku" className="text-right text-slate-600">SKU</Label><Input id="sku" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="PROD-001" className="col-span-3" /></div>
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="nombre" className="text-right text-slate-600">Nombre</Label><Input id="nombre" value={newProduct.nombre} onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })} placeholder="Nombre del producto" className="col-span-3" /></div>
                          <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="stock" className="text-right text-slate-600">Stock Inicial</Label><Input id="stock" type="number" min="0" value={newProduct.stock || ""} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })} placeholder="0" className="col-span-3" /></div>
                          <Button onClick={addProduct} className="w-full mt-2 font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:opacity-90 transition-opacity">
                              Confirmar y Agregar
                          </Button>
                      </div>
                  </DialogContent>
              </Dialog>
          </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
              <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                      placeholder="Buscar por SKU o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                  />
              </div>
              <Button onClick={fetchProducts} variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
              </Button>
          </div>

          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
              <Table>
                  <TableHeader className="bg-slate-50">
                      <TableRow>
                          <TableHead className="text-slate-600 font-semibold">SKU</TableHead>
                          <TableHead className="text-slate-600 font-semibold">Nombre</TableHead>
                          <TableHead className="text-slate-600 font-semibold text-center">Stock</TableHead>
                          <TableHead className="text-slate-600 font-semibold">Estado</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {loading ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">Cargando productos...</TableCell></TableRow>
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
                      ) : filteredProducts.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-500">No hay productos en el inventario.</TableCell></TableRow>
                      ) : (
                          filteredProducts.map((product) => (
                              <TableRow key={product.sku} className="hover:bg-slate-50/50 transition-colors">
                                  <TableCell className="font-mono text-xs text-slate-700">{product.sku}</TableCell>
                                  <TableCell className="font-medium text-slate-800">{product.nombre || "-"}</TableCell>
                                  <TableCell className="font-bold text-slate-800 text-center">{product.stock}</TableCell>
                                  <TableCell>{getStockBadge(product.stock)}</TableCell>
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