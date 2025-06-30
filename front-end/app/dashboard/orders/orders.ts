// front-end/types/orders.ts
export interface Order {
  id: string;
  total: number;
  status: 'pending' | 'completed' | 'failed'; // Ejemplo con valores posibles
  items?: OrderItem[]; // Opcional si hay más datos
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}