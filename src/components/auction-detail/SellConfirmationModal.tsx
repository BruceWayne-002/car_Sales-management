import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { formatINR } from '@/lib/format-inr';

interface SellConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carTitle: string;
  buyerName: string;
  finalPrice: number;
  endTime: string;
  onConfirm: () => void;
  confirming: boolean;
}

export default function SellConfirmationModal({
  open, onOpenChange, carTitle, buyerName, finalPrice, endTime, onConfirm, confirming,
}: SellConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Confirm Sale</DialogTitle>
          <DialogDescription className="text-muted-foreground">You are about to sell</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
            <p className="font-display text-lg font-bold text-foreground">{carTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              to <span className="font-semibold text-foreground">{buyerName}</span> for{' '}
              <span className="font-bold text-primary">{formatINR(finalPrice)}</span>
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buyer</span>
              <span className="font-medium text-foreground">{buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final Price</span>
              <span className="font-bold text-primary">{formatINR(finalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auction Ends</span>
              <span className="font-medium text-foreground">{new Date(endTime).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">This action is irreversible. Once confirmed, the auction will be marked as sold.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>Cancel</Button>
          <Button onClick={onConfirm} disabled={confirming} className="bg-gradient-brand shadow-brand">
            {confirming ? 'Processing...' : 'Confirm Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
