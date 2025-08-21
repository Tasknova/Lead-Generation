import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, Building, MapPin, Users, Briefcase, Globe, Filter, Type, List, Zap, CheckCircle, ArrowRight, Star, TrendingUp, Users as UsersIcon, CreditCard, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import Navbar from '@/components/ui/navbar';
import SimplePaymentModal from '@/components/payment/SimplePaymentModal';
import { motion } from 'framer-motion';

const LeadGenerationPage = () => {
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [freeLeadsUsed, setFreeLeadsUsed] = useState<boolean>(false);
  const [isFreeRequest, setIsFreeRequest] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [activeMode, setActiveMode] = useState<'dropdown' | 'manual'>('dropdown');
  const [isVisible, setIsVisible] = useState(false);
  
  // Lead targeting fields - only 4 essential options
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>('');

  // Dropdown options
  const jobTitleOptions = [
    'CEO', 'CTO', 'CFO', 'COO', 'VP of Marketing', 'VP of Sales', 'VP of Engineering',
    'Marketing Director', 'Sales Director', 'Product Manager', 'Business Development Manager',
    'Marketing Manager', 'Sales Manager', 'Account Executive', 'Sales Representative',
    'Marketing Specialist', 'Growth Manager', 'Digital Marketing Manager', 'Content Manager',
    'SEO Manager', 'PPC Manager', 'Social Media Manager', 'Brand Manager', 'Product Marketing Manager',
    'Customer Success Manager', 'Operations Manager', 'Project Manager', 'Scrum Master',
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Data Analyst', 'UX Designer', 'UI Designer',
    'Founder', 'Co-Founder', 'Entrepreneur', 'Startup Founder', 'Business Owner',
    'Consultant', 'Freelancer', 'Agency Owner', 'Agency Director'
  ];

  const industryOptions = [
    'Technology', 'Software', 'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
    'Real Estate', 'Marketing', 'Advertising', 'Consulting', 'Manufacturing', 'Retail',
    'Hospitality', 'Travel', 'Food & Beverage', 'Fashion', 'Beauty', 'Fitness', 'Sports',
    'Entertainment', 'Media', 'Publishing', 'Non-profit', 'Government', 'Legal', 'Finance',
    'Insurance', 'Banking', 'Investment', 'Venture Capital', 'Private Equity', 'Startup',
    'Agency', 'Freelance', 'Professional Services', 'Construction', 'Energy',
    'Automotive', 'Transportation', 'Logistics', 'Supply Chain', 'Pharmaceuticals',
    'Biotechnology', 'Telecommunications', 'Internet', 'Mobile Apps', 'Gaming', 'AI/ML',
    'Blockchain', 'Cryptocurrency', 'Cybersecurity', 'Cloud Computing', 'IoT', 'Big Data'
  ];

  const locationOptions = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'India',
    'Singapore', 'Japan', 'South Korea', 'China', 'Brazil', 'Mexico', 'Argentina', 'Chile',
    'Colombia', 'Peru', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland',
    'Austria', 'Belgium', 'Italy', 'Spain', 'Portugal', 'Poland', 'Czech Republic', 'Hungary',
    'Romania', 'Bulgaria', 'Greece', 'Turkey', 'Israel', 'UAE', 'Saudi Arabia', 'South Africa',
    'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'New Zealand', 'Philippines', 'Thailand', 'Vietnam',
    'Malaysia', 'Indonesia', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Myanmar'
  ];

  const companySizeOptions = [
    '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees',
    '501-1000 employees', '1000+ employees'
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, free_leads_used')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profile) {
          setFullName(profile.full_name || '');
          setFreeLeadsUsed(profile.free_leads_used || false);
        }
      }
    };

    fetchUser();
  }, []);

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setShowPaymentModal(false);
    toast({
      title: 'Payment Successful',
      description: 'Starting lead generation process...',
    });
    // Automatically start lead generation after successful payment
    setTimeout(() => {
      handleGenerateLeads();
    }, 1000);
  };

  const handleFreeLeadsActivation = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to use free leads.',
        variant: 'destructive',
      });
      return;
    }

    if (freeLeadsUsed) {
      toast({
        title: 'Free Leads Already Used',
        description: 'You have already used your 10 free leads. Please purchase leads to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Mark free leads as used in the database
      const { error } = await supabase
        .from('profiles')
        .update({ free_leads_used: true })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setFreeLeadsUsed(true);
      setIsFreeRequest(true); // Mark this as a free request
      
      // Set up for free leads generation - use the same input fields
      setActiveMode('dropdown'); // Use dropdown mode for consistency
      setJobTitles(['CEO', 'Marketing Director']); // Set some default targeting
      setIndustries(['Technology', 'Marketing']);
      setLocations(['United States']);
      setSelectedCompanySize('11-50 employees');
      setTermsAccepted(true);
      setPaymentStatus('success');
      
      toast({
        title: "Free Trial Activated!",
        description: "Starting lead generation process...",
      });
      // Automatically start lead generation after free leads activation
      setTimeout(() => {
        handleGenerateLeads();
      }, 1000);
    } catch (error) {
      console.error('Error activating free leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate free leads. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Test webhook function
  const testWebhook = async () => {
    const webhookUrl = "https://n8nautomation.site/webhook/user-form/leadgen";
    const testPayload = {
      id: "test-" + Date.now(),
      lead_description: "Test lead generation request",
      user_name: "Test User",
      user_email: "test@example.com",
      request_type: "test"
    };

    console.log('=== TESTING WEBHOOK ===');
    console.log('Test URL:', webhookUrl);
    console.log('Test Payload:', testPayload);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testPayload),
      });

      console.log('Test response status:', response.status);
      console.log('Test response headers:', response.headers);

      if (response.ok) {
        const responseText = await response.text();
        console.log('Test success response:', responseText);
        toast({
          title: 'Webhook Test Success!',
          description: `Webhook is working. Status: ${response.status}`,
        });
      } else {
        const errorText = await response.text();
        console.error('Test error response:', errorText);
        toast({
          title: 'Webhook Test Failed',
          description: `Status: ${response.status} - ${errorText}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      toast({
        title: 'Webhook Test Error',
        description: error.message || 'Network error occurred',
        variant: 'destructive',
      });
    }
  };

  const addFilter = (type: string, value: string) => {
    if (!value.trim()) return;
    
    switch (type) {
      case 'jobTitle':
        if (!jobTitles.includes(value)) {
          setJobTitles([...jobTitles, value]);
        }
        break;
      case 'industry':
        if (!industries.includes(value)) {
          setIndustries([...industries, value]);
        }
        break;
      case 'location':
        if (!locations.includes(value)) {
          setLocations([...locations, value]);
        }
        break;
    }
  };

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'jobTitle':
        setJobTitles(jobTitles.filter(item => item !== value));
        break;
      case 'industry':
        setIndustries(industries.filter(item => item !== value));
        break;
      case 'location':
        setLocations(locations.filter(item => item !== value));
        break;
    }
  };

  const generateDescriptionFromFilters = () => {
    const parts = [];
    
    if (jobTitles.length > 0) {
      parts.push(`Job titles: ${jobTitles.join(', ')}`);
    }
    if (industries.length > 0) {
      parts.push(`Industries: ${industries.join(', ')}`);
    }
    if (locations.length > 0) {
      parts.push(`Locations: ${locations.join(', ')}`);
    }
    if (selectedCompanySize) {
      parts.push(`Company size: ${selectedCompanySize}`);
    }
    
    return parts.join(' | ');
  };

  const generateJsonDescriptionFromFilters = () => {
    const jsonData = {
      "Job titles": jobTitles,
      "Industries": industries,
      "Locations": locations,
      "Company size": selectedCompanySize
    };
    
    return JSON.stringify(jsonData, null, 2);
  };
  
  const handleGenerateLeads = async () => {
    let finalDescription = '';
    let jsonDescription = '';
    
    if (activeMode === 'dropdown') {
      finalDescription = generateDescriptionFromFilters();
      jsonDescription = generateJsonDescriptionFromFilters();
    } else {
      finalDescription = description.trim();
      jsonDescription = description.trim();
    }
    
    if (!finalDescription) {
      toast({
        title: 'Error',
        description: activeMode === 'dropdown' 
          ? 'Please select at least one targeting criteria.' 
          : 'Please describe your ideal leads.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      if (!user) {
        throw new Error('You must be logged in to generate leads.');
      }

      // Insert into Supabase lead_requests table first
      const { data: insertDataArr, error: dbError } = await supabase
        .from('lead_requests')
        .insert({
          user_id: user.id,
          user_email: user.email!,
          user_name: fullName || user.email!,
          lead_description: jsonDescription, // Use JSON format for dropdown, plain text for manual
          status: 'running',
          is_free_request: isFreeRequest // Track if this is a free request
        })
        .select('id');
      const insertData = Array.isArray(insertDataArr) ? insertDataArr[0] : insertDataArr;
      if (dbError || !insertData) {
        console.error('Error inserting into lead_requests:', dbError);
        toast({
          title: 'Error',
          description: 'Failed to record your lead request. Please try again.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return;
      }

      // Now send the POST request to the webhook with the correct payload structure
      const webhookUrl = "https://n8nautomation.site/webhook/user-form/leadgen";

      const payload = {
        id: insertData.id,
        lead_description: finalDescription, // Use readable format for webhook
        user_name: fullName || user.email!,
        user_email: user.email!,
        request_type: activeMode, // 'dropdown' or 'manual'
        is_free_request: isFreeRequest, // Identify free requests
        lead_count: isFreeRequest ? 10 : 100 // Set lead count based on request type
      };

      console.log('=== WEBHOOK DEBUG ===');
      console.log('Sending payload to webhook:', payload);
      console.log('Webhook URL:', webhookUrl);
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
        });

        console.log('Webhook response status:', response.status);
        console.log('Webhook response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Webhook error response:', errorText);
          throw new Error(`Webhook server error: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Webhook success response:', responseText);
        console.log('=== WEBHOOK SUCCESS ===');

      } catch (webhookError) {
        console.error('=== WEBHOOK ERROR ===');
        console.error('Webhook fetch error:', webhookError);
        console.error('Error details:', {
          message: webhookError.message,
          stack: webhookError.stack,
          name: webhookError.name
        });
        
        // Continue with the process even if webhook fails
        console.log('Continuing despite webhook error...');
      }

      console.log('Successfully recorded in Supabase and sent data to n8n webhook.');
      toast({
        title: 'Success!',
        description: isFreeRequest 
          ? 'Your 10 free leads request has been submitted. You will receive your leads via email within 25-30 minutes.'
          : 'Please wait while we generate your leads. The leads will be sent to your email. It may take upto 25 to 30 mins to generate the leads',
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error sending data to webhook:', error);
      
      // Even if webhook fails, show success if data was inserted
      if (error.message.includes('webhook') || error.message.includes('fetch')) {
        toast({
          title: 'Partial Success',
          description: 'Your lead request was recorded successfully. We will process it shortly. If you don\'t receive leads within 30 minutes, please contact support.',
        });
        setSubmitted(true);
      } else {
      toast({
        title: 'Error Generating Leads',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerateLeads = termsAccepted && paymentStatus === 'success' && 
    (activeMode === 'dropdown' ? (jobTitles.length > 0 && industries.length > 0 && locations.length > 0 && selectedCompanySize) : description.trim().length > 0);

  const canProceedToPayment = () => {
    if (!termsAccepted) return false;
    
    if (activeMode === 'dropdown') {
      return jobTitles.length > 0 && industries.length > 0 && locations.length > 0 && selectedCompanySize;
    } else {
      return description.trim().length > 0;
    }
  };

  const reviews = [
    {
      quote: "This pipeline is a game-changer for our business. We saw a 3x increase in qualified leads within the first month!",
      name: "John Doe, CEO of TechCorp",
      rating: 5,
    },
    {
      quote: "The quality of leads is outstanding. It's like having a dedicated lead generation team working for you 24/7.",
      name: "Jane Smith, Marketing Manager",
      rating: 5,
    },
    {
      quote: "I was skeptical at first, but the results speak for themselves. Highly recommended for any sales team.",
      name: "Sam Wilson",
      rating: 4,
    }
  ];

  const stats = [
            { label: "Leads Generated", value: "51,450+", icon: <UsersIcon className="h-6 w-6" /> },
        { label: "Success Rate", value: "93%", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Average Response", value: "2.3 days", icon: <CheckCircle className="h-6 w-6" /> },
    { label: "Customer Satisfaction", value: "4.9/5", icon: <Star className="h-6 w-6" /> }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col min-h-screen"
        >
          <main className="flex-grow container mx-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold mb-4"
              >
                Order Submitted Successfully!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-8"
              >
                Your lead generation order has been processed. We'll start generating your leads and send them to your email within 25-30 minutes.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button asChild size="lg" className="px-8 py-3 text-lg">
                  <a href="/orders">View Your Orders</a>
                </Button>
              </motion.div>
            </div>
          </main>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col min-h-screen"
      >
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isFreeRequest ? '🎁 Configure Your 10 Free Leads' : '🎯 Get 100 Verified Leads'}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {isFreeRequest ? 'Customize your targeting criteria for your free leads' : 'Only $20 - Start Growing Your Business Today!'}
            </p>
            {!freeLeadsUsed && !isFreeRequest && (
              <p className="text-lg text-green-600 font-semibold mb-2">
                🎁 Or try our <span className="underline">10 FREE leads</span> first - No credit card required!
              </p>
            )}
            {freeLeadsUsed && !isFreeRequest && (
              <p className="text-lg text-blue-600 font-semibold mb-2">
                ✅ You've used your free leads. Ready to scale up with 100 leads for $20!
              </p>
            )}
            {isFreeRequest && (
              <p className="text-lg text-green-600 font-semibold mb-2">
                🎁 You're configuring your 10 FREE leads - No payment required!
              </p>
            )}
            <div className="flex justify-center items-center gap-8 mt-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 10 Free Leads Offer Section */}
          {!freeLeadsUsed && !isFreeRequest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-3">
                        <Gift className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      🎁 Try Before You Buy: <span className="text-green-600">10 FREE Leads</span>
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      Experience our AI-powered lead generation with 10 free leads. 
                      No credit card required. See the quality for yourself!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 font-semibold"
                        onClick={handleFreeLeadsActivation}
                      >
                        <Gift className="mr-2 h-5 w-5" />
                        Get 10 Free Leads Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        No credit card
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Instant access
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Full features
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Free Leads Already Used Message */}
          {freeLeadsUsed && !isFreeRequest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full p-3">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      ✅ You've Used Your Free Leads
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      You've already enjoyed your 10 free leads. Ready to scale up? 
                      Get 100 verified leads for just $20!
                    </p>
                    
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 font-semibold"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <Target className="mr-2 h-5 w-5" />
                      Get 100 Leads for $20
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-8">
              {/* Mode Selection */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Choose Your Lead Targeting Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as 'dropdown' | 'manual')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                      <TabsTrigger value="dropdown" className="flex items-center gap-2 text-base">
                        <List className="h-5 w-5" />
                        Dropdown Targeting
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex items-center gap-2 text-base">
                        <Type className="h-5 w-5" />
                        Manual Description
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="dropdown" className="mt-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <p className="text-gray-600 text-lg">Select your targeting criteria from the dropdowns below</p>
                          <p className="text-sm text-red-500 mt-2">* All fields are required</p>
                        </div>
                        
                        {/* Job Titles */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-700">Job Titles *</label>
                          <Select onValueChange={(value) => addFilter('jobTitle', value)}>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select job titles" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobTitleOptions.map((title) => (
                                <SelectItem key={title} value={title}>{title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {jobTitles.map((title) => (
                              <Badge key={title} variant="secondary" className="cursor-pointer px-3 py-1" onClick={() => removeFilter('jobTitle', title)}>
                                {title} ×
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Industries */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-700">Industries *</label>
                          <Select onValueChange={(value) => addFilter('industry', value)}>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select industries" />
                            </SelectTrigger>
                            <SelectContent>
                              {industryOptions.map((industry) => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {industries.map((industry) => (
                              <Badge key={industry} variant="secondary" className="cursor-pointer px-3 py-1" onClick={() => removeFilter('industry', industry)}>
                                {industry} ×
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Locations */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-700">Locations *</label>
                          <Select onValueChange={(value) => addFilter('location', value)}>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select locations" />
                            </SelectTrigger>
                            <SelectContent>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {locations.map((location) => (
                              <Badge key={location} variant="secondary" className="cursor-pointer px-3 py-1" onClick={() => removeFilter('location', location)}>
                                {location} ×
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Company Size - Rectangular Selection */}
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-700">Company Size *</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {companySizeOptions.map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedCompanySize(size)}
                                className={`p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                                  selectedCompanySize === size
                                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg scale-105'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="font-semibold text-base">{size}</div>
                                {selectedCompanySize === size && (
                                  <CheckCircle className="h-5 w-5 text-blue-600 mt-2" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Generated Description Preview */}
                        {(jobTitles.length > 0 || industries.length > 0 || locations.length > 0 || selectedCompanySize) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                          >
                            <h4 className="font-semibold text-sm mb-3 text-blue-800">Generated Description:</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{generateDescriptionFromFilters()}</p>
                          </motion.div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="manual" className="mt-8">
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <p className="text-gray-600 text-lg">Describe your ideal leads in your own words</p>
                          <p className="text-sm text-red-500 mt-2">* Description is required</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold mb-3 block text-gray-700">Lead Description *</label>
                          <Textarea
                            placeholder="Examples:&#10;- Marketing agency owners or founders in India&#10;- Sales Managers in Pune with team size > 10&#10;- Marketing agencies with 20-40 employees in India&#10;- CEOs of SaaS companies in the United States&#10;- Startup founders looking for growth marketing services"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[200px] text-base border-2 focus:border-blue-500"
                          />
                </div>
              </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Zap className="mr-3 h-6 w-6 text-blue-600" />
                    {isFreeRequest ? 'Generate Your Free Leads' : 'Payment & Generate Leads'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor="terms"
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the <a href="#" className="underline text-blue-600 hover:text-blue-800">Terms & Privacy Policy</a>
                    </label>
                  </div>

                  {/* 10 Free Leads Button - Only show if user hasn't used free leads */}
                  {!freeLeadsUsed && !isFreeRequest && (
                    <Button 
                      onClick={handleFreeLeadsActivation} 
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white mb-4" 
                      disabled={!canProceedToPayment()}
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      Get 10 Free Leads
                    </Button>
                  )}

                  {/* Payment Button - Only show if user has used free leads or payment is not successful */}
                  {!isFreeRequest && paymentStatus !== 'success' && (
                    <Button 
                      onClick={handlePayment} 
                      className="w-full h-12 text-lg font-semibold" 
                      disabled={paymentStatus === 'processing' || !canProceedToPayment()}
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Choose Package & Pay
                        </>
                      )}
                    </Button>
                  )}

                  {/* Show generating status when processing */}
                  {isGenerating && (
                    <Button 
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                      disabled={true}
                    >
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Leads...
                    </Button>
                  )}
                </CardContent>
              </Card>
          </div>
          </motion.div>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
            <Carousel className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
              <CarouselContent>
                {reviews.map((review, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                          <p className="text-center text-lg leading-relaxed">"{review.quote}"</p>
                          <div className="text-center">
                            <p className="font-semibold text-lg">{review.name}</p>
                            <p className="text-sm text-muted-foreground">{'⭐'.repeat(review.rating)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </motion.section>





          {/* Payment Modal */}
          <SimplePaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        </main>
      </motion.div>
      </div>
  );
};

export default LeadGenerationPage; 