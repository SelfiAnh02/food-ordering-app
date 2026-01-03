import { useCallback, useMemo, useState } from "react";
import CartCustomerContext from "./CartCustomerContext";

export default function CartCustomerProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const exist = prev.find((i) => i._id === product._id);
      if (exist) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1, notes: product.notes || "" }];
    });
  }, []);

  const increaseQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  }, []);

  const decreaseQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, qty: i.qty > 1 ? i.qty - 1 : 1 } : i
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const updateItem = useCallback((id, updates = {}) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const updateItemNotes = useCallback((id, notes = "") => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, notes: String(notes) } : i))
    );
  }, []);

  const total = useMemo(() => {
    return items.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (i.qty || 0),
      0
    );
  }, [items]);

  const value = {
    items,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    updateItem,
    updateItemNotes,
    total,
  };

  return (
    <CartCustomerContext.Provider value={value}>
      {children}
    </CartCustomerContext.Provider>
  );
}
