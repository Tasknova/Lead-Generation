import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/ui/navbar';
import { getPaymentHistory } from '@/integrations/razorpay/payment';

import type { Database } from '@/integrations/supabase/types';
import { Loader2, CheckCircle2, XCircle, RefreshCw, Download, Users, CreditCard, Calendar, IndianRupee } from 'lucide-react';

// Types
// These should match your Supabase types
// You may need to adjust imports if your types are elsewhere

type LeadRequest = Database['public']['Tables']['lead_requests']['Row'] & { status?: string | null; downloadable_url?: string | null };

const OrdersPage: React.FC = () => {
  const [leadRequests, setLeadRequests] = useState<LeadRequest[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Function to format lead description for display
  const formatLeadDescription = (description: string): string => {
    // First, try to clean up the description if it looks like JSON
    let cleanDescription = description.trim();
    
    try {
      // Try to parse as JSON first (for dropdown mode)
      const parsed = JSON.parse(cleanDescription);
      
      // If it's a dropdown request, format it nicely
      if (parsed['Job titles'] || parsed['Industries'] || parsed['Locations'] || parsed['Company size']) {
        const parts = [];
        
        if (parsed['Job titles'] && Array.isArray(parsed['Job titles']) && parsed['Job titles'].length > 0) {
          parts.push(`${parsed['Job titles'].join(', ')}`);
        }
        
        if (parsed['Industries'] && Array.isArray(parsed['Industries']) && parsed['Industries'].length > 0) {
          parts.push(`in ${parsed['Industries'].join(', ')}`);
        }
        
        if (parsed['Locations'] && Array.isArray(parsed['Locations']) && parsed['Locations'].length > 0) {
          parts.push(`from ${parsed['Locations'].join(', ')}`);
        }
        
        if (parsed['Company size'] && Array.isArray(parsed['Company size']) && parsed['Company size'].length > 0) {
          parts.push(`(${parsed['Company size'].join(', ')})`);
        } else if (parsed['Company size'] && typeof parsed['Company size'] === 'string') {
          parts.push(`(${parsed['Company size']})`);
        }
        
        const result = parts.join(' ');
        return result || 'Lead generation request';
      }
      
      // If it's not a dropdown format, return as is
      return description;
    } catch (error) {
      // If it's not JSON, check if it looks like a partial JSON and try to extract info
      if (description.includes('"Job titles"') || description.includes('"Industries"')) {
        try {
          // Try to extract job titles and industries from the partial JSON
          const jobTitlesMatch = description.match(/"Job titles":\s*\[([^\]]+)\]/);
          const industriesMatch = description.match(/"Industries":\s*\[([^\]]+)\]/);
          const locationsMatch = description.match(/"Locations":\s*\[([^\]]+)\]/);
          const companySizeMatch = description.match(/"Company size":\s*"([^"]+)"/);
          
          const parts = [];
          
          if (jobTitlesMatch) {
            const jobTitles = jobTitlesMatch[1].replace(/"/g, '').split(',').map(s => s.trim());
            parts.push(jobTitles.join(', '));
          }
          
          if (industriesMatch) {
            const industries = industriesMatch[1].replace(/"/g, '').split(',').map(s => s.trim());
            parts.push(`in ${industries.join(', ')}`);
          }
          
          if (locationsMatch) {
            const locations = locationsMatch[1].replace(/"/g, '').split(',').map(s => s.trim());
            parts.push(`from ${locations.join(', ')}`);
          }
          
          if (companySizeMatch) {
            parts.push(`(${companySizeMatch[1]})`);
          }
          
          if (parts.length > 0) {
            return parts.join(' ');
          }
        } catch (extractError) {
          // Silently continue to fallback
        }
      }
      
      // If it's not JSON, return as plain text (for manual mode)
      return description;
    }
  };

  // Function to get a short preview of the description
  const getDescriptionPreview = (description: string): string => {
    const formatted = formatLeadDescription(description);
    if (formatted.length > 80) {
      return `${formatted.substring(0, 80)}...`;
    }
    return formatted;
  };

  const fetchLeadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found.');
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('lead_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (requestsError) throw requestsError;
      setLeadRequests(requestsData as LeadRequest[]);
    } catch (error) {
      console.error('Error fetching lead requests:', error);
      setLeadRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found.');
      
      const paymentData = await getPaymentHistory(user.id);
      setPaymentOrders(paymentData);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentOrders([]);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await Promise.all([
          fetchLeadRequests(),
          fetchPaymentHistory()
        ]);
      }
    };

    initializePage();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for lead_requests table
    const channel = supabase
      .channel('lead_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'lead_requests',
          filter: `user_id=eq.${user.id}` // Only listen to changes for current user
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New record added
            setLeadRequests(prev => [payload.new as LeadRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Record updated
            setLeadRequests(prev => 
              prev.map(request => 
                request.id === payload.new.id 
                  ? { ...request, ...payload.new } as LeadRequest
                  : request
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Record deleted
            setLeadRequests(prev => 
              prev.filter(request => request.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRefresh = async () => {
    setLoading(true);
    setPaymentLoading(true);
    await Promise.all([
      fetchLeadRequests(),
      fetchPaymentHistory()
    ]);
  };



  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Tabs defaultValue="lead-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lead-requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lead Requests
            </TabsTrigger>
            <TabsTrigger value="payment-history" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lead-requests">
            <Card className="w-full overflow-hidden shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Lead Requests
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardTitle>
                <CardDescription>
                  A history of all your lead generation requests. Updates in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Loading...</p>
              </div>
            ) : leadRequests.length > 0 ? (
              <div className="space-y-6">
                {leadRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg overflow-hidden">
                    {/* Request Header */}
                    <div className="p-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {request.lead_description ? getDescriptionPreview(request.lead_description) : 'No description'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Requested on: {new Date(request.created_at).toLocaleString()}
                        </p>
                        {/* Status display with color and icon */}
                        {(() => {
                          const status = (request.status || '').toLowerCase();
                          if (status === 'running') {
                            return (
                              <span className="flex items-center gap-1 text-blue-600 font-medium mt-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Running
                              </span>
                            );
                          } else if (status === 'completed') {
                            return (
                              <span className="flex items-center gap-1 text-green-600 font-medium mt-2">
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Completed
                              </span>
                            );
                          } else if (status.startsWith('failed') || status === 'error') {
                            return (
                              <span className="flex items-center gap-1 text-red-600 font-medium mt-2">
                                <XCircle className="h-4 w-4 mr-1" /> Error. Our team will connect with you.
                              </span>
                            );
                          } else {
                            return (
                              <span className="flex items-center gap-1 text-gray-500 font-medium mt-2">
                                Status: {request.status || 'Pending'}
                              </span>
                            );
                          }
                        })()}
                      </div>
                                             <div className="flex gap-2 ml-4">
                         {request.downloadable_url && (
                           <Button asChild variant="default" size="sm">
                             <a href={request.downloadable_url} target="_blank" rel="noopener noreferrer">
                               <Download className="h-4 w-4 mr-2" />
                               Download CSV
                             </a>
                           </Button>
                         )}
                         {request.json_data && (
                           <Button
                             variant="outline"
                             size="sm"
                             asChild
                           >
                             <a href={`/lead-data/${request.id}`}>
                               <Users className="h-4 w-4 mr-2" />
                               View Leads
                             </a>
                           </Button>
                         )}

                       </div>
                    </div>

                                       </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't made any lead requests yet.</p>
                <Button asChild className="mt-4">
                  <a href="/lead-generation">Generate Your First Leads</a>
                </Button>
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-history">
            <Card className="w-full overflow-hidden shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View all your payment transactions and lead packages purchased.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Loading payment history...</p>
                  </div>
                ) : paymentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {paymentOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={order.status === 'success' ? 'default' : order.status === 'failed' ? 'destructive' : 'secondary'}>
                                {order.status === 'success' ? 'Paid' : order.status === 'failed' ? 'Failed' : 'Pending'}
                              </Badge>
                              {order.package_id === 'test' && (
                                <Badge variant="destructive" className="text-xs">
                                  TEST
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                {order.leads_count} leads
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                            {order.payment_id && (
                              <p className="text-xs text-gray-400 mt-1">
                                Payment ID: {order.payment_id}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-semibold">
                              <IndianRupee className="h-4 w-4" />
                              {(order.amount / 100).toFixed(0)}
                            </div>
                            <p className="text-sm text-gray-500">{order.package_id} package</p>
                            {order.customer_phone && (
                              <p className="text-xs text-gray-400 mt-1">
                                📞 {order.customer_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No payment history yet.</p>
                    <p className="text-sm text-gray-400">Your payment transactions will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OrdersPage; 