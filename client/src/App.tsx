import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:5000/api';

const getImageForItem = (id: any, name: string, category: string, section: string) => {
  const n = name.toLowerCase();
  const numId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 0;
  const pick = (arr: string[]) => arr[numId % arr.length];
  
  if (n.includes('dress') || n.includes('floral') || n.includes('maxi') || n.includes('bohemian') || n.includes('skirt')) {
    return pick([
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80', 
      'https://images.unsplash.com/photo-1515347619252-78d91c530e12?w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
    ]);
  }

  if (n.includes('bag') || n.includes('purse') || n.includes('backpack')) {
    if (section === 'mens') return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80';
    return 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80';
  }
  
  if (n.includes('denim') || n.includes('jacket') || n.includes('coat') || n.includes('corduroy')) {
    if (section === 'womens') {
       return pick(['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80']);
    }
    return pick(['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80']);
  }

  if (n.includes('boots') || n.includes('shoes')) return 'https://images.unsplash.com/photo-1608256246200-53e635b5e65f?w=800&q=80';

  if (n.includes('cardigan') || n.includes('wool') || n.includes('sweater')) return 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80';
  
  if (section === 'womens') {
    return pick([
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80'
    ]);
  }

  return pick([
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
  ]);
};

const Home = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('mens');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/inventory`).then(res => setItems(res.data)).catch(console.error);
  }, []);

  const displayedItems = items.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'mens') return item.category.toLowerCase().includes('vintage') || item.category.toLowerCase().includes('accessories') || item.category.toLowerCase().includes('casual');
    if (activeTab === 'womens') return item.category.toLowerCase().includes('boho') || item.category.toLowerCase().includes('ethnic') || item.category.toLowerCase().includes('accessories') || item.category.toLowerCase().includes('vintage') || item.name.toLowerCase().includes('dress') || item.name.toLowerCase().includes('boots');
    return true;
  });

  const addToCart = (item: any, type: string) => {
    setCart([...cart, { ...item, cartId: Date.now(), purchaseType: type }]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(i => i.cartId !== cartId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.purchaseType === 'buy' ? parseFloat(item.price) : parseFloat(item.rental_price)), 0);

  const processCheckout = async () => {
    try {
      for (const item of cart) {
        await axios.put(`${API_URL}/inventory/${item.id}`, { status: 'Sold' });
      }
      setCart([]);
      setIsCartOpen(false);
      alert('Success! Your items have been securely checked out and your order is processing.');
      axios.get(`${API_URL}/inventory`).then(res => setItems(res.data)).catch(console.error);
    } catch (error) {
      console.error(error);
      alert('Error connecting to the database during checkout.');
    }
  };

  return (
    <>
      <header className="header">
          <div className="header-logo">Thrift-Link</div>
          <div className="header-search">
              <input type="text" placeholder="Search vintage styles..." aria-label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="header-actions">
              <button type="button" className="btn-outline" style={{border: 'none', background: '#f5f5dc'}} onClick={() => setIsCartOpen(!isCartOpen)}>
                Cart ({cart.length})
              </button>
              <Link to="/login" className="btn-outline">Login</Link>
          </div>
      </header>

      {isCartOpen && (
        <div style={{position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 1000, padding: '24px', display: 'flex', flexDirection: 'column'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
             <h2 style={{fontFamily: 'Montserrat', fontSize: '1.5rem', color: 'var(--olive-green)'}}>Your Cart</h2>
             <button type="button" onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', fontSize: '2rem', lineHeight: 1, color: '#777'}}>&times;</button>
          </div>
          
          <div style={{flex: 1, overflowY: 'auto'}}>
            {cart.length === 0 ? <p style={{color: '#777'}}>Your cart is empty.</p> : cart.map(item => (
               <div key={item.cartId} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px'}}>
                 <div>
                   <h4 style={{fontSize: '1rem', marginBottom: '4px'}}>{item.name}</h4>
                   <span style={{fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: item.purchaseType === 'buy' ? '#e8f5e9' : '#fff3e0', color: item.purchaseType === 'buy' ? '#2e7d32' : '#ef6c00', fontWeight: 600}}>
                     {item.purchaseType === 'buy' ? 'Purchase' : '3-Day Rental'}
                   </span>
                 </div>
                 <div style={{textAlign: 'right'}}>
                   <p style={{fontWeight: 600}}>${item.purchaseType === 'buy' ? item.price : item.rental_price}</p>
                   <button type="button" onClick={() => removeFromCart(item.cartId)} style={{background: 'none', border: 'none', color: 'var(--terracotta)', fontSize: '0.8rem', marginTop: '8px', cursor: 'pointer', textDecoration: 'underline'}}>Remove</button>
                 </div>
               </div>
            ))}
          </div>
          
          {cart.length > 0 && (
            <div style={{marginTop: 'auto', paddingTop: '24px', borderTop: '2px solid #eee'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 600, fontSize: '1.25rem', fontFamily: 'Montserrat'}}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
               </div>
               <button type="button" className="btn-emerald" style={{width: '100%', padding: '16px', fontSize: '1.1rem'}} onClick={processCheckout}>Proceed to Checkout</button>
            </div>
          )}
        </div>
      )}

      <main className="home-container">
          <nav className="category-nav">
              <button type="button" className={`nav-toggle ${activeTab === 'mens' ? 'active' : ''}`} onClick={() => setActiveTab('mens')}>Men's Section</button>
              <button type="button" className={`nav-toggle ${activeTab === 'womens' ? 'active' : ''}`} onClick={() => setActiveTab('womens')}>Women's Section</button>
          </nav>
          <section className="product-grid">
              {displayedItems.map((item: any) => (
                <article key={item.id} className="product-card">
                  <div className="product-image-wrap">
                      {item.unique_piece && <span className="badge-unique">Unique Piece</span>}
                      <img src={getImageForItem(item.id, item.name, item.category, activeTab)} alt={item.name} className="product-image" />
                  </div>
                  <div className="product-info">
                      <span className="product-category">{item.category}</span>
                      <h2 className="product-title">{item.name}</h2>
                      <div className="product-pricing">
                          <div className="price-option">
                              <span className="price-label">Buy Price</span>
                              <span className="price-value">${item.price}</span>
                          </div>
                          <div className="price-divider"></div>
                          <div className="price-option" style={{textAlign: 'right'}}>
                              <span className="price-label">Rental Price</span>
                              <span className="price-value" style={{color: 'var(--terracotta)'}}>${item.rental_price}</span>
                          </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                          <button type="button" className="btn-emerald" style={{ flex: 1, padding: '10px 0' }} onClick={() => addToCart(item, 'buy')}>Buy Now</button>
                          <button type="button" className="btn-outline" style={{ flex: 1, padding: '10px 0', borderWidth: '2px', fontWeight: 600 }} onClick={() => addToCart(item, 'rent')}>Rent Item</button>
                      </div>
                  </div>
              </article>
              ))}
          </section>
      </main>
    </>
  );
};

const Admin = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const [activeTab, setActiveTab] = useState('inventory');
  const [shippedOrders, setShippedOrders] = useState<number[]>([]);

  const fetchItems = () => axios.get(`${API_URL}/inventory`).then(res => setItems(res.data)).catch(console.error);

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) return;
    await axios.post(`${API_URL}/inventory`, newItem);
    setNewItem({ name: '', price: '', category: '' });
    fetchItems();
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Available' ? 'Sold' : 'Available';
    await axios.put(`${API_URL}/inventory/${id}`, { status: newStatus });
    fetchItems();
  };

  const soldItems = items.filter((i: any) => i.status === 'Sold');
  const availableItems = items.filter((i: any) => i.status === 'Available');
  const totalRevenue = soldItems.reduce((acc, curr: any) => acc + parseFloat(curr.price || 0), 0);

  return (
    <div className="admin-layout">
        <aside className="admin-sidebar">
            <div className="admin-logo">Thrift-Link</div>
            <ul className="admin-nav">
                <li><a href="#" className={activeTab === 'inventory' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('inventory'); }}>Inventory</a></li>
                <li><a href="#" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>Customer Orders</a></li>
                <li><a href="#" className={activeTab === 'analytics' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }}>Sales Analytics</a></li>
                <li><a href="#" className={activeTab === 'settings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>Settings</a></li>
                <li style={{marginTop: '40px'}}><Link to="/login" style={{color: 'rgba(255,255,255,0.5)'}}>Logout</Link></li>
            </ul>
        </aside>
        <main className="admin-main">
            {activeTab === 'inventory' && (
              <>
                <div className="admin-header">
                    <h1>Inventory Management</h1>
                    <p style={{color: '#777', marginTop: '8px'}}>Manage your unique boutique items connected to Node.js Backend</p>
                </div>
                <div className="dashboard-grid">
                    <div className="admin-card quick-add-form">
                        <h2 className="admin-card-title">Quick Add</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input type="text" className="form-control" placeholder="e.g. Vintage Denim Jacket" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input type="number" className="form-control" placeholder="0.00" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} required>
                                    <option value="" disabled>Select category</option>
                                    <option value="Vintage">Vintage</option>
                                    <option value="Ethnic">Ethnic</option>
                                    <option value="Boho Chic">Boho Chic</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '16px'}}>Add Item</button>
                        </form>
                    </div>
                    <div className="admin-card">
                        <h2 className="admin-card-title">Current Inventory</h2>
                        <div style={{overflowX: 'auto'}}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Availability</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any) => (
                                      <tr key={item.id}>
                                          <td style={{fontFamily: 'monospace'}}>{item.item_id}</td>
                                          <td style={{fontWeight: 500}}>{item.name}</td>
                                          <td>{item.category}</td>
                                          <td><span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                                          <td>
                                            <label className="toggle-switch">
                                                <input type="checkbox" checked={item.status === 'Sold'} onChange={() => toggleStatus(item.id, item.status)} />
                                                <span className="slider"></span>
                                            </label>
                                          </td>
                                      </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
                <div className="admin-header">
                    <h1>Customer Orders</h1>
                    <p style={{color: '#777', marginTop: '8px'}}>Manage checkouts and rentals fulfilled from the storefront cart.</p>
                    <div className="admin-card" style={{marginTop: '24px'}}>
                        <div style={{overflowX: 'auto'}}>
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Order ID</th><th>Customer Info</th><th>Item Purchased</th><th>Total</th><th>Status</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {soldItems.length === 0 ? (
                                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px', color: '#777'}}>No active orders available right now.</td></tr>
                                    ) : soldItems.map((item: any) => {
                                        const isShipped = shippedOrders.includes(item.id);
                                        return (
                                        <tr key={item.id}>
                                            <td style={{fontFamily: 'monospace'}}>#ORD-{7850 + item.id}</td>
                                            <td>
                                                <strong>Store Customer</strong><br />
                                                <span style={{fontSize: '0.8rem', color: '#777'}}>Verified Purchase</span>
                                            </td>
                                            <td>
                                                <strong>{item.name}</strong><br/>
                                                <span style={{fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#e8f5e9', color: '#2e7d32', fontWeight: 600, display: 'inline-block', marginTop: '4px'}}>Purchase</span>
                                            </td>
                                            <td><strong>${parseFloat(item.price || 0).toFixed(2)}</strong></td>
                                            <td>
                                                {isShipped ? (
                                                    <span className="status-badge" style={{background: '#e8f5e9', color: '#2e7d32'}}>Shipped</span>
                                                ) : (
                                                    <span className="status-badge" style={{background: '#fff3e0', color: '#ef6c00'}}>Pending Shipment</span>
                                                )}
                                            </td>
                                            <td>
                                                <button type="button" className={isShipped ? "btn-outline" : "btn-emerald"} style={{padding: '4px 12px', fontSize: '0.8rem', minWidth: '110px'}} onClick={() => {
                                                    if (isShipped) setShippedOrders(shippedOrders.filter(id => id !== item.id));
                                                    else setShippedOrders([...shippedOrders, item.id]);
                                                }}>
                                                    {isShipped ? 'Undo' : 'Mark Shipped'}
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'analytics' && (
                <div className="admin-header">
                    <h1>Sales Analytics</h1>
                    <p style={{color: '#777', marginTop: '8px'}}>Real-time performance based on your MySQL database.</p>
                    <div className="dashboard-grid" style={{marginTop: '24px'}}>
                        <div className="admin-card" style={{padding: '32px', textAlign: 'center'}}>
                            <h3 style={{fontSize: '2rem', color: 'var(--olive-green)'}}>${totalRevenue.toFixed(2)}</h3>
                            <p style={{color: '#777'}}>Total Revenue</p>
                        </div>
                        <div className="admin-card" style={{padding: '32px', textAlign: 'center'}}>
                            <h3 style={{fontSize: '2rem', color: 'var(--terracotta)'}}>{soldItems.length}</h3>
                            <p style={{color: '#777'}}>Items Sold</p>
                        </div>
                        <div className="admin-card" style={{padding: '32px', textAlign: 'center'}}>
                            <h3 style={{fontSize: '2rem', color: 'var(--emerald-green)'}}>{availableItems.length}</h3>
                            <p style={{color: '#777'}}>Items Available</p>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="admin-header">
                    <h1>Admin Settings</h1>
                    <p style={{color: '#777', marginTop: '8px'}}>Configure logic and application variables here.</p>
                    <div className="admin-card" style={{marginTop: '24px', maxWidth: '600px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                            <div>
                                <strong>Enable Customer Signups</strong>
                                <p style={{fontSize: '0.85rem', color: '#777'}}>Allow new customers to create accounts.</p>
                            </div>
                            <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                            <div>
                                <strong>Rental Mode</strong>
                                <p style={{fontSize: '0.85rem', color: '#777'}}>Allow 3-Day Rentals for all available items.</p>
                            </div>
                            <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div>
                                <strong>Store Front Visibility</strong>
                                <p style={{fontSize: '0.85rem', color: '#777'}}>Temporarily hide the store UI for maintenance.</p>
                            </div>
                            <label className="toggle-switch"><input type="checkbox" /><span className="slider"></span></label>
                        </div>
                        <button type="button" className="btn-primary" style={{marginTop: '24px'}}>Save Changes</button>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: any) => {
    e.preventDefault();
    try {
        const payload = { email, password, action: isSignUp ? 'signup' : 'login', role };
        const res = await axios.post(`${API_URL}/auth`, payload);
        if (res.data.success) {
            alert(isSignUp ? "Account fully authorized & uniquely created in database!" : "Logged into database successfully!");
            if (role === 'customer') navigate('/');
            else navigate('/admin');
        }
    } catch (err: any) {
        alert(err.response?.data?.error || 'Authentication error from MySQL server.');
    }
  };

  return (
    <div className="login-page">
        <div className="login-bg"></div>
        <div className="login-card">
            <h1 className="header-logo login-logo">Thrift-Link</h1>
            <p className="login-subtitle">Welcome back to the sustainable fashion hub.</p>
            <div className="role-toggle">
                <button type="button" className={`role-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => { setRole('customer'); setIsSignUp(false); }}>Customer</button>
                <button type="button" className={`role-btn ${role === 'staff' ? 'active' : ''}`} onClick={() => { setRole('staff'); setIsSignUp(false); }}>Staff</button>
            </div>
            <form onSubmit={handleAuth}>
                <div className="form-group" style={{textAlign: 'left', marginBottom: '16px'}}>
                    <label>Email Address / Username</label>
                    <input type="text" className="form-control" placeholder="hello@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group" style={{textAlign: 'left', marginBottom: '24px'}}>
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary login-btn">{isSignUp ? 'Record Account in DB' : 'Verify & Sign In'}</button>
            </form>
            <p style={{marginTop: '20px', fontSize: '0.9rem', color: '#777'}}>
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <a href="#" style={{color: 'var(--olive-green)', fontWeight: 600}} onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </a>
            </p>
        </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
