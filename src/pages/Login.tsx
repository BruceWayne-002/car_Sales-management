import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' }); }
    else { navigate('/dashboard'); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-8 w-8 text-primary" />
            BABU<span className="text-gradient-brand">Vault</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required className="mt-1" /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1" /></div>
            <Button type="submit" className="w-full bg-gradient-brand shadow-brand" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
