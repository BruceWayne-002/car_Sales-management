import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gavel, Calculator, Shield, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const features = [
  { icon: Gavel, title: 'Live Auctions', description: 'Create and bid on real car auctions with live countdown timers and instant bid updates.' },
  { icon: Calculator, title: 'AI Price Checker', description: 'Get intelligent price estimates powered by Indian market depreciation models.' },
  { icon: Shield, title: 'Secure & Verified', description: 'Every auction is backed by real data. No fakes, no placeholders, just real cars.' },
];

export default function Index() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.08),transparent_60%)]" />
          <div className="container relative mx-auto px-4 py-24 text-center lg:py-36">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-brand" />
                Live auctions happening now
              </div>
              <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                India's Premium Car
                <br />
                <span className="text-gradient-brand">Auction Platform</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                Buy and sell cars through transparent, real-time auctions. Powered by intelligent pricing and a trusted community.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-brand shadow-brand text-base">
                  <Link to="/auctions">Browse Auctions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/price-checker">Check Car Price</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border bg-card py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="rounded-2xl border border-border bg-background p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
