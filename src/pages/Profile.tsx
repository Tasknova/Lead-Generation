import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Lock, Unlock, Building2, User, Linkedin, Globe, Phone, CheckCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar, { ProfileContext } from '@/components/ui/navbar';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  position: string;
  linkedin_url?: string | null;
  website_url?: string | null;
  industry: string;
  phone: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");
        
        setUser(user);
        
        // Check if user is a Google OAuth user
        const isGoogle = user.app_metadata?.provider === 'google';
        setIsGoogleUser(isGoogle);
        
        // Check if user has a password set
        // Users with passwords have 'email' provider, Google users might have both
        const hasPasswordSet = user.app_metadata?.providers?.includes('email') || 
                              (!isGoogle && user.app_metadata?.provider === 'email');
        setHasPassword(hasPasswordSet);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(data);
        setAvatarUrl(data?.avatar_url || null);
        setFullName(data?.full_name || '');

        // Fetch business profile
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (businessError) {
          console.error('Error fetching business profile:', businessError);
        } else {
          setBusinessProfile(businessData as any);
        }

      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        toast({
          title: 'Failed to load profile',
          description: 'There was an error fetching your profile information.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // When opening the edit dialog, pre-fill fields with current values
  useEffect(() => {
    if (editOpen && profile) {
      setEditName(profile.full_name || '');
      setEditAvatarPreview(profile.avatar_url || '');
      setEditAvatar(null);
      setCurrentPassword('');
      setEditPassword('');
      setEditPasswordConfirm('');
    }
  }, [editOpen, profile]);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditProfile = async () => {
    setEditLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      const updates: { full_name: string; avatar_url?: string } = { full_name: editName };
      let newAvatarUrl = profile?.avatar_url || '';
      
      if (editAvatar) {
        const fileExt = editAvatar.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, editAvatar, { upsert: true });
        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw uploadError;
        }
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        newAvatarUrl = `${data.publicUrl}?t=${new Date().getTime()}`;
        updates.avatar_url = newAvatarUrl;
      }
      
      const { error: updateError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      // Update password if provided
      if (editPassword) {
        if (editPassword !== editPasswordConfirm) {
          throw new Error('New passwords do not match');
        }
        
        // Only ask for current password if user already has a password set
        if (hasPassword) {
          if (!currentPassword) {
            throw new Error('Current password is required to change password');
          }
          
          // Verify current password by attempting to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
          });
          
          if (signInError) {
            throw new Error('Current password is incorrect');
          }
        }
        
        // Update the password
        const { error: pwError } = await supabase.auth.updateUser({ password: editPassword });
        if (pwError) {
          console.error('Password update error:', pwError);
          throw pwError;
        }
      }
      
      // Update local state so UI reflects changes instantly
      setProfile(prev => prev ? { ...prev, full_name: editName, avatar_url: newAvatarUrl } : prev);
      setAvatarUrl(newAvatarUrl);
      setFullName(editName);
      toast({ title: 'Profile updated', description: 'Your profile has been updated.' });
      setEditOpen(false);
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      console.error('Edit Profile error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatar(file);
      setEditAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Could not load profile.</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileContext.Provider value={{ avatarUrl }}>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <Card className="w-full overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-primary to-primary-focus h-24" />
              <CardHeader className="text-center -mt-16">
                <Avatar className="w-28 h-28 mx-auto border-4 border-white shadow-md">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={fullName || ''} />
                  ) : (
                    <AvatarFallback className="text-3xl">
                      {getInitials(fullName || profile?.full_name || '')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-3xl font-bold mt-4">{fullName || profile?.full_name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{profile?.email}</CardDescription>
                <Button onClick={() => setEditOpen(true)} variant="secondary" size="sm" className="mt-4">Edit Profile</Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-500 mb-2">Email</h3>
                    <p className="text-gray-800">{profile?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-500 mb-2">Full Name</h3>
                    <p className="text-gray-800">{fullName || profile?.full_name || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-500 mb-2">Phone</h3>
                    <p className="text-gray-800">{profile?.phone || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-500 mb-2">Member Since</h3>
                    <p className="text-gray-800">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Profile Section */}
            {businessProfile && (
              <Card className="w-full overflow-hidden shadow-lg mt-6">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-2xl font-bold text-blue-900">Business Profile</CardTitle>
                  </div>
                  <CardDescription className="text-blue-700">
                    Your business information and professional details
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-500">Business Name</h3>
                      </div>
                      <p className="text-gray-800">{businessProfile.business_name}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-500">Position</h3>
                      </div>
                      <p className="text-gray-800">{businessProfile.position}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-500">Industry</h3>
                      </div>
                      <p className="text-gray-800">{businessProfile.industry}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-500">Phone</h3>
                        {businessProfile.phone_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-gray-800">{businessProfile.phone}</p>
                      {businessProfile.phone_verified && (
                        <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                      )}
                    </div>
                    
                    {businessProfile.linkedin_url && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Linkedin className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-500">LinkedIn</h3>
                        </div>
                        <a 
                          href={businessProfile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    
                    {businessProfile.website_url && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-500">Website</h3>
                        </div>
                        <a 
                          href={businessProfile.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Business profile created on {new Date(businessProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Business Profile Message */}
            {!businessProfile && (
              <Card className="w-full overflow-hidden shadow-lg mt-6">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-orange-600" />
                    <CardTitle className="text-2xl font-bold text-orange-900">Business Profile</CardTitle>
                  </div>
                  <CardDescription className="text-orange-700">
                    Complete your business profile to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You haven't completed your business profile yet. This helps us provide better lead generation services.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/onboarding'}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Complete Business Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar">Avatar</Label>
                    <Input 
                      id="avatar"
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                    {editAvatarPreview && (
                      <img 
                        src={editAvatarPreview} 
                        alt="Avatar Preview" 
                        className="w-16 h-16 rounded-full mt-2" 
                      />
                    )}
                  </div>
                  
                  {/* Password Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      {hasPassword ? (
                        <Lock className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-blue-500" />
                      )}
                      <Label className="text-sm font-medium">
                        {hasPassword ? 'Change Password' : 'Set Password'}
                      </Label>
                    </div>
                    
                    {!hasPassword && (
                      <p className="text-xs text-gray-500 mb-3">
                        {isGoogleUser 
                          ? 'Since you signed up with Google, you can set a password for your account.'
                          : 'You can set a password for your account.'
                        }
                      </p>
                    )}
                    
                    {hasPassword && (
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword"
                          type="password" 
                          value={currentPassword} 
                          onChange={e => setCurrentPassword(e.target.value)} 
                          placeholder="Enter your current password"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="newPassword">
                        {hasPassword ? 'New Password' : 'Password'}
                      </Label>
                      <Input 
                        id="newPassword"
                        type="password" 
                        value={editPassword} 
                        onChange={e => setEditPassword(e.target.value)} 
                        placeholder={hasPassword ? "Leave blank to keep current password" : "Set a new password"} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password" 
                        value={editPasswordConfirm} 
                        onChange={e => setEditPasswordConfirm(e.target.value)} 
                        placeholder="Confirm new password" 
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleEditProfile} disabled={editLoading} className="mt-4 w-full">
                  {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ProfileContext.Provider>
    </>
  );
};

export default ProfilePage; 