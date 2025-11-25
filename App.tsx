import React, { useState } from 'react';
import { VehicleForm } from './components/VehicleForm';
import { AnalysisResult } from './components/AnalysisResult';
import { VehicleData, AnalysisResult as AnalysisResultType } from './types';
import { analyzeVehicle } from './services/geminiService';
import { CarFront, BarChart3, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (data: VehicleData) => {
    setIsLoading(true);
    setError(null);
    setCurrentVehicle(data);
    setResult(null);

    try {
      const analysis = await analyzeVehicle(data);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Analiz sırasında bir hata oluştu. Lütfen API anahtarınızı kontrol edin veya daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
              <CarFront size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-none">OtoAnaliz AI</h1>
              <span className="text-xs text-slate-500 font-medium">Akıllı Araç Değerleme</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><BarChart3 size={16} /> Piyasa Analizi</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} /> Hasar Değerleme</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Intro Banner */}
        {!result && !isLoading && (
          <div className="mb-8 bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Aracın Gerçek Değerini Öğrenin</h2>
              <p className="text-indigo-100 text-lg mb-6">
                Yapay zeka ile anlık piyasa verilerini tarar, hasar durumunu analiz eder ve size en doğru fiyat aralığını sunar.
              </p>
              <div className="flex gap-4 text-sm font-medium text-indigo-200">
                <span className="bg-indigo-800/50 px-3 py-1 rounded-full">Canlı Piyasa Verisi</span>
                <span className="bg-indigo-800/50 px-3 py-1 rounded-full">Google Search Destekli</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className={`lg:col-span-${result ? '4' : '12'} transition-all duration-500`}>
            <VehicleForm onSubmit={handleAnalysis} isLoading={isLoading} />
            
            {/* Guide Info (only visible when full width) */}
            {!result && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-blue-600 font-bold text-lg mb-2">1. Emsal Tarama</div>
                  <p className="text-sm text-slate-600">Google Search üzerinden benzer marka, model ve km'deki araçlar taranır.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-blue-600 font-bold text-lg mb-2">2. Hasar Analizi</div>
                  <p className="text-sm text-slate-600">Değişen, boya ve hasar kaydı durumuna göre değer düşüşü hesaplanır.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-blue-600 font-bold text-lg mb-2">3. Uzman Tavsiyesi</div>
                  <p className="text-sm text-slate-600">Fiyatın fırsat mı yoksa fahiş mi olduğu belirlenir ve pazarlık tüyoları verilir.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          {result && currentVehicle && (
            <div className="lg:col-span-8">
              <AnalysisResult result={result} vehicle={currentVehicle} />
              
              <div className="mt-6 flex justify-end">
                 <button 
                  onClick={() => setResult(null)}
                  className="text-slate-500 hover:text-slate-800 text-sm font-medium underline"
                 >
                   Yeni Analiz Yap
                 </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">⚠️</div>
            <p>{error}</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
