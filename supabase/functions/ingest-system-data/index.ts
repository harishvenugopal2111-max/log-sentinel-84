import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SystemData {
  cpu_usage: number;
  memory_usage: number;
  process_count: number;
}

interface AnomalyResult {
  detected: boolean;
  type: string;
  severity: "Low" | "Medium" | "High";
  description: string;
}

function detectAnomalies(data: SystemData): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  if (data.cpu_usage > 90) {
    anomalies.push({
      detected: true,
      type: "High CPU Usage",
      severity: "High",
      description: `CPU usage critically high at ${data.cpu_usage.toFixed(1)}%. Possible runaway process or resource exhaustion.`,
    });
  } else if (data.cpu_usage > 75) {
    anomalies.push({
      detected: true,
      type: "Elevated CPU Usage",
      severity: "Medium",
      description: `CPU usage elevated at ${data.cpu_usage.toFixed(1)}%. Monitor for sustained spikes.`,
    });
  }

  if (data.memory_usage > 85) {
    anomalies.push({
      detected: true,
      type: "High Memory Usage",
      severity: data.memory_usage > 95 ? "High" : "Medium",
      description: `Memory usage at ${data.memory_usage.toFixed(1)}%. Risk of OOM conditions.`,
    });
  }

  if (data.process_count > 300) {
    anomalies.push({
      detected: true,
      type: "Suspicious Process Count",
      severity: data.process_count > 500 ? "High" : "Medium",
      description: `Unusual process count: ${data.process_count}. Possible fork bomb or malware.`,
    });
  }

  return anomalies;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SystemData = await req.json();

    // Store metrics
    const { error: insertError } = await supabase
      .from("system_metrics")
      .insert({
        user_id: user.id,
        cpu_usage: body.cpu_usage,
        memory_usage: body.memory_usage,
        process_count: body.process_count,
      });

    if (insertError) {
      console.error("Failed to insert metrics:", insertError);
    }

    // Detect anomalies
    const anomalies = detectAnomalies(body);

    // For each anomaly, create a task and log
    for (const anomaly of anomalies) {
      // Create task
      await supabase.from("tasks").insert({
        user_id: user.id,
        type: anomaly.type,
        severity: anomaly.severity,
        status: "Open",
        description: anomaly.description,
        anomaly_source: "system-monitor",
        cpu_at_detection: body.cpu_usage,
        memory_at_detection: body.memory_usage,
      });

      // Create anomaly log entry
      await supabase.from("logs").insert({
        user_id: user.id,
        level: anomaly.severity === "High" ? "CRITICAL" : "ERROR",
        source: "system-monitor",
        message: anomaly.description,
        is_anomaly: true,
      });

      // Trigger email alert
      try {
        await supabase.functions.invoke("send-anomaly-alert", {
          body: {
            level: anomaly.severity === "High" ? "CRITICAL" : "ERROR",
            source: "system-monitor",
            message: anomaly.description,
            userEmail: user.email,
            anomalyScore: anomaly.severity === "High" ? 0.95 : 0.75,
            anomalyReason: anomaly.type,
          },
        });
      } catch (e) {
        console.error("Failed to send alert email:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        metrics_stored: true,
        anomalies_detected: anomalies.length,
        anomalies,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
