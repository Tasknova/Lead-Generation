import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Eye, EyeOff, ChevronLeft, ChevronRight, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JSONViewerProps {
  jsonUrl?: string;
  jsonData?: any;
  title?: string;
  maxRows?: number;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ jsonUrl, jsonData, title = "Lead Data", maxRows = 50 }) => {
  const [localJsonData, setLocalJsonData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const { toast } = useToast();

  // Initialize with jsonData if provided
  useEffect(() => {
    if (jsonData) {
      try {
        let arr: any[] = Array.isArray(jsonData) ? jsonData : (jsonData.data || jsonData.leads || jsonData.results || [jsonData]);
        if (!Array.isArray(arr)) arr = [jsonData];
        if (arr.length === 0) {
          setError('No data found in JSON');
          return;
        }
        setHeaders(Object.keys(arr[0]));
        setLocalJsonData(arr.slice(0, maxRows));
        setShowData(true);
        toast({ title: 'JSON Data Loaded', description: `Loaded ${arr.length} rows from database` });
      } catch (err: any) {
        setError('Invalid JSON data in database');
        toast({ title: 'Error Loading JSON', description: 'Invalid JSON data in database', variant: 'destructive' });
      }
    }
  }, [jsonData, maxRows, toast]);

  const convertGoogleDriveUrl = (url: string): string => {
    // Convert Google Drive viewer URL to direct download URL
    const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
    return url;
  };

  const fetchJSONData = async () => {
    if (!jsonUrl) return;
    setLoading(true);
    setError(null);
    try {
      const directUrl = convertGoogleDriveUrl(jsonUrl);
      console.log('Attempting to fetch JSON from:', directUrl);
      
      // Use a proxy approach to bypass CORS and authentication issues
      const proxyUrl = `/api/json-proxy?url=${encodeURIComponent(directUrl)}`;
      
      const response = await fetch(proxyUrl, { 
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        if (jsonUrl.includes('drive.google.com')) {
          throw new Error(`Failed to fetch JSON from Google Drive (${response.status}).\n\nPlease ensure the file is shared with "Anyone with the link" permissions in Google Drive.`);
        }
        throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (text.trim().startsWith('<')) {
        if (jsonUrl.includes('drive.google.com')) {
          throw new Error('The Google Drive file is not accessible.\n\nPlease check:\n1. The file is shared with "Anyone with the link"\n2. The file contains valid JSON data\n3. The file is not empty');
        }
        throw new Error('The file at this URL is not valid JSON.\n\nThis usually means the file is not public, does not exist, or the URL is incorrect. Please check the URL and file permissions.');
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('The file at this URL is not valid JSON.\n\nPlease ensure the file contains valid JSON data.');
      }
      
      let arr: any[] = Array.isArray(data) ? data : (data.data || data.leads || data.results || [data]);
      if (!Array.isArray(arr)) arr = [arr];
      if (arr.length === 0) throw new Error('No data found in JSON');
      
      setHeaders(Object.keys(arr[0]));
      setLocalJsonData(arr.slice(0, maxRows));
      setShowData(true);
      toast({ title: 'JSON Loaded', description: `Loaded ${arr.length} rows` });
    } catch (err: any) {
      console.error('JSON fetch error:', err);
      setError(err.message);
      toast({ title: 'Error Loading JSON', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (jsonData) {
      // Download JSON data from database
      const dataStr = JSON.stringify(jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leads.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Download Started', description: 'JSON file download has started' });
    } else if (jsonUrl) {
      // Download from URL
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = 'leads.json';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: 'Download Started', description: 'JSON file download has started' });
    }
  };



  const totalPages = Math.ceil(localJsonData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = localJsonData.slice(startIndex, endIndex);

  // Show data source indicator
  const dataSource = jsonData ? 'Database' : (jsonUrl ? 'URL' : 'None');
  const hasData = jsonData || localJsonData.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {title}
            {localJsonData.length > 0 && (
              <Badge variant="secondary">{localJsonData.length} rows</Badge>
            )}
            <Badge variant="outline">{dataSource}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {hasData && (
              <>
                <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'json' : 'table')}>
                  {viewMode === 'table' ? 'Raw JSON' : 'Table View'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowData(!showData)}>
                  {showData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showData ? 'Hide' : 'Show'} Data
                </Button>
                <Button variant="outline" size="sm" onClick={downloadJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            {jsonUrl && !jsonData && (
              <Button onClick={fetchJSONData} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileJson className="h-4 w-4 mr-2" />}
                Load JSON
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading JSON data...</p>
          </div>
        )}
        {localJsonData.length > 0 && showData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                <p className="text-2xl font-bold text-blue-700">{localJsonData.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Columns</p>
                <p className="text-2xl font-bold text-green-700">{headers.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Current Page</p>
                <p className="text-2xl font-bold text-purple-700">{currentPage} / {totalPages}</p>
              </div>
            </div>
            {viewMode === 'table' ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {headers.map((header, idx) => (
                            <TableHead key={idx} className="bg-gray-50 font-semibold">{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRows.map((row, rowIdx) => (
                          <TableRow key={rowIdx} className="hover:bg-gray-50">
                            {headers.map((header, cellIdx) => (
                              <TableCell key={cellIdx} className="max-w-xs truncate">
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, localJsonData.length)} of {localJsonData.length} rows
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-semibold">Raw JSON Data</h3>
                </div>
                <div className="overflow-auto max-h-96">
                  <pre className="p-4 text-sm bg-gray-900 text-green-400">
                    {JSON.stringify(localJsonData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button onClick={downloadJSON} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>
        )}
        {localJsonData.length > 0 && !showData && (
          <div className="text-center py-8 text-gray-500">
            <FileJson className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Show Data" to view the JSON content</p>
          </div>
        )}
        {!hasData && !loading && (
          <div className="text-center py-8 text-gray-500">
            <FileJson className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No JSON data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JSONViewer;
