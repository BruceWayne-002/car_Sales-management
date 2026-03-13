import { Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/format-inr';

interface BidStatusCardProps {
  highestBid: number;
  basePrice: number;
  bidsCount: number;
  timeLeft: string;
  isExpired: boolean;
  auctionStatus: string;
  isOwner: boolean;
  isWinner: boolean;
  winnerName?: string;
  winningBid?: number;
  user: any;
  bidAmount: string;
  minBid: number;
  bidding: boolean;
  onBidAmountChange: (val: string) => void;
  onPlaceBid: () => void;
  onAcceptHighestBid: () => void;
}

export default function BidStatusCard({
  highestBid, basePrice, bidsCount, timeLeft, isExpired, auctionStatus,
  isOwner, isWinner, winnerName, winningBid, user, bidAmount, minBid, bidding,
  onBidAmountChange, onPlaceBid, onAcceptHighestBid,
}: BidStatusCardProps) {
  const isSold = auctionStatus === 'sold';
  const isEnded = auctionStatus === 'ended' || isExpired;
  const isActive = auctionStatus === 'active' && !isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      {/* Header */}
      <div className={`px-5 py-3 ${isSold ? 'bg-success' : isEnded ? 'bg-muted' : 'bg-gradient-brand'}`}>
        <p className={`text-sm font-semibold ${isSold ? 'text-success-foreground' : isEnded ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
          {isSold ? '✅ Sale Complete' : isEnded ? 'Auction Ended' : 'Live Auction'}
        </p>
      </div>

      <div className="space-y-4 p-5">
        {/* Price */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isSold ? 'Sold For' : highestBid > 0 ? 'Current Highest Bid' : 'Starting Price'}
          </p>
          <p className="font-display text-4xl font-bold text-primary">
            {formatINR(isSold && winningBid ? winningBid : highestBid > 0 ? highestBid : basePrice)}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{bidsCount} {bidsCount === 1 ? 'bid' : 'bids'}</span>
          <span className="text-border">•</span>
          <span>{isEnded || isSold ? 'Ended' : `Ends in ${timeLeft}`}</span>
        </div>

        {/* SOLD */}
        {isSold && winnerName && (
          <div className="rounded-xl border border-success/20 bg-success/5 p-4">
            <p className="text-sm font-semibold text-foreground">✔ Sold to {winnerName}</p>
            {winningBid && (
              <p className="mt-1 text-xs text-muted-foreground">Final price: {formatINR(Number(winningBid))}</p>
            )}
          </div>
        )}

        {/* Winner */}
        {isWinner && isEnded && !isSold && (
          <div className="rounded-xl border border-primary/20 bg-accent p-4">
            <p className="text-sm font-semibold text-accent-foreground">🏆 You won this auction!</p>
          </div>
        )}

        {/* Owner CTA */}
        {isOwner && isActive && highestBid > 0 && (
          <Button onClick={onAcceptHighestBid} className="w-full bg-gradient-brand shadow-brand text-base font-semibold" size="lg">
            Accept Highest Bid — {formatINR(highestBid)}
          </Button>
        )}

        {isOwner && isActive && highestBid === 0 && (
          <p className="text-center text-sm text-muted-foreground">No bids yet. Waiting for bidders...</p>
        )}

        {isOwner && !isActive && !isSold && (
          <p className="text-center text-sm text-muted-foreground">This auction has ended.</p>
        )}

        {/* Bidder CTA */}
        {!isOwner && isActive && user && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Min ${formatINR(minBid)}`}
              value={bidAmount}
              onChange={(e) => onBidAmountChange(e.target.value)}
              min={minBid}
              className="text-base"
            />
            <Button onClick={onPlaceBid} disabled={bidding} className="bg-gradient-brand shadow-brand whitespace-nowrap" size="lg">
              <Gavel className="mr-2 h-4 w-4" />
              {bidding ? 'Placing...' : 'Place Bid'}
            </Button>
          </div>
        )}

        {!user && isActive && (
          <p className="text-center text-sm text-muted-foreground">Sign in to place a bid.</p>
        )}
      </div>
    </motion.div>
  );
}
