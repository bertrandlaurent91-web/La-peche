import { GoogleGenAI } from "@google/genai";
import { CatchDetails, LocationInfo } from "../types";

const getApiKey = () => process.env.API_KEY;

/**
 * Helper to determine visual scale based on weight string
 */
const getWeightVisualContext = (weightStr: string): string => {
  const weight = parseInt(weightStr.replace(/[^0-9]/g, '')) || 5;
  
  if (weight <= 1) return "Small size. Length approx 20-30cm. Looks very light.";
  if (weight <= 3) return "Medium-small size. Length approx 40-50cm. Looks easy to hold.";
  if (weight <= 8) return "Good size specimen. Length approx 60-70cm. Looks substantial.";
  if (weight <= 20) return "LARGE trophy size. Length approx 90cm-1m. Thick body. Looks heavy to lift.";
  if (weight <= 50) return "VERY LARGE, IMPRESSIVE size. Length 1.2m+. It covers a large part of the person's torso. Looks very heavy.";
  if (weight <= 100) return "HUGE, MASSIVE catch. Length 1.5m-2m. As big as a human. Massive girth. The person shows strain supporting this beast.";
  return "GIGANTIC, LEGENDARY MONSTER. Larger than a human. Occupies the entire frame width. An absolute leviathan of the sea.";
};

/**
 * Helper to determine the pose based on weight
 * Prevents holding massive fish at arm's length.
 * NOW FORCES HEAD DOWN VERTICAL POSE.
 */
const getPoseInstruction = (weightStr: string): string => {
  const weight = parseInt(weightStr.replace(/[^0-9]/g, '')) || 5;

  if (weight < 10) {
    return "Action: The person is holding the fish VERTICALLY, suspending it by the tail or body using TWO HANDS. The HEAD IS POINTING DOWN towards the ground. The fish hangs vertically.";
  } else if (weight < 40) {
     return "Action: The person is holding the fish VERTICALLY against their body/chest. The HEAD IS POINTING DOWN. The tail is near the person's shoulders/head. Held securely with TWO HANDS due to weight.";
  } else {
     // > 40kg
     return "Action: The MASSIVE fish is positioned VERTICALLY with its HEAD RESTING ON THE BOAT DECK (pointing down). The person is sitting or crouching next to it, holding the tail or upper body upright. The fish stands vertically.";
  }
};

/**
 * Uses Google Search to get a precise visual description of the fish
 * and verify its presence in the specific location.
 */
const getFishVisualDetails = async (fishType: string, location: string, apiKey: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Research task:
        1. Identify the specific local subspecies or variant of "${fishType}" found in "${location}" (Brittany/France context).
        2. Describe the EXACT visual appearance of a **freshly caught** local specimen (not cooked, not in an aquarium).
        3. Focus on: specific skin colors/patterns, fin shape, body proportions, and distinctive features that prove it is the local variety.
        
        Output a concise paragraph describing the fish visually for a hyper-realistic photo prompt.
      `,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    return response.text || "";
  } catch (error) {
    console.warn("Could not fetch fish visual details, using default.", error);
    return "";
  }
};

export const generateFishermanImage = async (
  base64UserImage: string,
  details: CatchDetails
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Clé API manquante. Veuillez configurer process.env.API_KEY.");
  }

  // Step 1: Get accurate visual details via Search Grounding
  const visualDetails = await getFishVisualDetails(details.fishType, details.location, apiKey);
  const sizeContext = getWeightVisualContext(details.weight);
  const poseInstruction = getPoseInstruction(details.weight);

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const cleanBase64 = base64UserImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const lobsterInstruction = (details.fishType.toLowerCase().includes('homard') || details.fishType.toLowerCase().includes('lobster')) 
      ? "IMPORTANT: The lobster is wild and freshly caught. It MUST NOT have rubber bands on its claws. Show natural, sharp claws." 
      : "";

    const prompt = `
      Create a hyper-realistic photograph.
      Subject: The person from the provided reference image. 
      CRITICAL: You MUST preserve the person's exact facial features AND HAIRSTYLE. Do not change their hair color, length, or style.
      
      POSE: ${poseInstruction}
      The person is inside a small recreational fishing boat (white hull).
      
      The catch: a ${details.weight} ${details.fishType}.
      SCALE & SIZE INSTRUCTION: ${sizeContext}
      The fish size MUST visually correspond to the weight described above.
      
      Fish Appearance (Strictly adhere to this local species description):
      ${visualDetails}
      The fish should look heavy, wet, slithery, and hyper-realistic.
      IMPORTANT: There should be ABSOLUTELY NO water droplets falling or dripping from the fish. The fish is wet but not dripping.
      ORIENTATION: The fish head MUST BE POINTING DOWN.
      ${lobsterInstruction}

      Atmosphere & Details:
      - Include fishing details: small cut pieces of mackerel (bait) visible nearby on a board or in a bucket.
      - Setting: The boat is on the water. Background: ${details.location}.
      - Lighting: Natural daylight, slightly overcast or sunny typical of the region (Brittany), cinematic photography style.
      - The person looks triumphant but respectful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg', 
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("Aucune image générée. Veuillez réessayer.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Erreur lors de la génération de l'image.");
  }
};

