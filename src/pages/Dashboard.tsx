import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Gavel, Trophy, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/format-inr';

export default function Dashboard() {
  const { user } = useAuth();
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [auctionsRes, wonRes, bidsRes] = await Promise.all([
        supabase.from('auctions').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('auctions').select('*').eq('winner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bids').select('*, auctions(brand, model, year, status, end_time, winner_id)').eq('bidder_id', user.id).order('created_at', { ascending: false }),
      ]);
      setMyAuctions(auctionsRes.data || []);
      setWonAuctions(wonRes.data || []);
      setMyBids(bidsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: 'My Auctions', value: myAuctions.length, icon: Gavel, color: 'text-primary' },
    { label: 'Auctions Won', value: wonAuctions.length, icon: Trophy, color: 'text-success' },
    { label: 'Active Bids', value: myBids.filter((b) => b.auctions?.status === 'active').length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Bids', value: myBids.length, icon: Clock, color: 'text-muted-foreground' },
  ];

  const getAuctionStatus = (auction: any) => {
    if (auction.status === 'ended') {
      if (auction.winner_id === user?.id) return { label: 'Won', variant: 'default' as const };
      return { label: 'Lost', variant: 'destructive' as const };
    }
    if (new Date(auction.end_time) <= new Date()) return { label: 'Ended', variant: 'secondary' as const };
    return { label: 'Active', variant: 'outline' as const };
  };

  if (loading) {
    return (
      <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div></>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-6 font-display text-3xl font-bold">Dashboard</h1>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-display text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-xl font-semibold">My Auctions</h2>
            {myAuctions.length === 0 ? (
              <p className="text-muted-foreground">You haven't created any auctions yet.</p>
            ) : (
              <div className="space-y-3">
                {myAuctions.map((a) => (
                  <Link key={a.id} to={`/auctions/${a.id}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-surface-hover">
                    <div className="flex items-center gap-4">
                      <img src={a.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{a.year} {a.brand} {a.model}</p>
                        <p className="text-sm text-muted-foreground">Base: {formatINR(Number(a.base_price))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={a.status === 'active' ? 'outline' : 'secondary'}>{a.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">My Bids</h2>
            {myBids.length === 0 ? (
              <p className="text-muted-foreground">You haven't placed any bids yet.</p>
            ) : (
              <div className="space-y-3">
                {[...new Map(myBids.map((b) => [b.auction_id, b])).values()].map((bid) => {
                  const status = bid.auctions ? getAuctionStatus(bid.auctions) : { label: 'Unknown', variant: 'secondary' as const };
                  return (
                    <Link key={bid.auction_id} to={`/auctions/${bid.auction_id}`} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-surface-hover">
                      <div>
                        <p className="font-medium">{bid.auctions?.year} {bid.auctions?.brand} {bid.auctions?.model}</p>
                        <p className="text-sm text-muted-foreground">Your bid: {formatINR(Number(bid.amount))}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </>
  );
}
