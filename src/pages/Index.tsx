import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  HeartPulse, 
  Microscope,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HeroSection />

        {/* How it Works Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-heading font-black text-foreground">How MediMitra Works</h2>
              <p className="text-muted-foreground font-medium">Three simple steps to better health understanding.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-primary/20 -z-10" />
              
              <Step 
                number="01" 
                title="Upload Document" 
                description="Upload your lab report or prescription as a PDF or photo."
              />
              <Step 
                number="02" 
                title="AI Analysis" 
                description="Our specialized AI extracts data and translates medical jargon into simple English."
              />
              <Step 
                number="03" 
                title="Get Insights" 
                description="View your health score, find cheap medicines, and download your simplified report."
              />
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Your Privacy is Our Priority
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground leading-tight">
                  Medical Grade Security <br />
                  <span className="text-primary">For Your Private Data.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We understand the sensitivity of medical data. All your uploads are encrypted 
                  and we never share your personal health information with third parties.
                </p>
                <div className="space-y-4">
                  <FeatureItem text="HIPAA Compliant Data Handling" />
                  <FeatureItem text="End-to-End Encryption" />
                  <FeatureItem text="No Login Required for Quick Analysis" />
                </div>
                <Button 
                  size="lg" 
                  className="bg-foreground text-white font-black px-10 h-16 rounded-2xl"
                  onClick={() => navigate("/dashboard")}
                >
                  Experience It Now
                </Button>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] -z-10" />
                <Card className="p-8 border-none shadow-2xl rounded-[40px] bg-white relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <HeartPulse className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-foreground">Health Dashboard</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Live Analysis</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-primary/5 rounded-3xl border border-primary/10 p-4">
                        <p className="text-[10px] font-black text-primary uppercase mb-1">Score</p>
                        <p className="text-2xl font-black text-foreground">92%</p>
                      </div>
                      <div className="h-24 bg-accent/5 rounded-3xl border border-accent/10 p-4">
                        <p className="text-[10px] font-black text-accent uppercase mb-1">Status</p>
                        <p className="text-2xl font-black text-foreground">Good</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-heading font-black">What Our Users Say</h2>
              <p className="text-slate-400 font-medium">Helping thousands understand their health better every day.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial 
                name="Rahul Sharma" 
                role="Diabetes Patient"
                content="I used to be so confused by my blood sugar reports. MediMitra simplified everything and even helped me find my insulin at a 20% lower price!"
              />
              <Testimonial 
                name="Dr. Anjali Gupta" 
                role="General Physician"
                content="I recommend this to my patients. It helps them follow my prescriptions accurately and keep track of their lab results in a simple way."
              />
              <Testimonial 
                name="Suresh Mehra" 
                role="Caregiver"
                content="Managing my parents' health became so much easier. The prescription scanner is a lifesaver for tracking multiple medications."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight">
              Ready to take control of <br /> your health journey?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">
              Join 10,000+ users who are already using MediMitra to simplify their medical lives.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-slate-100 font-black px-12 h-16 rounded-2xl text-lg shadow-xl"
                onClick={() => navigate("/dashboard")}
              >
                Get Started Now — It's Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 font-black px-12 h-16 rounded-2xl text-lg"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Step = ({ number, title, description }: any) => (
  <div className="text-center space-y-4 group">
    <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mx-auto text-2xl font-black text-primary group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <h3 className="text-xl font-heading font-black text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm font-medium leading-relaxed">{description}</p>
  </div>
);

const FeatureItem = ({ text }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    </div>
    <span className="font-bold text-foreground text-sm">{text}</span>
  </div>
);

const Testimonial = ({ name, role, content }: any) => (
  <Card className="p-8 bg-slate-800 border-none text-white space-y-6 hover:bg-slate-700 transition-colors">
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-lg leading-relaxed italic text-slate-300">"{content}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-600" />
      <div>
        <p className="font-black text-white">{name}</p>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </Card>
);

export default Index;
