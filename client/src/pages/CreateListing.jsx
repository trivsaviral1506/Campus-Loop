import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/ListingForm';

const CreateListing = () => {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await axios.post('/items', payload);
    navigate('/dashboard');
  };

  return (
    <ListingForm
      title="List a Resource"
      submitLabel="Post Listing"
      onSubmit={handleCreate}
    />
  );
};

export default CreateListing;
