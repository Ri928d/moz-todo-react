import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../AuthContext";
import { useItems } from "../hooks/useInventory";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLOURS = {
  electronics: "#1565c0",
  clothing: "#6a1b9a",
  food: "#2e7d32",
  office: "#e65100",
  other: "#546e7a",
};

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CategoryBadge({ category }) {
  const bg = CATEGORY_COLOURS[category] || CATEGORY_COLOURS.other;
  const label = CATEGORIES.find((c) => c.value === category)?.label || category;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "12px",
        background: bg,
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}

function StockBadge({ isLow }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "12px",
        background: isLow ? "#d32f2f" : "#2e7d32",
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {isLow ? "Low Stock" : "In Stock"}
    </span>
  );
}

function DashboardCards({ totalItems, lowStockItems, totalQuantity }) {
  const cards = [
    { label: "Total Items", value: totalItems, bg: "#f5f5f5" },
    { label: "Low Stock", value: lowStockItems, bg: "#fff3e0" },
    { label: "Total Units", value: totalQuantity, bg: "#e3f2fd" },
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card) => (
        <div key={card.label} className="dashboard-card" style={{ background: card.bg }}>
          <span className="dashboard-card-label">{card.label}</span>
          <span className="dashboard-card-value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}

function ItemForm({ formData, onChange, onSubmit, formError, isSubmitting }) {
  return (
    <form onSubmit={onSubmit} className="inventory-form">
      <h2>Add New Item</h2>
      {formError && <p className="form-error">{formError}</p>}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="item-name">Item Name *</label>
          <input
            id="item-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="e.g. Wireless Mouse"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="item-desc">Description</label>
          <textarea
            id="item-desc"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Optional description of the item"
            rows={2}
          />
        </div>
      </div>

      <div className="form-row form-row--three">
        <div className="form-field">
          <label htmlFor="item-qty">Quantity *</label>
          <input
            id="item-qty"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={onChange}
            min="0"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="item-cat">Category</label>
          <select
            id="item-cat"
            name="category"
            value={formData.category}
            onChange={onChange}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="item-threshold">Low Stock Threshold</label>
          <input
            id="item-threshold"
            type="number"
            name="low_stock_threshold"
            value={formData.low_stock_threshold}
            onChange={onChange}
            min="0"
            required
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
}

function SearchAndFilter({ searchTerm, setSearchTerm, stockFilter, setStockFilter, sortOption, setSortOption }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by name, description, or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <select
        value={stockFilter}
        onChange={(e) => setStockFilter(e.target.value)}
        className="filter-select"
      >
        <option value="all">All Items</option>
        <option value="low">Low Stock Only</option>
        <option value="ok">In Stock Only</option>
      </select>
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="filter-select"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="quantity-high">Quantity: High → Low</option>
        <option value="quantity-low">Quantity: Low → High</option>
        <option value="name-asc">Name: A → Z</option>
        <option value="name-desc">Name: Z → A</option>
      </select>
    </div>
  );
}

function InventoryItem({
  item,
  editingItemId,
  editData,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onAdjustQuantity,
  onDelete,
  busyItemId,
}) {
  const isBusy = busyItemId === item.id;
  const isEditing = editingItemId === item.id;

  if (isEditing) {
    return (
      <li className="inventory-item inventory-item--editing">
        <div className="edit-form">
          <div className="form-field">
            <label>Item Name</label>
            <input type="text" name="name" value={editData.name} onChange={onEditChange} />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea name="description" value={editData.description} onChange={onEditChange} rows={2} />
          </div>
          <div className="form-row form-row--three">
            <div className="form-field">
              <label>Quantity</label>
              <input type="number" name="quantity" min="0" value={editData.quantity} onChange={onEditChange} />
            </div>
            <div className="form-field">
              <label>Category</label>
              <select name="category" value={editData.category} onChange={onEditChange}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Low Stock Threshold</label>
              <input type="number" name="low_stock_threshold" min="0" value={editData.low_stock_threshold} onChange={onEditChange} />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => onSaveEdit(item.id)} disabled={isBusy}>
              {isBusy ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn btn-secondary" onClick={onCancelEdit} disabled={isBusy}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`inventory-item ${item.is_low_stock ? "inventory-item--low" : "inventory-item--ok"}`}>
      <div className="item-content">
        <div className="item-details">
          <div className="item-header">
            <h3 className="item-name">{item.name}</h3>
            <div className="item-badges">
              <CategoryBadge category={item.category} />
              <StockBadge isLow={item.is_low_stock} />
            </div>
          </div>

          {item.description && (
            <p className="item-description">{item.description}</p>
          )}

          <div className="item-meta">
            <span><strong>Qty:</strong> {item.quantity}</span>
            <span><strong>Alert at:</strong> {item.low_stock_threshold}</span>
          </div>

          <div className="item-timestamps">
            <span>Created: {formatDate(item.created_at)}</span>
            {item.updated_at && item.updated_at !== item.created_at && (
              <span>Updated: {formatDate(item.updated_at)}</span>
            )}
          </div>
        </div>

        <div className="item-actions">
          <div className="quantity-controls">
            <button
              className="btn btn-sm btn-decrease"
              onClick={() => onAdjustQuantity(item.id, Math.max(0, item.quantity - 1))}
              disabled={isBusy || item.quantity === 0}
              title="Decrease by 1"
            >
              −
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button
              className="btn btn-sm btn-increase"
              onClick={() => onAdjustQuantity(item.id, item.quantity + 1)}
              disabled={isBusy}
              title="Increase by 1"
            >
              +
            </button>
          </div>

          <button className="btn btn-edit" onClick={() => onStartEdit(item)} disabled={isBusy}>
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
                onDelete(item.id);
              }
            }}
            disabled={isBusy}
          >
            {isBusy ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function InventoryApp() {
  const { username } = useAuth();
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
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "low_stock_threshold" ? Number(value) : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "low_stock_threshold" ? Number(value) : value,
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
    } catch {
      setFormError("Failed to add item. Please try again.");
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
  };

  const saveEdit = async (itemId) => {
    if (!editData.name.trim()) {
      setActionMessage("Item name is required.");
      return;
    }
    if (editData.quantity < 0 || editData.low_stock_threshold < 0) {
      setActionMessage("Values cannot be negative.");
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
      setActionMessage("Item updated.");
    } finally {
      setBusyItemId(null);
    }
  };

  const adjustQuantity = async (itemId, newQuantity) => {
    try {
      setBusyItemId(itemId);
      await updateItemField(itemId, { quantity: newQuantity });
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setBusyItemId(itemId);
      await deleteItemById(itemId);
      setActionMessage("Item deleted.");
    } finally {
      setBusyItemId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const desc = item.description || "";
      const cat = item.category || "";
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        desc.toLowerCase().includes(term) ||
        cat.toLowerCase().includes(term);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && item.is_low_stock) ||
        (stockFilter === "ok" && !item.is_low_stock);

      return matchesSearch && matchesStock;
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p className="page-subtitle">
          Logged in as <strong>{username}</strong> — {totalItems} item{totalItems !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {actionMessage && <div className="toast toast--success">{actionMessage}</div>}

      <DashboardCards
        totalItems={totalItems}
        lowStockItems={lowStockItems}
        totalQuantity={totalQuantity}
      />

      <ItemForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      <div className="results-info">
        Showing {filteredItems.length} of {totalItems} items
      </div>

      {loading && <p className="loading-text">Loading inventory...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && filteredItems.length === 0 ? (
        <div className="empty-state">
          {items.length === 0
            ? "No inventory items yet. Add your first item above to begin tracking stock."
            : "No items match your current search or filter."}
        </div>
      ) : (
        <ul className="inventory-list">
          {filteredItems.map((item) => (
            <InventoryItem
              key={item.id}
              item={item}
              editingItemId={editingItemId}
              editData={editData}
              onEditChange={handleEditChange}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEdit={saveEdit}
              onAdjustQuantity={adjustQuantity}
              onDelete={handleDelete}
              busyItemId={busyItemId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}