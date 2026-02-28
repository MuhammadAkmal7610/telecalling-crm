import React from 'react';

export default function IntegrationCard({ name, description, icon: Icon, color, linkText, buttonText, onClick }) {
    // color prop should be 'blue' or 'green' to map to styles
    const colors = {
        blue: { border: 'border-l-blue-600', iconBg: 'bg-blue-600', button: 'bg-blue-700 hover:bg-blue-800' },
        green: { border: 'border-l-green-600', iconBg: 'bg-green-600', button: 'bg-green-700 hover:bg-green-800' },
        teal: { border: 'border-l-teal-600', iconBg: 'bg-teal-600', button: 'bg-teal-700 hover:bg-teal-800' },
    };

    const styles = colors[color] || colors.blue; // Default to blue

    return (
        <div className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 border-l-4 p-5 flex flex-col justify-between ${styles.border} transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 group relative overflow-hidden`}>
            {/* Hover Decor - Dark Green Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-900 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${styles.iconBg}`}>
                            {Icon && <Icon className="w-6 h-6" />}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{description}</p>
            </div>

            <div className="flex items-center justify-between mt-2">
                <button
                    onClick={onClick}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${styles.button}`}
                >
                    {buttonText || 'Connect'}
                </button>
                {linkText && (
                    <a href="#" className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
                        {linkText}
                    </a>
                )}
            </div>
        </div>
    );
}
