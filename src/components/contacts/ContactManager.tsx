import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Phone, 
  Building,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Import,
  FileDown,
  Tag,
  Target
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactList = Database['public']['Tables']['contact_lists']['Row'];

interface ContactManagerProps {
  listId?: string;
  onContactSelect?: (contact: Contact) => void;
}

interface ImportedContact {
  email: string;
  first_name?: string;
  last_name?: string;
  custom_fields?: Record<string, any>;
  status: 'valid' | 'invalid' | 'duplicate';
  error?: string;
}

const ContactManager: React.FC<ContactManagerProps> = ({
  listId,
  onContactSelect
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [currentList, setCurrentList] = useState<ContactList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContactLists();
    if (listId) {
      loadContacts(listId);
    }
  }, [listId]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery, statusFilter]);

  const loadContactLists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setContactLists(data || []);

      if (listId) {
        const currentList = data?.find(list => list.id === listId);
        setCurrentList(currentList || null);
      }
    } catch (error) {
      console.error('Error loading contact lists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact lists',
        variant: 'destructive',
      });
    }
  };

  const loadContacts = async (listId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const contacts: ImportedContact[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const contact: ImportedContact = {
        email: values[headers.indexOf('email')] || '',
        first_name: values[headers.indexOf('first_name')] || '',
        last_name: values[headers.indexOf('last_name')] || '',
        custom_fields: {},
        status: 'valid'
      };

      // Add custom fields
      headers.forEach((header, index) => {
        if (!['email', 'first_name', 'last_name'].includes(header)) {
          contact.custom_fields![header] = values[index] || '';
        }
      });

      // Validate email
      if (!contact.email || !isValidEmail(contact.email)) {
        contact.status = 'invalid';
        contact.error = 'Invalid email address';
      } else if (contacts.some(c => c.email === contact.email)) {
        contact.status = 'duplicate';
        contact.error = 'Email already exists';
      }

      contacts.push(contact);
    }

    setImportedContacts(contacts);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleImportContacts = async () => {
    if (!listId) return;

    try {
      setImportProgress(0);
      const validContacts = importedContacts.filter(c => c.status === 'valid');
      
      for (let i = 0; i < validContacts.length; i++) {
        const contact = validContacts[i];
        
        const { error } = await supabase
          .from('contacts')
          .insert({
            list_id: listId,
            email: contact.email,
            first_name: contact.first_name,
            last_name: contact.last_name,
            custom_fields: contact.custom_fields,
            status: 'active'
          });

        if (error) {
          console.error('Error importing contact:', error);
        }

        setImportProgress(((i + 1) / validContacts.length) * 100);
      }

      toast({
        title: 'Success',
        description: `Imported ${validContacts.length} contacts successfully`,
      });

      setShowImportDialog(false);
      setImportedContacts([]);
      loadContacts(listId);
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to import contacts',
        variant: 'destructive',
      });
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    if (!listId) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          list_id: listId,
          email: contactData.email!,
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          custom_fields: contactData.custom_fields || {},
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Contact added successfully',
      });

      setShowAddDialog(false);
      loadContacts(listId);
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contact',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContacts = async () => {
    if (!selectedContacts.length) return;

    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', selectedContacts);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${selectedContacts.length} contacts deleted successfully`,
      });

      setSelectedContacts([]);
      loadContacts(listId!);
    } catch (error) {
      console.error('Error deleting contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contacts',
        variant: 'destructive',
      });
    }
  };

  const handleExportContacts = () => {
    const csvContent = generateCSV(contacts);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${currentList?.name || 'export'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (contacts: Contact[]): string => {
    const headers = ['email', 'first_name', 'last_name', 'status', 'created_at'];
    const rows = contacts.map(contact => [
      contact.email,
      contact.first_name || '',
      contact.last_name || '',
      contact.status,
      contact.created_at
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unsubscribed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'unsubscribed':
        return <Badge variant="destructive">Unsubscribed</Badge>;
      case 'bounced':
        return <Badge variant="secondary">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">
            {currentList ? `Managing contacts in "${currentList.name}"` : 'Select a contact list to manage'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportContacts}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Import className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedContacts.length} contacts selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteContacts}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>
            {filteredContacts.length} of {contacts.length} contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first contact to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {contact.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.first_name || contact.last_name ? (
                        <div>
                          {contact.first_name} {contact.last_name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No name</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onContactSelect?.(contact)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteContacts()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV file with your contacts. The file should include columns for email, first_name, and last_name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importedContacts.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valid: {importedContacts.filter(c => c.status === 'valid').length}</span>
                  <span>Invalid: {importedContacts.filter(c => c.status === 'invalid').length}</span>
                  <span>Duplicate: {importedContacts.filter(c => c.status === 'duplicate').length}</span>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded">
                  {importedContacts.map((contact, index) => (
                    <div
                      key={index}
                      className={`p-2 border-b last:border-b-0 ${
                        contact.status === 'valid' ? 'bg-green-50' :
                        contact.status === 'invalid' ? 'bg-red-50' :
                        'bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{contact.email}</span>
                        <Badge variant={
                          contact.status === 'valid' ? 'default' :
                          contact.status === 'invalid' ? 'destructive' :
                          'secondary'
                        }>
                          {contact.status}
                        </Badge>
                      </div>
                      {contact.error && (
                        <p className="text-xs text-red-600 mt-1">{contact.error}</p>
                      )}
                    </div>
                  ))}
                </div>

                {importProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing...</span>
                      <span>{Math.round(importProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleImportContacts}
                    disabled={importedContacts.filter(c => c.status === 'valid').length === 0}
                    className="flex-1"
                  >
                    Import Valid Contacts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your list.
            </DialogDescription>
          </DialogHeader>

          <AddContactForm
            onSubmit={handleAddContact}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Contact Form Component
interface AddContactFormProps {
  onSubmit: (contact: Partial<Contact>) => void;
  onCancel: () => void;
}

const AddContactForm: React.FC<AddContactFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    custom_fields: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Add Contact
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ContactManager; 