import { api } from "@/lib/api";
import { Order } from "@/app/dashboard/orders/orders"; // Importa el tipo

export default async function OrdersPage() {
  const orders = await api.orders.getAll() as Order[]; // Casting explícito

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Órdenes</h1>
      <div className="mt-4 space-y-4">
        {orders.map((order: Order) => ( // Reemplaza `any` por `Order`
          <div key={order.id} className="p-4 border rounded-lg">
            <h3>Orden #{order.id}</h3>
            <p>Total: ${order.total}</p>
            <p>Estado: {order.status}</p> {/* Ahora TypeScript sabe que `status` existe */}
          </div>
        ))}
      </div>
    </div>
  );
}