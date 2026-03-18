
import { GoogleGenAI } from "@google/genai";

/**
 * Extracts all available keys from the environment and localStorage.
 */
const getApiKeyPool = () => {
  const envKeys = (process.env.API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
  
  let storedKeys: { key: string; isDefault: boolean }[] = [];
  try {
    const local = localStorage.getItem('arena_user_keys');
    if (local) {
      const parsed = JSON.parse(local);
      storedKeys = parsed.filter((k: any) => k.isActive).map((k: any) => ({
        key: k.key,
        isDefault: k.isDefault
      }));
    }
  } catch (e) {
    console.error("Failed to parse local API keys", e);
  }

  // If we have a default key, we might want to prioritize it, 
  // but for the sake of quota avoidance, rotation is usually better.
  const combined = [
    ...envKeys.map(k => ({ key: k, isDefault: false })), 
    ...storedKeys
  ];

  return combined;
};

/**
 * Creates a fresh instance of the Gemini AI client.
 * Uses rotation among active keys. If a default key exists, it has a higher chance of being selected
 * OR we can just pick it if it's the only one.
 */
export const getGeminiClient = () => {
  const pool = getApiKeyPool();
  if (pool.length === 0) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  // Rotation Strategy:
  // We prefer the 'default' key 50% of the time if it exists, 
  // otherwise we rotate through the whole pool.
  const defaultKey = pool.find(p => p.isDefault);
  let selectedKey: string;

  if (defaultKey && Math.random() > 0.5) {
    selectedKey = defaultKey.key;
  } else {
    selectedKey = pool[Math.floor(Math.random() * pool.length)].key;
  }

  return new GoogleGenAI({ apiKey: selectedKey });
};

/**
 * Helper to parse the retry delay from a Gemini API error message.
 */
const parseRetryDelay = (errorMessage: string): number => {
  const match = errorMessage.match(/retry in ([\d.]+)s/i);
  if (match && match[1]) {
    return parseFloat(match[1]) * 1000;
  }
  return 2000; 
};

/**
 * Executes a function with automatic retries for Quota/429 errors.
 */
export const callWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  onRetry?: (delay: number, attempt: number) => void
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isQuotaError = 
        err.message?.includes("429") || 
        err.message?.includes("RESOURCE_EXHAUSTED") || 
        err.message?.includes("quota");
        
      if (isQuotaError && i < retries - 1) {
        const delay = parseRetryDelay(err.message);
        if (onRetry) onRetry(delay, i + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

export const generateText = async (
  prompt: string, 
  systemInstruction?: string, 
  model: string = 'gemini-3-flash-preview',
  onRetry?: (delay: number, attempt: number) => void
): Promise<string> => {
  return await callWithRetry(async () => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: 'application/json' 
      }
    });
    return response.text || "";
  }, 3, onRetry);
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string | null> => {
  return await callWithRetry(async () => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: { aspectRatio }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) return null;

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};

export const initiateVideoGeneration = async (prompt: string, resolution: '720p' | '1080p' = '720p', aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getGeminiClient();
  return await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution,
      aspectRatio
    }
  });
};

export const pollVideoStatus = async (operation: any) => {
  const ai = getGeminiClient();
  return await ai.operations.getVideosOperation({ operation });
};

// Audio Utilities for Live API
export const decodeBase64Audio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
