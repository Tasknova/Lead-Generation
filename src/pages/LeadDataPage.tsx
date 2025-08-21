import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Eye, EyeOff, ChevronLeft, ChevronRight, FileJson, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/ui/navbar';
import type { Database } from '@/integrations/supabase/types';

type LeadRequest = Database['public']['Tables']['lead_requests']['Row'];

const LeadDataPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [leadRequest, setLeadRequest] = useState<LeadRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [user, setUser] = useState<any>(null);

  const [jsonData, setJsonData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setUser(user);

        if (!id) {
          setError('No lead request ID provided');
          setLoading(false);
          return;
        }

        // Fetch the specific lead request
        const { data: requestData, error: requestError } = await supabase
          .from('lead_requests')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (requestError) {
          throw new Error('Lead request not found or access denied');
        }

        setLeadRequest(requestData);

        // Process JSON data if available
        if (requestData.json_data) {
          try {
            let arr: any[] = Array.isArray(requestData.json_data) 
              ? requestData.json_data 
              : (requestData.json_data.data || requestData.json_data.leads || requestData.json_data.results || [requestData.json_data]);
            
            if (!Array.isArray(arr)) arr = [requestData.json_data];
            
            if (arr.length === 0) {
              setError('No data found in JSON');
              setLoading(false);
              return;
            }

            setHeaders(Object.keys(arr[0]));
            setJsonData(arr);
            
            toast({
              title: 'JSON Data Loaded',
              description: `Loaded ${arr.length} leads from database`,
            });
          } catch (err: any) {
            setError('Invalid JSON data in database');
            toast({
              title: 'Error Loading JSON',
              description: 'Invalid JSON data in database',
              variant: 'destructive',
            });
          }
        } else {
          setError('No JSON data available for this request');
        }

      } catch (error: any) {
        console.error('Error loading lead data:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [id, navigate, toast]);

  const downloadJSON = () => {
    if (!jsonData.length) return;
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'JSON file download has started',
    });
  };



  const totalPages = Math.ceil(jsonData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = jsonData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <p className="text-lg">Loading lead data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              
              <Alert className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/orders')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Lead Data
                  </h1>
                  <p className="text-gray-600">
                    {leadRequest?.user_name} • {leadRequest?.user_email} • {new Date(leadRequest?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={leadRequest?.status === 'Completed' ? 'default' : 'secondary'}>
                  {leadRequest?.status}
                </Badge>
              </div>
            </div>

            {/* Main Content */}
            <Card className="w-full shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Lead Data ({jsonData.length} leads)
                    <Badge variant="outline">Database</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'table' ? 'json' : 'table')}
                    >
                      {viewMode === 'table' ? 'Raw JSON' : 'Table View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowData(!showData)}
                    >
                      {showData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showData ? 'Hide' : 'Show'} Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadJSON}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {showData && jsonData.length > 0 && (
                  <div className="space-y-6">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Leads</p>
                        <p className="text-2xl font-bold text-blue-700">{jsonData.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Columns</p>
                        <p className="text-2xl font-bold text-green-700">{headers.length}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Current Page</p>
                        <p className="text-2xl font-bold text-purple-700">{currentPage} / {totalPages}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Request ID</p>
                        <p className="text-sm font-mono text-orange-700 truncate">{id}</p>
                      </div>
                    </div>

                    {/* Data Display */}
                    {viewMode === 'table' ? (
                      <>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {headers.map((header, idx) => (
                                    <TableHead key={idx} className="bg-gray-50 font-semibold">
                                      {header}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentRows.map((row, rowIdx) => (
                                  <TableRow key={rowIdx} className="hover:bg-gray-50">
                                    {headers.map((header, cellIdx) => (
                                      <TableCell key={cellIdx} className="max-w-xs">
                                        <div className="truncate" title={String(row[header] || '')}>
                                          {row[header] ? String(row[header]) : '-'}
                                        </div>
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Showing {startIndex + 1} to {Math.min(endIndex, jsonData.length)} of {jsonData.length} leads
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Raw JSON View */
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <h3 className="font-semibold">Raw JSON Data</h3>
                        </div>
                        <div className="overflow-auto max-h-96">
                          <pre className="p-4 text-sm bg-gray-900 text-green-400">
                            {JSON.stringify(jsonData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button onClick={downloadJSON} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download JSON
                      </Button>
                    </div>
                  </div>
                )}

                {!showData && (
                  <div className="text-center py-8 text-gray-500">
                    <FileJson className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Click "Show Data" to view the lead information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadDataPage; 