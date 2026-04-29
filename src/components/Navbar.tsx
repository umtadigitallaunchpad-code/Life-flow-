import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn, logOut, auth } from '@/src/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  setCurrentPage: (page: 'home' | 'profile') => void;
}

const Navbar: React.FC<NavbarProps> = ({ setCurrentPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Auth listener
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const handleHomeClick = () => {
    setCurrentPage('home');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleProfileClick = () => {
    if (user) {
      setCurrentPage('profile');
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
      signIn().catch((error) => {
        if (error?.code !== 'auth/popup-blocked' && error?.code !== 'auth/cancelled-popup-request' && error?.code !== 'auth/popup-closed-by-user') {
          alert('Sign-in error: ' + error.message);
        }
      });
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleHomeClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(229,62,62,0.4)] group-hover:shadow-[0_0_25px_-3px_rgba(229,62,62,0.6)] transition-all">
            <Droplet className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            Life<span className="text-primary font-serif italic">Flow</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#network" onClick={() => setCurrentPage('home')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Donors Map</a>
          <a href="#emergency" onClick={() => setCurrentPage('home')} className="text-sm font-medium text-primary hover:text-primary-foreground transition-colors flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Emergency
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => signIn().catch(() => {})}>Sign In</Button>
          ) : (
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => { logOut(); setCurrentPage('home'); }}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
          <Button onClick={handleProfileClick} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 rounded-full">
            <User className="w-4 h-4 mr-2" />
            {user ? 'Profile' : 'Guest'}
          </Button>
        </div>

        <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-3xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <a href="#network" onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-lg font-medium text-gray-300 p-2 hover:bg-white/5 rounded-lg">Donors Map</a>
              <a href="#emergency" onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-lg font-medium text-primary p-2 hover:bg-primary/10 rounded-lg">Emergency Request</a>
              <div className="h-[1px] w-full bg-white/10 my-2" />
              {!user ? (
                <Button className="w-full justify-center" onClick={() => signIn().catch(() => {})}>Sign In</Button>
              ) : (
                <Button className="w-full justify-center" variant="outline" onClick={() => { logOut(); setCurrentPage('home'); setMobileMenuOpen(false); }}>Sign Out</Button>
              )}
              <Button className="w-full justify-center" onClick={() => { handleProfileClick(); setMobileMenuOpen(false); }}>
                <User className="w-4 h-4 mr-2" />
                {user ? 'Profile' : 'Guest'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

