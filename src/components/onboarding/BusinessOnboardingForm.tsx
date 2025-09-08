import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, User, Linkedin, Globe, Phone, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PhoneVerification from './PhoneVerification';

interface BusinessOnboardingData {
  businessName: string;
  position: string;
  linkedin: string;
  website: string;
  industry: string;
  phone: string;
  phoneVerified: boolean;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Real Estate',
  'Manufacturing',
  'Consulting',
  'Marketing & Advertising',
  'Legal',
  'Retail',
  'Food & Beverage',
  'Travel & Hospitality',
  'Non-profit',
  'Other'
];

const BusinessOnboardingForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessOnboardingData>({
    businessName: '',
    position: '',
    linkedin: '',
    website: '',
    industry: '',
    phone: '',
    phoneVerified: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      toast({
        title: "Business name required",
        description: "Please enter your business name.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.position.trim()) {
      toast({
        title: "Position required",
        description: "Please enter your position.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.industry) {
      toast({
        title: "Industry required",
        description: "Please select your business industry.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return false;
    }

    if (!phoneVerified) {
      toast({
        title: "Phone verification required",
        description: "Please verify your phone number before continuing.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };


  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile with business information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.businessName, // Using business name as display name
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create business profile record
      const { error: businessError } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          business_name: formData.businessName,
          position: formData.position,
          linkedin_url: formData.linkedin,
          website_url: formData.website,
          industry: formData.industry,
          phone: formData.phone,
          phone_verified: phoneVerified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (businessError) throw businessError;

      toast({
        title: "Onboarding completed!",
        description: "Welcome to Tasknova Lead Generator. You now have 10 free leads to get started!",
      });

      // Redirect to lead generation page
      navigate('/lead-generation');
    } catch (error: any) {
      toast({
        title: "Onboarding failed",
        description: error.message || "Failed to complete onboarding.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Business Onboarding</CardTitle>
          <CardDescription className="text-lg">
            Tell us about your business to get started with 10 free leads
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business Name *
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Position *
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="e.g., CEO, Marketing Manager"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn Profile
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Business Website
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourbusiness.com"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business Industry *
              </Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
                {phoneVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full"
              />
              
              {formData.phone && (
                <PhoneVerification
                  phone={formData.phone}
                  onVerified={setPhoneVerified}
                  onCodeSent={() => {}}
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              size="lg"
              className="w-full max-w-md"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Completing Onboarding...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Onboarding & Get 10 Free Leads
                </>
              )}
            </Button>
          </div>

          {/* Free Leads Notice */}
          <div className="text-center text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="font-semibold text-green-800">🎉 Welcome Bonus!</p>
            <p>Complete your onboarding to receive 10 free leads to get started with lead generation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessOnboardingForm;
