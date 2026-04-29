import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, MapPin, Activity, ShieldAlert, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signIn } from '@/src/lib/firebase';

const EmergencyPanel: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    location: '',
    contact: ''
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    
    if (!auth.currentUser) {
      try {
        await signIn();
      } catch (error: any) {
        if (error?.code === 'auth/popup-blocked') {
          alert('Sign-in popup blocked. Please allow popups for this site and try again.');
        } else if (error?.code !== 'auth/cancelled-popup-request' && error?.code !== 'auth/popup-closed-by-user') {
          alert('Sign-in error: ' + (error?.message || 'Unknown error'));
        }
        return;
      }
    }

    if (auth.currentUser) {
      setIsSubmitting(true);
      try {
        const db = getFirestore();
        const requestId = crypto.randomUUID();
        
        await setDoc(doc(db, 'emergency_requests', requestId), {
          id: requestId,
          requesterId: auth.currentUser.uid,
          bloodGroup: formData.bloodGroup,
          status: 'active',
          createdAt: serverTimestamp(),
          location: formData.location,
          contact: formData.contact,
          lat: 0,
          lng: 0
        });
        
        alert('Emergency Broadcast Sent successfully!');
        setIsActive(false);
        setFormData({ bloodGroup: 'A+', location: '', contact: '' });
      } catch (error: any) {
        console.error("Error creating emergency request:", error);
        alert('Failed to send broadcast: ' + (error?.message || 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section id="emergency" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-destructive/30 bg-destructive/5 backdrop-blur-xl"
        >
          {/* Animated Background Warning lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #e53e3e 10px, #e53e3e 20px)' }} 
          />
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-destructive/20 mb-6 relative">
                <div className="absolute inset-0 bg-destructive/50 rounded-full animate-ping opacity-20" />
                <ShieldAlert className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Emergency Broadcast</h2>
              <p className="text-gray-400">
                Immediately alert all highly-matched donors within a 20km radius. 
                Only use this for critical, life-threatening situations where blood is needed urgently.
              </p>
            </div>

            <div className="w-full md:w-1/2">
              <AnimatePresence mode="wait">
                {!isActive ? (
                  <motion.div 
                    key="trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-2xl border border-white/5"
                  >
                    <Button 
                      size="lg" 
                      onClick={() => setIsActive(true)}
                      className="h-20 w-full text-xl font-bold bg-destructive hover:bg-destructive/90 text-white rounded-xl shadow-[0_0_40px_-5px_rgba(229,62,62,0.6)] hover:shadow-[0_0_60px_-5px_rgba(229,62,62,0.8)] transition-all"
                    >
                      <AlertTriangle className="w-6 h-6 mr-3" />
                      ACTIVATE EMERGENCY
                    </Button>
                    <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest text-center">Bypasses standard matching</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-black/60 rounded-2xl border border-destructive/40 shadow-[0_0_30px_-5px_rgba(229,62,62,0.2)]"
                  >
                    <form className="space-y-4" onSubmit={handleBroadcast}>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Required Blood Group</Label>
                        <select 
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                          className="flex h-12 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-destructive"
                        >
                          <option>A+</option><option>A-</option>
                          <option>B+</option><option>B-</option>
                          <option>AB+</option><option>AB-</option>
                          <option>O+</option><option>O-</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Hospital Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <Input 
                            required 
                            placeholder="E.g. City General Hospital" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="pl-10 h-12 rounded-xl bg-black/50 border-white/10 text-white focus-visible:ring-destructive focus-visible:border-destructive" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Contact Number</Label>
                        <Input 
                          required 
                          type="tel" 
                          placeholder="Your direct line" 
                          value={formData.contact}
                          onChange={(e) => setFormData({...formData, contact: e.target.value})}
                          className="h-12 rounded-xl bg-black/50 border-white/10 text-white focus-visible:ring-destructive focus-visible:border-destructive" 
                        />
                      </div>
                      <div className="pt-2 flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsActive(false)} className="flex-1 hover:bg-white/5 text-gray-400">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Broadcasting...' : 'Broadcast'}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyPanel;
