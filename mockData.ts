
import { User, Canvas, Outcome1Y, Bet, RhythmSession, Comment, Measure } from './types';

export const USERS: User[] = [
  { 
    id: 'u1', 
    firstName: 'Alex', 
    lastName: 'Strategist', 
    email: 'alex@powershifter.com', 
    role: 'Admin', 
    title: 'Chief Strategy Officer',
    ownedThemeId: 't1',
    ownershipType: 'Owner',
    active: true, 
    avatar: 'https://i.pravatar.cc/150?u=u1' 
  },
  { 
    id: 'u2', 
    firstName: 'Jordan', 
    lastName: 'Lead', 
    email: 'jordan@powershifter.com', 
    role: 'Editor', 
    title: 'Director of Product',
    ownedThemeId: 't2',
    ownershipType: 'Owner',
    active: true, 
    avatar: 'https://i.pravatar.cc/150?u=u2' 
  },
  { 
    id: 'u3', 
    firstName: 'Casey', 
    lastName: 'Observer', 
    email: 'casey@powershifter.com', 
    role: 'Viewer', 
    title: 'Analyst',
    active: true, 
    avatar: 'https://i.pravatar.cc/150?u=u3' 
  },
];

export const INITIAL_CANVAS: Canvas = {
  id: 'c1',
  workspace_id: 'w1',
  purpose: 'To empower organizations to navigate complexity with clarity and decisive action.',
  vision: 'The world\'s most adaptive strategy operating system.',
  values: 'Curiosity over Certainty, Evidence over Opinion, Velocity over Perfection.',
  updated_at: new Date().toISOString(),
  updated_by: 'u1',
  version_current_id: 'v1',
};

export const INITIAL_OUTCOMES: Outcome1Y[] = [
  {
    id: 'o1',
    workspace_id: 'w1',
    theme_id: 't1',
    title: 'Market Share Expansion',
    description: 'Grow top-tier enterprise accounts by 25%.',
    time_horizon: '2024',
    status: 'Green',
    owner_user_ids: ['u1'],
    last_reviewed_at: '2024-05-15',
  },
  {
    id: 'o2',
    workspace_id: 'w1',
    theme_id: 't3',
    title: 'Employee Retention',
    description: 'Maintain >90% retention for high-performance roles.',
    time_horizon: '2024',
    status: 'Yellow',
    owner_user_ids: ['u2'],
    last_reviewed_at: '2024-05-10',
  }
];

export const INITIAL_MEASURES: Measure[] = [
  {
    id: 'm1',
    outcome_id: 'o1',
    name: 'Enterprise Contract Value',
    definition: 'Total annual value of new contracts >$100k.',
    cadence: 'Monthly',
    source_type: 'Manual',
    target: '$10M',
    thresholds: { red_below: 7000000, green_above: 9000000 },
    notes: 'Tracking well for H1.'
  },
  {
    id: 'm2',
    outcome_id: 'o2',
    name: 'eNPS Score',
    definition: 'Employee Net Promoter Score from quarterly survey.',
    cadence: 'Quarterly',
    source_type: 'Manual',
    target: '45',
    thresholds: { red_below: 30, green_above: 40 },
    notes: 'Slight dip in last pulse survey.'
  }
];

export const INITIAL_BETS: Bet[] = [
  {
    id: 'b1',
    workspace_id: 'w1',
    title: 'AI Strategy Copilot v1',
    theme_id: 't1',
    linked_outcome_ids: ['o1'],
    bet_type: 'Discovery',
    problem_statement: 'Clients struggle to articulate clear hypotheses.',
    hypothesis: 'Integrating Gemini will reduce hypothesis creation time by 40%.',
    success_signals: 'Active usage of GPT buttons; positive feedback on brief clarity.',
    risks_assumptions: 'Latency of LLM might frustrate power users.',
    stage: 'In Progress',
    timebox: 'H1',
    start_date: '2024-01-15',
    completion_date: '2024-06-30',
    estimated_completion: 'Q2 2024',
    tshirt_size: 'L',
    progress: 75,
    actions: [
      { id: 'a1', title: 'Finalize API specs for Gemini integration', tshirt_size: 'S', progress: 100, start_date: '2024-01-20', due_date: '2024-02-15' },
      { id: 'a2', title: 'Deploy alpha version to testing environment', tshirt_size: 'M', progress: 75, start_date: '2024-03-01', due_date: '2024-05-20' },
      { id: 'a3', title: 'User feedback session (Internal Group)', tshirt_size: 'M', progress: 50, start_date: '2024-05-10', due_date: '2024-06-05' }
    ],
    owner_user_ids: ['u1'],
    stakeholder_user_ids: ['u2'],
    created_at: '2024-01-10',
    updated_at: '2024-05-15',
  },
  {
    id: 'b2',
    workspace_id: 'w1',
    title: 'Legacy Data Migration',
    theme_id: 't4',
    linked_outcome_ids: [],
    bet_type: 'Enablement',
    problem_statement: 'Old systems prevent real-time tracking.',
    hypothesis: 'A unified schema will enable monthly scorecard automation.',
    success_signals: 'Scorecards generated in <1min.',
    risks_assumptions: 'Data quality in legacy CSVs is poor.',
    stage: 'Blocked',
    timebox: 'H1',
    start_date: '2024-02-01',
    completion_date: '2024-05-15',
    estimated_completion: 'Q2 2024',
    tshirt_size: 'XL',
    progress: 0,
    actions: [
      { id: 'a4', title: 'Audit legacy CSV structures', tshirt_size: 'L', progress: 0, start_date: '2024-02-10', due_date: '2024-03-15' },
      { id: 'a5', title: 'Draft unified schema documentation', tshirt_size: 'M', progress: 0, start_date: '2024-03-20', due_date: '2024-04-30' }
    ],
    owner_user_ids: ['u2'],
    stakeholder_user_ids: ['u1'],
    created_at: '2024-02-15',
    updated_at: '2024-05-12',
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com1',
    entity_type: 'Bet',
    entity_id: 'b1',
    author_id: 'u2',
    author_name: 'Jordan Lead',
    author_avatar: 'https://i.pravatar.cc/150?u=u2',
    body: 'We should consider adding a latency monitoring signal for the AI response time.',
    created_at: '2024-05-14T10:00:00Z',
  },
  {
    id: 'com2',
    entity_type: 'Canvas',
    entity_id: 'c1',
    author_id: 'u1',
    author_name: 'Alex Strategist',
    author_avatar: 'https://i.pravatar.cc/150?u=u1',
    body: 'Quarterly values adjusted to reflect our focus on "Evidence over Opinion".',
    created_at: '2024-05-10T09:00:00Z',
  }
];

export const RHYTHM_SESSIONS: RhythmSession[] = [
  { id: 'rs1', name: 'Weekly Bet Check-in', cadence: 'Weekly', scheduled_at: '2024-05-22T10:00:00Z', status: 'Planned', miro_link: 'https://miro.com/app/board/weekly-tracker' },
  { id: 'rs2', name: 'Quarterly Strategy Reset', cadence: 'Quarterly', scheduled_at: '2024-07-01T09:00:00Z', status: 'Planned', miro_link: 'https://miro.com/app/board/strategy-q3' },
  { id: 'rs3', name: 'Annual Vision Session', cadence: 'Yearly', scheduled_at: '2024-12-15T09:00:00Z', status: 'Planned' },
];
