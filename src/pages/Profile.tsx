import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
      if (data) setFullName(data.full_name);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Profile updated!' }); }
  };

  if (loading) {
    return (<><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div></>);
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Profile</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-4">
              <div><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input value={user?.email || ''} disabled className="mt-1" /></div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-brand shadow-brand">{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
