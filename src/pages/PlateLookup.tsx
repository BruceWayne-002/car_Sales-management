import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type LookupResponse = {
  success: boolean;
  message?: string;
  plate_number?: string;
  vehicle?: {
    brand: string | null;
    model: string | null;
    year: number | null;
    state: string | null;
    rto_code: string | null;
  };
  owner_name?: string | null;
  owner_context?: string;
  verified?: boolean;
  data_type?: string;
  disclaimer?: string;
};

const INDIAN_PLATE_REGEX = /^(DL|MH|TN|KA|GJ|UP|RJ|HR|PB|WB|BR|AP|TS|MP|CG|OD|JK|HP|UA|UK|GA|KL|AS|TR|MN|MZ|NL|SK|AR|DN|DD|LD|PY|AN|CH|JT|JH)\d{1,2}[A-Z]{1,3}\d{4}$/i;

function normalizePlate(input: string) {
  return input.replace(/\s+/g, "").toUpperCase();
}

export default function PlateLookup() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResponse | null>(null);

  const lookup = async () => {
    setError(null);
    setResult(null);
    const normalized = normalizePlate(plate);
    if (!INDIAN_PLATE_REGEX.test(normalized)) {
      setError("Enter a valid Indian plate, e.g., MH01AB0001");
      return;
    }
    setLoading(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<LookupResponse>(
        "vehicle-plate-lookup",
        {
          body: { plate_number: normalized },
          headers: { "Content-Type": "application/json" },
        }
      );
      if (fnErr) {
        setError("We couldn’t retrieve vehicle info right now. Please try again later.");
      } else if (!data?.success) {
        setError(data?.message ?? "No public vehicle information found");
      } else {
        setResult(data);
      }
    } catch {
      setError("We couldn’t retrieve vehicle info right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const badge =
    result?.verified ? "Verified" :
    result?.data_type === "demo" ? "Demo Data" :
    result ? "Public Record" : undefined;

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center">
            <h1 className="font-display text-3xl font-bold">Vehicle Plate Lookup</h1>
            <p className="mt-2 text-muted-foreground">
              View curated public details for Indian number plates
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <label className="mb-2 block text-sm font-medium">Enter Number Plate</label>
            <div className="flex gap-3">
              <Input
                placeholder="MH01AB0001"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" ? lookup() : null}
              />
              <Button onClick={lookup} disabled={loading}>
                {loading ? "Fetching..." : "Get Vehicle Info"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </div>

          {result?.success ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Result</h2>
                {badge && <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{badge}</span>}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Plate:</span> {result.plate_number}
                </div>
                <div>
                  <span className="text-muted-foreground">Brand:</span> {result.vehicle?.brand ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span> {result.vehicle?.model ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span> {result.vehicle?.year ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">State:</span> {result.vehicle?.state ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">RTO:</span> {result.vehicle?.rto_code ?? "—"}
                </div>
                {result.owner_name && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Owner:</span> {result.owner_name}
                    {result.owner_context ? ` (${result.owner_context})` : ""}
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">BabuVault does not access government databases or display private ownership information.</p>
              {result.disclaimer && (
                <p className="mt-1 text-xs text-muted-foreground">{result.disclaimer}</p>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              <div className="mb-3 mx-auto h-12 w-12 rounded-xl bg-muted" />
              <p className="mb-2 font-medium">No results yet</p>
              <p className="text-sm">Enter a valid Indian number plate to look up curated public details.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => { setPlate(""); setResult(null); setError(null); }}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
