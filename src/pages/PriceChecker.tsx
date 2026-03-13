import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, TrendingDown, BarChart3, ArrowRight, ShieldCheck, ChevronRight, Gauge, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { calculateValuation, type Condition, type ValuationResult } from '@/lib/indian-valuation';
import { formatINR } from '@/lib/format-inr';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'iMT'];
const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' },
];

export default function PriceChecker() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuel_type: '',
    transmission: '',
    condition: '' as Condition | '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', variant: 'destructive' });
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.condition) {
      toast({ title: 'Please select vehicle condition', variant: 'destructive' });
      return;
    }

    setIsCalculating(true);
    setResult(null);

    // Simulate processing delay for premium feel
    await new Promise((r) => setTimeout(r, 1200));

    const r = calculateValuation({
      brand: form.brand,
      model: form.model,
      year: form.year,
      mileage: form.mileage,
      fuelType: form.fuel_type,
      transmission: form.transmission,
      condition: form.condition as Condition,
      hasImage: !!imagePreview,
    });

    setResult(r);
    setIsCalculating(false);
  };

  const updateForm = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const confidenceColor = (c: string) => {
    if (c === 'High') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400';
    if (c === 'Medium') return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400';
    return 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400';
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Gauge className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Car Price Checker</h1>
            <p className="mt-2 text-muted-foreground">
              Get an accurate market valuation for any car in India
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* LEFT — Form */}
            <form
              onSubmit={handleCalculate}
              className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              {/* Image upload */}
              <div>
                <Label className="text-sm font-medium">Car Photo</Label>
                {imagePreview ? (
                  <div className="relative mt-2 overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Car" className="h-48 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute right-2 top-2 rounded-full bg-foreground/70 p-1 text-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 py-10 transition-colors hover:border-primary/50">
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload car image</span>
                    <span className="mt-1 text-xs text-muted-foreground/60">Improves confidence score</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">Brand *</Label>
                  <Input value={form.brand} onChange={(e) => updateForm('brand', e.target.value)} placeholder="e.g. Tata" required className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Model *</Label>
                  <Input value={form.model} onChange={(e) => updateForm('model', e.target.value)} placeholder="e.g. Nexon" required className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Year *</Label>
                  <Input type="number" value={form.year} onChange={(e) => updateForm('year', parseInt(e.target.value))} min={1990} max={2030} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Mileage (km) *</Label>
                  <Input type="number" value={form.mileage} onChange={(e) => updateForm('mileage', parseInt(e.target.value) || 0)} min={0} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Fuel Type *</Label>
                  <Select value={form.fuel_type} onValueChange={(v) => updateForm('fuel_type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Transmission *</Label>
                  <Select value={form.transmission} onValueChange={(v) => updateForm('transmission', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <Label className="text-sm">Vehicle Condition *</Label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => updateForm('condition', c.value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        form.condition === c.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!form.fuel_type || !form.transmission || !form.condition || isCalculating}
              >
                {isCalculating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Calculating...
                  </span>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" /> Get Valuation
                  </>
                )}
              </Button>
            </form>

            {/* RIGHT — Result */}
            <AnimatePresence mode="wait">
              {isCalculating ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <Skeleton className="mb-4 h-6 w-48" />
                    <Skeleton className="mb-3 h-12 w-56" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <Skeleton className="mb-4 h-6 w-44" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="mb-3 h-10 w-full" />
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Price card */}
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <h2 className="mb-1 font-display text-lg font-semibold text-muted-foreground">
                      Estimated Market Value
                    </h2>
                    <div className="mb-3">
                      <span className="font-display text-4xl font-bold text-primary">
                        {formatINR(result.estimatedPrice)}
                      </span>
                    </div>

                    {/* Range bar */}
                    <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="whitespace-nowrap font-medium">{formatINR(result.lowPrice)}</span>
                      <div className="relative h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
                          style={{ width: `${result.confidenceScore}%` }}
                        />
                      </div>
                      <span className="whitespace-nowrap font-medium">{formatINR(result.highPrice)}</span>
                    </div>

                    {/* Confidence */}
                    <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${confidenceColor(result.confidence)}`}>
                      <ShieldCheck className="h-4 w-4" />
                      {result.confidence} Confidence · {result.confidenceScore}%
                    </div>

                    {!result.modelMatched && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        Exact model not found in database. Using brand-average pricing. Actual value may vary.
                      </div>
                    )}
                  </div>

                  {/* Breakdown */}
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                      <TrendingDown className="h-5 w-5 text-primary" /> Calculation Breakdown
                    </h3>
                    <div className="space-y-3">
                      {result.breakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                          <span
                            className={`font-mono text-sm font-semibold ${
                              item.value > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : item.value < 0
                                ? 'text-destructive'
                                : 'text-foreground'
                            }`}
                          >
                            {item.value > 0 ? '+' : ''}
                            {formatINR(Math.abs(item.value))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  {user && (
                    <Button
                      onClick={() => navigate('/create-auction')}
                      className="w-full"
                      variant="outline"
                      size="lg"
                    >
                      List This Car in Auction <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center"
                >
                  <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <h3 className="font-display text-lg font-semibold">Price Estimate</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out the form to get an accurate Indian market valuation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
