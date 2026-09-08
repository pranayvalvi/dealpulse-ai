import React from 'react';
import { motion } from 'framer-motion';

const CRMCard = ({ title, value, type = "text", icon: Icon }) => {
  // Simple animations for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderValue = () => {
    if (type === "interest") {
      const color = value === "High" ? "text-emerald-400 bg-emerald-400/10" : 
                   value === "Medium" ? "text-amber-400 bg-amber-400/10" : 
                   "text-rose-400 bg-rose-400/10";
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
          {value || 'N/A'}
        </span>
      );
    }

    if (type === "tags") {
      if (!value || value.length === 0) return <span className="text-gray-500 italic text-sm">No objections identified</span>;
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-md text-sm text-slate-200">
              {tag}
            </span>
          ))}
        </div>
      );
    }

    if (type === "list") {
      if (!value || value.length === 0) return <span className="text-gray-500 italic text-sm">No next steps</span>;
      return (
        <ul className="space-y-2 mt-2">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm leading-snug">
              <span className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    return <span className="text-slate-100 font-medium">{value || 'Not mentioned'}</span>;
  };

  return (
    <motion.div 
      variants={cardVariants}
      className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all group flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="p-2 bg-slate-700/50 rounded-lg text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">{title}</h3>
      </div>
      <div className="flex-1 text-base">
        {renderValue()}
      </div>
    </motion.div>
  );
};

export default CRMCard;
