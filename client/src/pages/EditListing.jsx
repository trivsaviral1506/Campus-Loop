import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'books', condition: 'good', deposit: 0, imageUrl: '', pickupLocation: ''
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/items/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/items/${id}`, formData);
      navigate('/lent');
    } catch (err) {
      console.error(err);
      alert('Failed to update listing');
    }
  };

  return (
    <div className="animate-fade-in flex justify-center">
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '24px' }}>Edit Resource</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-muted">Item Name</label>
          <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} />

          <label className="text-muted">Description</label>
          <textarea name="description" required rows="3" value={formData.description || ''} onChange={handleChange} />

          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label className="text-muted">Category</label>
              <select name="category" value={formData.category || 'books'} onChange={handleChange}>
                <option value="books">Books</option>
                <option value="electronics">Electronics/Gadgets</option>
                <option value="lab">Lab Equipment</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-muted">Condition</label>
              <select name="condition" value={formData.condition || 'good'} onChange={handleChange}>
                <option value="new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label className="text-muted">Deposit (₹)</label>
              <input type="number" name="deposit" value={formData.deposit || 0} onChange={handleChange} min="0" />
            </div>
            <div style={{ flex: 2 }}>
              <label className="text-muted">Pickup Location</label>
              <input type="text" name="pickupLocation" required value={formData.pickupLocation || ''} onChange={handleChange} />
            </div>
          </div>

          <label className="text-muted">Image URL (Optional)</label>
          <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} />

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
