import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../AuthContext";
import { useItems } from "../hooks/useInventory";
import { getItemHistory } from "../services/api";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
];

// i picked these colours manually, they kind of match the categories
const CATEGORY_COLOURS = {
  electronics: "#1565c0",
  clothing: "#7b1fa2",
  food: "#388e3c",
  office: "#d84315",
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
        padding: "2px 9px",
        borderRadius: "10px",
        background: bg,
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
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
        padding: "2px 9px",
        borderRadius: "10px",
        background: isLow ? "#c62828" : "#2e7d32",
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {isLow ? "⚠ Low Stock" : "In Stock"}
    </span>
  );
}

function DashboardCards({ totalItems, lowStockItems, totalQuantity }) {
  return (
    <div className="dashboard-cards">
      <div className="dashboard-card" style={{ background: "#f5f5f5" }}>
        <span className="dashboard-card-label">Total Items</span>
        <span className="dashboard-card-value">{totalItems}</span>
      </div>
      <div className="dashboard-card" style={{ background: lowStockItems > 0 ? "#fff3e0" : "#f5f5f5" }}>
        <span className="dashboard-card-label">Low Stock</span>
        <span className="dashboard-card-value" style={{ color: lowStockItems > 0 ? "#e65100" : "inherit" }}>
          {lowStockItems}
        </span>
      </div>
      <div className="dashboard-card" style={{ background: "#e8f5e9" }}>
        <span className="dashboard-card-label">Total Units</span>
        <span className="dashboard-card-value">{totalQuantity}</span>
      </div>
    </div>
  );
}

