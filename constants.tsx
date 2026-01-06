
import React from 'react';

export const THEMES = [
  { id: 't1', name: 'Competitive Advantage', color: 'blue' },
  { id: 't2', name: 'Client Promise', color: 'emerald' },
  { id: 't3', name: 'Employee Experience', color: 'amber' },
  { id: 't4', name: 'Scalable Ops', color: 'rose' },
];

export const BET_STAGES = ['Idea', 'Prioritized', 'In Progress', 'Blocked', 'Completed', 'Archived'] as const;
export const TIMEBOXES = ['H1', 'H2', 'Backlog'] as const;
