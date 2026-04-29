import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/src/lib/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const Hero: React.FC = () => {
  const [pulse, setPulse] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relation: 'Self',
    bloodGroup: 'A+',
    location: '',
    phone: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    if (!auth.currentUser) {
      try {
        await signIn();
      } catch (error: any) {
        if (error?.code === 'auth/popup-blocked') {
          alert('Sign-in popup blocked. Please allow popups for this site and try again.');
        } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
          alert('Sign-in was cancelled. Please complete sign-in to register.');
        } else {
          alert('An error occurred during sign-in: ' + (error?.message || 'Unknown error'));
        }
        return; // Stop if sign-in fails
      }
    }
    
    // Check again, as signIn might resolve without errors but user is still not signed in depending on auth flow
    if (auth.currentUser) {
      try {
        const db = getFirestore();
        const donorId = crypto.randomUUID();
        await setDoc(doc(db, 'donors', donorId), {
          id: donorId,
          ownerId: auth.currentUser.uid,
          name: formData.name,
          relation: formData.relation,
          bloodGroup: formData.bloodGroup,
          location: formData.location,
          phone: formData.phone,
          availableForDonation: true,
          lat: 0,
          lng: 0,
        });
        alert(`Registration complete! ${formData.name}'s profile has been added to the LifeFlow network.`);
        setIsRegistering(false);
        setFormData({ ...formData, name: '', location: '', phone: '' });
      } catch (error: any) {
         console.error('Error adding document: ', error);
         if (error?.message?.includes('Missing or insufficient permissions')) {
            alert('Failed to save profile: You do not have permission to perform this action.');
         } else {
            alert('Failed to register: ' + (error?.message || 'Please try again later.'));
         }
      }
    } else {
      alert('You must be signed in to register.');
    }
  };

  return (
    <section className="relative h-screen w-full bg-black text-white overflow-hidden flex items-center justify-center">

      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-black"></div>

      {/* Animated Pulse Glow */}
      <motion.div
        animate={{
          scale: pulse ? 1.2 : 1,
          opacity: pulse ? 0.4 : 0.2,
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-6">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 inline-block px-4 py-1 text-sm border border-white/20 rounded-full backdrop-blur-md"
        >
          Real-Time Blood Network
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-6xl font-semibold leading-tight"
        >
          Be the Hero <br />
          <span className="text-red-500">
            Someone Desperately Needs
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto"
        >
          Every second, someone is fighting for life. LifeFlow connects you instantly
          with nearby donors or lets you broadcast emergency requests in real-time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button onClick={() => document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium transition cursor-pointer">
            Find a Donor
          </button>

          <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
            <DialogTrigger render={
              <button className="px-8 py-3 border border-white/20 hover:border-white/40 rounded-full backdrop-blur-md transition cursor-pointer">
                Become a Lifesaver
              </button>
            } />
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Join LifeFlow</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Register your profile to become a verified donor in your local area.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black/50 border-white/10 text-white focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relation">Relation</Label>
                  <select id="relation" value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-primary">
                    <option>Self</option>
                    <option>Family Member</option>
                    <option>Friend</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <select id="bloodGroup" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-primary">
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>AB+</option><option>AB-</option>
                    <option>O+</option><option>O-</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">General Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input id="location" required placeholder="City or Postal Code" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="pl-10 bg-black/50 border-white/10 text-white focus-visible:ring-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input id="phone" type="tel" required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-black/50 border-white/10 text-white focus-visible:ring-primary" />
                </div>
                <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-white">
                  Save Profile
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};

export default Hero;