function AdjustmentHistory({ history, loading }) {
  if (loading) return <p style={{ fontSize: "13px", color: "#888" }}>Loading history...</p>;
  if (!history || history.length === 0) {
    return <p style={{ fontSize: "13px", color: "#999", marginTop: "6px" }}>No stock changes recorded yet.</p>;
  }

  const reasonLabels = {
    created: "Created",
    increase: "Increased",
    decrease: "Decreased",
    edit: "Edited",
    manual: "Adjusted",
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <h4 style={{ fontSize: "13px", marginBottom: "6px", fontWeight: 600, color: "#555" }}>
        Stock Change History
      </h4>
      <div style={{
        maxHeight: "180px",
        overflowY: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        background: "#fcfcfc",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>Date</th>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>Action</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>From</th>
              <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 600 }}></th>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>To</th>
            </tr>
          </thead>
          <tbody>
            {history.map((adj, i) => (
              <tr key={adj.id || i} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "5px 8px", color: "#777" }}>{formatDate(adj.created_at)}</td>
                <td style={{ padding: "5px 8px" }}>
                  <span style={{
                    padding: "1px 6px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background:
                      adj.reason === "increase" ? "#e8f5e9" :
                      adj.reason === "decrease" ? "#fff3e0" :
                      adj.reason === "created" ? "#e3f2fd" : "#f5f5f5",
                    color:
                      adj.reason === "increase" ? "#2e7d32" :
                      adj.reason === "decrease" ? "#e65100" :
                      adj.reason === "created" ? "#1565c0" : "#555",
                  }}>
                    {reasonLabels[adj.reason] || adj.reason}
                  </span>
                </td>
                <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 500 }}>{adj.old_quantity}</td>
                <td style={{ padding: "5px 8px", textAlign: "center", color: "#bbb" }}>→</td>
                <td style={{ padding: "5px 8px", fontWeight: 600 }}>{adj.new_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemForm({ formData, onChange, onSubmit, formError, isSubmitting }) {
  return (
    <form onSubmit={onSubmit} className="inventory-form">
      <h2 style={{ fontSize: "1.05rem" }}>Add New Item</h2>
      {formError && <p className="form-error">{formError}</p>}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="item-name">Item Name *</label>
          <input id="item-name" type="text" name="name" value={formData.name} onChange={onChange} required placeholder="e.g. Wireless Mouse" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="item-desc">Description</label>
          <textarea id="item-desc" name="description" value={formData.description} onChange={onChange} placeholder="Brief description of the item" rows={2} />
        </div>
      </div>

      <div className="form-row form-row--three">
        <div className="form-field">
          <label htmlFor="item-qty">Quantity *</label>
          <input id="item-qty" type="number" name="quantity" value={formData.quantity} onChange={onChange} min="0" required />
        </div>
        <div className="form-field">
          <label htmlFor="item-cat">Category</label>
          <select id="item-cat" name="category" value={formData.category} onChange={onChange}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="item-threshold">Low Stock Alert</label>
          <input id="item-threshold" type="number" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={onChange} min="0" required />
        </div>
      </div>

      <p style={{ margin: 0, color: "#777", fontSize: "13px" }}>
        Items at or below the alert threshold will be flagged as low stock.
      </p>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
}

function SearchAndFilter({ searchTerm, setSearchTerm, stockFilter, setStockFilter, sortOption, setSortOption }) {
  return (
    <div className="search-bar">
      <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="filter-select">
        <option value="all">All Items</option>
        <option value="low">Low Stock</option>
        <option value="ok">In Stock</option>
      </select>
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="filter-select">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="quantity-high">Qty High-Low</option>
        <option value="quantity-low">Qty Low-High</option>
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
      </select>
    </div>
  );
}

function InventoryItem({
  item, editingItemId, editData, onEditChange, onStartEdit,
  onCancelEdit, onSaveEdit, onAdjustQuantity, onDelete, busyItemId,
  expandedItemId, onToggleHistory, historyData, historyLoading,
}) {
  const isBusy = busyItemId === item.id;
  const isEditing = editingItemId === item.id;
  const isExpanded = expandedItemId === item.id;

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
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Low Stock Threshold</label>
              <input type="number" name="low_stock_threshold" min="0" value={editData.low_stock_threshold} onChange={onEditChange} />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => onSaveEdit(item.id)} disabled={isBusy}>
              {isBusy ? "Saving..." : "Save"}
            </button>
            <button className="btn btn-secondary" onClick={onCancelEdit} disabled={isBusy}>Cancel</button>
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

          {item.description && <p className="item-description">{item.description}</p>}

          <div className="item-meta">
            <span><strong>Qty:</strong> {item.quantity}</span>
            <span><strong>Alert at:</strong> {item.low_stock_threshold}</span>
          </div>

          <div className="item-timestamps">
            <span>Added {formatDate(item.created_at)}</span>
            {item.updated_at && item.updated_at !== item.created_at && (
              <span> · Edited {formatDate(item.updated_at)}</span>
            )}
          </div>

          {/* stock history toggle */}
          <button
            onClick={() => onToggleHistory(item.id)}
            style={{
              marginTop: "8px",
              padding: "4px 10px",
              fontSize: "12px",
              background: isExpanded ? "#e0e0e0" : "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#555",
            }}
          >
            {isExpanded ? "Hide History" : "Show Stock History"}
          </button>

          {isExpanded && (
            <AdjustmentHistory
              history={historyData}
              loading={historyLoading}
            />
          )}
        </div>

        <div className="item-actions">
          <div className="quantity-controls">
            <button
              className="btn btn-sm btn-decrease"
              onClick={() => onAdjustQuantity(item.id, Math.max(0, item.quantity - 1))}
              disabled={isBusy || item.quantity === 0}
              title="Remove 1"
            >
              −
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button
              className="btn btn-sm btn-increase"
              onClick={() => onAdjustQuantity(item.id, item.quantity + 1)}
              disabled={isBusy}
              title="Add 1"
            >
              +
            </button>
          </div>

          <button className="btn btn-edit" onClick={() => onStartEdit(item)} disabled={isBusy}>Edit</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
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
    name: "", description: "", quantity: 0, category: "other", low_stock_threshold: 5,
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
    name: "", description: "", quantity: 0, category: "other", low_stock_threshold: 5,
  });

  // audit history state
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    if (!formData.name.trim()) { setFormError("Item name is required."); return; }
    if (formData.quantity < 0) { setFormError("Quantity cannot be negative."); return; }
    if (formData.low_stock_threshold < 0) { setFormError("Threshold cannot be negative."); return; }

    try {
      setIsSubmitting(true);
      await addItem({ ...formData, name: formData.name.trim(), description: formData.description.trim() });
      setActionMessage("Item added successfully.");
      setFormData({ name: "", description: "", quantity: 0, category: "other", low_stock_threshold: 5 });
    } catch {
      setFormError("Failed to add item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditData({
      name: item.name, description: item.description || "",
      quantity: item.quantity, category: item.category,
      low_stock_threshold: item.low_stock_threshold,
    });
  };

  const cancelEditing = () => setEditingItemId(null);

  const saveEdit = async (itemId) => {
    if (!editData.name.trim()) { setActionMessage("Name is required."); return; }
    if (editData.quantity < 0 || editData.low_stock_threshold < 0) { setActionMessage("Values cannot be negative."); return; }

    try {
      setBusyItemId(itemId);
      await updateItemField(itemId, { ...editData, name: editData.name.trim(), description: editData.description.trim() });
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
      if (expandedItemId === itemId) setExpandedItemId(null);
    } finally {
      setBusyItemId(null);
    }
  };

  const toggleHistory = async (itemId) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
      setHistoryData([]);
      return;
    }

    setExpandedItemId(itemId);
    setHistoryLoading(true);
    try {
      const data = await getItemHistory(itemId);
      setHistoryData(data);
    } catch (err) {
      console.error("Failed to load history", err);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const desc = item.description || "";
      const cat = item.category || "";
      const term = searchTerm.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(term) || desc.toLowerCase().includes(term) || cat.toLowerCase().includes(term);
      const matchesStock = stockFilter === "all" || (stockFilter === "low" && item.is_low_stock) || (stockFilter === "ok" && !item.is_low_stock);
      return matchesSearch && matchesStock;
    });

    const sorted = [...filtered];
    switch (sortOption) {
      case "oldest": sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case "quantity-high": sorted.sort((a, b) => b.quantity - a.quantity); break;
      case "quantity-low": sorted.sort((a, b) => a.quantity - b.quantity); break;
      case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
    }
    return sorted;
  }, [items, searchTerm, stockFilter, sortOption]);

  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.is_low_stock).length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventory</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "2px" }}>
          Logged in as <strong>{username}</strong> · {totalItems} item{totalItems !== 1 && "s"} in system
        </p>
      </div>

      {actionMessage && <div className="toast toast--success">{actionMessage}</div>}

      <DashboardCards totalItems={totalItems} lowStockItems={lowStockItems} totalQuantity={totalQuantity} />

      <ItemForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} formError={formError} isSubmitting={isSubmitting} />

      <SearchAndFilter
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        stockFilter={stockFilter} setStockFilter={setStockFilter}
        sortOption={sortOption} setSortOption={setSortOption}
      />

      <div className="results-info">
        Showing {filteredItems.length} of {totalItems} items
      </div>

      {loading && <p className="loading-text">Loading inventory...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && filteredItems.length === 0 ? (
        <div className="empty-state">
          {items.length === 0
            ? "No items yet — add your first item using the form above."
            : "No items match your search or filter."}
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
              expandedItemId={expandedItemId}
              onToggleHistory={toggleHistory}
              historyData={historyData}
              historyLoading={historyLoading}
            />
          ))}
        </ul>
      )}

      <footer style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #e0e0e0", fontSize: "12px", color: "#aaa" }}>
        Inventory Management System · Built with React & Django REST Framework · ESE Assignment 2026
      </footer>
    </div>
  );
}