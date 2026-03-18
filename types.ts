
export enum GDStage {
  LANDING = 'LANDING',
  API_KEY_SETUP = 'API_KEY_SETUP',
  KEY_MANAGEMENT = 'KEY_MANAGEMENT',
  LOGIN = 'LOGIN',
  SIGN_IN = 'SIGN_IN',
  ABOUT = 'ABOUT',
  SERVICES = 'SERVICES',
  LOBBY = 'LOBBY',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  DISCUSSION = 'DISCUSSION',
  FEEDBACK = 'FEEDBACK'
}

export type SimulationContext = 'UG_PLACEMENT' | 'MBA_ADMISSION' | 'CORPORATE_HIRE' | 'GOVT_SERVICES';

export interface AITraits {
  aggression: number;
  talkativeness: number;
  logicVsEmotion: number; // 0 (pure logic) to 100 (pure emotion)
  formality: number;
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface Participant {
  id: string;
  name: string;
  role: string;
  description: string;
  isAI: boolean;
  avatar: string;
  speaking: boolean;
  gender: 'MALE' | 'FEMALE';
  voiceName: VoiceName;
  stance?: string; 
  isMuted?: boolean;
  volume?: number;
  traits?: AITraits;
}

export interface EvaluationReport {
  overallSummary: string;
  sentimentAnalysis: {
    tone: string;
    emotionalStability: number; // 0-10
    dominantSentiment: string;
    sentimentOverTime: { turn: number; sentiment: string; score: number }[];
  };
  interruptionCount: number;
  scores: {
    contentLogic: number;
    communicationSkills: number;
    confidenceAssertiveness: number;
    listeningResponse: number;
    leadershipPotential: number;
  };
  strengths: string[];
  weaknesses: string[];
  missedOpportunities: string[];
  sampleResponses: string[];
  executiveVerdict: string; 
  panelAudioScript?: string;
}

export interface GDMessage {
  sender: string;
  text: string;
  timestamp: number;
  isUser: boolean;
}

export interface UserApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  isDefault: boolean;
  addedAt: number;
}
