import { useMemo, useState } from "react";
import "./App.css";

const initialFoods = [
  { id: 1, name: "Chicken Biryani", category: "Non-Veg", price: 180, image: "/chicken-biryani.jpg", available: true, sold: 45 },
  { id: 2, name: "Masala Dosa", category: "South Indian", price: 80, image: "/masala-dosa.jpg", available: true, sold: 32 },
  { id: 3, name: "Paneer Butter Masala", category: "Veg", price: 160, image: "/paneer-butter-masala.jpg", available: true, sold: 28 },
  { id: 4, name: "Chicken 65", category: "Non-Veg", price: 140, image: "/chicken-65.jpg", available: true, sold: 25 },
  { id: 5, name: "Butter Naan", category: "Bread", price: 40, image: "/butter-naan.jpg", available: true, sold: 20 },
  { id: 6, name: "South Indian Meals", category: "South Indian", price: 120, image: "/south-indian-meals.jpg", available: true, sold: 38 },
  { id: 7, name: "Veg Fried Rice", category: "Veg", price: 110, image: "/veg-fried-rice.jpg", available: true, sold: 18 },
  { id: 8, name: "Gulab Jamun", category: "Dessert", price: 60, image: "/gulab-jamun.jpg", available: true, sold: 15 }
];

const initialOrders = [
  { id: "QP1001", customer: "Arun Kumar", phone: "9876543210", items: "Chicken Biryani × 2", total: 360, status: "Pending", date: "2026-11-26" },
  { id: "QP1002", customer: "Priya", phone: "9876543211", items: "Masala Dosa × 2, Gulab Jamun × 1", total: 220, status: "Preparing", date: "2026-11-26" },
  { id: "QP1003", customer: "Rahul", phone: "9876543212", items: "Veg Fried Rice × 1", total: 110, status: "Completed", date: "2026-11-26" },
  { id: "QP1004", customer: "Karthik", phone: "9876543213", items: "Chicken 65 × 1", total: 140, status: "Completed", date: "2026-11-25" },
  { id: "QP1005", customer: "Divya", phone: "9876543214", items: "South Indian Meals × 2", total: 240, status: "Cancelled", date: "2026-11-25" }
];

const salesData = [
  { day: "Mon", amount: 3200 },
  { day: "Tue", amount: 4600 },
  { day: "Wed", amount: 3900 },
  { day: "Thu", amount: 5800 },
  { day: "Fri", amount: 4900 },
  { day: "Sat", amount: 7200 },
  { day: "Sun", amount: 6400 }
];

