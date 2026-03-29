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
  const [sortOption, setSortOption] = useState("newest");
  const [formError, setFormError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyItemId, setBusyItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editData, setEditData] = useState({
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

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
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

    try {
      setIsSubmitting(true);
      await addItem({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      setActionMessage("Item added successfully.");

      setFormData({
        name: "",
        description: "",
        quantity: 0,
        category: "other",
        low_stock_threshold: 5,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditData({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      category: item.category,
      low_stock_threshold: item.low_stock_threshold,
    });
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditData({
      name: "",
      description: "",
      quantity: 0,
      category: "other",
      low_stock_threshold: 5,
    });
  };

  const saveEdit = async (itemId) => {
    if (!editData.name.trim()) {
      setActionMessage("Item name is required.");
      return;
    }

    if (editData.quantity < 0 || editData.low_stock_threshold < 0) {
      setActionMessage("Quantity and threshold cannot be negative.");
      return;
    }

    try {
      setBusyItemId(itemId);
      await updateItemField(itemId, {
        ...editData,
        name: editData.name.trim(),
        description: editData.description.trim(),
      });
      setEditingItemId(null);
      setActionMessage("Item updated successfully.");
    } finally {
      setBusyItemId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const description = item.description || "";
      const category = item.category || "";

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStockFilter =
        stockFilter === "all"
          ? true
          : stockFilter === "low"
          ? item.is_low_stock
          : !item.is_low_stock;

      return matchesSearch && matchesStockFilter;
    });

    const sorted = [...filtered];

    switch (sortOption) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "quantity-high":
        sorted.sort((a, b) => b.quantity - a.quantity);
        break;
      case "quantity-low":
        sorted.sort((a, b) => a.quantity - b.quantity);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return sorted;
  }, [items, searchTerm, stockFilter, sortOption]);

  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.is_low_stock).length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isLoggedIn) {
    return <div style={{ padding: "40px" }}>Redirecting to login...</div>;
  }

  const hoverOn = (e) => {
    if (!e.target.disabled) e.target.style.opacity = 0.8;
  };

  const hoverOff = (e) => {
    e.target.style.opacity = 1;
  };

  return (
    <div style={{ padding: "40px", color: "black", background: "white" }}>
      <h1 style={{ marginBottom: "24px" }}>Inventory Management</h1>

      {actionMessage && (
        <p
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "18px",
            maxWidth: "700px",
          }}
        >
          {actionMessage}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
          maxWidth: "700px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "#f5f5f5",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <strong>Total Items</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "22px", fontWeight: "bold" }}>
            {totalItems}
          </p>
        </div>

        <div
          style={{
            padding: "16px",
            background: "#fff3e0",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <strong>Low Stock</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "22px", fontWeight: "bold" }}>
            {lowStockItems}
          </p>
        </div>

        <div
          style={{
            padding: "16px",
            background: "#e3f2fd",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <strong>Total Quantity</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: "22px", fontWeight: "bold" }}>
            {totalQuantity}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          maxWidth: "700px",
          marginBottom: "30px",
        }}
      >
        {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
            Item Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ padding: "12px", width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ padding: "12px", width: "100%" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              required
              style={{ padding: "12px", width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ padding: "12px", width: "100%" }}
            >
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
              Low Stock Alert Level
            </label>
            <input
              type="number"
              name="low_stock_threshold"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              min="0"
              required
              style={{ padding: "12px", width: "100%" }}
            />
          </div>
        </div>

        <p style={{ margin: "0", color: "#555", fontSize: "14px" }}>
          The low stock alert level determines when an item is flagged as low stock.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "12px",
            width: "180px",
            background: isSubmitting ? "#90caf9" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
          onMouseOver={hoverOn}
          onMouseOut={hoverOff}
        >
          {isSubmitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "12px",
          maxWidth: "900px",
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

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ padding: "12px" }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="quantity-high">Quantity High-Low</option>
          <option value="quantity-low">Quantity Low-High</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      {loading && <p>Loading inventory...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "16px" }}>
        <strong>Total filtered items:</strong> {filteredItems.length}
      </div>

      {filteredItems.length === 0 ? (
        <div
          style={{
            border: "1px dashed #bbb",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "900px",
            background: "#fafafa",
          }}
        >
          {items.length === 0
            ? "No inventory items yet. Add your first item to begin tracking stock."
            : searchTerm || stockFilter !== "all"
            ? "No items match your current search or filter."
            : "No items available."}
        </div>
      ) : (
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
              {editingItemId === item.id ? (
                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      style={{ padding: "12px", width: "100%" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      style={{ padding: "12px", width: "100%" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        value={editData.quantity}
                        onChange={handleEditChange}
                        style={{ padding: "12px", width: "100%" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                        Category
                      </label>
                      <select
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        style={{ padding: "12px", width: "100%" }}
                      >
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="food">Food</option>
                        <option value="office">Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                        Low Stock Alert Level
                      </label>
                      <input
                        type="number"
                        name="low_stock_threshold"
                        min="0"
                        value={editData.low_stock_threshold}
                        onChange={handleEditChange}
                        style={{ padding: "12px", width: "100%" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => saveEdit(item.id)}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px 14px",
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {busyItemId === item.id ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      onClick={cancelEditing}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px 14px",
                        background: "#757575",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
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

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      minWidth: "140px",
                    }}
                  >
                    <button
                      onClick={async () => {
                        try {
                          setBusyItemId(item.id);
                          await updateItemField(item.id, { quantity: item.quantity + 1 });
                          setActionMessage("Quantity updated successfully.");
                        } finally {
                          setBusyItemId(null);
                        }
                      }}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px",
                        background: "#2e7d32",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {busyItemId === item.id ? "Updating..." : "Increase"}
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          setBusyItemId(item.id);
                          await updateItemField(item.id, {
                            quantity: Math.max(0, item.quantity - 1),
                          });
                          setActionMessage("Quantity updated successfully.");
                        } finally {
                          setBusyItemId(null);
                        }
                      }}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px",
                        background: "#f9a825",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {busyItemId === item.id ? "Updating..." : "Decrease"}
                    </button>

                    <button
                      onClick={() => startEditing(item)}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px",
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm("Delete this item?")) {
                          try {
                            setBusyItemId(item.id);
                            await deleteItemById(item.id);
                            setActionMessage("Item deleted successfully.");
                          } finally {
                            setBusyItemId(null);
                          }
                        }
                      }}
                      disabled={busyItemId === item.id}
                      onMouseOver={hoverOn}
                      onMouseOut={hoverOff}
                      style={{
                        padding: "10px",
                        background: "#d32f2f",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: busyItemId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {busyItemId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}