import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Laptop, Activity, CheckCircle, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col animate-fade-in" style={{ width: '100%' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge-pill">
          <span className="pill-dot"></span>
          ✨ Next-Gen University Sharing Network • Spring 2026
        </div>
        
        <h1 className="text-6xl font-extrabold mb-4" style={{ lineHeight: 1.1, letterSpacing: '-1px' }}>
          Smart Campus <br />
          <span className="text-primary">Resource Exchange</span>
        </h1>
        
        <p className="text-xl text-muted mb-8" style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
          Lend, borrow, and request academic resources, gadgets, and project components instantly within your verified campus community.
        </p>

        <div className="search-pill">
          <Search className="text-muted ml-4" size={20} />
          <input 
            type="text" 
            placeholder="Search textbooks, calculators, Arduino kits..." 
            style={{ flex: 1, backgroundColor: 'transparent', padding: '12px' }}
          />
          <Link to="/login" className="btn btn-primary" style={{ margin: 0 }}>
            Search Now
          </Link>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Join CampusLoop <ArrowRight size={18} />
          </Link>
          <a href="#categories" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
            Explore Categories
          </a>
        </div>

        <div className="stats-banner grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="stat-item">
            <div className="text-3xl font-extrabold">4,200+</div>
            <div className="text-sm font-bold text-muted mt-2">Active Students</div>
          </div>
          <div className="stat-item">
            <div className="text-3xl font-extrabold text-primary">180+</div>
            <div className="text-sm font-bold text-muted mt-2">Live Listings</div>
          </div>
          <div className="stat-item">
            <div className="text-3xl font-extrabold">$24k+</div>
            <div className="text-sm font-bold text-muted mt-2">Saved on Books</div>
          </div>
          <div className="stat-item">
            <div className="text-3xl font-extrabold" style={{ color: '#198754' }}>100%</div>
            <div className="text-sm font-bold text-muted mt-2">University Verified</div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="section-pad bg-light border-y border-outline-variant">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold text-primary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Curated Collections</h2>
            <p className="text-3xl font-bold">Popular Resource Categories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center flex flex-col items-center">
              <BookOpen size={40} className="text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Academic Books</h3>
              <p className="text-sm text-muted">Borrow textbooks for a semester instead of buying expensive editions.</p>
            </div>
            <div className="card text-center flex flex-col items-center">
              <Laptop size={40} className="text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Tech & Gadgets</h3>
              <p className="text-sm text-muted">Need a charger, adapter, or micro-controller kit? Borrow it instantly.</p>
            </div>
            <div className="card text-center flex flex-col items-center">
              <Activity size={40} className="text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Sports Gear</h3>
              <p className="text-sm text-muted">Grab sports equipment for a quick weekend game or fitness session.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section-pad">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold text-primary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Seamless Process</h2>
            <p className="text-3xl font-bold mb-2">How CampusLoop Works</p>
            <p className="text-muted">Simple, campus-verified sharing designed around student life and deadlines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center flex flex-col items-center">
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>1</div>
              <h3 className="text-xl font-bold mb-2">List or Search</h3>
              <p className="text-sm text-muted">Snap a photo of textbooks or gear you aren't using, or query what you need.</p>
            </div>
            <div className="card text-center flex flex-col items-center">
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>2</div>
              <h3 className="text-xl font-bold mb-2">Connect & Arrange</h3>
              <p className="text-sm text-muted">Chat with your peers to arrange a convenient and safe drop-off location on campus.</p>
            </div>
            <div className="card text-center flex flex-col items-center">
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>3</div>
              <h3 className="text-xl font-bold mb-2">Loop & Return</h3>
              <p className="text-sm text-muted">Meet at designated Safe Zones, use the resource, and loop it back.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
