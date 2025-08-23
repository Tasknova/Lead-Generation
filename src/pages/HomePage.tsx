import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Rocket,
  BarChart3,
  Shield,
  Clock,
  Search,
  Database,
  Gift
} from 'lucide-react';

import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Precision Targeting",
      description: "Advanced algorithms to find your ideal customers with precision"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Smart Lead Discovery",
      description: "Automatically discover and verify high-quality leads for your business"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Rich Data Export",
      description: "Export leads in CSV/JSON format with detailed contact information"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Quality Assurance",
      description: "Verified contact information with high accuracy rates"
    }
  ];

  const stats = [
            { number: "51,450+", label: "Leads Generated", icon: <Users className="h-4 w-4" /> },
            { number: "93%", label: "Accuracy Rate", icon: <CheckCircle className="h-4 w-4" /> },
    { number: "24/7", label: "Processing", icon: <Clock className="h-4 w-4" /> },
    { number: "3x", label: "Faster Results", icon: <Zap className="h-4 w-4" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "This platform transformed our lead generation. We saw a 300% increase in qualified leads within the first month!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Sales Manager",
      company: "GrowthStart",
      content: "The precision targeting helped us find the perfect prospects. Our conversion rate improved dramatically.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "InnovateLab",
      content: "Best investment we made this year. The ROI was immediate and continues to grow.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    toast({
      title: "Get Started",
      description: "Choose your path to success!",
    });
  };

  return (
    <>
      {/* Header with Login/Signup */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                              <img src="/logo2.png" alt="Tasknova Logo" className="w-32 h-20 object-contain" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <a href="/auth">Login</a>
              </Button>
              <Button asChild>
                <a href="/auth">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Rocket className="h-3 w-3 mr-2" />
                Lead Generation Platform
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Generate High-Quality Leads
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform your business with our lead generation platform. 
                Find your ideal customers with precision targeting and verified contact information.
                <span className="block mt-2 text-lg font-semibold text-green-600">
                  🎁 Start with 10 FREE leads - No credit card required!
                </span>
              </p>

              <div className="flex justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Get 10 Free Leads
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center mb-2 text-blue-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 10 Free Leads Offer Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-green-200">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-4">
                    <Gift className="h-8 w-8" />
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  🎁 Get <span className="text-green-600">10 FREE Leads</span> Today!
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Start generating high-quality leads immediately with our free trial. 
                  No credit card required. Experience the power of AI-driven lead generation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold"
                    onClick={() => window.location.href = '/auth'}
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Claim Your 10 Free Leads
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-sm text-orange-600 font-semibold">
                    ⏰ <span className="underline">Limited Time Offer</span> - Don't miss out!
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Instant access
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Export in CSV/JSON
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Powerful Lead Generation Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to find, target, and connect with your ideal customers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple 3-step process to generate high-quality leads
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Define Your Target",
                  description: "Describe your ideal customers and specify your target market criteria.",
                  icon: <Target className="h-8 w-8" />
                },
                {
                  step: "02",
                  title: "Generate Leads",
                  description: "Our system finds verified leads that match your criteria with detailed contact information.",
                  icon: <Search className="h-8 w-8" />
                },
                {
                  step: "03",
                  title: "Export & Connect",
                  description: "Download your leads in CSV/JSON format and start connecting with prospects.",
                  icon: <Database className="h-8 w-8" />
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  className="text-center relative"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-600">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of businesses that have transformed their lead generation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Scale Your Business?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Start generating qualified leads today. 
                Join thousands of successful businesses.
              </p>
              
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                  onClick={() => window.location.href = '/auth'}
                >
                  <Target className="mr-2 h-5 w-5" />
                  Start Generating Leads
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white text-gray-600 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p>&copy; 2025 TaskNova. All rights reserved.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a 
                  href="https://tasknova.io/privacy-policy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a 
                  href="https://tasknova.io/terms-and-conditions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Terms & Conditions
                </a>
                <a 
                  href="https://tasknova.io/contact-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage; 