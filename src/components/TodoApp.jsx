import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useItems } from "../hooks/useTodos";

export default function TodoApp() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { items, loading, error, addItem, updateItemField, deleteItemById } = useItems();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    category: "other",
    low_stock_threshold: 5,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "low_stock_threshold" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addItem(formData);
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      category: "other",
      low_stock_threshold: 5,
    });
  };

  if (!isLoggedIn) {
    return <div style={{ padding: "40px" }}>Redirecting to login...</div>;
  }

  return (
    <div style={{ padding: "40px", color: "black", background: "white" }}>
      <h1>Inventory Management</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="food">Food</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          name="low_stock_threshold"
          placeholder="Low stock threshold"
          value={formData.low_stock_threshold}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Item</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} | {item.description} | Qty: {item.quantity} | {item.category} | {item.is_low_stock ? "Low Stock" : "In Stock"}
            <div>
              <button onClick={() => updateItemField(item.id, { quantity: item.quantity + 1 })}>+1</button>
              <button onClick={() => updateItemField(item.id, { quantity: Math.max(0, item.quantity - 1) })}>-1</button>
              <button onClick={() => deleteItemById(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}