import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Gavel, Calculator, LayoutDashboard, LogOut, User, Menu, X, TrendingUp, Scan } from 'lucide-react';
import Logo from '@/components/branding/Logo';
import NotificationBell from '@/components/NotificationBell';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/auctions', label: 'Auctions', icon: Gavel },
    { to: '/price-checker', label: 'Price Checker', icon: Calculator },
    { to: '/plate-lookup', label: 'Plate Lookup', icon: Scan },
    { to: '/car-insights', label: 'Car Insights', icon: TrendingUp },
    ...(user ? [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'Profile', icon: User },
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Logo className="h-6 w-6" />
          <span>Babu<span className="text-gradient-brand">Vault</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to) ? 'bg-gradient-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationBell />
          {user ? (
            <>
              <Button onClick={() => navigate('/create-auction')} size="sm" className="bg-gradient-brand shadow-brand">
                <Gavel className="mr-2 h-4 w-4" /> Create Auction
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button size="sm" onClick={() => navigate('/register')} className="bg-gradient-brand shadow-brand">Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.to) ? 'bg-gradient-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                {user ? (
                  <>
                    <Button onClick={() => { navigate('/create-auction'); setMobileOpen(false); }} size="sm" className="bg-gradient-brand">
                      Create Auction
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
                    <Button size="sm" onClick={() => { navigate('/register'); setMobileOpen(false); }} className="bg-gradient-brand">Get Started</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
