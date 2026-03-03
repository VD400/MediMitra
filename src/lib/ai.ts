// AI helper for medical analysis calling local backend proxy
export interface MedicalParameter {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: "normal" | "abnormal";
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  parameters: MedicalParameter[];
}

export interface PrescriptionAnalysis {
  summary?: string;
  doctor_name?: string;
  hospital_name?: string;
  date?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    context: string;
  }>;
  total_estimated_price_range?: string;
}

export interface HealthScoreResult {
  health_score: number;
  summary: string;
  trends: Array<{ parameter: string; trend: string; status: string }>;
  risks: Array<{ disease: string; probability: string; reason: string }>;
  recommendations: string[];
  historical_data: Array<{ date: string; parameter: string; value: string }>;
  composition: Array<{ name: string; value: number; fill: string }>; // For Pie Charts
  comparisons: Array<{ 
    parameter: string; 
    your_value: string; 
    normal_value: string; 
    status: "Normal" | "High" | "Low" | "Warning";
    explanation: string;
  }>;
}

const BACKEND_URL = "http://localhost:5000/analyze";

// Helper to extract and parse JSON from AI response
const parseAIResponse = (raw: string) => {
  try {
    // Try to find a JSON block in the text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    let jsonStr = jsonMatch[0];
    
    // Cleaning: handle common AI JSON mistakes
    jsonStr = jsonStr
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Aggressive fix for unquoted values that contain non-numeric chars
    // This regex identifies values that are not wrapped in quotes, not numbers, not booleans, not null
    jsonStr = jsonStr.replace(/":\s*([^"\s,\[\]{}][^,\]}]*?)\s*(,|$|(?=[\]}]))/g, (match, p1, p2) => {
      const trimmed = p1.trim();
      
      // If it's already a number, boolean, or null, leave it alone
      if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed) || 
          /^(true|false|null)$/.test(trimmed)) {
        return `": ${trimmed}${p2}`;
      }
      
      // If it's a string that should have been quoted, wrap it
      // Avoid wrapping if it looks like it might be a nested object/array start (though regex handles this mostly)
      return `": "${trimmed.replace(/"/g, '\\"')}"${p2}`;
    });

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Parse Helper Error:", e, "Raw Text:", raw);
    return null;
  }
};

export const getHealthScoreAnalysis = async (content: string): Promise<HealthScoreResult> => {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: content, type: "health_score" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  const rawResult = data.result || "{}";
  
  const parsed = parseAIResponse(rawResult);
  
  if (parsed) {
    // 1. Normalize Composition (Pie Chart)
    if (!parsed.composition || !Array.isArray(parsed.composition)) {
      parsed.composition = [
        { name: "Vitality", value: 50, fill: "#3b82f6" },
        { name: "Immunity", value: 50, fill: "#10b981" },
        { name: "Metabolism", value: 50, fill: "#f59e0b" }
      ];
    } else {
      parsed.composition = parsed.composition.map((item: any) => {
        const val = typeof item.value === 'string' ? parseFloat(item.value.replace(/[^0-9.]/g, '')) || 50 : item.value;
        return {
          name: item.name || item.parameter || "Metric",
          value: val,
          fill: item.fill || (val > 70 ? "#10b981" : val > 40 ? "#3b82f6" : "#f59e0b")
        };
      });
    }

    // 2. Normalize Comparisons (Table)
    if (!parsed.comparisons || !Array.isArray(parsed.comparisons)) {
      parsed.comparisons = [];
    } else {
      parsed.comparisons = parsed.comparisons.map((c: any) => ({
        parameter: c.parameter || "Unknown",
        your_value: c.your_value || c.value || "N/A",
        normal_value: c.normal_value || c.reference_range || "N/A",
        status: c.status || "Normal",
        explanation: c.explanation || c.interpretation || "Parameter within range."
      }));
    }

    // 3. Normalize Recommendations (Strings Only)
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      parsed.recommendations = [];
    } else {
      parsed.recommendations = parsed.recommendations.map((r: any) => {
        if (typeof r === 'string') return r;
        return r.recommendation || r.advice || r.text || JSON.stringify(r);
      });
    }

    // 4. Normalize Risks
    if (!parsed.risks || !Array.isArray(parsed.risks)) {
      parsed.risks = [];
    } else {
      parsed.risks = parsed.risks.map((r: any) => ({
        disease: r.disease || r.parameter || "Potential Risk",
        probability: r.probability || r.risk_level || "Medium",
        reason: r.reason || r.explanation || `Variation detected in ${r.parameter || 'metrics'}.`
      }));
    }

    // 5. Ensure other arrays exist
    if (!parsed.historical_data) parsed.historical_data = [];
    if (!parsed.trends) parsed.trends = [];
    
    return parsed;
  }
  
  throw new Error("Invalid AI response format for health score. The analysis might be too large.");
};

