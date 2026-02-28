import React from 'react';

export default function ActionCard({ title, description, icon: Icon, buttonText, onClick }) {
    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 group h-full hover:border-gray-200 relative overflow-hidden">
            {/* Hover Decor - Dark Green Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-900 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-5 group-hover:bg-gray-100 transition-colors duration-300">
                <Icon className="h-7 w-7 text-teal-600 group-hover:text-gray-700 transition-colors duration-300" />
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>

            <p className="text-gray-500 text-sm mb-auto px-1 leading-relaxed">{description}</p>

            <button
                onClick={onClick}
                className="mt-6 bg-teal-600 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 w-full shadow-sm hover:shadow-lg"
            >
                {buttonText || 'Open'}
            </button>
        </div>
    );
}