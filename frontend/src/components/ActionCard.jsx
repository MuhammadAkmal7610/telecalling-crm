import React from 'react';

export default function ActionCard({ title, description, icon: Icon, buttonText, onClick }) {
    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 group h-full hover:bg-white relative overflow-hidden">
            {/* Hover Decor - Flowing Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* Top Shine Effect */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-teal-100/50 relative z-10">
                <Icon className="h-8 w-8 text-teal-600 group-hover:text-teal-500 transition-colors duration-300 drop-shadow-sm" />
            </div>

            <h3 className="font-extrabold text-gray-900 text-lg mb-3 tracking-tight relative z-10">{title}</h3>

            <p className="text-gray-500/90 text-sm mb-auto px-2 leading-relaxed font-medium relative z-10">{description}</p>

            <button
                onClick={onClick}
                className="mt-8 bg-white border border-gray-200 text-gray-700 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white group-hover:border-transparent px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 w-full shadow-sm group-hover:shadow-lg group-hover:shadow-teal-500/25 relative z-10 hover:brightness-110"
            >
                {buttonText || 'Open'}
            </button>
        </div>
    );
}