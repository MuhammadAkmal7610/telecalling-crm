import React from 'react';

export default function IntegrationCard({ name, description, icon: Icon, color, linkText, buttonText, onClick }) {
    // color prop should be 'blue' or 'green' to map to styles
    const colors = {
        blue: { border: 'bg-blue-500', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', buttonHover: 'group-hover:from-blue-500 group-hover:to-blue-600' },
        green: { border: 'bg-green-500', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', buttonHover: 'group-hover:from-green-500 group-hover:to-green-600' },
        teal: { border: 'bg-teal-500', iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600', buttonHover: 'group-hover:from-teal-500 group-hover:to-teal-600' },
    };

    const styles = colors[color] || colors.blue; // Default to blue

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 group h-full hover:bg-white relative overflow-hidden">
            {/* Hover Decor - Flowing Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
            
            {/* Top Shine Effect */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

            {/* Left Edge Accent Indicator */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full ${styles.border} opacity-50 group-hover:h-full group-hover:top-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:rounded-none transition-all duration-500`}></div>

            <div className="relative z-10 pl-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${styles.iconBg} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                            {Icon && <Icon className="w-6 h-6 drop-shadow-md" />}
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">{name}</h3>
                    </div>
                </div>
                <p className="text-gray-500/90 text-sm mb-5 leading-relaxed font-medium">{description}</p>
            </div>

            <div className="flex items-center justify-between mt-2 pl-2 relative z-10">
                <button
                    onClick={onClick}
                    className={`px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:text-white ${styles.buttonHover} hover:brightness-110`}
                >
                    {buttonText || 'Connect'}
                </button>
                {linkText && (
                    <a href="#" className="text-xs text-gray-400 hover:text-gray-600 hover:underline font-semibold transition-colors">
                        {linkText}
                    </a>
                )}
            </div>
        </div>
    );
}
