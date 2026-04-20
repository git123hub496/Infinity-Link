/**
 * Configuration for Infinity Cybersecurity Services
 * Add new services here to have them appear on the landing page.
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string; // Lucide icon name
  category: 'Intelligence' | 'Defense' | 'Infrastructure' | 'Support';
}

export const services: Service[] = [
  {
    id: 'infinity-ai',
    name: 'Infinity AI',
    description: 'Autonomous intelligence workspace for cognitive enterprise automation.',
    url: 'https://infinity-ai-workspace.vercel.app/',
    icon: 'Cpu',
    category: 'Intelligence',
  },
  {
    id: 'infinity-photo',
    name: 'Infinity Photo',
    description: 'High-fidelity AI image generation system for visual content creation.',
    url: 'https://infinity-photo.vercel.app/',
    icon: 'Image',
    category: 'Intelligence',
  }
];
