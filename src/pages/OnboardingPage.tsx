import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BusinessOnboardingForm from '@/components/onboarding/BusinessOnboardingForm';
import { Loader2 } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndOnboarding = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          navigate('/auth');
          return;
        }

        setUser(user);

        // Check if user already has a business profile
        const { data: businessProfile, error: profileError } = await supabase
          .from('business_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking business profile:', profileError);
        }

        // If user already has a business profile, redirect to lead generation
        if (businessProfile) {
          navigate('/lead-generation');
          return;
        }

      } catch (error) {
        console.error('Error in onboarding check:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndOnboarding();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return <BusinessOnboardingForm />;
};

export default OnboardingPage;
