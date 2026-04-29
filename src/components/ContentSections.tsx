import React from 'react';
import { motion } from 'motion/react';
import { lifeFlowContent } from '../content';
import { Activity, Shield, Clock, Heart, Zap, ShieldCheck, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UrgencyStats = () => {
  const { title, description, stats } = lifeFlowContent.urgencyStats;
  return (
    <section className="py-24 bg-black/60 backdrop-blur-md border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
            >
              <div className="text-sm text-primary uppercase tracking-wider mb-2 font-mono">{stat.label}</div>
              <div className="text-4xl font-bold text-white mb-4">{stat.value}</div>
              <p className="text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProblemSolution = () => {
  const { problemSection, solutionSection } = lifeFlowContent;
  return (
    <section className="py-24 bg-black relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-red-500 mb-6">{problemSection.title}</h2>
            <p className="text-gray-400 mb-8">{problemSection.description}</p>
            <ul className="space-y-4">
              {problemSection.points.map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{solutionSection.title}</h2>
            <p className="text-gray-400 mb-8">{solutionSection.description}</p>
            <div className="space-y-6">
              {solutionSection.features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const EmotionalSection = () => {
  const { title, description, storytelling } = lifeFlowContent.emotionalSection;
  return (
    <section className="py-24 bg-gradient-to-b from-black to-red-950/20 relative z-10 border-t border-b border-primary/10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{title}</h2>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed font-serif italic">"{storytelling}"</p>
        <p className="text-gray-400">{description}</p>
      </div>
    </section>
  );
};

export const HowItWorks = () => {
  const { title, steps } = lifeFlowContent.howItWorks;
  return (
    <section className="py-24 bg-black/80 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="text-6xl font-black text-white/5 absolute -top-8 -left-4 pointer-events-none">{step.step}</div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full relative z-10">
                <h4 className="text-xl font-bold text-white mb-3 mt-4">{step.title}</h4>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TrustAndImpact = () => {
  const { impactSection, trustSection } = lifeFlowContent;
  return (
    <section className="py-24 bg-black relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{impactSection.title}</h2>
          <p className="text-2xl text-gray-300 mb-4 font-serif italic">"{impactSection.vision}"</p>
          <p className="text-gray-400">{impactSection.description}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-left">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <ShieldCheck className="w-16 h-16 text-primary mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">{trustSection.title}</h3>
            </div>
            <div className="flex-1 w-full">
              <ul className="space-y-4">
                {trustSection.points.map((point, idx) => (
                  <li key={idx} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-4" />
                    <span className="text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const CallToAction = () => {
  const { title, description, buttons } = lifeFlowContent.callToAction;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scrollToNetwork = () => {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 bg-primary/10 relative z-10 text-center overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pattern-dots" />
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">{title}</h2>
        <p className="text-xl text-gray-300 mb-12">{description}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={scrollToTop} size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_0_30px_-5px_rgba(229,62,62,0.5)]">
            {buttons[0]}
          </Button>
          <Button onClick={scrollToNetwork} size="lg" variant="outline" className="h-14 px-8 text-lg border-primary/50 text-white hover:bg-primary/10 rounded-full bg-black/20 backdrop-blur-md">
            {buttons[1]}
          </Button>
        </div>
      </div>
    </section>
  );
};
