import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { getQueueCount, syncQueue, isOnline as checkOnline } from "../lib/offlineQueue";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const NetworkStatus = () => {
  const [online, setOnline] = useState(checkOnline());
  const [pendingCount, setPendingCount] = useState(getQueueCount());
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      setShowBanner(true);

      // Auto-sync queued requests when back online
      const count = getQueueCount();
      if (count > 0) {
        setSyncing(true);
        toast.loading(`Syncing ${count} offline record(s)...`, { id: "sync-toast" });
        const { synced, failed } = await syncQueue(axiosInstance);
        setSyncing(false);
        setPendingCount(getQueueCount());
        
        if (synced > 0) {
          toast.success(`✅ ${synced} record(s) synced successfully!`, { id: "sync-toast" });
        }
        if (failed > 0) {
          toast.error(`❌ ${failed} record(s) failed to sync.`, { id: "sync-failed" });
        }
      } else {
        toast.success("You're back online!", { id: "sync-toast", duration: 2000 });
      }

      setTimeout(() => setShowBanner(false), 4000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowBanner(true);
      toast.error("You are offline. Changes will be saved locally.", { id: "offline-toast", duration: 3000 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Poll pending count every 2 seconds
    const interval = setInterval(() => {
      setPendingCount(getQueueCount());
    }, 2000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!online || syncing || pendingCount === 0) return;
    setSyncing(true);
    toast.loading("Syncing...", { id: "manual-sync" });
    const { synced, failed } = await syncQueue(axiosInstance);
    setSyncing(false);
    setPendingCount(getQueueCount());
    if (synced > 0) toast.success(`${synced} record(s) synced!`, { id: "manual-sync" });
    if (failed > 0) toast.error(`${failed} record(s) failed.`);
    if (synced === 0 && failed === 0) toast.dismiss("manual-sync");
  };

  return (
    <>
      {/* Floating status indicator (bottom-right corner) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {/* Pending sync badge */}
        {pendingCount > 0 && (
          <button
            onClick={handleManualSync}
            disabled={!online || syncing}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold tracking-widest uppercase border backdrop-blur-xl transition-all ${
              syncing
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse"
                : online
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer"
                : "bg-neutral-800/80 text-neutral-500 border-neutral-700 cursor-not-allowed"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : `${pendingCount} Pending`}
          </button>
        )}

        {/* Connection status pill */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold tracking-widest uppercase border backdrop-blur-xl transition-all ${
            online
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse"
          }`}
        >
          {online ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          {online ? "Online" : "Offline"}
        </div>
      </div>

      {/* Top banner that slides in when status changes */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
            online
              ? "bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/20 backdrop-blur-xl"
              : "bg-red-500/20 text-red-300 border-b border-red-500/20 backdrop-blur-xl"
          }`}
        >
          {online ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Connection restored! {pendingCount > 0 ? "Syncing offline data..." : "All data is up to date."}
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              No internet connection. Your changes will be saved locally and synced when you reconnect.
            </>
          )}
        </div>
      )}
    </>
  );
};

export default NetworkStatus;
