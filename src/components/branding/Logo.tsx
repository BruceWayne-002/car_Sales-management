interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bv-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#bv-grad)" opacity="0.15" />
      <path
        d="M8 6h5.2c2.2 0 3.8 1.4 3.8 3.3 0 1.4-.9 2.5-2.2 3 .9.5 1.5 1.4 1.5 2.6 0 2-1.7 3.5-4.1 3.5H8V6zm3.9 5.3c1.2 0 2-.7 2-1.7s-.8-1.6-2-1.6H10v3.3h1.9zm.2 5c1.4 0 2.3-.7 2.3-1.9s-.9-1.9-2.3-1.9H10v3.8h2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

