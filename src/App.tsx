/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HeartCanvas from "./components/HeartCanvas";
import NetworkSection from "./components/NetworkSection";
import EmergencyPanel from "./components/EmergencyPanel";
import ProfilePage from "./components/ProfilePage";
import { lifeFlowContent } from "./content";
import { UrgencyStats, ProblemSolution, EmotionalSection, HowItWorks, TrustAndImpact, CallToAction } from "./components/ContentSections";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <HeartCanvas />
      <Navbar setCurrentPage={setCurrentPage} />
      <main className="flex-1">
        {currentPage === 'home' ? (
          <>
            <Hero />
            <UrgencyStats />
            <ProblemSolution />
            <NetworkSection />
            <EmotionalSection />
            <HowItWorks />
            <EmergencyPanel />
            <TrustAndImpact />
            <CallToAction />
          </>
        ) : (
          <ProfilePage setCurrentPage={setCurrentPage} />
        )}
      </main>
      
      <footer className="py-12 border-t border-white/5 bg-background/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">{lifeFlowContent.footer.message}</p>
          <p className="text-gray-500 font-mono text-sm">
            {lifeFlowContent.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
