import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useCountdown } from '@/hooks/useCountdown';
import { formatINR } from '@/lib/format-inr';
import Navbar from '@/components/Navbar';
import AuctionImage from '@/components/auction-detail/AuctionImage';
import AuctionSpecs from '@/components/auction-detail/AuctionSpecs';
import BidStatusCard from '@/components/auction-detail/BidStatusCard';
import BidHistory from '@/components/auction-detail/BidHistory';
import SellConfirmationModal from '@/components/auction-detail/SellConfirmationModal';
import { motion } from 'framer-motion';
import { Clock, Shield, User } from 'lucide-react';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  bidder_id: string;
  profiles: { full_name: string } | null;
}

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    const { data: auctionData } = await supabase
      .from('auctions')
      .select('*, profiles!auctions_seller_id_fkey(full_name)')
      .eq('id', id)
      .single();

    const { data: bidData } = await supabase
      .from('bids')
      .select('*, profiles!bids_bidder_id_fkey(full_name)')
      .eq('auction_id', id)
      .order('amount', { ascending: false });

    if (auctionData) {
      if (auctionData.status === 'active' && new Date(auctionData.end_time) <= new Date()) {
        const highestBid = bidData?.[0];
        await supabase.from('auctions').update({
          status: 'ended',
          winner_id: highestBid?.bidder_id || null,
          winning_bid: highestBid?.amount || null,
        }).eq('id', id);
        setAuction({ ...auctionData, status: 'ended', winner_id: highestBid?.bidder_id, winning_bid: highestBid?.amount });
      } else {
        setAuction(auctionData);
      }
    }
    setBids((bidData as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel(`auction-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${id}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const { timeLeft, isExpired } = useCountdown(auction?.end_time || '');

  const highestBid = bids[0]?.amount || 0;
  const minBid = highestBid > 0 ? highestBid + 1 : Number(auction?.base_price || 0) + 1;
  const isOwner = user?.id === auction?.seller_id;
  const isWinner = user?.id === auction?.winner_id;
  const highestBidder = bids[0];

  const placeBid = async () => {
    if (!user || !id) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast({ title: 'Invalid bid', description: `Minimum bid is ${formatINR(minBid)}`, variant: 'destructive' });
      return;
    }
    setBidding(true);
    const { error } = await supabase.from('bids').insert({ auction_id: id, bidder_id: user.id, amount });
    setBidding(false);
    if (error) {
      toast({ title: 'Bid failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Bid placed!' });
      setBidAmount('');
    }
  };

  const confirmSale = async () => {
    if (!id || !highestBidder) return;
    setConfirming(true);
    const { error } = await supabase.from('auctions').update({
      status: 'sold', winner_id: highestBidder.bidder_id, winning_bid: highestBidder.amount,
    }).eq('id', id);
    setConfirming(false);
    setSellModalOpen(false);
    if (error) {
      toast({ title: 'Sale failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sale confirmed!', description: `Sold to ${highestBidder.profiles?.full_name || 'bidder'}` });
      fetchData();
    }
  };

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

  if (!auction) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Auction not found.</p>
        </div>
      </>
    );
  }

  const carTitle = `${auction.year} ${auction.brand} ${auction.model}`;
  const winnerName = bids.find(b => b.bidder_id === auction.winner_id)?.profiles?.full_name || 'Buyer';

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <AuctionImage imageUrl={auction.image_url} brand={auction.brand} model={auction.model} />
            {auction.description && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h2 className="mb-2 font-display text-lg font-semibold text-foreground">About this car</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{auction.description}</p>
              </motion.div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-5">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{carTitle}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Listed by {auction.profiles?.full_name || 'Seller'}</span>
                <Shield className="ml-1 h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Verified</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
              auction.status === 'sold' ? 'bg-success/10 text-success'
                : auction.status === 'ended' || isExpired ? 'bg-destructive/10 text-destructive'
                  : 'bg-accent text-accent-foreground'
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {auction.status === 'sold' ? 'SOLD' : isExpired || auction.status === 'ended' ? 'Auction Ended' : timeLeft}
            </div>

            <AuctionSpecs fuelType={auction.fuel_type} transmission={auction.transmission} mileage={auction.mileage} year={auction.year} />
            <BidStatusCard highestBid={highestBid} basePrice={Number(auction.base_price)} bidsCount={bids.length}
              timeLeft={timeLeft} isExpired={isExpired} auctionStatus={auction.status} isOwner={isOwner}
              isWinner={isWinner} winnerName={winnerName} winningBid={auction.winning_bid} user={user}
              bidAmount={bidAmount} minBid={minBid} bidding={bidding} onBidAmountChange={setBidAmount}
              onPlaceBid={placeBid} onAcceptHighestBid={() => setSellModalOpen(true)} />
            <BidHistory bids={bids} />
          </motion.div>
        </div>
      </div>

      {highestBidder && (
        <SellConfirmationModal open={sellModalOpen} onOpenChange={setSellModalOpen} carTitle={carTitle}
          buyerName={highestBidder.profiles?.full_name || 'Bidder'} finalPrice={highestBidder.amount}
          endTime={auction.end_time} onConfirm={confirmSale} confirming={confirming} />
      )}
    </>
  );
}
