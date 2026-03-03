import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeMedicalReport, type AnalysisResult } from "@/lib/ai";
import Tesseract from "tesseract.js";
import logo from "@/assets/logo.png";
import {
  LogOut,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Pill,
  Search as SearchIcon,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  Heart,
  Activity,
  User,
  ExternalLink,
  History,
  ShieldCheck,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Microscope
} from "lucide-react";

// Import new components
import PrescriptionAnalyzer from "@/components/PrescriptionAnalyzer";
import MedicineSearch from "@/components/MedicineSearch";
import HealthScoreAnalyzer from "@/components/HealthScoreAnalyzer";
import Chatbot from "@/components/Chatbot";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportRecord {
  id: string;
  file_name: string;
  file_url: string;
  analysis: AnalysisResult | null;
  created_at: any;
}

const ParameterCard = ({ parameter }: { parameter: any }) => {
  const isDanger = parameter.is_danger;
  const isAbnormal = parameter.status === "abnormal";

  return (
    <Card className={`p-5 transition-all duration-300 hover:shadow-xl border-2 ${
      isDanger ? "border-destructive/30 bg-destructive/5" : 
      isAbnormal ? "border-yellow-500/30 bg-yellow-50/50" : 
      "border-transparent hover:border-primary/20"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDanger ? "bg-destructive/10 text-destructive" : 
            isAbnormal ? "bg-yellow-500/10 text-yellow-600" : 
            "bg-primary/10 text-primary"
          }`}>
            {isDanger ? <AlertCircle className="w-5 h-5" /> : 
             isAbnormal ? <AlertCircle className="w-5 h-5" /> : 
             <Activity className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-black text-foreground text-sm uppercase tracking-tight">{parameter.name}</h4>
            <p className="text-[10px] text-muted-foreground font-bold">NORMAL: {parameter.reference_range}</p>
          </div>
        </div>
        <Badge className={`${
          isDanger ? "bg-destructive text-white" : 
          isAbnormal ? "bg-yellow-500 text-white" : 
          "bg-green-500 text-white"
        } font-black text-[10px] uppercase tracking-widest px-2 py-0.5`}>
          {isDanger ? "DANGER" : parameter.status}
        </Badge>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-3xl font-black ${
          isDanger ? "text-destructive" : 
          isAbnormal ? "text-yellow-600" : 
          "text-foreground"
        }`}>{parameter.value}</span>
        <span className="text-sm font-bold text-muted-foreground uppercase">{parameter.unit}</span>
      </div>

      <div className="pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          {parameter.explanation}
        </p>
      </div>
    </Card>
  );
};

const isPdfFile = (candidate: { name?: string; type?: string }) => {
  const fileName = candidate.name?.toLowerCase() || "";
  const fileType = candidate.type?.toLowerCase() || "";
  return fileType.includes("pdf") || fileName.endsWith(".pdf");
};

  const Dashboard = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"pdf" | "image" | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "prescription" | "medicines" | "chatbot" | "healthscore">("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("");
  const [combinedMedicines, setCombinedMedicines] = useState<string[]>([]);

  const handleMedicineSearch = (query: string) => {
    setMedicineSearchQuery(query);
    setCombinedMedicines([]);
    setActiveTab("medicines");
  };

  const handleCombinedSearch = (medicines: string[]) => {
    setCombinedMedicines(medicines);
    setMedicineSearchQuery("");
    setActiveTab("medicines");
  };

  const fetchReports = useCallback(async () => {
    // Reports fetching disabled as we're now in "No Login" mode
    // In a real app, we might use localStorage to persist reports locally
    const savedReports = localStorage.getItem("medimitra_reports");
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleLogout = async () => {
    navigate("/");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setAnalysis(null);
    setError("");

    if (isPdfFile(selected)) {
      setPreviewType("pdf");
      // Note: PDF rendering removed for simplicity, will use basic preview
      setFilePreviewUrl(URL.createObjectURL(selected));
      return;
    }

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviewUrl(reader.result as string);
        setPreviewType("image");
      };
      reader.readAsDataURL(selected);
      return;
    }

    setFilePreviewUrl(null);
    setPreviewType(null);
    setError("Unsupported file type. Please upload a PDF or image.");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");

    try {
      let extractedText = "";

      if (isPdfFile(file)) {
        // PDF text extraction using a simpler mock for now or real logic if needed
        extractedText = "This is a sample text from a PDF report.";
      } else {
        // OCR for images
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(m)
        });
        extractedText = text;
      }

      console.log("EXTRACTED TEXT:", extractedText);

      if (!extractedText || extractedText.trim() === "") {
        throw new Error("Could not extract any text from the file. Please ensure the image is clear.");
      }

      const analysisResult = await analyzeMedicalReport(extractedText);
      setAnalysis(analysisResult);

      // Save to local storage for persistence
      const newReport: ReportRecord = {
        id: Date.now().toString(),
        file_name: file.name,
        file_url: filePreviewUrl || "",
        analysis: analysisResult,
        created_at: new Date().toISOString(),
      };
      
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem("medimitra_reports", JSON.stringify(updatedReports.slice(0, 10)));
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze report. Please check your AI API key.");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadPastReport = (report: ReportRecord) => {
    setAnalysis(report.analysis);
    setFile(null);
    setActiveTab("reports");
    setFilePreviewUrl(report.file_url);
    setPreviewType(report.file_name.toLowerCase().endsWith(".pdf") ? "pdf" : "image");
  };

  const calculateHealthScore = () => {
    if (!analysis) return 0;
    const normalCount = analysis.parameters.filter(p => p.status === "normal").length;
    return Math.round((normalCount / (analysis.parameters.length || 1)) * 100);
  };

  const healthScore = calculateHealthScore();

  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState({ name: "", email: "", phone: "" });

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you ${downloadInfo.name}! Your report is being generated and will be sent to ${downloadInfo.email}.`);
    setShowDownloadForm(false);
  };

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-200 ${
        activeTab === id
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, color, onClick }: any) => (
    <Card 
      className="p-6 border-none shadow-xl bg-white rounded-3xl hover:shadow-2xl transition-all cursor-pointer group" 
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-foreground tracking-tight">
                MEDIMITRA
              </h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">
                Health Partner
              </p>
            </div>
            <button className="lg:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem id="overview" label="Overview" icon={LayoutDashboard} />
            <SidebarItem id="reports" label="Report Analyzer" icon={FileText} />
            <SidebarItem id="prescription" label="Prescriptions" icon={Pill} />
            <SidebarItem id="medicines" label="Medicine Search" icon={SearchIcon} />
            <SidebarItem id="chatbot" label="MediBot AI" icon={MessageSquare} />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 mb-4">Advanced</p>
              <SidebarItem id="healthscore" label="Check Health Score" icon={TrendingUp} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full bg-primary/5 text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Exit Dashboard
            </button>
            <div className="mt-4 bg-muted/50 rounded-xl p-4 text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center border border-border/50">
              V 1.0.0 • Made with ❤️
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-border px-6 flex items-center justify-between lg:justify-end gap-4 sticky top-0 z-40">
          <button className="lg:hidden p-2 hover:bg-muted rounded-lg" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-green-200 text-green-700 bg-green-50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              AI System Online
            </Badge>
            <div className="h-8 w-[1px] bg-border mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-widest hidden sm:block">Status: Active</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                  <h2 className="text-4xl font-heading font-black text-foreground tracking-tight">
                    Hi there, <span className="text-primary">how are you?</span>
                  </h2>
                  <p className="text-lg text-muted-foreground font-medium max-w-xl">
                    Your personal health companion is ready. Analyze reports, track prescriptions, and get AI insights.
                  </p>
                </div>
                {analysis && (
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-center gap-6 group hover:scale-105 transition-all duration-500">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Health Status</p>
                      <p className="text-3xl font-black text-primary">{healthScore}%</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * healthScore) / 100} strokeLinecap="round" className="text-primary" />
                      </svg>
                      <Heart className="absolute inset-0 m-auto w-6 h-6 text-primary group-hover:scale-125 transition-transform" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={TrendingUp} 
                  label="Health Score" 
                  value="Analyze Now" 
                  color="bg-primary" 
                  onClick={() => setActiveTab("healthscore")}
                />
                <StatCard 
                  icon={Microscope} 
                  label="Reports" 
                  value={reports.length.toString()} 
                  color="bg-blue-600" 
                  onClick={() => setActiveTab("reports")}
                />
                <StatCard icon={Activity} label="Status" value="Optimal" color="bg-green-500" />
                <StatCard icon={ShieldCheck} label="Security" value="Encrypted" color="bg-slate-900" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 border-none shadow-xl bg-white rounded-[40px] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group" onClick={() => setActiveTab("reports")}>
                  <div className="w-16 h-16 rounded-[24px] bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-3">Report Analysis</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                    Deep-dive into your lab results. AI simplifies complex medical jargon for you.
                  </p>
                  <div className="flex items-center text-blue-600 font-black text-sm uppercase tracking-widest">
                    Start Now <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>

                <Card className="p-8 border-none shadow-xl bg-white rounded-[40px] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group" onClick={() => setActiveTab("prescription")}>
                  <div className="w-16 h-16 rounded-[24px] bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Pill className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-3">Prescription AI</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                    Scan handwritten prescriptions to digitize medications and instructions automatically.
                  </p>
                  <div className="flex items-center text-accent font-black text-sm uppercase tracking-widest">
                    Scan Image <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>

                <Card className="p-8 border-none shadow-xl bg-white rounded-[40px] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group" onClick={() => setActiveTab("chatbot")}>
                  <div className="w-16 h-16 rounded-[24px] bg-green-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-3">MediBot AI</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                    Your 24/7 medical assistant. Ask anything about symptoms, drugs or wellness.
                  </p>
                  <div className="flex items-center text-green-600 font-black text-sm uppercase tracking-widest">
                    Open Chat <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Card>
              </div>

              {reports.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-heading font-black text-foreground">Recent Reports</h3>
                    <Button variant="link" className="text-primary font-black uppercase tracking-widest text-xs" onClick={() => setActiveTab("reports")}>View All Reports</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reports.slice(0, 4).map((report) => (
                      <Card key={report.id} className="p-6 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer bg-white border-none rounded-3xl group" onClick={() => loadPastReport(report)}>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-foreground truncate">{report.file_name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">Verified</Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Health Score Section */}
              {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-10 border-none bg-slate-900 text-white rounded-[48px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-primary/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                      <div className="shrink-0 relative">
                        <div className="w-44 h-44 rounded-full border-[10px] border-white/5 border-t-primary flex flex-col items-center justify-center shadow-2xl">
                          <span className="text-5xl font-black text-white">{healthScore}%</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl">
                          Live Analysis
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <h3 className="text-3xl font-heading font-black leading-tight">Your health is <br/><span className="text-primary">{healthScore > 80 ? "Excellent" : healthScore > 60 ? "Stable" : "Needs Care"}</span></h3>
                        <p className="text-slate-400 font-medium leading-relaxed">
                          We've analyzed {analysis.parameters.length} vitals from your latest report. {analysis.parameters.filter(p => p.status === "abnormal").length} parameters require your attention.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                           <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Normal</p>
                              <p className="text-xl font-black text-green-400">{analysis.parameters.filter(p => p.status === "normal").length}</p>
                           </div>
                           <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Abnormal</p>
                              <p className="text-xl font-black text-destructive">{analysis.parameters.filter(p => p.status === "abnormal").length}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-10 border-none bg-white rounded-[48px] shadow-xl flex flex-col justify-center border-b-8 border-primary/20">
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                           <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                           <h4 className="text-2xl font-heading font-black text-foreground">Health Trend</h4>
                           <p className="text-sm text-muted-foreground font-medium">Tracking your vitals over time</p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        {analysis.parameters.slice(0, 3).map((p, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between items-end">
                                 <span className="font-black text-foreground text-sm uppercase tracking-tighter">{p.name}</span>
                                 <span className={`text-sm font-black ${p.status === 'abnormal' ? 'text-destructive' : 'text-primary'}`}>{p.value} {p.unit}</span>
                              </div>
                              <Progress value={p.status === 'normal' ? 90 : 45} className={`h-2.5 ${p.status === 'abnormal' ? 'bg-destructive/10' : 'bg-primary/10'}`} />
                           </div>
                        ))}
                        <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px] p-0 h-auto" onClick={() => setActiveTab("reports")}>
                          View Detailed Analysis Report <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                     </div>
                  </Card>
                </div>
              )}
            </div>
          )}

              {/* Download Form Dialog */}
              {showDownloadForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <Card className="w-full max-w-md p-8 relative overflow-hidden">
                    <button 
                      onClick={() => setShowDownloadForm(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="text-center space-y-2 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-heading font-black text-foreground">Get Your Full Report</h3>
                      <p className="text-muted-foreground text-sm">Provide your details to receive your comprehensive AI-analyzed health report.</p>
                    </div>

                    <form onSubmit={handleDownload} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Enter your name"
                          className="w-full h-12 px-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          value={downloadInfo.name}
                          onChange={(e) => setDownloadInfo({...downloadInfo, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="your@email.com"
                          className="w-full h-12 px-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          value={downloadInfo.email}
                          onChange={(e) => setDownloadInfo({...downloadInfo, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          placeholder="+91 00000 00000"
                          className="w-full h-12 px-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          value={downloadInfo.phone}
                          onChange={(e) => setDownloadInfo({...downloadInfo, phone: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-xl font-black text-lg shadow-lg shadow-primary/20 mt-4">
                        Generate & Download
                      </Button>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase font-bold tracking-widest opacity-60">
                      By submitting, you agree to our privacy policy and data handling.
                    </p>
                  </Card>
                </div>
              )}

          {activeTab === "reports" && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Report Analyzer</h2>
                  <p className="text-muted-foreground font-medium">Upload and analyze your medical lab reports with AI.</p>
                </div>
                {analysis && (
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 font-bold" onClick={() => {setAnalysis(null); setFile(null);}}>
                    New Analysis
                  </Button>
                )}
              </div>

              {!analysis && !analyzing && (
                <div className="bg-white p-12 rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center group hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden shadow-2xl shadow-slate-200/50">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-foreground mb-4 relative z-10">Upload Your Lab Report</h3>
                  <p className="text-muted-foreground max-w-sm mb-10 font-medium relative z-10">
                    Upload your medical report (PDF, PNG, JPG) to get an AI-powered summary and insights.
                  </p>
                  <label className="cursor-pointer relative z-10">
                    <div className="bg-primary text-primary-foreground px-12 py-5 rounded-2xl font-black shadow-xl shadow-primary/30 inline-block hover:scale-105 active:scale-95 transition-all">
                      {file ? file.name : "Choose File"}
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" />
                  </label>
                  {file && (
                    <Button 
                      onClick={handleAnalyze} 
                      className="mt-6 bg-slate-900 hover:bg-black text-white font-black px-12 py-5 h-auto rounded-2xl relative z-10 shadow-xl"
                    >
                      Process Report Now
                    </Button>
                  )}
                  {error && (
                    <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive font-bold text-sm relative z-10">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {analyzing && (
                <div className="bg-white p-20 rounded-[40px] border border-border flex flex-col items-center justify-center text-center shadow-xl">
                  <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <div className="absolute inset-4 rounded-full border-4 border-accent/10 border-b-accent animate-spin-slow" />
                    <FileText className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-foreground mb-2">Analyzing Your Health Data</h3>
                  <p className="text-muted-foreground font-medium animate-pulse">Our medical AI is processing your report. This usually takes 10-15 seconds...</p>
                </div>
              )}

              {analysis && (
                <div className="grid gap-8 animate-fade-up">
                  {/* Top Summary Card */}
                  <Card className="p-8 border-none shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <ShieldCheck className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                          <Heart className="w-6 h-6 text-primary-foreground animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Health Overview</h3>
                      </div>
                      <p className="text-lg text-foreground font-medium leading-relaxed max-w-3xl">
                        {analysis.summary}
                      </p>
                    </div>
                  </Card>

                  {/* Statistical Parameter Grid */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                        <Microscope className="w-5 h-5 text-primary" />
                        Detailed Lab Metrics
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase">Normal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase">Abnormal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-destructive" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase">Danger</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analysis.parameters.map((param, idx) => (
                        <ParameterCard key={idx} parameter={param} />
                      ))}
                    </div>
                  </div>

                  {/* Health Score & Report Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                    <Card className="p-10 border-none shadow-2xl bg-white rounded-[40px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16" />
                      <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="relative w-56 h-56 mb-8 group">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="112" cy="112" r="100" fill="none" stroke="currentColor" strokeWidth="20" className="text-slate-100" />
                            <circle cx="112" cy="112" r="100" fill="none" stroke="currentColor" strokeWidth="20" strokeDasharray={628.3} strokeDashoffset={628.3 - (628.3 * healthScore) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-foreground">{healthScore}%</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Health Score</span>
                          </div>
                        </div>
                        <h4 className="text-3xl font-heading font-black text-foreground mb-3">Overall Assessment</h4>
                        <p className="text-muted-foreground font-medium mb-8 max-w-sm">
                          Based on {analysis.parameters.length} extracted parameters from your latest report. Your status is {healthScore > 80 ? "excellent" : healthScore > 60 ? "good" : "needs attention"}.
                        </p>
                        <Button onClick={() => setShowDownloadForm(true)} className="w-full bg-slate-900 text-white font-black h-16 rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-slate-200">
                          Get Detailed PDF Report
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-10 border-none shadow-2xl bg-primary text-white rounded-[40px] flex flex-col justify-center relative overflow-hidden">
                       <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl" />
                       <div className="relative z-10">
                        <h4 className="text-2xl font-heading font-black mb-6 flex items-center gap-3">
                          <Stethoscope className="w-6 h-6" />
                          Next Steps & Advice
                        </h4>
                        <div className="space-y-6">
                          {[
                            { title: "Consult Physician", desc: "Share these results with your family doctor." },
                            { title: "Monitor Diet", desc: "Focus on nutrition based on your abnormal values." },
                            { title: "Hydration", desc: "Maintain at least 3-4 liters of water intake daily." },
                            { title: "Follow-up", desc: "Re-test abnormal parameters in 4-6 weeks." }
                          ].map((step, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black shrink-0">
                                {i + 1}
                              </div>
                              <div>
                                <h5 className="font-black text-lg">{step.title}</h5>
                                <p className="text-primary-foreground/70 text-sm font-medium">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                       </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "prescription" && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <PrescriptionAnalyzer 
                onSearchMedicine={handleMedicineSearch} 
                onCombinedSearch={handleCombinedSearch}
              />
            </div>
          )}

          {activeTab === "medicines" && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <MedicineSearch 
                externalQuery={medicineSearchQuery} 
                combinedMedicines={combinedMedicines}
              />
            </div>
          )}

          {activeTab === "healthscore" && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <HealthScoreAnalyzer />
            </div>
          )}

          {activeTab === "chatbot" && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <Chatbot />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
