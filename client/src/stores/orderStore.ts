import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface OrderAddOn {
  id: string;
  name: string;
  price: number;
  note?: string;
}

export interface OrderItem {
  id: string;
  categorySlug: string;
  productSlug: string;
  productName: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  addOns: OrderAddOn[];
}

interface OrderState {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, "id">) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const itemTotal = (item: OrderItem) =>
  (item.unitPrice + item.addOns.reduce((sum, addOn) => sum + addOn.price, 0)) * item.quantity;

export const orderTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + itemTotal(item), 0);

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, { ...item, id: crypto.randomUUID() }] })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    // localStorage can throw in private windows; zustand then just keeps the order in memory.
    { name: "bakverkstan-order", storage: createJSONStorage(() => localStorage) }
  )
);
