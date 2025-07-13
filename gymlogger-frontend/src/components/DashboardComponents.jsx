// src/components/DashboardComponents.jsx
import React from 'react';

// Reusable Tab Button Component
export const TabButton = ({ label, isActive, onClick, color = "red" }) => {
  const activeColor =
    color === "cyan"
      ? "bg-cyan-500 text-white shadow-lg"
      : "bg-red-600 text-white shadow-lg";
  const hoverColor =
    color === "cyan"
      ? "hover:bg-cyan-500 hover:text-white"
      : "hover:bg-red-600 hover:text-white";

  return (
    <button
      className={`px-5 py-2 sm:px-3 sm:py-2 rounded-lg font-semibold text-sm sm:text-sm transition-all duration-300 ease-in-out whitespace-nowrap
        ${isActive ? activeColor : `bg-gray-800 text-gray-300 ${hoverColor}`}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// DashboardCard Component - Description removed
export const DashboardCard = ({ title, onClick }) => (
  <div
    className="bg-gray-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
               transform hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center text-center w-48 h-10"
    onClick={onClick}
  >
    <div>
      <h3 className="text-2m font-bold text-stone-200">{title}</h3>
      {/* Description removed as requested */}
    </div>
  </div>
);

// Dashboard Component - Description props removed
export const Dashboard = ({ setActiveTab, setWeightliftingCategory }) => {
  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full h-full text-center
      p-2 sm:p-5 md:p-6 lg:p-8">
      <DashboardCard
        title="Weightlifting"
        onClick={() => {
          setWeightliftingCategory(null);
          setActiveTab('weightliftingForm');
        }}
      />
      <DashboardCard
        title="Body Weight"
        onClick={() => setActiveTab('weightForm')}
      />
      <DashboardCard
        title="Cardio"
        onClick={() => setActiveTab('cardioForm')}
      />
    </div>
  );
};

// WeightliftingCategoryMenu
export const WeightliftingCategoryMenu = ({ onSelectCategory, onBack }) => (
  <div className="flex flex-col gap-4 items-center justify-center text-center">
    <button
      className="w-48 h-10 bg-gray-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg text-sm transition-all duration-200"
      onClick={() => onSelectCategory('Push')}
    >
      Push
    </button>
    <button
      className="w-48 h-10 bg-gray-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg text-sm transition-all duration-200"
      onClick={() => onSelectCategory('Pull')}
    >
      Pull
    </button>
    <button
      className="w-48 h-10 bg-gray-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg text-sm transition-all duration-200"
      onClick={() => onSelectCategory('Legs')}
    >
      Legs
    </button>
    <button
      className="w-48 h-10 bg-gray-700 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-lg text-sm transition-all duration-200"
      onClick={() => onSelectCategory('Full Body')}
    >
      Full Body
    </button>
  </div>
);
