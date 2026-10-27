import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StructuredSystem from "@/components/StructuredSystem";
import ProblemSection from "@/components/ProblemSection";
import Solutions from "@/components/Solutions";
import CoreCapabilities from "@/components/CoreCapabilities";
import LogoMarquee from "@/components/LogoMarquee";
import UseCases from "@/components/UseCases";
import Architecture from "@/components/Architecture";
import WhyAugent from "@/components/WhyAugent";
import WhoUses from "@/components/WhoUses";
import Philosophy from "@/components/Philosophy";
import CTAForm from "@/components/CTAForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StructuredSystem />
        <ProblemSection />
        <Solutions />
        <CoreCapabilities />
        <LogoMarquee />
        <UseCases />
        <Architecture />
        <WhyAugent />
        <WhoUses />
        <Philosophy />
        <CTAForm />
      </main>
      <Footer />
    </>
  );
}
