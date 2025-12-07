import React, { useRef, useState } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="relative group rounded-lg overflow-hidden shadow-md border-2 border-breton-blue/30">
        <img 
          src={preview} 
          alt="Votre portrait" 
          className="w-full h-64 object-cover object-top bg-blue-50"
        />
        <div className="absolute inset-0 bg-breton-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => {
              setPreview(null);
              onImageSelected('');
            }}
            disabled={disabled}
            className="bg-white text-breton-blue px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-blue-50 transition border border-breton-blue"
          >
            <RefreshCw className="w-4 h-4" /> Changer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={!disabled ? triggerUpload : undefined}
      className={`border-2 border-dashed border-blue-300 bg-blue-50/30 rounded-lg h-64 flex flex-col items-center justify-center p-6 transition-colors ${!disabled ? 'cursor-pointer hover:border-breton-blue hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'}`}
    >
      <div className="bg-breton-blue/10 p-4 rounded-full mb-4">
        <Camera className="w-8 h-8 text-breton-blue" />
      </div>
      <p className="text-lg font-semibold text-breton-blue/80 text-center">Ajoutez votre portrait</p>
      <p className="text-sm text-slate-500 text-center mt-2 max-w-xs">
        Prenez une photo claire de votre visage pour que l'IA puisse vous intégrer à la scène.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <button className="mt-4 text-breton-blue font-bold text-sm flex items-center gap-2">
        <Upload className="w-4 h-4" /> Importer ou prendre une photo
      </button>
    </div>
  );
};

export default ImageUploader;