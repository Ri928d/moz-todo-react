import { useState, useEffect, useMemo } from "react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "low_stock_threshold"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Item name is required.");
      return;
    }

    if (formData.quantity < 0) {
      setFormError("Quantity cannot be negative.");
      return;
    }

    if (formData.low_stock_threshold < 0) {
      setFormError("Low stock threshold cannot be negative.");
      return;
    }

    await addItem({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });

    setFormData({
      name: "",
      description: "",
      quantity: 0,
      category: "other",
      low_stock_threshold: 5,
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStockFilter =
        stockFilter === "all"
          ? true
          : stockFilter === "low"
          ? item.is_low_stock
          : !item.is_low_stock;

      return matchesSearch && matchesStockFilter;
    });
  }, [items, searchTerm, stockFilter]);

  if (!isLoggedIn) {
    return <div style={{ padding: "40px" }}>Redirecting to login...</div>;
  }

  return (
    <div style={{ padding: "40px", color: "black", background: "white" }}>
      <h1 style={{ marginBottom: "24px" }}>Inventory Management</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "700px",
          marginBottom: "30px",
        }}
      >
        {formError && (
          <p style={{ color: "red", margin: 0 }}>{formError}</p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ padding: "12px" }}
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          style={{ padding: "12px" }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            style={{ padding: "12px" }}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ padding: "12px" }}
          >
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
            min="0"
            style={{ padding: "12px" }}
          />
        </div>

        <button type="submit" style={{ padding: "12px", width: "180px" }}>
          Add Item
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "12px",
          maxWidth: "700px",
          marginBottom: "24px",
        }}
      >
        <input
          type="text"
          placeholder="Search by name, description, or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "12px" }}
        />

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          style={{ padding: "12px" }}
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="ok">In Stock</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "16px" }}>
        <strong>Total items:</strong> {filteredItems.length}
      </div>

      <ul style={{ listStyle: "none", padding: 0, maxWidth: "900px" }}>
        {filteredItems.map((item) => (
          <li
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderLeft: item.is_low_stock ? "6px solid #d32f2f" : "6px solid #2e7d32",
              padding: "16px",
              marginBottom: "14px",
              borderRadius: "6px",
              background: item.is_low_stock ? "#fff5f5" : "#f9fff9",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0" }}>{item.name}</h3>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Description:</strong> {item.description || "No description"}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Category:</strong> {item.category}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Threshold:</strong> {item.low_stock_threshold}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: item.is_low_stock ? "#d32f2f" : "#2e7d32",
                  }}
                >
                  {item.is_low_stock ? "Low Stock" : "In Stock"}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" }}>
                <button
                  onClick={() => updateItemField(item.id, { quantity: item.quantity + 1 })}
                  style={{ padding: "10px" }}
                >
                  Increase
                </button>
                <button
                  onClick={() =>
                    updateItemField(item.id, {
                      quantity: Math.max(0, item.quantity - 1),
                    })
                  }
                  style={{ padding: "10px" }}
                >
                  Decrease
                </button>
                <button
                  onClick={() => deleteItemById(item.id)}
                  style={{ padding: "10px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}