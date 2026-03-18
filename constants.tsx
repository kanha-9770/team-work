
import { Participant } from './types';

export const AI_PARTICIPANTS: Participant[] = [
  {
    id: 'ai-1',
    name: 'Ankit (Analytical)',
    role: 'Analytical Thinker',
    description: 'Data-driven, calm, relies on facts and logic. Very objective.',
    isAI: true,
    gender: 'MALE',
    voiceName: 'Puck',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit&eyebrows=flatNatural&mouth=serious',
    speaking: false
  },
  {
    id: 'ai-2',
    name: 'Aria (Aggressive)',
    role: 'Aggressive Speaker',
    description: 'Dominates conversation, interrupts, and challenges points with fiery rhetoric.',
    isAI: true,
    gender: 'FEMALE',
    voiceName: 'Kore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&eyes=squint&mouth=smile',
    speaking: false
  },
  {
    id: 'ai-3',
    name: 'Esha (Empathetic)',
    role: 'Human-Centric Speaker',
    description: 'Focuses on human impact, societal values, and opinion-based arguments. Compassionate.',
    isAI: true,
    gender: 'FEMALE',
    voiceName: 'Kore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Esha&eyes=happy&mouth=default',
    speaking: false
  },
  {
    id: 'ai-4',
    name: 'Mohit (Pragmatic)',
    role: 'Moderator / Balanced',
    description: 'Tries to find middle ground, summarizes group points, and focuses on feasibility.',
    isAI: true,
    gender: 'MALE',
    voiceName: 'Charon',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohit&eyes=closed&mouth=default',
    speaking: false
  }
];

export const TOPICS = [
  {
    id: 'tech-ethics',
    title: 'Impact of AI on Job Security in India',
    context: 'With rapid automation, the Indian IT sector and manufacturing are at a crossroads. Is AI a job creator or a job destroyer?'
  },
  {
    id: 'economic',
    title: 'Work from Home vs. Work from Office',
    context: 'Post-pandemic, companies are forcing employees back to office. Discuss the impact on productivity, mental health, and corporate culture.'
  },
  {
    id: 'social',
    title: 'Social Media: A Boon or a Curse for the Youth?',
    context: 'While it connects people, it is also linked to mental health issues and misinformation. Discuss its role in modern society.'
  },
  {
    id: 'corporate',
    title: 'Privatization of Public Sector Banks',
    context: 'The government is moving towards privatizing major PSBs to improve efficiency. Will this help the economy or hurt the common man?'
  }
];
