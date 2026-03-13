import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const plate_number = body?.plate_number;

    if (!plate_number) {
      return new Response(
        JSON.stringify({ success: false, message: "plate_number required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedPlate = plate_number.replace(/\s+/g, "").toUpperCase();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("vehicle_plate_registry")
      .select("*")
      .eq("plate_number", normalizedPlate)
      .maybeSingle();

    if (!data || error) {
      return new Response(
        JSON.stringify({ success: false, message: "No public vehicle information found" }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        plate_number: data.plate_number,
        vehicle: {
          brand: data.vehicle_brand,
          model: data.vehicle_model,
          year: data.vehicle_year,
          state: data.state,
          rto_code: data.rto_code,
        },
        owner_name: data.owner_name,
        verified: data.verified ?? false,
        data_type: data.data_type ?? "BABU",
        disclaimer:
          "Vehicle information shown is based on curated public associations;",
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("vehicle-plate-lookup error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
