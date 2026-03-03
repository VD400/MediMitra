import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Zap, 
  ChevronRight, 
  FileText, 
  Pill, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-3xl -ml-16 -mb-16 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest animate-fade-down">
            <Sparkles className="w-4 h-4" />
            AI-Powered Healthcare for Everyone
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-black text-foreground tracking-tight leading-[1.1] animate-fade-up">
            Your Medical Reports, <br />
            <span className="text-primary italic">Clearly Explained.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            MediMitra uses advanced AI to simplify complex lab reports, digitize prescriptions, 
            and find the lowest medicine prices near you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary text-primary-foreground font-black px-10 h-16 rounded-2xl shadow-xl shadow-primary/30 text-lg hover:scale-105 transition-transform"
              onClick={() => navigate("/dashboard")}
            >
              Start Free Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-muted flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-black text-foreground">10,000+ Users</p>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Trusting MediMitra</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            icon={FileText} 
            color="bg-blue-500"
            title="Lab Report Analyzer" 
            description="Upload any blood test or lab report. Get a simple summary and health score instantly."
            delay="0.4s"
          />
          <FeatureCard 
            icon={Pill} 
            color="bg-accent"
            title="Prescription AI" 
            description="Snap a photo of your doctor's note. We'll extract medications, dosages, and timings."
            delay="0.5s"
          />
          <FeatureCard 
            icon={Zap} 
            color="bg-green-500"
            title="Price Comparison" 
            description="Find where your prescribed medicines are available at the lowest prices nearby."
            delay="0.6s"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, color, title, description, delay }: any) => (
  <Card 
    className="p-8 border-none bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-up"
    style={{ animationDelay: delay }}
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-heading font-black text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed text-sm font-medium">
      {description}
    </p>
  </Card>
);

export default HeroSection;
