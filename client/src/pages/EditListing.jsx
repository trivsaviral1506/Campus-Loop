import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/items/${id}`);
        if (active) setItem(res.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load listing');
      }
    };
    fetchItem();
    return () => { active = false; };
  }, [id]);

  const handleUpdate = async (payload) => {
    await axios.put(`/items/${id}`, payload);
    navigate('/lent');
  };

  if (error) {
    return <div className="card glass-panel max-w-md mx-auto text-center text-red-500">{error}</div>;
  }

  if (!item) {
    return <div className="text-center text-[var(--text-muted)] py-12">Loading listing...</div>;
  }

  return (
    <ListingForm
      title="Edit Resource"
      submitLabel="Save Changes"
      initialData={item}
      onSubmit={handleUpdate}
    />
  );
};

export default EditListing;
