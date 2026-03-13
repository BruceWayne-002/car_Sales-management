import { motion } from 'framer-motion';
import { useState } from 'react';

interface AuctionImageProps {
  imageUrl: string;
  brand: string;
  model: string;
}

export default function AuctionImage({ imageUrl, brand, model }: AuctionImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border shadow-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.img
        src={imageUrl}
        alt={`${brand} ${model}`}
        className="h-full min-h-[400px] w-full object-cover lg:min-h-[520px]"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-card-foreground backdrop-blur-sm">
          {brand} {model}
        </span>
      </div>
    </motion.div>
  );
}
