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
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { isAuthTokenValid } from "@/lib/api";

const Index = () => {
  const [showFullMobileLanding, setShowFullMobileLanding] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;

  if (isAuthTokenValid(token)) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className={showFullMobileLanding ? "block" : "hidden md:block"}>
        <FullLanding
          showMobileBackButton={showFullMobileLanding}
          onBack={() => setShowFullMobileLanding(false)}
        />
      </div>
      {!showFullMobileLanding && (
        <MobileLanding onExplore={() => setShowFullMobileLanding(true)} />
      )}
    </div>
  );
};

const FullLanding = ({
  showMobileBackButton,
  onBack,
}: {
  showMobileBackButton: boolean;
  onBack: () => void;
}) => (
  <>
    <SEO />
    {showMobileBackButton && (
      <button
        type="button"
        onClick={onBack}
        className="fixed left-4 top-20 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-4 text-sm font-semibold text-foreground shadow-md backdrop-blur md:hidden"
        aria-label="Back to the mobile CollegeBook landing page"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    )}
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
  </>
);

export default Index;
