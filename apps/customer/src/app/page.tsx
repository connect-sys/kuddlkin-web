"use client";

import { Hero } from "@/components/home/Hero";
import { ServiceRail } from "@/components/home/ServiceRail";
import { StatsStrip } from "@/components/home/StatsStrip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HappyMomentsGallery } from "@/components/home/HappyMomentsGallery";
import { HappyMoments } from "@/components/home/HappyMoments";
import { getServices, getCamps, campToService } from "@/lib/api";

export default function HomePage() {
  return (
    <>
      <Hero />

      <ServiceRail
        title="Trending right now"
        subtitle="The experiences families are loving this week"
        queryKey={["services", "trending"]}
        fetcher={() => getServices({ limit: 12 })}
        viewAllHref="/services"
      />

      <StatsStrip />

      <ServiceRail
        title="Camps & workshops"
        subtitle="Holiday programmes and hands-on workshops to explore"
        queryKey={["camps", "home"]}
        fetcher={async () => {
          const camps = await getCamps();
          return camps.map(campToService);
        }}
        viewAllHref="/services?module=DISCOVER"
        tint="#FFFAF3"
      />

      <HowItWorks />
      <HappyMomentsGallery />
      <HappyMoments />
    </>
  );
}
