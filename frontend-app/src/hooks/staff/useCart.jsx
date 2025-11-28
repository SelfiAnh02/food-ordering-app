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
      return [...prev, { ...product, qty: 1 }];
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

  /** Total harga */
  const total = useMemo(() => {
    return items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }, [items]);

  return {
    items,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    total,
  };
}
