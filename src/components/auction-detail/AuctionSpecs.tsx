import { Fuel, Gauge, Settings2, Calendar } from 'lucide-react';

interface AuctionSpecsProps {
  fuelType: string;
  transmission: string;
  mileage: number;
  year: number;
}

export default function AuctionSpecs({ fuelType, transmission, mileage, year }: AuctionSpecsProps) {
  const specs = [
    { icon: Fuel, label: 'Fuel', value: fuelType },
    { icon: Settings2, label: 'Transmission', value: transmission },
    { icon: Gauge, label: 'Mileage', value: `${Number(mileage).toLocaleString()} km` },
    { icon: Calendar, label: 'Year', value: String(year) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-card"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <spec.icon className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <p className="text-sm font-semibold text-foreground">{spec.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
