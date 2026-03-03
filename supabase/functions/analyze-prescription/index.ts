import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical prescription analyzer. You will receive an image of a doctor's prescription. 

Analyze the prescription and extract all medications mentioned. For each medication, extract the name, dosage, frequency, duration, and any specific instructions.

You MUST respond by calling the extract_prescription_data tool with the structured results.`;

    const userContent = [
      {
        type: "text",
        text: `Analyze this medical prescription image and extract all medication details. File: ${fileName}`,
      },
      {
        type: "image_url",
        image_url: { url: fileBase64 },
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_prescription_data",
                description: "Extract structured medical prescription data",
                parameters: {
                  type: "object",
                  properties: {
                    doctor_name: { type: "string" },
                    hospital_name: { type: "string" },
                    date: { type: "string" },
                    medications: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          dosage: { type: "string" },
                          frequency: { type: "string" },
                          duration: { type: "string" },
                          instructions: { type: "string" },
                        },
                        required: ["name", "dosage", "frequency", "duration", "instructions"],
                        additionalProperties: false,
                      },
                    },
                    notes: { type: "string", description: "Any other advice or notes mentioned" },
                  },
                  required: ["medications"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_prescription_data" },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No structured response from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
