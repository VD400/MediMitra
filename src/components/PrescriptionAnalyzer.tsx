import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Pill, ClipboardList, Search, Activity, Heart, Hospital, Calendar, Edit3, Check, RefreshCw, AlertTriangle, User, ArrowRight, Info, ShieldCheck } from "lucide-react";
import { analyzePrescription } from "@/lib/ai";
import Tesseract from "tesseract.js";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface PrescriptionAnalysis {
  summary?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    context: string;
  }[];
  doctor_name: string;
  hospital_name: string;
  date: string;
  total_estimated_price_range: string;
}

interface PrescriptionAnalyzerProps {
  onSearchMedicine?: (name: string) => void;
  onCombinedSearch?: (medicines: string[]) => void;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
  <div className="flex items-center gap-5">
    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <div>
      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="font-black text-xl text-white tracking-tight">{value || "N/A"}</p>
    </div>
  </div>
);

const PrescriptionAnalyzer = ({ onSearchMedicine, onCombinedSearch }: PrescriptionAnalyzerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [isOcrDone, setIsOcrDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PrescriptionAnalysis | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOcrText("");
      setIsOcrDone(false);
      setAnalysis(null);
      setError("");
      // Auto-start OCR
      performOcr(selectedFile);
    }
  };

  const performOcr = async (imageFile: File) => {
    setOcrLoading(true);
    setProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      setOcrText(text);
      setIsOcrDone(true);
    } catch (err: any) {
      setError("OCR failed: " + err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!ocrText) return;
    setAnalyzing(true);
    setError("");

    try {
      const analysisResult = await analyzePrescription(ocrText, file?.name || "prescription.jpg");
      setAnalysis(analysisResult);

      // Save to local history if needed (optional for now, as we're focusing on no-login)
      const newPrescription = {
        id: Date.now().toString(),
        file_name: file?.name || "Prescription",
        analysis: analysisResult,
        created_at: new Date().toISOString(),
      };
      
      const existing = localStorage.getItem("medimitra_prescriptions");
      const prescriptions = existing ? JSON.parse(existing) : [];
      localStorage.setItem("medimitra_prescriptions", JSON.stringify([newPrescription, ...prescriptions].slice(0, 10)));

    } catch (err: any) {
      setError(err.message || "Failed to analyze prescription");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-card rounded-[32px] border border-border p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20 rotate-3">
            <Pill className="w-10 h-10 text-primary-foreground -rotate-3" />
          </div>
          <h2 className="text-4xl font-heading font-black text-foreground tracking-tight mb-4">Handwriting Decipherer</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            Upload your handwritten prescription. Our specialized AI will decode the doctor's handwriting and extract medication info.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          {!isOcrDone && !ocrLoading ? (
            <label className="w-full max-w-xl">
              <div className={`border-4 border-dashed rounded-[40px] p-12 transition-all cursor-pointer flex flex-col items-center group ${
                file ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
              }`}>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-black text-foreground text-lg mb-2">
                  Upload prescription photo
                </p>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest text-center">
                  Support for JPEG, PNG, WEBP. Ensure the handwriting is well-lit.
                </p>
              </div>
            </label>
          ) : null}

          {ocrLoading && (
            <div className="w-full max-w-xl flex flex-col items-center p-12 bg-slate-50 rounded-[40px] border-4 border-slate-100 animate-pulse">
              <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-black text-lg text-primary mb-2">Reading Handwriting...</p>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="mt-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">{progress}% Complete</p>
            </div>
          )}

          {isOcrDone && !analyzing && (
            <div className="w-full max-w-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white font-black">STEP 1: REVIEW TEXT</Badge>
                  <p className="text-xs font-bold text-muted-foreground italic">OCR might have some typos</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary font-black hover:bg-primary/5 rounded-xl h-10 px-4"
                >
                  {isEditing ? <><Check className="w-4 h-4 mr-2" /> Finish Editing</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit Text</>}
                </Button>
              </div>

              <div className="relative group">
                <Textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  readOnly={!isEditing}
                  className={`min-h-[200px] rounded-[32px] p-8 text-lg font-medium leading-relaxed transition-all border-2 ${
                    isEditing ? 'border-primary ring-4 ring-primary/10 shadow-xl' : 'border-slate-100 bg-slate-50/50'
                  }`}
                  placeholder="The extracted text will appear here..."
                />
                {!isEditing && (
                  <div className="absolute inset-0 bg-transparent cursor-pointer rounded-[32px]" onClick={() => setIsEditing(true)} />
                )}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setIsOcrDone(false);
                    setAnalysis(null);
                  }}
                  className="h-16 px-8 rounded-2xl font-black text-lg border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Retake Photo
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  className="h-16 px-12 rounded-2xl font-black text-xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                >
                  Decipher & Search
                  <Activity className="ml-3 w-6 h-6" />
                </Button>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="w-full max-w-xl flex flex-col items-center p-12 bg-primary/5 rounded-[40px] border-4 border-primary/10">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-black text-xl text-primary">AI Deciphering Handwriting...</p>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Connecting to medical context engine...</p>
            </div>
          )}
          
          {error && (
            <p className="mt-6 text-destructive font-bold flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-xl animate-shake">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      </div>

      {analysis && (
        <div className="space-y-12 animate-fade-up">
          {/* Prescription Summary Header */}
          <div className="bg-slate-900 text-white p-12 rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mb-32 blur-[80px]" />
            
            <div className="relative z-10 space-y-6 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-3 bg-primary/20 text-primary px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border border-primary/20">
                <ShieldCheck className="w-4 h-4" />
                Verified Digital Record
              </div>
              <h2 className="text-5xl font-heading font-black leading-tight tracking-tight">Handwriting <span className="text-primary italic">Deciphered</span></h2>
              <p className="text-slate-400 font-medium text-xl leading-relaxed">
                {analysis.summary && analysis.summary.length < 300 
                  ? analysis.summary 
                  : "Our AI has digitized your handwritten prescription. You can view the extracted medications and estimated costs below."}
              </p>
            </div>
            
            <div className="relative z-10 shrink-0">
              <div className="w-48 h-48 rounded-full border-[12px] border-white/5 border-t-primary flex flex-col items-center justify-center shadow-2xl bg-white/5 backdrop-blur-sm group">
                <span className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-500">{analysis.medications.length}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Medications</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr,380px] gap-10">
            <div className="space-y-8">
              <h3 className="text-3xl font-black text-foreground flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                Prescribed Medications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {analysis.medications.map((med, i) => (
                  <Card key={i} className="p-8 border-2 border-slate-100 shadow-xl bg-white hover:border-primary/20 transition-all group rounded-[40px] relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-20 h-20 rounded-[28px] bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                          <Pill className="w-10 h-10 text-primary" />
                        </div>
                        {onSearchMedicine && (
                          <Button 
                            size="icon" 
                            onClick={() => onSearchMedicine(med.name)}
                            className="h-16 w-16 rounded-2xl shadow-xl shadow-primary/10 group-hover:scale-105 transition-all bg-primary text-white"
                            title="Check Local Price"
                          >
                            <Search className="w-8 h-8" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-6 flex-1">
                        <div>
                          <h4 className="text-3xl font-black text-foreground mb-3 group-hover:text-primary transition-colors tracking-tight line-clamp-1">[{med.name}]</h4>
                          <div className="flex flex-wrap gap-3">
                            <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border-none">
                              {med.dosage}
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest border-none">
                              {med.frequency}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Duration</p>
                            <p className="text-sm font-black text-slate-800 truncate">{med.duration || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Timing</p>
                            <p className="text-sm font-black text-slate-800 truncate">{med.instructions || "N/A"}</p>
                          </div>
                        </div>

                        <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 relative overflow-hidden mt-auto">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Use Case
                          </p>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed italic line-clamp-2">
                            "{med.context}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Total Combined Estimation Card */}
              <Card className="p-12 border-none bg-gradient-to-br from-primary to-blue-600 text-white rounded-[48px] shadow-2xl shadow-primary/30 flex flex-col md:flex-row items-center justify-between gap-10 mt-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-80">Total Combined Price Estimation</p>
                  <h4 className="text-6xl font-black tracking-tighter">{analysis.total_estimated_price_range}</h4>
                    <p className="text-lg font-medium opacity-70">
                      Calculated for {analysis.medications.length} {analysis.medications.length === 1 ? 'medicine' : 'medicines'} in your nearby stores
                    </p>
                </div>
                {onCombinedSearch && (
                  <Button 
                    onClick={() => onCombinedSearch(analysis.medications.map(m => m.name))}
                    size="lg"
                    className="relative z-10 h-20 px-12 rounded-[28px] bg-white text-primary font-black text-xl hover:bg-slate-50 transition-all shadow-2xl shadow-black/10 flex items-center gap-3"
                  >
                    Search All Nearby Shops
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                )}
              </Card>
            </div>

            {/* Sidebar Info Column */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Hospital className="w-5 h-5 text-primary" />
                </div>
                Metadata
              </h3>
              
              <Card className="p-10 border-none shadow-2xl bg-slate-900 text-white rounded-[48px] sticky top-24 space-y-10">
                <div className="space-y-8">
                  <InfoItem icon={Hospital} label="Facility" value={analysis.hospital_name} />
                  <InfoItem icon={User} label="Consultant" value={analysis.doctor_name} />
                  <InfoItem icon={Calendar} label="Date Issued" value={analysis.date} />
                </div>
                
                <div className="pt-10 border-t border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Estimated Cost</p>
                    <Badge className="bg-primary/20 text-primary border-none font-black px-3 py-1 rounded-full">{analysis.total_estimated_price_range}</Badge>
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <p className="text-xs font-bold text-slate-400">Verified by MediMitra AI</p>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 italic uppercase font-bold tracking-wider">
                      This information is extracted using advanced OCR. Please confirm dosages with your pharmacist before consumption.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PrescriptionAnalyzer;
