import React from 'react';
import { AnalysisResult as AnalysisResultType, VehicleData } from '../types';
import { PriceChart } from './PriceChart';
import { CheckCircle2, AlertTriangle, XCircle, Info, ExternalLink, Sparkles, TrendingDown, Calculator, ArrowRight } from 'lucide-react';

interface AnalysisResultProps {
  result: AnalysisResultType;
  vehicle: VehicleData;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, vehicle }) => {
  const { 
    estimatedMarketPrice, 
    cleanMarketPrice,
    depreciationRate,
    verdict, 
    verdictText, 
    reasoning, 
    damageImpact, 
    questionsToAsk,
    groundingSources,
    comparableListings
  } = result;

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'Excellent':
      case 'Good':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'Fair':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Info };
      case 'High':
      case 'Overpriced':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: AlertTriangle };
    }
  };

  const style = getVerdictStyle(verdict);
  const Icon = style.icon;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Verdict Card */}
      <div className={`p-6 rounded-xl border ${style.border} ${style.bg} shadow-sm`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-2xl font-bold ${style.text} flex items-center gap-2`}>
              <Icon className="w-8 h-8" />
              {verdict === 'Excellent' || verdict === 'Good' ? 'Fiyat Uygun!' : 
               verdict === 'Fair' ? 'Normal Fiyat' : 'Fiyat Yüksek'}
            </h3>
            <p className={`mt-2 font-medium ${style.text} opacity-90 text-lg`}>
              {verdictText}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm text-slate-500">Analiz Edilen Fiyat</div>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(vehicle.price)}</div>
          </div>
        </div>
      </div>

      {/* Depreciation Calculator Card (NEW) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Calculator size={100} />
        </div>
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
           <Calculator size={20} className="text-blue-600" />
           Değer Kaybı Hesaplayıcısı
        </h4>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Step 1: Clean Price */}
            <div className="flex-1 bg-slate-50 p-4 rounded-lg w-full text-center md:text-left">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hatasız Piyasa Ort.</div>
                <div className="text-xl font-bold text-slate-700">{formatCurrency(cleanMarketPrice || estimatedMarketPrice.max * 1.1)}</div>
            </div>

            {/* Step 2: Deduction */}
            <div className="flex flex-col items-center">
                <div className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full mb-1">
                    -%{depreciationRate || 0}
                </div>
                <ArrowRight className="text-slate-300 hidden md:block" />
                <div className="text-xs text-red-500 font-medium mt-1 text-center max-w-[120px]">
                    Hasar & KM Kaybı
                </div>
            </div>

            {/* Step 3: Fair Value */}
            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100 w-full text-center md:text-left">
                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Bu Aracın Adil Değeri</div>
                <div className="text-2xl font-bold text-blue-800">{formatCurrency(estimatedMarketPrice.average)}</div>
            </div>
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
           <span className="font-semibold text-slate-800">Hesaplama Detayı:</span> {damageImpact}
        </div>
      </div>

      {/* Market Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-800 mb-2">Piyasa Karşılaştırması</h4>
        <p className="text-sm text-slate-500 mb-4">
          Bu hasar durumundaki araçlar için piyasa aralığı: <span className="font-semibold text-slate-700">{formatCurrency(estimatedMarketPrice.min)} - {formatCurrency(estimatedMarketPrice.max)}</span>
        </p>
        <PriceChart 
          currentPrice={vehicle.price} 
          marketMin={estimatedMarketPrice.min} 
          marketMax={estimatedMarketPrice.max}
          marketAvg={estimatedMarketPrice.average}
        />
      </div>

      {/* Comparable / Opportunity Listings */}
      {comparableListings && comparableListings.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
           <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4 text-lg">
              <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Sparkles size={20} />
              </span>
              Bu Bütçedeki En İyi Fırsatlar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparableListings.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                     {item.advantagePercentage > 0 ? (
                       <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                         <TrendingDown size={12} />
                         %{item.advantagePercentage.toFixed(1)} Daha Uygun
                       </span>
                     ) : (
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                          Alternatif
                        </span>
                     )}
                     <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-indigo-700 transition-colors">
                    {item.title}
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="text-xl font-bold text-slate-900">{formatCurrency(item.price)}</div>
                  </div>
                  
                  {item.description && (
                    <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-50">
                      {item.description}
                    </div>
                  )}
                </a>
              ))}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Reasoning */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Info size={18} /></span>
              Analiz Mantığı
            </h4>
            <ul className="space-y-2">
              {reasoning.map((r, i) => (
                <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Advice */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <span className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><CheckCircle2 size={18} /></span>
              Kontrol Noktaları
            </h4>
            <ul className="space-y-3">
              {questionsToAsk.map((q, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-400 text-sm select-none">0{i + 1}</span>
                  <span className="text-slate-700 text-sm font-medium">{q}</span>
                </li>
              ))}
            </ul>
        </div>

      </div>

      {/* Grounding Sources */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kaynaklar & Emsaller</h5>
          <div className="flex flex-wrap gap-2">
            {groundingSources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-white px-3 py-1.5 rounded-full border border-blue-100 hover:border-blue-300 transition-colors shadow-sm"
              >
                <ExternalLink size={12} />
                <span className="max-w-[150px] truncate">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};