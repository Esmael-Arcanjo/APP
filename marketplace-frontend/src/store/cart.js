import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cart key includes size + color so different variants of the same product
 *  become independent cart lines. */
const keyFor = (product, size, color) => `${product.id}|${size || ""}|${color || ""}`;

export const useCart = create(persist((set, get) => ({
  items: [],
  add: (product, qty = 1, opts = {}) => set((state) => {
    const size = opts.size || "";
    const color = opts.color || "";
    const key = keyFor(product, size, color);
    const existing = state.items.find((it) => it.key === key);
    const image = (product.images && product.images[0]) || product.image_url;
    if (existing) {
      return { items: state.items.map((it) => it.key === key
        ? { ...it, quantity: Math.min(it.stock ?? 99, it.quantity + qty) } : it) };
    }
    return { items: [...state.items, {
      key,
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      currency: product.currency,
      image_url: image,
      stock: product.stock,
      seller_name: product.seller_name,
      seller_id: product.seller_id,
      category: product.category || "",
      size, color,
      quantity: qty,
    }] };
  }),
  update: (key, qty) => set((state) => ({
    items: state.items.map((it) => it.key === key ? { ...it, quantity: Math.max(1, qty) } : it),
  })),
  remove: (key) => set((state) => ({ items: state.items.filter((it) => it.key !== key) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, it) => s + it.price_cents * it.quantity, 0),
  count: () => get().items.reduce((s, it) => s + it.quantity, 0),
}), { name: "wibaza-mp-cart-v2" }));
