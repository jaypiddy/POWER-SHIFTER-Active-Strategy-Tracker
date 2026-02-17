
import React from 'react';

/**
 * Default strategic themes/pillars for seeding the application.
 * Each theme represents a core area of focus for the organization.
 */
export const THEMES = [
  { 
    id: 't1', 
    name: 'Competitive Advantage', 
    color: 'blue', 
    definition: 'Be the sought after antidote for motivated, capable clients seeking an alternative approach to digital transformation.',
    description: "When 'good enough' isn't good enough. We're leading the way with a fresh digital approach, and we'll know we're on track when we're the name on the most selective consideration lists, winning over strategic competitors and showing what sets us apart.\n\nOutcompete our peers and legacy competitors by pioneering, teaching & proving the PS Way.", 
    successCriteria: "We'll know we're headed in the right direction when we're on different 'consideration lists', we win business against strategic competitors (not just implementors), and our reasons for winning demonstrate our difference.",
    order: 1 
  },
  { 
    id: 't2', 
    name: 'Client Promise', 
    color: 'emerald', 
    definition: 'Be the agency that meets our clients as the experts they are.',
    description: "We're the place clients look for when 'good enough' isn't good enough. We're leading the way with a fresh digital approach, and we'll know we're on track when we're the name on the most selective consideration lists, winning over strategic competitors and showing what sets us apart.\n\nEnable and inspire our clients to access their potential, deepen capacity and achieve meaningful, measurable business results.", 
    successCriteria: "We'll know we're headed in the right direction when our clients are getting promoted.",
    order: 2 
  },
  { 
    id: 't3', 
    name: 'Employee Experience', 
    color: 'amber', 
    definition: 'Be the agency that removes barriers between client and agency experts unlocking the maximum co-creation potential.',
    description: 'Continue to attract empathetic and deeply human transformation experts who want to make a positive impact.', 
    successCriteria: "We'll know we're headed in the right direction when our team members can continuously have the unfettered access to client experts to co-create on projects.",
    order: 3 
  },
  { 
    id: 't4', 
    name: 'Scalable Ops', 
    color: 'rose', 
    definition: 'Be the agency that scales without compromising our values or the quality of our work.',
    description: 'Continue to improve how we deliver for our teams and clients.', 
    successCriteria: "We'll know we're headed in the right direction when, even during times of rapid growth we see consistent high eNPS scores and strong profit margins.",
    order: 4 
  },
];

export const BET_STAGES = ['Idea', 'Prioritized', 'In Progress', 'Blocked', 'Completed', 'Archived'] as const;
export const TIMEBOXES = ['H1', 'H2', 'Backlog'] as const;
