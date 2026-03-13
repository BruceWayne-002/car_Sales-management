import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CarInsights() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold">Car Insights</h1>
            <p className="mt-2 text-muted-foreground">Understand ownership patterns, market demand, and resale confidence</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-muted">
                <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                  <rect x="8" y="40" width="10" height="16" rx="2" className="fill-foreground/10" />
                  <rect x="26" y="32" width="10" height="24" rx="2" className="fill-foreground/10" />
                  <rect x="44" y="24" width="10" height="32" rx="2" className="fill-foreground/10" />
                  <path d="M10 38 C20 30, 28 28, 36 26 S 54 20, 58 18" className="stroke-muted-foreground" fill="none" strokeWidth="2" />
                </svg>
              </div>
              <p className="mb-6 text-muted-foreground">Upload a car or use Price Checker to view insights</p>
              <Button asChild size="lg" className="bg-gradient-brand shadow-brand">
                <Link to="/price-checker">Go to Price Checker</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
