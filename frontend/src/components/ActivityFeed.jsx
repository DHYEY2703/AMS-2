import React from "react";
import { Clock } from "lucide-react";

const ActivityFeed = ({ activities }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6 tracking-wide drop-shadow-md">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-all">
            <div className="bg-white/10 p-2 rounded-lg mr-4 shadow-inner">
              <Clock className="h-5 w-5 text-neutral-300" />
            </div>
            <p className="text-neutral-200 font-medium">{activity.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
