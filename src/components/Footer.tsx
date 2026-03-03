import { Heart, Mail, Phone, MapPin, ShieldCheck, Stethoscope, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden relative">
    {/* Decorative element */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-white tracking-tight">
                MEDIMITRA
              </h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">
                Your Health Partner
              </p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 font-medium">
            Empowering everyone with AI-driven medical insights. Understand your reports, find affordable medicines, and stay healthy for free.
          </p>
          <div className="flex items-center gap-4">
            <SocialIcon icon={Twitter} />
            <SocialIcon icon={Linkedin} />
            <SocialIcon icon={Github} />
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h3 className="text-white font-black text-sm uppercase tracking-widest">Services</h3>
          <ul className="space-y-4">
            <FooterLink to="/dashboard">Report Analyzer</FooterLink>
            <FooterLink to="/dashboard">Prescription AI</FooterLink>
            <FooterLink to="/dashboard">Medicine Search</FooterLink>
            <FooterLink to="/dashboard">MediBot Chat</FooterLink>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-6">
          <h3 className="text-white font-black text-sm uppercase tracking-widest">Trust & Safety</h3>
          <ul className="space-y-4">
            <FooterLink to="#">Privacy Policy</FooterLink>
            <FooterLink to="#">Terms of Service</FooterLink>
            <FooterLink to="#">Data Security</FooterLink>
            <FooterLink to="#">HIPAA Compliance</FooterLink>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="text-white font-black text-sm uppercase tracking-widest">Get in Touch</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              support@medimitra.com
            </li>
            <li className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              _+91 6393430000
            </li>
            <li className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              Digital Health Hub, IN
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          © 2026 MediMitra • Made by <Heart className="w-3 h-3 text-destructive inline-block mx-1 fill-destructive" /> Team Dhruva
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-green-500/80">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure & Private</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">v 1.0.0 Stable</p>
        </div>
      </div>
    </div>
  </footer>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-sm font-medium hover:text-primary transition-colors flex items-center group">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-3 group-hover:scale-150 transition-transform" />
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ icon: Icon }: { icon: any }) => (
  <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
    <Icon className="w-5 h-5" />
  </button>
);

export default Footer;
