import { GoogleGenAI } from "@google/genai";
import { CatchDetails, LocationInfo } from "../types";

// Récupération sécurisée de la clé via les variables d'environnement de Vite
// @ts-ignore
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getApiKey = () => {
    if (!API_KEY) {
        throw new Error("Clé API manquante. Configurez VITE_GEMINI_API_KEY.");
    }
    return API_KEY;
};

/**
 * Détermine le contexte visuel selon le poids
 */
const getWeightVisualContext = (weightStr: string): string => {
  const weight = parseInt(weightStr.replace(/[^0-9]/g, '')) || 5;
  if (weight <= 1) return "Petite taille. Environ 20-30cm.";
  if (weight <= 8) return "Belle prise. Environ 60-70cm.";
  if (weight <= 40) return "Trophée massif. Environ 1m. Très lourd.";
  return "MONSTRE LÉGENDAIRE. Plus grand qu'un humain. Un léviathan.";
};

const getPoseInstruction = (weightStr: string): string => {
  const weight = parseInt(weightStr.replace(/[^0-9]/g, '')) || 5;
  if (weight < 20) return "La personne tient le poisson VERTICALEMENT avec deux mains. Tête vers le bas.";
  return "Le poisson massif est posé VERTICALEMENT sur le pont du bateau. La personne pose fièrement à côté.";
};

export const generateFishermanImage = async (
  base64UserImage: string,
  details: CatchDetails
): Promise<string> => {
  const key = getApiKey();
  const genAI = new GoogleGenAI(key);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const cleanBase64 = base64UserImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const sizeContext = getWeightVisualContext(details.weight);
    const poseInstruction = getPoseInstruction(details.weight);

    const prompt = `
      Crée une photo hyper-réaliste. 
      Sujet: La personne de l'image fournie (garde ses traits et ses cheveux).
      Action: ${poseInstruction}
      La prise: un ${details.fishType} de ${details.weight}.
      Contexte de taille: ${sizeContext}
      Lieu: Bateau de pêche à ${details.location}, Bretagne.
      IMPORTANT: Tête du poisson vers le bas. Style photographique professionnel.
    `;

    const result = await model.generateContent([
      { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
      { text: prompt }
    ]);

    const response = await result.response;
    return base64UserImage; // Temporaire: renvoie l'image d'origine pour tester le flux

  } catch (error: any) {
    console.error("Erreur Gemini Image:", error);
    throw new Error(error.message || "Erreur lors de la génération de l'image.");
  }
};

export const generateFishermanVideo = async (
  base64UserImage: string,
  details: CatchDetails
): Promise<string> => {
  return "https://www.w3schools.com/html/mov_bbb.mp4"; 
};

export const getLocationInfo = async (location: string): Promise<LocationInfo> => {
  const key = getApiKey();
  const genAI = new GoogleGenAI(key);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(`Donne une info courte sur la pêche à ${location}.`);
    return { text: response.response.text() };
  } catch (error) {
    return { text: "Information non disponible." };
  }
};
