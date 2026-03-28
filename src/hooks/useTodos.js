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
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(data) {
    try {
      const newItem = await createItem(data);
      setItems([...items, newItem]);
      return newItem;
    } catch (error) {
      console.error(error);
    }
  }

  async function updateItemField(id, data) {
    try {
      const updated = await updateItem(id, data);
      setItems(items.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteItemById(id) {
    try {
      await deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  return {
    items,
    loading,
    error,
    addItem,
    updateItemField,
    deleteItemById,
  };
}