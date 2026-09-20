import { ArrowLeftRight, Globe, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--bg-card)] py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                <ArrowLeftRight size={20} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
                Campus<span className="text-[var(--primary)]">Loop</span>
              </span>
            </Link>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm">
              The smartest way to lend, borrow, and exchange resources within your verified university community. Built by students, for students.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition"><Globe size={20} /></a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition"><Mail size={20} /></a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition"><MessageSquare size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-[var(--text-main)] mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)] flex flex-col">
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Campus Guidelines</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Safe Pickup Spots</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Trust & Safety</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Help Center</Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--text-main)] mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-[var(--text-muted)] flex flex-col">
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">About Us</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Privacy Policy</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Terms of Service</Link>
              <Link to="#" className="hover:text-[var(--primary)] transition w-fit">Contact Support</Link>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
          <p>© 2026 CampusLoop Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
