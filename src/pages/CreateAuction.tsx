import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'DCT'];

export default function CreateAuction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear(), fuel_type: '',
    transmission: '', mileage: 0, base_price: 0, description: '', duration_hours: 24,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'File too large', description: 'Maximum 5MB allowed.', variant: 'destructive' }); return; }
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file', description: 'Only images are allowed.', variant: 'destructive' }); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !user) return;
    setLoading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('car-images').upload(path, imageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(path);
      const endTime = new Date(Date.now() + form.duration_hours * 3600000).toISOString();
      const { error } = await supabase.from('auctions').insert({
        seller_id: user.id, brand: form.brand.trim(), model: form.model.trim(), year: form.year,
        fuel_type: form.fuel_type, transmission: form.transmission, mileage: form.mileage,
        base_price: form.base_price, description: form.description.trim(), image_url: publicUrl, end_time: endTime,
      });
      if (error) throw error;
      toast({ title: 'Auction created!' });
      navigate('/auctions');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-6 font-display text-3xl font-bold">Create Auction</h1>
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card">
            <div>
              <Label>Car Image *</Label>
              {imagePreview ? (
                <div className="relative mt-2 overflow-hidden rounded-xl">
                  <img src={imagePreview} alt="Preview" className="h-64 w-full object-cover" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1 text-background hover:bg-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted py-12 transition-colors hover:border-primary">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload (max 5MB)</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Brand *</Label><Input value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} placeholder="Toyota" required className="mt-1" /></div>
              <div><Label>Model *</Label><Input value={form.model} onChange={(e) => updateForm('model', e.target.value)} placeholder="Supra" required className="mt-1" /></div>
              <div><Label>Year *</Label><Input type="number" value={form.year} onChange={(e) => updateForm('year', parseInt(e.target.value))} min={1900} max={2030} required className="mt-1" /></div>
              <div><Label>Fuel Type *</Label><Select value={form.fuel_type} onValueChange={(v) => updateForm('fuel_type', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Transmission *</Label><Select value={form.transmission} onValueChange={(v) => updateForm('transmission', v)}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Mileage (km) *</Label><Input type="number" value={form.mileage} onChange={(e) => updateForm('mileage', parseInt(e.target.value))} min={0} required className="mt-1" /></div>
              <div><Label>Base Price (₹) *</Label><Input type="number" value={form.base_price} onChange={(e) => updateForm('base_price', parseFloat(e.target.value))} min={1} required className="mt-1" /></div>
              <div><Label>Duration (hours) *</Label><Input type="number" value={form.duration_hours} onChange={(e) => updateForm('duration_hours', parseInt(e.target.value))} min={1} max={168} required className="mt-1" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Describe the car's condition, history, features..." rows={4} className="mt-1" /></div>
            <Button type="submit" className="w-full bg-gradient-brand shadow-brand" disabled={loading || !imageFile || !form.fuel_type || !form.transmission}>
              {loading ? 'Creating...' : 'Create Auction'}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
