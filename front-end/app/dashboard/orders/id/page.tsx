import { api } from "@/lib/api";

export default async function OrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await api.orders.getById(params.id);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Orden #{order.id}</h1>
      <p className="mt-2">Total: ${order.total}</p>
    </div>
  );
}