import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import CatchForm from './components/CatchForm';
import LoadingDisplay from './components/LoadingDisplay';
import { generateFishermanImage, generateFishermanVideo } from './services/geminiService';
import { AppStatus, CatchDetails, MediaType } from './types';
import { Loader2, Download, Share2, AlertCircle, Camera, Video, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [userImage, setUserImage] = useState<string>('');
  const [generatedMedia, setGeneratedMedia] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE);
  
  // Default values based on the persona
  const [details, setDetails] = useState<CatchDetails>({
    fishType: 'Thon Rouge',
    weight: '100 kg',
    location: 'Baie de Morlaix (Château du Taureau)',
    story: 'Une lutte acharnée de 2 heures !',
  });

  const handleDetailsChange = (field: keyof CatchDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const checkApiKey = async (): Promise<boolean> => {
    // Access aistudio via explicit casting to avoid TS conflicts with global types
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
            await aiStudio.openSelectKey();
            // Race condition check: re-check after opening dialog.
            // But instruction says assume success after openSelectKey triggers.
            return true; 
        }
        return true;
    }
    return true; // Fallback for dev env if not in aistudio
  };

  const handleGenerate = async () => {
    if (!userImage) {
      setErrorMsg("Veuillez d'abord ajouter une photo de vous.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setErrorMsg('');
    setGeneratedMedia('');

    try {
      if (mediaType === MediaType.VIDEO) {
         // Check Key for Veo
         const keyReady = await checkApiKey();
         if (!keyReady) {
            setStatus(AppStatus.IDLE);
            return;
         }
         
         const resultUrl = await generateFishermanVideo(userImage, details);
         setGeneratedMedia(resultUrl);
      } else {
         const resultUrl = await generateFishermanImage(userImage, details);
         setGeneratedMedia(resultUrl);
      }
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes("Requested entity was not found")) {
          // If key error, try to reset/prompt (handled by user re-clicking usually, or we can prompt again)
          const aiStudio = (window as any).aistudio;
          if (aiStudio) {
             try { await aiStudio.openSelectKey(); } catch(e) {}
          }
          setErrorMsg("Erreur de clé API. Veuillez resélectionner votre projet.");
      } else {
          setErrorMsg(error.message || "Une erreur est survenue lors de la création de votre souvenir.");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedMedia) {
      const link = document.createElement('a');
      link.href = generatedMedia;
      link.download = `peche-legendaire-${Date.now()}.${mediaType === MediaType.VIDEO ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro Section */}
        <section className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-breton-blue">
            Immortalisez Votre Prise
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Transformez votre récit en légende. L'IA vous place au cœur de l'action.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mode Toggle */}
            <div className="flex bg-white p-1 rounded-lg border border-blue-100 shadow-sm">
                <button
                    onClick={() => setMediaType(MediaType.IMAGE)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        mediaType === MediaType.IMAGE 
                        ? 'bg-breton-blue text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" /> Photo
                </button>
                <button
                    onClick={() => setMediaType(MediaType.VIDEO)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        mediaType === MediaType.VIDEO 
                        ? 'bg-breton-blue text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <Video className="w-4 h-4" /> Vidéo (Veo)
                </button>
            </div>

            <ImageUploader 
              onImageSelected={setUserImage} 
              disabled={status === AppStatus.LOADING} 
            />
            
            <CatchForm 
              details={details} 
              onChange={handleDetailsChange}
              disabled={status === AppStatus.LOADING}
            />

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.LOADING || !userImage}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white shadow-lg transform transition-all 
                ${status === AppStatus.LOADING 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-breton-blue hover:bg-breton-blue/90 hover:-translate-y-1'
                } flex items-center justify-center gap-3`}
            >
              {status === AppStatus.LOADING ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {mediaType === MediaType.VIDEO ? 'Tournage en cours...' : 'Développement en cours...'}
                </>
              ) : (
                <>
                  {mediaType === MediaType.VIDEO ? <Video className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                  {mediaType === MediaType.VIDEO ? 'Générer la Vidéo' : 'Générer la Photo'}
                </>
              )}
            </button>
            
            {mediaType === MediaType.VIDEO && (
                <p className="text-xs text-center text-slate-400">
                    La génération de vidéo utilise Veo et nécessite une clé API payante via Google Cloud.
                </p>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className={`h-full min-h-[500px] bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden flex flex-col ${!generatedMedia && 'justify-center items-center'}`}>
              
              {!generatedMedia && status !== AppStatus.LOADING && (
                <div className="text-center p-10 opacity-60">
                  <div className="bg-blue-50 w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border border-blue-100">
                    <FishSymbolIcon className="w-16 h-16 text-breton-blue/40" />
                  </div>
                  <p className="text-xl font-serif text-breton-blue/70">
                      {mediaType === MediaType.VIDEO ? 'Votre film légendaire apparaîtra ici.' : 'Votre photo légendaire apparaîtra ici.'}
                  </p>
                </div>
              )}

              {status === AppStatus.LOADING && <LoadingDisplay />}

              {generatedMedia && (
                <div className="relative h-full flex flex-col animate-fadeIn">
                  <div className="relative flex-grow bg-breton-dark flex items-center justify-center">
                     {mediaType === MediaType.VIDEO ? (
                         <video 
                            src={generatedMedia} 
                            controls 
                            autoPlay 
                            loop 
                            className="w-full h-full max-h-[600px] object-contain"
                         />
                     ) : (
                        <img 
                          src={generatedMedia} 
                          alt="Résultat généré" 
                          className="w-full h-full object-contain mx-auto"
                        />
                     )}
                  </div>
                  
                  <div className="bg-white p-6 border-t border-blue-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-breton-blue">{details.fishType} - {details.weight}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" /> {details.location}
                        </p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                          onClick={handleDownload}
                          className="flex-1 sm:flex-none px-4 py-2 border border-breton-blue text-breton-blue rounded-md hover:bg-blue-50 font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <Download className="w-4 h-4" /> Sauvegarder
                        </button>
                        <button 
                          onClick={() => alert("Partage bientôt disponible !")}
                          className="flex-1 sm:flex-none px-4 py-2 bg-breton-blue text-white rounded-md hover:bg-breton-blue/90 font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <Share2 className="w-4 h-4" /> Partager
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-slate-400 text-sm py-8 border-t border-blue-100 mt-12 bg-white">
        <p>© 2024 Légende de la Mer - Propulsé par Google Gemini & Veo</p>
        <p className="mt-1 text-xs">Les images et vidéos sont générées par IA et sont à but récréatif.</p>
      </footer>
    </div>
  );
};

// Simple Icons for local use
const FishSymbolIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 16s9-15 20-4C12 32 2 16 2 16z"/>
    <circle cx="7" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default App;