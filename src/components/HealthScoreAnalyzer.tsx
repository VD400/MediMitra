import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle, TrendingUp, ShieldCheck, Download, Mail, Phone, CheckCircle2, History, AlertTriangle, ArrowRight, BarChart3, Pill, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getHealthScoreAnalysis, type HealthScoreResult } from "@/lib/ai";
import Tesseract from "tesseract.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const HealthScoreAnalyzer = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HealthScoreResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  
  // Verification states
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(prev => [...prev, ...selected].slice(0, 5)); // Limit to 5 files
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const performAnalysis = async () => {
    if (files.length === 0) return;
    setStep("analyzing");
    setAnalyzing(true);
    setError("");

    try {
      let combinedText = "";
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const { data: { text } } = await Tesseract.recognize(file, 'eng');
          combinedText += `\n--- File: ${file.name} ---\n${text}`;
        } else {
          combinedText += `\n--- File: ${file.name} ---\n(PDF Content Simulation)`;
        }
      }

      const result = await getHealthScoreAnalysis(combinedText);
      setAnalysis(result);
      setStep("result");
    } catch (err: any) {
      setError(err.message || "Failed to analyze your health records.");
      setStep("upload");
    } finally {
      setAnalyzing(false);
    }
  };

  const sendOTP = async () => {
    if (!email) return toast.error("Please enter email");
    setVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      toast.error("Failed to send OTP. Is the server running?");
    } finally {
      setVerifying(false);
    }
  };

  const verifyOTP = async () => {
    setVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        setIsVerified(true);
        toast.success("Verification successful!");
        downloadPDF();
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("health-report-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MediMitra_Health_Report_${Date.now()}.pdf`);
      setShowVerification(false);
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {step === "upload" && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">
              <History className="w-4 h-4" />
              {files.length > 1 ? "3-Year Historical Analysis" : "Deep Health Analysis"}
            </div>
            <h2 className="text-4xl font-heading font-black text-foreground tracking-tight">Check My Health Score</h2>
            <p className="text-lg text-muted-foreground font-medium">
              Upload your medical reports and prescriptions. 
              Our AI will analyze major parameters, trends, and predict potential health risks.
            </p>
          </div>

          <Card className="p-12 border-4 border-dashed border-slate-200 rounded-[48px] bg-white hover:border-primary/50 transition-all group">
            <div className="flex flex-col items-center">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                id="health-files" 
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              <label htmlFor="health-files" className="cursor-pointer flex flex-col items-center">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2">Upload your records</h3>
                <p className="text-muted-foreground font-medium mb-8">Drop up to 5 files (Reports or Prescriptions)</p>
                <Button size="lg" className="rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-primary/20">
                  Select Files
                </Button>
              </label>
            </div>
          </Card>

          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, i) => (
                <Card key={i} className="p-6 bg-white border-none shadow-xl rounded-3xl flex items-center justify-between group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive p-2">
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </Card>
              ))}
              <Card 
                className="p-6 bg-primary text-white border-none shadow-xl rounded-3xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
                onClick={performAnalysis}
              >
                <div className="flex items-center gap-3 font-black text-lg">
                  Analyze All <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-pulse">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-primary/10 border-t-primary animate-spin" />
            <ShieldCheck className="absolute inset-0 m-auto w-12 h-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-heading font-black text-foreground">Analyzing Your History...</h3>
            <p className="text-muted-foreground font-medium">Comparing {files.length} records with normal human benchmarks</p>
          </div>
        </div>
      )}

      {step === "result" && analysis && (
        <div className="space-y-10 animate-fade-in" id="health-report-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
              <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">AI Assessment Complete</Badge>
              <h2 className="text-5xl font-heading font-black leading-tight">Your Health Score is <span className="text-primary italic">{analysis.health_score}%</span></h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                {analysis.summary}
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <div className="w-48 h-48 rounded-full border-[12px] border-white/5 border-t-primary flex flex-col items-center justify-center shadow-2xl">
                <span className="text-6xl font-black">{analysis.health_score}</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Optimal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Pie Chart: Health Composition */}
            <Card className="p-8 border-none shadow-2xl bg-white rounded-[40px] space-y-6 flex flex-col items-center">
              <h3 className="text-2xl font-heading font-black flex items-center gap-3 self-start">
                <BarChart3 className="w-6 h-6 text-primary" />
                Health Composition
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.composition}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analysis.composition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center italic">
                This chart shows the balanced composition of your overall health markers.
              </p>
            </Card>

            {/* Trends Chart */}
            <Card className="p-8 border-none shadow-2xl bg-white rounded-[40px] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-heading font-black flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  {analysis.historical_data.length > 1 ? "Health Trends" : "Parameter Snapshot"}
                </h3>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-primary/20 text-primary">Analysis</Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.historical_data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {analysis.trends.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${t.status === 'rising' ? 'bg-destructive' : 'bg-green-500'}`} />
                      <p className="font-bold text-sm text-slate-700">{t.parameter}</p>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary">{t.trend}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Detailed Parameter Comparison Table */}
          <Card className="p-10 border-none shadow-2xl bg-white rounded-[48px] space-y-8">
            <h3 className="text-3xl font-heading font-black flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Detailed Parameter Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <th className="px-6 py-4">Parameter</th>
                    <th className="px-6 py-4">Your Value</th>
                    <th className="px-6 py-4">Normal Range</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">AI Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.comparisons.map((c, i) => (
                    <tr key={i} className="bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-3xl">
                      <td className="px-6 py-6 font-black text-slate-900 rounded-l-3xl">{c.parameter}</td>
                      <td className="px-6 py-6 font-bold text-primary">{c.your_value}</td>
                      <td className="px-6 py-6 font-medium text-slate-500">{c.normal_value}</td>
                      <td className="px-6 py-6">
                        <Badge className={`${
                          c.status === 'Normal' ? 'bg-green-500' : 
                          c.status === 'High' ? 'bg-destructive' : 
                          c.status === 'Low' ? 'bg-blue-500' : 'bg-yellow-500'
                        } text-white font-black px-4 py-1.5 rounded-full`}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-600 font-medium rounded-r-3xl leading-relaxed">
                        {c.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* AI Recommendations & Advice */}
            <Card className="p-10 border-none shadow-2xl bg-slate-900 text-white rounded-[48px] space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Heart className="w-32 h-32 text-primary" />
              </div>
              <h3 className="text-3xl font-heading font-black flex items-center gap-4 relative z-10">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                AI Health Recommendations
              </h3>
              <div className="space-y-6 relative z-10">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-black text-xl">{i+1}</span>
                    </div>
                    <p className="text-lg font-medium leading-relaxed text-slate-300">
                      {typeof rec === 'string' ? rec : (rec as any).recommendation || JSON.stringify(rec)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/10 relative z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">
                  Note: These recommendations are AI-generated based on clinical data. Please consult your physician for clinical decisions.
                </p>
              </div>
            </Card>

            {/* Disease Risks */}
            <Card className="p-8 border-none shadow-2xl bg-white rounded-[40px] space-y-6">
              <h3 className="text-2xl font-heading font-black flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Risk Assessment
              </h3>
              <div className="space-y-6">
                {analysis.risks.map((risk, i) => (
                  <div key={i} className="space-y-3 p-6 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-destructive/20 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg text-slate-800">{risk.disease}</h4>
                      <Badge className={`${
                        risk.probability === 'High' ? 'bg-destructive' : 
                        risk.probability === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      } text-white border-none font-black`}>
                        {risk.probability} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {risk.reason}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-center pt-10 no-print">
            <Button 
              size="lg" 
              className="h-20 px-12 rounded-[28px] bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
              onClick={() => setShowVerification(true)}
            >
              <Download className="w-6 h-6 mr-3" />
              Download Full Medical Report
            </Button>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVerification(false)} />
          <Card className="relative z-10 w-full max-w-md p-10 rounded-[40px] border-none shadow-2xl bg-white animate-fade-up">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-black text-slate-900">Verify to Download</h3>
              <p className="text-muted-foreground font-medium">Please enter your email to receive a verification code.</p>
            </div>

            <div className="space-y-6">
              {!otpSent ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="email@example.com" 
                      className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl font-black text-lg"
                    onClick={sendOTP}
                    disabled={verifying}
                  >
                    {verifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="Enter 6-digit OTP" 
                      className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 text-center text-2xl font-black tracking-[0.5em]"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl font-black text-lg"
                    onClick={verifyOTP}
                    disabled={verifying}
                  >
                    {verifying ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Download"}
                  </Button>
                  <button 
                    onClick={() => setOtpSent(false)} 
                    className="w-full text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    Change Email
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthScoreAnalyzer;