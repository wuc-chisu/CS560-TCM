import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ClinicIntro } from "@/components/sections/clinic-intro";
import { ContactUs } from "@/components/sections/contact-us";
import { Doctors } from "@/components/sections/doctors";
import { HealthArticles } from "@/components/sections/health-articles";
import { HeroBanner } from "@/components/sections/hero-banner";
import { Services } from "@/components/sections/services";

export default function Home() {
  return (
    <div className="bg-[#f8f2e8]">
      <SiteHeader />
      <main>
        <HeroBanner />
        <ClinicIntro />
        <Services />
        <Doctors />
        <HealthArticles />
        <ContactUs />
      </main>
      <SiteFooter />
    </div>
  );
}
