import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Trash2, Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MedicalDocument {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  file_data: string;
}

interface VaultSession {
  id: string;
  verified: boolean;
  expires_at: string;
}

const MedicalVault = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      checkVaultAccess();
    }
  }, [user]);

  const checkVaultAccess = async () => {
    try {
      // Check if there's an active verified session
      const { data: sessions } = await supabase
        .from('vault_sessions')
        .select('*')
        .eq('verified', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setIsVaultUnlocked(true);
        loadDocuments();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking vault access:', error);
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email found for user",
        variant: "destructive"
      });
      return;
    }

    try {
      const otpCode = Math.random().toString().slice(2, 8);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP session
      await supabase.from('vault_sessions').insert({
        user_id: user.id,
        otp_code: otpCode,
        email: user.email,
        expires_at: expiresAt.toISOString()
      });

      // Send OTP via edge function
      const { error } = await supabase.functions.invoke('send-vault-otp', {
        body: { email: user.email, otpCode }
      });

      if (error) throw error;

      setShowOtpDialog(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code"
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive"
      });
    }
  };

  const verifyOTP = async () => {
    try {
      const { data: session } = await supabase
        .from('vault_sessions')
        .select('*')
        .eq('otp_code', otpCode)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!session) {
        toast({
          title: "Invalid OTP",
          description: "The code is incorrect or expired",
          variant: "destructive"
        });
        return;
      }

      // Mark session as verified
      await supabase
        .from('vault_sessions')
        .update({ verified: true })
        .eq('id', session.id);

      setIsVaultUnlocked(true);
      setShowOtpDialog(false);
      setOtpCode('');
      loadDocuments();
      
      toast({
        title: "Vault Unlocked",
        description: "Welcome to your secure medical vault"
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive"
      });
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || uploading) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const { error } = await supabase.from('medical_documents').insert({
          user_id: user!.id,
          name: uploadFile.name,
          file_data: base64Data,
          file_type: uploadFile.type,
          file_size: uploadFile.size
        });

        if (error) throw error;

        toast({
          title: "Document Uploaded",
          description: "Your document has been securely stored"
        });

        setUploadDialogOpen(false);
        setUploadFile(null);
        loadDocuments();
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = (doc: MedicalDocument) => {
    const link = document.createElement('a');
    link.href = doc.file_data;
    link.download = doc.name;
    link.click();
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "Document has been permanently removed"
      });

      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isVaultUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">Medical Vault</CardTitle>
                <CardDescription>
                  Secure access to your medical documents. An OTP will be sent to your registered email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={sendOTP} className="w-full" size="lg">
                  <Lock className="h-4 w-4 mr-2" />
                  Request Access Code
                </Button>
              </CardContent>
            </Card>

            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Verification Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">6-Digit Code</Label>
                    <Input
                      id="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={verifyOTP} className="w-full">
                    Verify & Unlock Vault
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Medical Vault</h1>
          <p className="text-muted-foreground">Secure storage for your medical documents</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Medical Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
              <Button
                onClick={handleFileUpload}
                disabled={!uploadFile || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <Badge variant="outline">{doc.file_type}</Badge>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => downloadDocument(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteDocument(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalVault;