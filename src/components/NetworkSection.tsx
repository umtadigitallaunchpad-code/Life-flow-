import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Activity, PhoneCall } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { signIn } from '@/src/lib/firebase';

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  distance?: string;
  availableForDonation: boolean;
}

const NetworkSection: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const auth = getAuth();
    
    // Only fetch donors when the user is signed in
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const db = getFirestore();
        // Notice: 'donors' is plural, as declared in firestore.rules
        const q = query(collection(db, 'donors'));
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const donorData: Donor[] = [];
          snapshot.forEach((doc) => {
            donorData.push({ id: doc.id, ...doc.data(), distance: 'Local' } as Donor);
          });
          setDonors(donorData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching donors:", error);
          setLoading(false);
        });
      } else {
        setDonors([]);
        setLoading(false); // No data to load since user is logged out
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <section id="network" className="py-24 relative z-10 bg-background/50 backdrop-blur-md border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Find Blood <span className="text-primary italic font-serif">Instantly</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-lg">
              Our AI-powered network matches you with the closest available donors.
              Time is critical, and we make every second count.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search Blood Group..." 
                className="pl-10 bg-black/40 border-white/10 text-white w-full h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>
            <Button className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/5">
              <MapPin className="w-4 h-4 mr-2" />
              Local Area
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
             <Activity className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No donors found in the network yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {donors.map((donor, idx) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.1, duration: 0.5 }}
              >
                <Card className="bg-black/40 border-white/5 overflow-hidden group hover:border-primary/50 transition-all duration-300 relative h-full">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardContent className="p-6 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                          {donor.bloodGroup}
                        </span>
                      </div>
                      {donor.availableForDonation ? (
                        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                          <Activity className="w-3 h-3 mr-1" /> Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-800">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-1 truncate" title={donor.name}>{donor.name}</h3>
                    <div className="flex items-center text-sm text-gray-400 mb-6 font-mono flex-grow">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate" title={donor.location}>{donor.location}</span>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full bg-white/5 hover:bg-primary text-white border border-white/10 hover:border-primary transition-all group-hover:shadow-[0_0_20px_-5px_rgba(229,62,62,0.4)] mt-auto"
                      disabled={!donor.availableForDonation}
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Request Contact
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NetworkSection;
