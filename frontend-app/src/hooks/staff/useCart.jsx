import { useState, useCallback, useMemo } from "react";

export default function useCart() {
  const [items, setItems] = useState([]);

  /** Add product to cart */
  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const exist = prev.find((i) => i._id === product._id);
      if (exist) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      // ensure item shape includes qty and notes (notes optional)
      return [...prev, { ...product, qty: 1, notes: product.notes || "" }];
    });
  }, []);

  /** Increase qty */
  const increaseQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  }, []);

  /** Decrease qty */
  const decreaseQty = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, qty: i.qty > 1 ? i.qty - 1 : 1 } : i
      )
    );
  }, []);

  /** Remove item */
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  /** Clear cart */
  const clearCart = useCallback(() => setItems([]), []);

  /**
   * Update an item partially. updates is an object e.g. { notes: "no onion", price: 10000 }
   * Useful as a general-purpose updater.
   */
  const updateItem = useCallback((id, updates = {}) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, ...updates } : i))
    );
  }, []);

  /**
   * Convenience: update only notes for an item
   */
  const updateItemNotes = useCallback((id, notes = "") => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, notes: String(notes) } : i))
    );
  }, []);

  /** Total harga */
  const total = useMemo(() => {
    return items.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (i.qty || 0),
      0
    );
  }, [items]);

  return {
    items,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    updateItem, // general updater
    updateItemNotes, // notes-specific helper
    total,
  };
}
