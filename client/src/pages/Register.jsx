import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', college: '', department: '', year: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="flex justify-center items-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create an Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@college.edu" />
            </div>
          </div>
          
          <label style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
          
          <label style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>College</label>
          <input type="text" name="college" required value={formData.college} onChange={handleChange} placeholder="Engineering Institute" />
          
          <div className="flex gap-4">
            <div style={{ flex: 2 }}>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Department</label>
              <input type="text" name="department" required value={formData.department} onChange={handleChange} placeholder="Computer Science" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Year</label>
              <select name="year" required value={formData.year} onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
