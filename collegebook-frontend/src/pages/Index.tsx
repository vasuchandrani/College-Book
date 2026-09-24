import SEO from "@/components/SEO";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CampusTicker from "@/components/landing/CampusTicker";
import InteractiveFeatureShowcase from "@/components/landing/InteractiveFeatureShowcase";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import MobileLanding from "@/components/landing/MobileLanding";
import { Navigate } from "react-router-dom";
import { isAuthTokenValid } from "@/lib/api";

const Index = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;

  if (isAuthTokenValid(token)) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="hidden md:block">
        <SEO />
        <Navbar />
        <main>
          <HeroSection />
          <CampusTicker />
          <InteractiveFeatureShowcase />
          <FeaturesSection />
          <div id="how-it-works">
            <HowItWorksSection />
          </div>
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
      <MobileLanding />
    </div>
  );
};

export default Index;
