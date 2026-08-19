// Inventory Management System
class InventoryManager {
  constructor() {
    this.inventory = this.loadInventory();
    this.editingId = null;
    this.filteredInventory = [...this.inventory];
    this.initializeEventListeners();
    this.displayInventory();
  }

  // Load inventory from localStorage
  loadInventory() {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  }

  // Save inventory to localStorage
  saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(this.inventory));
  }

  // Initialize event listeners
  initializeEventListeners() {
    const form = document.getElementById('inventoryForm');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const exportBtn = document.getElementById('exportBtn');
    const searchInput = document.getElementById('searchInput');

    form.addEventListener('submit', (e) => this.handleAddItem(e));
    clearAllBtn.addEventListener('click', () => this.clearAllItems());
    exportBtn.addEventListener('click', () => this.exportData());
    searchInput.addEventListener('input', (e) => this.searchItems(e.target.value));
  }

  // Add or update item
  handleAddItem(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);

    if (!productName || !quantity || !price) {
      alert('Please fill in all fields');
      return;
    }

    if (this.editingId !== null) {
      this.updateItem(this.editingId, productName, quantity, price);
      this.editingId = null;
      document.getElementById('addBtn').textContent = 'Add Item';
    } else {
      this.addItem(productName, quantity, price);
    }

    document.getElementById('inventoryForm').reset();
    this.displayInventory();
    this.updateStats();
  }

  // Add new item to inventory
  addItem(name, quantity, price) {
    const id = Date.now().toString();
    const item = {
      id,
      name,
      quantity,
      price,
      dateAdded: new Date().toLocaleDateString()
    };
    this.inventory.push(item);
    this.saveInventory();
  }

  // Update existing item
  updateItem(id, name, quantity, price) {
    const item = this.inventory.find(item => item.id === id);
    if (item) {
      item.name = name;
      item.quantity = quantity;
      item.price = price;
      this.saveInventory();
    }
  }

  // Delete item from inventory
  deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.inventory = this.inventory.filter(item => item.id !== id);
      this.saveInventory();
      this.displayInventory();
      this.updateStats();
    }
  }

  // Edit item
  editItem(id) {
    const item = this.inventory.find(item => item.id === id);
    if (item) {
      document.getElementById('productName').value = item.name;
      document.getElementById('quantity').value = item.quantity;
      document.getElementById('price').value = item.price;
      document.getElementById('addBtn').textContent = 'Update Item';
      this.editingId = id;
      document.getElementById('productName').focus();
    }
  }

  // Search items
  searchItems(searchTerm) {
    if (!searchTerm) {
      this.filteredInventory = [...this.inventory];
    } else {
      this.filteredInventory = this.inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.displayInventory();
  }

  // Display inventory in table
  displayInventory() {
    const tableBody = document.getElementById('tableBody');
    const table = document.getElementById('inventoryTable');
    const emptyState = document.getElementById('emptyState');

    tableBody.innerHTML = '';

    if (this.filteredInventory.length === 0) {
      table.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    this.filteredInventory.forEach(item => {
      const row = document.createElement('tr');
      const totalValue = (item.quantity * item.price).toFixed(2);

      row.innerHTML = `
        <td>${this.escapeHtml(item.name)}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${totalValue}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-edit" onclick="manager.editItem('${item.id}')">Edit</button>
            <button class="btn btn-delete" onclick="manager.deleteItem('${item.id}')">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Update statistics
  updateStats() {
    const totalItems = this.inventory.length;
    const totalQuantity = this.inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = this.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalQuantity').textContent = totalQuantity;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
  }

  // Clear all items
  clearAllItems() {
    if (confirm('Are you sure you want to delete ALL items? This cannot be undone.')) {
      this.inventory = [];
      this.filteredInventory = [];
      this.saveInventory();
      this.displayInventory();
      this.updateStats();
      document.getElementById('searchInput').value = '';
    }
  }

  // Export data as JSON
  exportData() {
    if (this.inventory.length === 0) {
      alert('No items to export');
      return;
    }

    const dataStr = JSON.stringify(this.inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the manager when DOM is loaded
let manager;
document.addEventListener('DOMContentLoaded', () => {
  manager = new InventoryManager();
  manager.updateStats();
});
