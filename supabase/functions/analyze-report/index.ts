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
    const { fileBase64, fileName, extractedText } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical report analyzer. You will receive either:
1) A medical report image, OR
2) Extracted text from a medical report PDF.

Analyze the report and extract all medical parameters/values found. For each parameter, determine if it's within normal range or not.

You MUST respond by calling the extract_medical_data tool with the structured results.`;

    const hasImageInput = typeof fileBase64 === "string" && fileBase64.startsWith("data:image");
    const hasTextInput = typeof extractedText === "string" && extractedText.trim().length > 0;

    if (!hasImageInput && !hasTextInput) {
      throw new Error("Could not read the uploaded report. Please upload a valid image or text-based PDF.");
    }

    const userContent = hasImageInput
      ? [
          {
            type: "text",
            text: `Analyze this medical report image and extract all test parameters, their values, units, reference ranges, and whether each is normal or abnormal. File: ${fileName}`,
          },
          {
            type: "image_url",
            image_url: { url: fileBase64 },
          },
        ]
      : [
          {
            type: "text",
            text: `Analyze this medical report text and extract all test parameters, their values, units, reference ranges, and whether each is normal or abnormal. File: ${fileName}\n\nExtracted report text:\n${extractedText}`,
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
                name: "extract_medical_data",
                description:
                  "Extract structured medical test data from a report",
                parameters: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "string",
                      description:
                        "A brief overall summary of the report findings",
                    },
                    parameters: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Parameter name (e.g., RBC Count)",
                          },
                          value: {
                            type: "string",
                            description: "The measured value",
                          },
                          unit: {
                            type: "string",
                            description:
                              "Unit of measurement (e.g., million/μL)",
                          },
                          reference_range: {
                            type: "string",
                            description:
                              "Normal reference range (e.g., 4.5-5.5)",
                          },
                          status: {
                            type: "string",
                            enum: ["normal", "abnormal"],
                            description: "Whether the value is within normal range",
                          },
                          explanation: {
                            type: "string",
                            description:
                              "Brief explanation of what this parameter means and clinical significance if abnormal",
                          },
                        },
                        required: [
                          "name",
                          "value",
                          "unit",
                          "reference_range",
                          "status",
                          "explanation",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["summary", "parameters"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_medical_data" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response keys:", JSON.stringify(Object.keys(data)));
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let analysis;
    if (toolCall) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from message content
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      }
      if (!analysis) {
        console.error("Full AI response:", JSON.stringify(data).substring(0, 1000));
        throw new Error("No structured response from AI");
      }
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
