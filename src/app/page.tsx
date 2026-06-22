import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { PitchOverview } from "@/components/sections/JudgePitch";
import { Mechanism } from "@/components/sections/Mechanism";
import { CosmosConnection } from "@/components/sections/CosmosConnection";
import { Fairness } from "@/components/sections/Fairness";
import { Dashboard } from "@/components/sections/Dashboard";
import { Integration } from "@/components/sections/Integration";
import { FooterCTA } from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <PitchOverview />
      <Mechanism />
      <CosmosConnection />
      <main className="w-full max-w-7xl mx-auto px-4 flex flex-col gap-20 py-12">
        <div className="w-full bg-[#EAE4D5] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8">
          <Fairness />
          <Dashboard />
        </div>
        <Integration />
      </main>
      <FooterCTA />
    </>
  );
}
