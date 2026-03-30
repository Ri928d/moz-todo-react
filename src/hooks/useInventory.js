import { useEffect, useState } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../services/api";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await getItems();
      setItems(data);
    } catch (err) {
      const message =
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : "Failed to load inventory. Please try again.";
      setError(message);
      console.error("fetchItems error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(data) {
    const newItem = await createItem(data);
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }

  async function updateItemField(id, data) {
    const updated = await updateItem(id, data);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }

  async function deleteItemById(id) {
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return {
    items,
    loading,
    error,
    addItem,
    updateItemField,
    deleteItemById,
    refetch: fetchItems,
  };
}