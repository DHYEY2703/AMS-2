import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, ShieldAlert } from "lucide-react";

const Profile = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.name || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name || name === authUser.name) return;
    await updateProfile({ name });
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4">
      <div className="glass-card flex flex-col gap-8 p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-md mb-2">Profile Details</h1>
          <p className="text-neutral-400">Manage your profile information and image</p>
        </div>

        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4 border-white/20 shadow-lg"
              onError={(e) => {
                e.target.src = "https://ui-avatars.com/api/?name=" + (authUser?.name || "User") + "&background=random";
              }}
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 
                bg-white border-4 border-neutral-900 p-2 rounded-full cursor-pointer 
                transition-all duration-200 hover:scale-105
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
            >
              <Camera className="w-5 h-5 text-black" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-neutral-400 font-medium">
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdateName} className="space-y-6 max-w-lg mx-auto w-full mt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input flex-grow text-white"
                placeholder="Your full name"
              />
              <button 
                type="submit" 
                className="glass-button whitespace-nowrap"
                disabled={name === authUser?.name || isUpdatingProfile}
              >
                Save
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              value={authUser?.email || ""}
              className="glass-input w-full text-neutral-400 bg-neutral-900/50 cursor-not-allowed"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Role & Class
            </label>
            <div className="glass-input w-full flex justify-between items-center text-neutral-400 bg-neutral-900/50 cursor-not-allowed">
              <span className="capitalize">{authUser?.role || "Unknown Role"}</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">{authUser?.classId?.name || "No Class Assigned"}</span>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
