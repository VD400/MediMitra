import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-black text-foreground tracking-tight">
              MEDIMITRA
            </h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">
              Your Health Partner
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-foreground hover:text-primary transition-colors">Home</Link>
          <button onClick={() => navigate("/dashboard")} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Analyzer</button>
          <button onClick={() => navigate("/dashboard")} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Medicines</button>
          <button onClick={() => navigate("/dashboard")} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Chatbot</button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/dashboard">
            <Button className="bg-primary text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-border p-4 animate-fade-in">
          <nav className="flex flex-col gap-4">
            <Link to="/" className="text-sm font-bold p-2 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <button onClick={() => {navigate("/dashboard"); setIsMenuOpen(false);}} className="text-left text-sm font-bold p-2 hover:bg-primary/5 rounded-lg">Analyzer</button>
            <button onClick={() => {navigate("/dashboard"); setIsMenuOpen(false);}} className="text-left text-sm font-bold p-2 hover:bg-primary/5 rounded-lg">Medicines</button>
            <button onClick={() => {navigate("/dashboard"); setIsMenuOpen(false);}} className="text-left text-sm font-bold p-2 hover:bg-primary/5 rounded-lg">Chatbot</button>
            <hr className="border-border" />
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full bg-primary text-primary-foreground font-black py-6 rounded-xl">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
