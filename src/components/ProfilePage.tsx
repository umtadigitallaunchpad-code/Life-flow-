import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, MapPin, Activity, Edit2, Check, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface ProfilePageProps {
  setCurrentPage: (page: 'home' | 'profile') => void;
}

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phone: string;
  relation: string;
  availableForDonation: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentPage }) => {
  const [userDonors, setUserDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Donor>>({});
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    if (!auth.currentUser) {
      setCurrentPage('home');
      return;
    }
    
    try {
      const q = query(collection(db, 'donors'), where('ownerId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const donors: Donor[] = [];
      querySnapshot.forEach((doc) => {
        donors.push({ id: doc.id, ...doc.data() } as Donor);
      });
      setUserDonors(donors);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (donor: Donor) => {
    setEditingId(donor.id);
    setEditFormData({
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      location: donor.location,
      phone: donor.phone,
      relation: donor.relation,
      availableForDonation: donor.availableForDonation
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !auth.currentUser) return;
    
    try {
      const docRef = doc(db, 'donors', editingId);
      await updateDoc(docRef, {
        name: editFormData.name,
        bloodGroup: editFormData.bloodGroup,
        location: editFormData.location,
        phone: editFormData.phone,
        relation: editFormData.relation,
        availableForDonation: editFormData.availableForDonation
      });
      alert('Profile updated successfully!');
      setEditingId(null);
      fetchDonors(); // refresh
    } catch (error: any) {
      console.error("Error updating donor:", error);
      alert('Failed to update profile: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    if (confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'donors', id));
        alert('Profile deleted successfully.');
        fetchDonors();
      } catch (error: any) {
         console.error("Error deleting donor:", error);
         alert('Failed to delete profile: ' + (error?.message || 'Unknown error'));
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Your Profiles</h1>
        <p className="text-gray-400 text-lg">Manage your registered donor profiles and availability.</p>
      </div>

      {userDonors.length === 0 ? (
        <div className="text-center py-24 bg-black/40 rounded-2xl border border-white/5">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Profiles Found</h2>
          <p className="text-gray-400 mb-6">You haven't registered any donor profiles yet.</p>
          <Button onClick={() => { setCurrentPage('home'); setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 100); }} className="bg-primary hover:bg-primary/90">
            Go to Home to Register
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userDonors.map((donor) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-black/60 border-white/10 relative overflow-hidden backdrop-blur-md">
                {editingId === donor.id ? (
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${donor.id}`}>Full Name</Label>
                      <Input id={`name-${donor.id}`} value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="bg-black/50 border-white/20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`relation-${donor.id}`}>Relation</Label>
                      <select id={`relation-${donor.id}`} value={editFormData.relation || ''} onChange={(e) => setEditFormData({...editFormData, relation: e.target.value})} className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-primary">
                        <option>Self</option>
                        <option>Family Member</option>
                        <option>Friend</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`bloodGroup-${donor.id}`}>Blood Group</Label>
                        <select id={`bloodGroup-${donor.id}`} value={editFormData.bloodGroup || ''} onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})} className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-primary">
                          <option>A+</option><option>A-</option>
                          <option>B+</option><option>B-</option>
                          <option>AB+</option><option>AB-</option>
                          <option>O+</option><option>O-</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`available-${donor.id}`}>Availability</Label>
                        <select id={`available-${donor.id}`} value={String(editFormData.availableForDonation)} onChange={(e) => setEditFormData({...editFormData, availableForDonation: e.target.value === 'true'})} className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-1 focus:ring-primary">
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-${donor.id}`}>Location</Label>
                      <Input id={`location-${donor.id}`} value={editFormData.location || ''} onChange={(e) => setEditFormData({...editFormData, location: e.target.value})} className="bg-black/50 border-white/20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${donor.id}`}>Phone</Label>
                      <Input id={`phone-${donor.id}`} value={editFormData.phone || ''} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="bg-black/50 border-white/20 text-white" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><Check className="w-4 h-4 mr-2" /> Save</Button>
                      <Button onClick={handleCancelEdit} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="pb-2">
                       <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                              {donor.name}
                            </CardTitle>
                            <CardDescription className="text-primary mt-1">{donor.relation}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                                {donor.bloodGroup}
                              </span>
                            </div>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {donor.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Activity className={`w-4 h-4 mr-2 ${donor.availableForDonation ? 'text-green-500' : 'text-gray-500'}`} />
                        {donor.availableForDonation ? 'Available to donate' : 'Currently unavailable'}
                      </div>
                      <div className="flex items-center text-sm text-gray-300 font-mono">
                         <span className="text-gray-500 mr-2">Phone:</span> {donor.phone}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 border-t border-white/5 flex gap-2">
                      <Button onClick={() => handleEditClick(donor)} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 bg-white/5">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button onClick={() => handleDelete(donor.id)} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
