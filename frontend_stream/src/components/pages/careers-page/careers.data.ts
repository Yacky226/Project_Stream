import { Heart, Lightbulb, Users, Verified } from 'lucide-react';
import type { CareersValueCard, JobRole } from './careers.types';

export const CAREERS_VALUE_CARDS: CareersValueCard[] = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Pushing what is possible in EdTech through AI and immersive learning experiences.',
  },
  {
    icon: Users,
    title: 'Inclusion',
    description:
      'Building a classroom that welcomes every learner regardless of background or geography.',
  },
  {
    icon: Verified,
    title: 'Excellence',
    description:
      'Setting a high standard for pedagogy quality and platform engineering performance.',
  },
  {
    icon: Heart,
    title: 'Learner-First',
    description:
      'Every feature starts with solving a real learner need through empathy and impact.',
  },
];

export const CAREERS_JOB_ROLES: JobRole[] = [
  {
    id: 'eng-senior-fullstack',
    department: 'Engineering',
    title: 'Senior Full Stack Engineer',
    location: 'Remote / London',
    type: 'Full-time',
  },
  {
    id: 'design-lead-product',
    department: 'Design',
    title: 'Lead Product Designer',
    location: 'San Francisco / Hybrid',
    type: 'Full-time',
  },
  {
    id: 'eng-ai-learning-scientist',
    department: 'Engineering',
    title: 'AI Learning Scientist',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: 'marketing-growth-manager',
    department: 'Marketing',
    title: 'Growth Marketing Manager',
    location: 'New York / Hybrid',
    type: 'Full-time',
  },
];
