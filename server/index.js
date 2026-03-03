import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const token = process.env.HF_TOKEN;
if (!token) {
  console.error("❌ HF_TOKEN is missing from .env!");
} else {
  console.log(`✅ HF_TOKEN loaded: ${token.substring(0, 8)}...`);
}

// In-memory OTP store (for demo purposes)
const otpStore = new Map();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

  try {
    await transporter.sendMail({
      from: `"MediMitra Health" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your MediMitra Verification Code",
      text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
      html: `<b>Your verification code is: <span style="font-size: 24px; color: #3b82f6;">${otp}</span></b><p>It expires in 5 minutes.</p>`,
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Nodemailer error:", error.message);
    res.status(500).json({ error: "Failed to send OTP. Please check server config." });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);

  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  otpStore.delete(email);
  res.json({ success: true, message: "Verified successfully" });
});

app.post("/analyze", async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided for analysis" });
    }

    let userMessage = "";
    if (type === "prescription") {
      userMessage = `You are an Expert Medical Pharmacist. Analyze this OCR text from a handwritten prescription.
      
      TASK:
      1. Decipher the medicine names, dosages, and instructions.
      2. Provide a friendly, 2-sentence summary at the top for the patient.
      3. Return the detailed data in JSON.
      
      OUTPUT FORMAT (Strictly JSON):
      {
        "summary": "Patient-friendly overview...",
        "medications": [{"name": "...", "dosage": "...", "frequency": "...", "duration": "...", "instructions": "...", "context": "..."}],
        "doctor_name": "...", "hospital_name": "...", "date": "...", "total_estimated_price_range": "..."
      }
      
      OCR TEXT: ${text}`;
    } else if (type === "health_score") {
      userMessage = `You are a Senior Health Analyst. Analyze these records.
      
      TASK:
      1. Calculate a health score (0-100).
      2. Provide a friendly, motivating 2-sentence summary.
      3. Compare parameters to normal ranges.
      
      CRITICAL: You must return valid JSON. All values (especially those with units like 'g/dL', '%', 'x 10^12/L') MUST be wrapped in double quotes. 
      Example: "value": "121g/L" is correct. "value": 121g/L is WRONG.
      
      OUTPUT FORMAT (Strictly JSON):
      {
        "health_score": 85,
        "summary": "Friendly patient overview...",
        "trends": [{"parameter": "...", "trend": "...", "status": "..."}],
        "risks": [{"disease": "...", "probability": "High", "reason": "..."}],
        "recommendations": ["Advice 1", "Advice 2"],
        "historical_data": [{"date": "...", "parameter": "...", "value": 85}],
        "composition": [
          {"name": "Vitality", "value": 80, "fill": "#3b82f6"},
          {"name": "Immunity", "value": 70, "fill": "#10b981"},
          {"name": "Metabolism", "value": 90, "fill": "#f59e0b"}
        ],
        "comparisons": [
          {
            "parameter": "...",
            "your_value": "...",
            "normal_value": "...",
            "status": "Normal/High/Low",
            "explanation": "..."
          }
        ]
      }
      
      DATA: ${text}`;
    } else if (type === "chat") {
      userMessage = `You are MediBot, a helpful medical assistant. 
      The user says: "${text}"
      
      TASK:
      1. Provide a direct, helpful, and empathetic answer in plain English.
      2. If you identify symptoms, list them clearly.
      
      OUTPUT FORMAT (Strictly JSON):
      {
        "answer": "Your direct answer here...",
        "symptoms": ["..."],
        "recommendations": ["..."]
      }
      
      Do not include raw JSON structure in your 'answer' field. Make it look like a real conversation.`;
    } else if (type === "report") {
      userMessage = `You are a Medical Lab Specialist. Analyze this report.
      
      TASK:
      1. Identify all lab parameters and their status.
      2. Provide a friendly, non-technical 2-sentence summary for the patient.
      
      OUTPUT FORMAT (Strictly JSON):
      {
        "summary": "Friendly patient-facing summary here...",
        "parameters": [
          {"name": "...", "value": "...", "unit": "...", "reference_range": "...", "status": "normal/abnormal", "explanation": "..."}
        ]
      }
      
      REPORT TEXT: ${text}`;
    } else {
      userMessage = text;
    }

    // Valid providers: cerebras, sambanova, together, fireworks-ai, groq
    // :fastest = cheapest/fastest available provider automatically
    const MODEL = "meta-llama/Llama-3.1-8B-Instruct:cerebras";
    const HF_URL = "https://router.huggingface.co/v1/chat/completions";

    console.log("📤 POST ->", HF_URL, "| model:", MODEL);

    const hfResponse = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional medical analysis system. You must ALWAYS return responses in valid JSON format. Do not include any conversational text outside the JSON block.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    const rawText = await hfResponse.text();
    console.log("📥 HTTP Status:", hfResponse.status);
    console.log("📥 Raw:", rawText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("❌ JSON parse failed:", e.message);
      return res.status(500).json({ error: `HF returned: ${rawText.substring(0, 200)}` });
    }

    if (data.error) {
      const errMsg = typeof data.error === "object" ? data.error.message : data.error;
      console.error("❌ HF error:", errMsg);
      return res.status(500).json({ error: errMsg });
    }

    const result = data?.choices?.[0]?.message?.content || "No output generated.";
    console.log("✅ Done:", result.substring(0, 150));

    return res.json({ result });

  } catch (error) {
    console.error("❌ Server error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));