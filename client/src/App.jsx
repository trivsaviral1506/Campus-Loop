import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ItemDetails from './pages/ItemDetails';
import OwnerDashboard from './pages/OwnerDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* Added top padding so content isn't hidden behind the floating navbar */}
        <main className="container flex-grow pt-32" style={{ paddingBottom: '64px' }}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/create-listing" element={user ? <CreateListing /> : <Navigate to="/login" />} />
            <Route path="/edit-listing/:id" element={user ? <EditListing /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={user ? <ItemDetails /> : <Navigate to="/login" />} />
            <Route path="/lent" element={user ? <OwnerDashboard /> : <Navigate to="/login" />} />
            <Route path="/borrowed" element={user ? <BorrowerDashboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
