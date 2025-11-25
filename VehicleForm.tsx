import React, { useState } from 'react';
import { VehicleData, FuelType, TransmissionType, DamageStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface VehicleFormProps {
  onSubmit: (data: VehicleData) => void;
  isLoading: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<VehicleData>({
    brand: '',
    model: '',
    year: currentYear,
    package: '',
    fuel: FuelType.Gasoline,
    transmission: TransmissionType.Manual,
    km: 0,
    price: 0,
    city: 'İstanbul',
    damage: DamageStatus.Clean
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'km' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-blue-600">🚗</span> Araç Bilgileri
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Brand & Model */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
            <input
              required
              type="text"
              name="brand"
              placeholder="Örn: Volkswagen"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
            <input
              required
              type="text"
              name="model"
              placeholder="Örn: Passat"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Year & Package */}
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yıl</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paket / Donanım</label>
            <input
              required
              type="text"
              name="package"
              placeholder="Örn: Elegance, Highline"
              value={formData.package}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Fuel & Gear */}
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yakıt Tipi</label>
            <select
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vites</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {Object.values(TransmissionType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* KM & Price & Damage */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometre</label>
            <input
              required
              type="number"
              name="km"
              min="0"
              value={formData.km || ''}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">İlan Fiyatı (TL)</label>
            <input
              required
              type="number"
              name="price"
              min="0"
              value={formData.price || ''}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

         <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hasar Durumu</label>
            <select
              name="damage"
              value={formData.damage}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              {Object.values(DamageStatus).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
         </div>

        <div className="col-span-1 md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={isLoading || formData.price === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
              ${isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Piyasa Analiz Ediliyor...
              </>
            ) : (
              'Analizi Başlat'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};