export const generateFishermanVideo = async (
  base64UserImage: string,
  details: CatchDetails
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Clé API manquante.");

  // Step 1: Get accurate visual details via Search Grounding
  const visualDetails = await getFishVisualDetails(details.fishType, details.location, apiKey);
  const sizeContext = getWeightVisualContext(details.weight);
  const poseInstruction = getPoseInstruction(details.weight);

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const cleanBase64 = base64UserImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const lobsterInstruction = (details.fishType.toLowerCase().includes('homard') || details.fishType.toLowerCase().includes('lobster')) 
      ? "The lobster MUST be wild and WITHOUT rubber bands on its claws." 
      : "";

    const prompt = `
      Cinematic shot of the person from the input image on a boat in ${details.location}.
      POSE: ${poseInstruction}
      The fish is held VERTICALLY with HEAD DOWN.
      
      SCALE INSTRUCTION: ${sizeContext}
      The fish MUST appear to be the size described above.

      CRITICAL: Keep the person's exact HAIRSTYLE and facial features.
      
      Fish Visual Details:
      ${visualDetails}
      The fish is wet/shiny but NOT dripping water. No falling drops.
      
      Scene details: Visible cut pieces of mackerel bait on the boat surface.
      The person is triumphant, the boat is rocking gently on the waves. 
      ${lobsterInstruction}
      High quality, 4k, realistic.
    `;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("La génération de vidéo a échoué.");
    
    // Append key for download/playback
    return `${videoUri}&key=${apiKey}`;

  } catch (error: any) {
    console.error("Gemini Video Error:", error);
    throw new Error(error.message || "Erreur lors de la génération de la vidéo.");
  }
};

export const getLocationInfo = async (location: string): Promise<LocationInfo> => {
  const apiKey = getApiKey();
  if (!apiKey) return { text: "Impossible de récupérer les infos (API Key manquante)." };

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a short, interesting fact (2 sentences max) about ${location} in the context of maritime history or fishing in Brittany.`,
      config: {
        tools: [{googleMaps: {}}],
      },
    });

    const text = response.text || "Aucune information trouvée.";
    
    // Extract grounding info
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let mapLink = undefined;
    let sourceTitle = undefined;

    if (chunks && chunks.length > 0) {
       for (const chunk of chunks) {
         // @ts-ignore
         if (chunk.maps?.uri) {
           // @ts-ignore
           mapLink = chunk.maps.uri;
           // @ts-ignore
           sourceTitle = chunk.maps.title;
           break;
         }
       }
    }

    return { text, mapLink, sourceTitle };

  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "Impossible de charger les informations sur le lieu." };
  }
};