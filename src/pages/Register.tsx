import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) { toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Check your email', description: 'We sent you a confirmation link.' }); navigate('/login'); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-8 w-8 text-primary" />
            BABU<span className="text-gradient-brand">Vault</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Create your account</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Full Name</Label><Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="mt-1" /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1" /></div>
            <Button type="submit" className="w-full bg-gradient-brand shadow-brand" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
