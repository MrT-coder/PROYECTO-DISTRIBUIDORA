import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { OrdersTab } from "../components/orders-tab";
import { InventoryTab } from "../components/inventory-tab";
import { PaymentsTab } from "../components/payments-tab";
import { ShippingTab } from "../components/shipping-tab";
import { DispatchTab } from "../components/dispatch-tab";
import { Package, ShoppingCart, CreditCard, Truck, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    // Fondo más suave y padding general para mejor espaciado
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con texto degradado y tipografía mejorada */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              Sistema de Microservicios
            </span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Panel de administración para gestión de órdenes, inventario, pagos y envíos.
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          {/* Estilo moderno para la lista de pestañas: píldora con fondo */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto rounded-full bg-slate-200/60 p-1.5 backdrop-blur-sm">
            {/* Estilo refinado para cada pestaña con estados de hover y activo claros */}
            <TabsTrigger
              value="orders"
              className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Órdenes
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Package className="w-4 h-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              Pagos
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Truck className="w-4 h-4" />
              Envíos
            </TabsTrigger>
            <TabsTrigger
              value="dispatch"
              className="flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/60 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Despacho
            </TabsTrigger>
          </TabsList>

          {/* El contenido se mantiene igual, pero heredará el nuevo contexto visual */}
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="shipping">
            <ShippingTab />
          </TabsContent>

          <TabsContent value="dispatch">
            <DispatchTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}