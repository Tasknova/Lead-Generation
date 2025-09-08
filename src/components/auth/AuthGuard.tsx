import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBusinessProfile, setHasBusinessProfile] = useState<boolean | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const checkSession = async (currentSession: Session | null) => {
      setSession(currentSession);
      
      if (currentSession) {
        // Check if user has business profile
        try {
          const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', currentSession.user.id)
            .maybeSingle();
          
          setHasBusinessProfile(!!businessProfile);
        } catch (error) {
          console.error('Error checking business profile:', error);
          setHasBusinessProfile(false);
        }
      } else {
        setHasBusinessProfile(null);
      }
      
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session);
    });

    // Also check immediately on load/navigation
    supabase.auth.getSession().then(({ data: { session } }) => {
        checkSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [location]);

  useEffect(() => {
    const createProfileIfNeeded = async () => {
      if (!session) return;
      const user = session.user;
      
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!data && !error) {
        // Insert new profile if it doesn't exist
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || null
        });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully for user:', user.id);
        }
      }
    };
    createProfileIfNeeded();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAuthPage = location.pathname === '/auth';
  const isAdminPage = location.pathname.startsWith('/admin');

  if (session) {
    // User is logged in
    console.log('User authenticated, current path:', location.pathname);
    
    if (isAuthPage) {
      // Redirect from auth page based on business profile status
      if (hasBusinessProfile === true) {
        return <Navigate to="/lead-generation" replace />;
      } else if (hasBusinessProfile === false) {
        return <Navigate to="/onboarding" replace />;
      }
      // If hasBusinessProfile is null, wait for loading to complete
    }

    // If user is on onboarding page but already has business profile, redirect to lead generation
    if (location.pathname === '/onboarding' && hasBusinessProfile === true) {
      return <Navigate to="/lead-generation" replace />;
    }

    // If user is on lead generation but doesn't have business profile, redirect to onboarding
    if (location.pathname === '/lead-generation' && hasBusinessProfile === false) {
      return <Navigate to="/onboarding" replace />;
    }

    if (isAdminPage) {
        return <>{children}</>;
    }

    // User is on a protected route
    return <>{children}</>;
  } else {
    // User is not logged in
    if (!isAuthPage) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  }
};

export default AuthGuard;
