import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/landing/HeroSection";
import { SuccessAgitationSection } from "@/components/landing/SuccessAgitationSection";
import { ValueStackSection } from "@/components/landing/ValueStackSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { SharingJourneySection } from "@/components/landing/SharingJourneySection";
import { ConversionSection } from "@/components/landing/ConversionSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default async function LandingPage() {
  const userCount = await prisma.user.count();
  const sampleUsers = await prisma.user.findMany({
    where: { avatarUrl: { not: null } },
    select: { avatarUrl: true },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="flex min-h-screen flex-col w-full">
      <HeroSection userCount={Math.max(500, userCount)} sampleUsers={sampleUsers} />
      <SuccessAgitationSection />
      <ValueStackSection />
      <SocialProofSection />
      <SharingJourneySection />
      <ConversionSection />
      <FooterSection />
    </main>
  );
}
