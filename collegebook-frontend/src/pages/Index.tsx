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

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
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
  );
};

export default Index;
