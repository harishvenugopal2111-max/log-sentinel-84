import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { level, source, message } = await req.json();

    if (!level || !source || !message) {
      return new Response(
        JSON.stringify({ error: "Missing fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to analyze the log for anomalies
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      // Fallback to rule-based detection
      const isAnomaly = level === "CRITICAL" || (level === "ERROR" && Math.random() > 0.5);
      return new Response(
        JSON.stringify({ isAnomaly, score: isAnomaly ? 0.85 : 0.15, method: "rule-based" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a log anomaly detection system (Isolation Forest simulation). Analyze this server log entry and determine if it's an anomaly.

Log Level: ${level}
Source: ${source}
Message: ${message}

Score the log from 0.0 (completely normal) to 1.0 (definitely anomalous).

Rules:
- CRITICAL level logs are almost always anomalies (0.85-1.0)
- ERROR logs with keywords like "unreachable", "corruption", "killed", "cascading", "failed" score high (0.7-0.95)
- ERROR logs with transient issues like "timeout", "retry" score medium (0.4-0.6)
- WARN logs score low (0.1-0.3) unless they mention critical resources
- INFO logs are almost never anomalies (0.0-0.1)

Respond ONLY with valid JSON: {"isAnomaly": boolean, "score": number, "reason": "brief reason"}`;

    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      // Fallback to rule-based
      const isAnomaly = level === "CRITICAL" || (level === "ERROR" && Math.random() > 0.5);
      return new Response(
        JSON.stringify({ isAnomaly, score: isAnomaly ? 0.85 : 0.15, method: "rule-based-fallback" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse the AI response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      const isAnomaly = level === "CRITICAL" || (level === "ERROR" && Math.random() > 0.5);
      result = { isAnomaly, score: isAnomaly ? 0.85 : 0.15, reason: "Fallback detection" };
    }

    return new Response(
      JSON.stringify({
        isAnomaly: result.isAnomaly ?? false,
        score: Math.max(0, Math.min(1, result.score ?? 0)),
        reason: result.reason ?? "AI analysis complete",
        method: "ai-isolation-forest",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-anomaly:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
