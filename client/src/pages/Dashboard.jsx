import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');

  const fetchItems = async () => {
    try {
      let query = `/items?keyword=${keyword}`;
      if (category) query += `&category=${category}`;
      if (availability !== '') query += `&availability=${availability}`;
      
      const res = await axios.get(query);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [keyword, category, availability]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Campus Resources</h2>
        <Link to="/create-listing" className="btn btn-primary">
          <Plus size={18} /> List an Item
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="flex items-center gap-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '8px', flex: '2 1 300px' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search for books, chargers, adapters..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ border: 'none', background: 'transparent', margin: 0, padding: 0 }}
          />
        </div>
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: '1 1 150px', margin: 0, background: 'rgba(0,0,0,0.2)' }}
        >
          <option value="">All Categories</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="lab">Lab Equipment</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>

        <select 
          value={availability} 
          onChange={(e) => setAvailability(e.target.value)}
          style={{ flex: '1 1 150px', margin: 0, background: 'rgba(0,0,0,0.2)' }}
        >
          <option value="">Any Status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div className="flex" style={{ flexWrap: 'wrap', gap: '24px' }}>
        {items.map(item => (
          <Link to={`/item/${item._id}`} key={item._id} className="card glass-panel" style={{ width: 'calc(33.333% - 16px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', height: '160px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No Image</span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{item.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px', flexGrow: 1 }}>{item.description.substring(0, 80)}...</p>
            <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
              <span className={`badge ${item.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Deposit: ₹{item.deposit}</span>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <p style={{ color: 'var(--text-muted)', width: '100%', textAlign: 'center', marginTop: '40px' }}>No resources found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