function App() {
  const [page, setPage] = useState("Dashboard");
  const [foods, setFoods] = useState(initialFoods);
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [period, setPeriod] = useState("Weekly");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [activity, setActivity] = useState(["Dashboard opened"]);
  const [newFood, setNewFood] = useState({
    name: "", category: "Veg", price: "", image: ""
  });

  const logActivity = (text) => {
    setActivity(prev => [text, ...prev].slice(0, 5));
  };

  const completedOrders = orders.filter(o => o.status === "Completed");
  const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter(o => o.status === "Pending").length;

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || food.category === category)
  );

  const filteredOrders = orders.filter(order =>
    (order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
     order.customer.toLowerCase().includes(orderSearch.toLowerCase())) &&
    (statusFilter === "All" || order.status === statusFilter)
  );

  const popularFoods = [...foods].sort((a, b) => b.sold - a.sold).slice(0, 4);

  const maxSales = Math.max(...salesData.map(item => item.amount));

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(order =>
      order.id === id ? { ...order, status } : order
    ));
    logActivity(`Order ${id} updated to ${status}`);
  };

  const resetForm = () => {
    setNewFood({ name: "", category: "Veg", price: "", image: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const saveFood = (e) => {
    e.preventDefault();

    if (!newFood.name.trim() || !newFood.image.trim() ||
        !Number.isFinite(Number(newFood.price)) || Number(newFood.price) <= 0) {
      alert("Enter valid food details.");
      return;
    }

    const imagePath = newFood.image.trim().startsWith("/")
      ? newFood.image.trim()
      : "/" + newFood.image.trim();

    if (editingId !== null) {
      setFoods(prev => prev.map(food =>
        food.id === editingId
          ? { ...food, ...newFood, price: Number(newFood.price), image: imagePath }
          : food
      ));
      logActivity(`Updated ${newFood.name}`);
    } else {
      setFoods(prev => [...prev, {
        id: Date.now(),
        ...newFood,
        price: Number(newFood.price),
        image: imagePath,
        available: true,
        sold: 0
      }]);
      logActivity(`Added ${newFood.name}`);
    }

    resetForm();
  };

  const editFood = (food) => {
    setEditingId(food.id);
    setNewFood({
      name: food.name,
      category: food.category,
      price: String(food.price),
      image: food.image
    });
    setShowForm(true);
  };

  const deleteFood = (id) => {
    const food = foods.find(f => f.id === id);
    if (window.confirm(`Delete ${food.name}?`)) {
      setFoods(prev => prev.filter(f => f.id !== id));
      logActivity(`Deleted ${food.name}`);
    }
  };

  const toggleAvailability = (id) => {
    setFoods(prev => prev.map(food =>
      food.id === id ? { ...food, available: !food.available } : food
    ));
    logActivity("Food availability changed");
  };

  const reportOrders = useMemo(() => {
    return orders.filter(order => order.status !== "Cancelled");
  }, [orders]);

  return (
    <div className={dark ? "app-shell dark" : "app-shell"}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">Q</span>
          <span>Quick<span className="brand-orange">Pickup</span></span>
        </div>

        <div className="owner-box">
          <div className="owner-avatar">H</div>
          <div>
            <strong>Hotel Owner</strong>
            <small>Administrator</small>
          </div>
          <span className="online-dot"></span>
        </div>

        <p className="nav-title">WORKSPACE</p>

        {[
          ["Dashboard", "▦"],
          ["Menu Management", "☷"],
          ["Order Management", "▤"]
        ].map(([name, icon]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => setPage(name)}
          >
            <span>{icon}</span>
            {name}
            {name === "Order Management" && pending > 0 &&
              <small className="nav-count">{pending}</small>}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="support-card">
            <strong>Need Help?</strong>
            <p>Manage your hotel operations with Quick Pickup.</p>
          </div>
          <small>QUICK PICKUP © 2026</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {page}</p>
            <h2>{page}</h2>
          </div>

          <div className="top-actions">
            <button className="icon-button" onClick={() => setDark(!dark)}
              title="Toggle theme">{dark ? "☀" : "☾"}</button>
            <button className="icon-button notification-button"
              onClick={() => setNotifications(!notifications)}
              title="Toggle notifications">
              ♧
              {notifications && pending > 0 && <i></i>}
            </button>
            <div className="top-user">
              <div className="profile-avatar">H</div>
              <div><strong>Hotel Owner</strong><small>Manager</small></div>
            </div>
          </div>
        </header>

        {notifications && pending > 0 && (
          <div className="notice">
            You have {pending} pending order(s) waiting for attention.
          </div>
        )}

        {/* DASHBOARD */}
        {page === "Dashboard" && (
          <section className="content">
            <div className="welcome-panel">
              <div>
                <span className="welcome-tag">OWNER OVERVIEW</span>
                <h1>Welcome back, Hotel Owner!</h1>
                <p>Here is what's happening with your restaurant today.</p>
                <button onClick={() => setPage("Order Management")}>
                  Manage Orders →
                </button>
              </div>
              <img src="/south-indian-meals.jpg" alt="Restaurant meals" />
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-top"><span>Total Orders</span><b className="stat-symbol orange">▤</b></div>
                <h2>{orders.length}</h2>
                <small>All recorded orders</small>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Total Revenue</span><b className="stat-symbol green">₹</b></div>
                <h2>₹{revenue.toLocaleString("en-IN")}</h2>
                <small>Completed orders only</small>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Menu Items</span><b className="stat-symbol blue">☷</b></div>
                <h2>{foods.length}</h2>
                <small>{foods.filter(f => f.available).length} available items</small>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Pending Orders</span><b className="stat-symbol purple">◷</b></div>
                <h2>{pending}</h2>
                <small>Need your attention</small>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="panel sales-panel">
                <div className="panel-heading">
                  <div><h3>Sales Overview</h3><p>Weekly performance sample</p></div>
                  <select value={period} onChange={e => setPeriod(e.target.value)}>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div className="sales-chart">
                  {salesData.map(item => (
                    <div className="bar-column" key={item.day}>
                      <span>₹{item.amount.toLocaleString("en-IN")}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{
                          height: `${(item.amount / maxSales) * 100}%`
                        }}></div>
                      </div>
                      <small>{item.day}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-heading">
                  <div><h3>Recent Activity</h3><p>Latest management actions</p></div>
                </div>
                {activity.map((item, index) => (
                  <div className="activity-item" key={index}>
                    <span className="activity-dot"></span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="panel">
                <div className="panel-heading">
                  <div><h3>Popular Food Items</h3><p>Based on sample sales counts</p></div>
                  <button className="text-btn" onClick={() => setPage("Menu Management")}>View Menu →</button>
                </div>
                {popularFoods.map(food => (
                  <div className="popular-row" key={food.id}>
                    <img src={food.image} alt={food.name} />
                    <div className="popular-info"><strong>{food.name}</strong><small>{food.sold} sample orders</small></div>
                    <b>₹{food.price}</b>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div><h3>Recent Orders</h3><p>Latest order records</p></div>
                  <button className="text-btn" onClick={() => setPage("Order Management")}>View All →</button>
                </div>
                {orders.slice(0, 4).map(order => (
                  <div className="recent-order" key={order.id}>
                    <div><strong>{order.id}</strong><small>{order.customer}</small></div>
                    <div className="recent-order-right">
                      <b>₹{order.total}</b>
                      <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MENU MANAGEMENT */}
        {page === "Menu Management" && (
          <section className="content">
            <div className="page-heading">
              <div><h2>Menu Management</h2><p>Manage food items, pricing and availability.</p></div>
              <button className="primary-btn" onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}>{showForm ? "Close Form" : "+ Add New Item"}</button>
            </div>

            {showForm && (
              <form className="food-form" onSubmit={saveFood}>
                <h3>{editingId ? "Edit Food Item" : "Add New Food Item"}</h3>
                <div className="form-grid">
                  <label>Food Name
                    <input value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} placeholder="Enter food name" required />
                  </label>
                  <label>Category
                    <select value={newFood.category} onChange={e => setNewFood({...newFood, category: e.target.value})}>
                      <option>Veg</option><option>Non-Veg</option><option>South Indian</option><option>Bread</option><option>Dessert</option>
                    </select>
                  </label>
                  <label>Price (₹)
                    <input type="number" min="1" value={newFood.price} onChange={e => setNewFood({...newFood, price: e.target.value})} placeholder="Enter price" required />
                  </label>
                  <label>Image filename in public folder
                    <input value={newFood.image} onChange={e => setNewFood({...newFood, image: e.target.value})} placeholder="chicken-biryani.jpg" required />
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
                  <button className="primary-btn" type="submit">{editingId ? "Save Changes" : "Add Food Item"}</button>
                </div>
              </form>
            )}

            <div className="menu-toolbar">
              <input placeholder="Search food items..." value={search} onChange={e => setSearch(e.target.value)} />
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option>All</option><option>Veg</option><option>Non-Veg</option><option>South Indian</option><option>Bread</option><option>Dessert</option>
              </select>
              <span>{filteredFoods.length} items found</span>
            </div>

            <div className="menu-grid">
              {filteredFoods.map(food => (
                <article className="food-card" key={food.id}>
                  <div className="food-image">
                    <img src={food.image} alt={food.name} />
                    <span className={`availability ${food.available ? "available" : "unavailable"}`}>
                      {food.available ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="food-card-body">
                    <span className="food-category">{food.category}</span>
                    <h3>{food.name}</h3>
                    <div className="food-meta">
                      <strong>₹{food.price}</strong>
                      <small>{food.sold} sample sold</small>
                    </div>
                    <div className="food-actions">
                      <button className="edit-btn" onClick={() => editFood(food)}>Edit</button>
                      <button className="toggle-btn" onClick={() => toggleAvailability(food.id)}>
                        {food.available ? "Mark Out" : "Mark Available"}
                      </button>
                      <button className="delete-btn" onClick={() => deleteFood(food.id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredFoods.length === 0 && <div className="empty-state">No food items match your search.</div>}
          </section>
        )}

        {/* ORDER MANAGEMENT */}
        {page === "Order Management" && (
          <section className="content">
            <div className="page-heading">
              <div><h2>Order Management</h2><p>Track, process and manage customer orders.</p></div>
              <span className="order-total-count">{orders.length} Total Orders</span>
            </div>

            <div className="order-stats">
              {["Pending", "Preparing", "Completed", "Cancelled"].map(status => (
                <div className="order-stat" key={status}>
                  <span>{status}</span>
                  <strong>{orders.filter(o => o.status === status).length}</strong>
                </div>
              ))}
            </div>

            <div className="panel orders-panel">
              <div className="order-toolbar">
                <input placeholder="Search order ID or customer..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>All</option><option>Pending</option><option>Preparing</option><option>Completed</option><option>Cancelled</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer Details</th><th>Items</th><th>Date</th><th>Amount</th><th>Status</th><th>Update</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td><strong>{order.customer}</strong><small className="table-sub">{order.phone}</small></td>
                        <td>{order.items}</td>
                        <td>{order.date}</td>
                        <td><strong>₹{order.total}</strong></td>
                        <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                        <td>
                          <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                            <option>Pending</option><option>Preparing</option><option>Completed</option><option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && <div className="empty-state">No matching orders found.</div>}
            </div>

            <div className="report-note">
              <strong>Sales report:</strong> {reportOrders.length} non-cancelled orders recorded. Revenue counts completed orders only.
            </div>
          </section>
        )}

        <footer className="footer">© 2026 Quick Pickup · Hotel Management System</footer>
      </main>
    </div>
  );
}

export default App;