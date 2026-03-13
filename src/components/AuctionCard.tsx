import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Gavel, User } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { formatINR } from '@/lib/format-inr';

interface AuctionCardProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  imageUrl: string;
  basePrice: number;
  highestBid: number;
  bidCount: number;
  endTime: string;
  sellerName: string;
}

export default function AuctionCard({
  id, brand, model, year, imageUrl, basePrice, highestBid, bidCount, endTime, sellerName,
}: AuctionCardProps) {
  const { timeLeft, isExpired } = useCountdown(endTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/auctions/${id}`} className="group block">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={imageUrl}
              alt={`${brand} ${model}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="font-display text-lg font-bold text-white">{year} {brand}</p>
                <p className="text-sm font-medium text-white/80">{model}</p>
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isExpired ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
                <Clock className="h-3 w-3" />
                {isExpired ? 'Ended' : timeLeft}
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {highestBid > 0 ? 'Current Bid' : 'Starting Price'}
                </p>
                <p className="font-display text-xl font-bold text-foreground">
                  {formatINR(highestBid > 0 ? highestBid : basePrice)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1 text-xs">
                  <Gavel className="h-3.5 w-3.5" /> {bidCount}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <User className="h-3.5 w-3.5" /> {sellerName || 'Seller'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
