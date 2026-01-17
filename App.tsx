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
  
  const [details, setDetails] = useState<CatchDetails>({
    fishType: 'Thon Rouge',
    weight: '100 kg',
    location: 'Baie de Morlaix',
    story: 'Une lutte acharnée !',
  });

  const handleDetailsChange = (field: keyof CatchDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!userImage) {
      setErrorMsg("Veuillez d'abord ajouter une photo.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setErrorMsg('');

    try {
      // Appel au service utilisant la clé API injectée via GitHub/Vite
      if (mediaType === MediaType.VIDEO) {
         const resultUrl = await generateFishermanVideo(userImage, details);
         setGeneratedMedia(resultUrl);
      } else {
         const resultUrl = await generateFishermanImage(userImage, details);
         setGeneratedMedia(resultUrl);
      }
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Erreur lors de la création de votre souvenir.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedMedia) {
      const link = document.createElement('a');
      link.href = generatedMedia;
      link.download = `peche-legendaire.${mediaType === MediaType.VIDEO ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-breton-blue">Immortalisez Votre Prise</h2>
          <p className="text-slate-600">L'IA vous place au cœur de l'action.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="flex bg-white p-1 rounded-lg border border-blue-100">
                <button onClick={() => setMediaType(MediaType.IMAGE)} className={`flex-1 py-2 rounded-md text-sm font-bold ${mediaType === MediaType.IMAGE ? 'bg-breton-blue text-white' : 'text-slate-500'}`}>
                    <ImageIcon className="w-4 h-4 inline mr-2" /> Photo
                </button>
                <button onClick={() => setMediaType(MediaType.VIDEO)} className={`flex-1 py-2 rounded-md text-sm font-bold ${mediaType === MediaType.VIDEO ? 'bg-breton-blue text-white' : 'text-slate-500'}`}>
                    <Video className="w-4 h-4 inline mr-2" /> Vidéo
                </button>
            </div>

            <ImageUploader onImageSelected={setUserImage} disabled={status === AppStatus.LOADING} />
            <CatchForm details={details} onChange={handleDetailsChange} disabled={status === AppStatus.LOADING} />

            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            <button onClick={handleGenerate} disabled={status === AppStatus.LOADING || !userImage} className={`w-full py-4 rounded-lg font-bold text-white ${status === AppStatus.LOADING ? 'bg-slate-400' : 'bg-breton-blue'}`}>
              {status === AppStatus.LOADING ? 'Génération...' : 'Générer mon souvenir'}
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="min-h-[500px] bg-white rounded-xl shadow-lg flex flex-col justify-center items-center">
              {status === AppStatus.LOADING ? <LoadingDisplay /> : (
                generatedMedia ? (
                    <div className="w-full h-full">
                        {mediaType === MediaType.VIDEO ? <video src={generatedMedia} controls className="w-full" /> : <img src={generatedMedia} className="w-full" />}
                        <div className="p-4 flex gap-4">
                            <button onClick={handleDownload} className="flex-1 py-2 border border-breton-blue text-breton-blue rounded">Télécharger</button>
                        </div>
                    </div>
                ) : <p className="text-slate-400 font-serif">Votre souvenir apparaîtra ici</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
