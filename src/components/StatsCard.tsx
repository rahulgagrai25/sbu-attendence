interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 lg:p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs sm:text-sm mt-2 ${trend ? trendColors[trend] : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-3 text-blue-600">
            <div className="text-2xl sm:text-3xl">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}

