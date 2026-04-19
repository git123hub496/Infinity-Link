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
    id: 'threat-monitor',
    name: 'Threat Sentinel',
    description: 'Real-time global threat intelligence and monitoring dashboard.',
    url: '#threat-monitor',
    icon: 'ShieldAlert',
    category: 'Intelligence',
  },
  {
    id: 'vault',
    name: 'Infinity Vault',
    description: 'Quantum-resistant encrypted storage for sensitive enterprise assets.',
    url: '#vault',
    icon: 'Lock',
    category: 'Infrastructure',
  },
  {
    id: 'audit',
    name: 'Nerve Center',
    description: 'Automated compliance auditing and vulnerability assessment.',
    url: '#audit',
    icon: 'Activity',
    category: 'Defense',
  }
];
