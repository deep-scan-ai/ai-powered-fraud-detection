import { TrendingUp } from "lucide-react";

function StatsCard({ title, value, icon, trend, color, bgGradient }) {
  const IconComponent = icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgGradient} p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-white/90">
              <TrendingUp size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        <div className={`p-4 bg-white/20 rounded-xl backdrop-blur-sm`}>
          <IconComponent className={`text-white`} size={32} />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
