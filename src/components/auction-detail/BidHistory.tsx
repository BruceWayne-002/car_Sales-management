import { Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/format-inr';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  bidder_id: string;
  profiles: { full_name: string } | null;
}

interface BidHistoryProps {
  bids: Bid[];
}

export default function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
        Bid History ({bids.length})
      </h2>
      <div className="space-y-2">
        {bids.map((bid, i) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center justify-between rounded-xl border p-3 transition-shadow hover:shadow-sm ${
              i === 0
                ? 'border-primary/30 bg-accent shadow-sm'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                i === 0 ? 'bg-primary/20' : 'bg-muted'
              }`}>
                {i === 0 ? (
                  <Trophy className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${i === 0 ? 'text-accent-foreground' : 'text-foreground'}`}>
                  {bid.profiles?.full_name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(bid.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p className={`text-base font-bold ${i === 0 ? 'text-primary' : 'text-foreground'}`}>
              {formatINR(Number(bid.amount))}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
