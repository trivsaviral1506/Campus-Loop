import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Laptop, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-1px' }}>
          Smart Campus <br/><span className="gradient-text">Resource Exchange</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
          Lend, borrow, and request academic resources, gadgets, and project components instantly within your campus community.
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <Link to="/register" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
            Join CampusLoop <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
            Explore Items
          </Link>
        </div>

        <div className="flex justify-center gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
          <div className="card glass-panel" style={{ width: '240px' }}>
            <BookOpen size={32} className="gradient-text mb-8" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Academic Books</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Borrow textbooks for a semester instead of buying.</p>
          </div>
          <div className="card glass-panel" style={{ width: '240px' }}>
            <Laptop size={32} className="gradient-text mb-8" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Tech & Gadgets</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Need a charger or adapter? Borrow it instantly.</p>
          </div>
          <div className="card glass-panel" style={{ width: '240px' }}>
            <Activity size={32} className="gradient-text mb-8" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Sports Gear</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Grab sports equipment for a quick weekend game.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
