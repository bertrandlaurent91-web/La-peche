import React, { useState, useEffect } from 'react';
import { CatchDetails, LocationInfo } from '../types';
import { MapPin, Scale, FishSymbol, Target, Info, ExternalLink, Loader2 } from 'lucide-react';
import { getLocationInfo } from '../services/geminiService';

interface CatchFormProps {
  details: CatchDetails;
  onChange: (field: keyof CatchDetails, value: string) => void;
  disabled: boolean;
}

const BRETON_FISH = [
  "Thon Rouge",
  "Bar",
  "Lieu Jaune",
  "Dorade Royale",
  "Maquereau",
  "Turbot",
  "Saint-Pierre",
  "Homard Breton",
  "Congre",
  "Requin Taupe",
  "Autre"
];

const BRETON_LOCATIONS = [
  "Baie de Morlaix (Château du Taureau)",
  "Archipel des Glénan",
  "Côte de Granit Rose (Ploumanac'h)",
  "Pointe du Raz",
  "Île de Bréhat",
  "Rade de Brest",
  "Golfe du Morbihan",
  "Saint-Malo (Remparts)",
  "Belle-Île-en-Mer",
  "En pleine mer (Hauturier)",
  "Autre"
];

const CatchForm: React.FC<CatchFormProps> = ({ details, onChange, disabled }) => {
  const [isCustomFish, setIsCustomFish] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [weightValue, setWeightValue] = useState<number>(100);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Initialize internal state from props
  useEffect(() => {
    const numericWeight = parseInt(details.weight.replace(/[^0-9]/g, '')) || 0;
    setWeightValue(numericWeight);
    
    if (details.fishType && !BRETON_FISH.includes(details.fishType)) {
      setIsCustomFish(true);
    }

    if (details.location && !BRETON_LOCATIONS.includes(details.location)) {
      setIsCustomLocation(true);
    }
  }, []);

  // Clear info when location changes significantly
  useEffect(() => {
    setLocationInfo(null);
  }, [details.location]);

  const handleFishTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Autre") {
      setIsCustomFish(true);
      onChange('fishType', '');
    } else {
      setIsCustomFish(false);
      onChange('fishType', value);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Autre") {
      setIsCustomLocation(true);
      onChange('location', '');
    } else {
      setIsCustomLocation(false);
      onChange('location', value);
    }
  };

  const handleWeightChange = (val: number) => {
    setWeightValue(val);
    onChange('weight', `${val} kg`);
  };

  const fetchLocationInfo = async () => {
    if (!details.location) return;
    setLoadingInfo(true);
    try {
      const info = await getLocationInfo(details.location);
      setLocationInfo(info);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInfo(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 space-y-5">
      <h3 className="text-lg font-serif font-bold text-breton-blue border-b pb-2 border-blue-100 flex items-center justify-between">
        <span>Détails de la Prise</span>
        <Target className="w-5 h-5 text-breton-accent" />
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fish Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-600 flex items-center gap-2">
            <FishSymbol className="w-4 h-4 text-breton-blue" /> Espèce
          </label>
          
          {!isCustomFish ? (
            <div className="relative">
              <select
                value={BRETON_FISH.includes(details.fishType) ? details.fishType : "Autre"}
                onChange={handleFishTypeChange}
                disabled={disabled}
                className="w-full p-3 bg-blue-50/30 border border-blue-200 rounded-md focus:ring-2 focus:ring-breton-blue focus:border-transparent outline-none transition appearance-none font-medium text-breton-blue"
              >
                {BRETON_FISH.map((fish) => (
                  <option key={fish} value={fish}>{fish}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-breton-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={details.fishType}
                onChange={(e) => onChange('fishType', e.target.value)}
                disabled={disabled}
                placeholder="Nom du poisson..."
                className="flex-1 p-3 border border-blue-200 bg-blue-50/30 rounded-md focus:ring-2 focus:ring-breton-blue outline-none"
                autoFocus
              />
              <button 
                onClick={() => { setIsCustomFish(false); onChange('fishType', BRETON_FISH[0]); }}
                className="px-3 py-1 text-xs text-blue-500 hover:text-red-500 border border-blue-200 rounded hover:bg-blue-50"
              >
                Liste
              </button>
            </div>
          )}
        </div>

        {/* Weight Slider & Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-600 flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-breton-blue" /> Poids (kg)</span>
            <span className="text-xs font-mono bg-breton-blue text-white px-2 py-0.5 rounded-full">{weightValue} kg</span>
          </label>
          
          <div className="flex items-center gap-4">
             <input
              type="range"
              min="1"
              max="300"
              value={weightValue}
              onChange={(e) => handleWeightChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-breton-blue"
            />
            <input
              type="number"
              value={weightValue}
              onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="w-20 p-2 text-center border border-blue-200 bg-blue-50/30 rounded-md focus:ring-2 focus:ring-breton-blue outline-none font-bold text-lg text-breton-blue"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-600 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-breton-blue" /> Lieu de pêche
        </label>
        
        <div className="flex flex-col gap-2">
        {!isCustomLocation ? (
            <div className="relative">
              <select
                value={BRETON_LOCATIONS.includes(details.location) ? details.location : "Autre"}
                onChange={handleLocationChange}
                disabled={disabled}
                className="w-full p-3 bg-blue-50/30 border border-blue-200 rounded-md focus:ring-2 focus:ring-breton-blue focus:border-transparent outline-none transition appearance-none font-medium text-slate-700"
              >
                {BRETON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-breton-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
               <div className="flex gap-2">
                <textarea
                  value={details.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  disabled={disabled}
                  rows={2}
                  className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-breton-blue focus:border-transparent outline-none transition resize-none bg-blue-50/30 text-slate-700"
                  placeholder="ex: Finistère nord près du château du taureau..."
                  autoFocus
                />
               </div>
               <button 
                onClick={() => { setIsCustomLocation(false); onChange('location', BRETON_LOCATIONS[0]); }}
                className="self-end px-3 py-1 text-xs text-blue-500 hover:text-red-500 border border-blue-200 rounded hover:bg-blue-50"
              >
                Choisir dans la liste
              </button>
            </div>
          )}
          
          {/* Maps Grounding Button/Result */}
          {!locationInfo && (
             <button 
               onClick={fetchLocationInfo}
               disabled={disabled || loadingInfo || !details.location}
               className="self-start text-xs flex items-center gap-1 text-breton-blue hover:underline disabled:opacity-50"
             >
               {loadingInfo ? <Loader2 className="w-3 h-3 animate-spin"/> : <Info className="w-3 h-3"/>}
               Infos sur ce lieu (Google Maps)
             </button>
          )}

          {locationInfo && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100 text-slate-700">
              <p>{locationInfo.text}</p>
              {locationInfo.mapLink && (
                <a 
                  href={locationInfo.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-breton-blue font-semibold hover:underline"
                >
                  <MapPin className="w-3 h-3" /> Voir sur Maps {locationInfo.sourceTitle && `- ${locationInfo.sourceTitle}`}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatchForm;