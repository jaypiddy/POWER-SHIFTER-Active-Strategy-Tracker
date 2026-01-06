
import React from 'react';

interface StrategyReportProps {
  content: string;
  onClose: () => void;
}

const StrategyReport: React.FC<StrategyReportProps> = ({ content, onClose }) => {
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">{line.replace('###', '').trim()}</h3>;
      if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
        {line.replace('##', '').trim()}
      </h2>;
      if (line.startsWith('#')) return <h1 key={i} className="text-3xl font-bold text-slate-900 mt-10 mb-6">{line.replace('#', '').trim()}</h1>;
      
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={i} className="flex items-start gap-3 ml-4 mb-3">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
            <span className="text-slate-700 leading-relaxed font-light">{line.replace(/^[-*]/, '').trim()}</span>
          </div>
        );
      }
      
      if (line.trim() === '') return <div key={i} className="h-4" />;
      
      return <p key={i} className="mb-4 text-slate-700 leading-relaxed font-light">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <i className="fas fa-file-invoice text-lg"></i>
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">Strategy Performance Report</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Quarterly Reset v2024.Q2</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Print Report"
            >
              <i className="fas fa-print"></i>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-10 md:p-16">
           <div className="max-w-2xl mx-auto">
              <div className="mb-12 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <i className="fas fa-sparkles"></i>
                    AI Synthesized Strategy Context
                 </div>
                 <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Quarterly Strategic Performance</h1>
                 <p className="text-slate-500 font-light text-lg">Detailed analysis of organization health, bet velocity, and future-looking recommendations.</p>
              </div>

              <div className="prose prose-slate max-w-none">
                {renderMarkdown(content)}
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center opacity-50">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Power Shifter Strategic OS
                 </div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Generated on {new Date().toLocaleDateString()}
                 </div>
              </div>
           </div>
        </div>

        <footer className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
           >
             Close Report
           </button>
        </footer>
      </div>
    </div>
  );
};

export default StrategyReport;
