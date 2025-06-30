const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
import { Order } from "@/app/dashboard/orders/orders";

export const api = {
  orders: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`);
      return res.json();
    },
    orders: {
    getAll: async (): Promise<Order[]> => { // Tipo de retorno explícito
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      return res.json();
    }
    },
  },
};

