import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVViewerProps {
  csvUrl: string;
  title?: string;
}

const CSVViewer: React.FC<CSVViewerProps> = ({ csvUrl, title = "Lead Data" }) => {
  const { toast } = useToast();

  const downloadCSV = () => {
    if (!csvUrl) return;
    
    const link = document.createElement('a');
    link.href = csvUrl;
    link.download = 'leads.csv';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "CSV file download has started",
    });
  };



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-3">
          <Button onClick={downloadCSV} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Leads
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVViewer; 