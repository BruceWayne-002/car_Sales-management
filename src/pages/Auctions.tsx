import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuctionCard from '@/components/AuctionCard';
import { motion } from 'framer-motion';
import { Gavel, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';

interface Auction {
  id: string; brand: string; model: string; year: number; image_url: string;
  base_price: number; end_time: string; seller_id: string;
  profiles: { full_name: string } | null;
}

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bidData, setBidData] = useState<Record<string, { highest: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAuctions = async () => {
    const { data } = await supabase
      .from('auctions')
      .select('*, profiles!auctions_seller_id_fkey(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setAuctions(data as any);
      const bids: Record<string, { highest: number; count: number }> = {};
      for (const a of data) {
        const { data: bidRows } = await supabase
          .from('bids').select('amount').eq('auction_id', a.id).order('amount', { ascending: false });
        bids[a.id] = { highest: bidRows?.[0]?.amount ?? 0, count: bidRows?.length ?? 0 };
      }
      setBidData(bids);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuctions();
    const channel = supabase.channel('auctions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchAuctions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => fetchAuctions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Live Auctions</h1>
            <p className="mt-1 text-muted-foreground">Browse and bid on premium vehicles</p>
          </div>
          {user && (
            <Button onClick={() => navigate('/create-auction')} className="bg-gradient-brand shadow-brand">
              <Plus className="mr-2 h-4 w-4" /> Create Auction
            </Button>
          )}
        </div>

        {auctions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20">
            <Gavel className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">No live auctions right now</h2>
            <p className="mt-1 text-muted-foreground">Be the first to create one</p>
            {user && (
              <Button onClick={() => navigate('/create-auction')} className="mt-4 bg-gradient-brand shadow-brand">Create Auction</Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} id={auction.id} brand={auction.brand} model={auction.model}
                year={auction.year} imageUrl={auction.image_url} basePrice={Number(auction.base_price)}
                highestBid={bidData[auction.id]?.highest ?? 0} bidCount={bidData[auction.id]?.count ?? 0}
                endTime={auction.end_time} sellerName={auction.profiles?.full_name || 'Seller'} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
