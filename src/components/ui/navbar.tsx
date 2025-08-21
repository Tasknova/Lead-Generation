import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Zap, ShoppingCart, User, LogIn, LogOut, Phone } from 'lucide-react';

// Profile context for sharing avatarUrl
export const ProfileContext = React.createContext<{ avatarUrl?: string } | undefined>(undefined);

const navLinks = [
  { to: '/lead-generation', label: 'Lead Generation', icon: <Zap className="inline-block w-5 h-5 mr-1" /> },
  { to: '/orders', label: 'Your Orders', icon: <ShoppingCart className="inline-block w-5 h-5 mr-1" /> },
];

const authNavLinks = [
  { to: 'https://tasknova.io/contact-us/', label: 'Contact Us', icon: <Phone className="inline-block w-5 h-5 mr-1" />, external: true },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Always use avatar_url from profiles table
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        setAvatarUrl(data?.avatar_url || null);
      } else {
        setIsAuthenticated(false);
        setAvatarUrl(null);
      }
    };
    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto flex items-center gap-4 py-1 px-4">
        <Link to={isAuthenticated ? "/lead-generation" : "/"} className="mr-4 flex items-center">
          <img src="/logo2.png" alt="Logo" className="w-32 h-20 object-contain" />
        </Link>
        
        {/* Navigation Links - Show different links based on authentication */}
        {(isAuthenticated ? navLinks : authNavLinks).map(link => (
          link.external ? (
            <a
              key={link.to}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-2 rounded font-medium transition-colors duration-150 text-gray-700 hover:bg-gray-200 flex items-center`}
            >
              {link.icon}
              {link.label}
            </a>
          ) : (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded font-medium transition-colors duration-150 text-gray-700 hover:bg-gray-200 flex items-center`}
            >
              {link.icon}
              {link.label}
            </Link>
          )
        ))}
        
        <div className="ml-auto flex flex-row-reverse items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white border">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </Link>
              {location.pathname.startsWith('/profile') && (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded font-medium transition-colors duration-150 text-gray-700 hover:bg-gray-200 border border-gray-200 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 