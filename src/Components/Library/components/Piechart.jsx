import React from 'react';

const Piechart = ({ myBalance, totalSupply }) => {
  const percentage = (myBalance / totalSupply) * 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="12"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold">
            {percentage.toFixed(1)}%
          </span>
          <p className="text-sm text-gray-500">Network Share</p>
        </div>
      </div>
    </div>
  );
};

export default Piechart;