export const analyzeMedicalReport = async (
  content: string | { fileBase64: string; fileName: string }
): Promise<AnalysisResult> => {
  const textToAnalyze =
    typeof content === "string" ? content : `Medical report: ${content.fileName}`;

  console.log("TEXT BEING SENT TO AI:", textToAnalyze.substring(0, 100));

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: textToAnalyze, type: "report" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const rawResult: string = data.result || "{}";
  const parsed = parseAIResponse(rawResult);

  if (parsed && parsed.parameters) {
    return {
      summary: parsed.summary || "Medical report analysis complete.",
      parameters: parsed.parameters
    };
  }

  // Fallback parsing if JSON fails but we have text
  const parameters: MedicalParameter[] = extractParameters(rawResult);

  return {
    summary: rawResult.split('\n')[0] || "Could not generate summary.",
    parameters,
  };
};

// Extract any mentioned abnormal values from the AI text
function extractParameters(text: string): MedicalParameter[] {
  const params: MedicalParameter[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    // Look for lines mentioning "higher than", "lower than", "above", "below normal"
    const isAbnormal =
      /higher than|lower than|above normal|below normal|outside.*range|abnormal/i.test(line);
    const isNormal = /within.*normal|normal range/i.test(line);

    if (isAbnormal || isNormal) {
      // Try to extract a parameter name from the line
      const nameMatch = line.match(/\*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].replace(/:$/, "").trim() : "Lab Value";

      params.push({
        name,
        value: "See summary",
        unit: "",
        reference_range: "See summary",
        status: isAbnormal ? "abnormal" : "normal",
        explanation: line.replace(/\*\*/g, "").trim(),
      });
    }
  }

  // Always add a general summary entry
  params.unshift({
    name: "General Analysis",
    value: "Complete",
    unit: "",
    reference_range: "N/A",
    status: "normal",
    explanation: "Full AI analysis provided in summary above.",
  });

  return params;
}

export const analyzePrescription = async (
  text: string,
  fileName: string
): Promise<PrescriptionAnalysis> => {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, type: "prescription" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const rawResult: string = data.result || "{}";

  const parsed = parseAIResponse(rawResult);
  
  if (parsed) {
    // Ensure medications array exists
    if (!parsed.medications) parsed.medications = [];
    return parsed;
  }
  
  // Fallback if parsing fails
  return {
    summary: "AI deciphered the text but could not structure it perfectly.",
    medications: [
      {
        name: "Deciphered Text",
        dosage: "N/A",
        frequency: "N/A",
        duration: "N/A",
        instructions: rawResult.substring(0, 500),
        context: "Raw extracted data"
      }
    ],
    doctor_name: "N/A",
    hospital_name: "N/A",
    date: "N/A",
    total_estimated_price_range: "N/A"
  };
};

export const chatWithAI = async (messages: any[]): Promise<string> => {
  const lastMessage = messages[messages.length - 1].content;

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lastMessage, type: "chat" }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return `AI Error: ${data.error}`;
    }

    const rawResult: string = data.result || "";
    const parsed = parseAIResponse(rawResult);

    if (parsed && parsed.answer) {
      let fullResponse = parsed.answer;
      if (parsed.symptoms && parsed.symptoms.length > 0) {
        fullResponse += "\n\n**Identified Symptoms:**\n- " + parsed.symptoms.join("\n- ");
      }
      if (parsed.recommendations && parsed.recommendations.length > 0) {
        fullResponse += "\n\n**Next Steps:**\n- " + parsed.recommendations.join("\n- ");
      }
      return fullResponse;
    }

    return rawResult || "I'm sorry, I couldn't process that.";
  } catch (err: any) {
    console.error("Chat error:", err);
    return `Error connecting to AI: ${err.message}`;
  }
};