
export type Status = 'Green' | 'Yellow' | 'Red';
export type BetStage = 'Idea' | 'Prioritized' | 'In Progress' | 'Blocked' | 'Completed' | 'Archived';
export type BetTimebox = 'H1' | 'H2' | 'Backlog';
export type BetType = 'Delivery' | 'Discovery' | 'Enablement';
export type TshirtSize = 'S' | 'M' | 'L' | 'XL';
export type RhythmCadence = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export type OwnershipType = 'Owner' | 'Supporting';
export type ActionProgress = 0 | 25 | 50 | 75 | 100;

export interface StrategicValue {
  title: string;
  description: string;
}

export interface PillarInvolvement {
  themeId: string;
  type: OwnershipType;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  title: string;
  ownedThemeId?: string; // Primary Focus
  ownershipType?: OwnershipType;
  supportingPillars?: PillarInvolvement[]; // Additional focus areas
  active: boolean;
  avatar?: string;
  bio?: string;
  timezone?: string;
  linkedinUrl?: string;
}

export interface Theme {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  definition?: string;
  successCriteria?: string;
  order: number;
  /**
   * The color associated with the strategic theme/pillar.
   * Used for UI consistency across the dashboard, canvas, and outcomes.
   */
  color: string;
}

export interface Canvas {
  id: string;
  workspace_id: string;
  purpose: string;
  vision: string;
  values: StrategicValue[];
  updated_at: string;
  updated_by: string;
  version_current_id: string;
}

export interface CanvasSnapshot {
  id: string;
  created_at: string;
  created_by: string;
  purpose: string;
  vision: string;
  values: StrategicValue[];
  outcomes: {
    title: string;
    status: Status;
    theme_id: string;
  }[];
}

export interface Outcome1Y {
  id: string;
  workspace_id: string;
  theme_id: string;
  title: string;
  description: string;
  time_horizon: string;
  status: Status;
  owner_user_ids: string[];
  last_reviewed_at: string;
}

export interface Measure {
  id: string;
  outcome_id: string;
  name: string;
  definition: string;
  cadence: 'Weekly' | 'Monthly' | 'Quarterly';
  source_type: 'Manual' | 'Sheet' | 'Integration';
  target: string;
  thresholds: {
    red_below?: number;
    green_above?: number;
  };
  notes?: string;
}

export interface BetAction {
  id: string;
  bet_id: string; // Linking task to a specific bet
  title: string;
  description?: string;
  owner_id?: string;
  tshirt_size: TshirtSize;
  progress: ActionProgress;
  start_date?: string;
  due_date?: string;
  completion_date?: string;
}

export interface Bet {
  id: string;
  workspace_id: string;
  title: string;
  theme_id: string;
  linked_outcome_ids: string[];
  bet_type: BetType;
  problem_statement: string;
  hypothesis: string;
  success_signals: string;
  risks_assumptions: string;
  stage: BetStage;
  timebox: BetTimebox;
  start_date?: string;
  completion_date?: string;
  estimated_completion: string;
  tshirt_size: TshirtSize;
  progress: number;
  actions: BetAction[]; // We keep this for UI convenience but it will be populated from the tasks collection
  owner_user_ids: string[];
  stakeholder_user_ids: string[];
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archive_reason?: string;
  learning_summary?: string;
}

export interface Comment {
  id: string;
  entity_type: 'Bet' | 'Outcome' | 'Measure' | 'Canvas';
  entity_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  body: string;
  created_at: string;
}

export interface RhythmSession {
  id: string;
  name: string;
  cadence: RhythmCadence;
  scheduled_at: string;
  status: 'Planned' | 'Completed';
  auto_brief?: string;
  notes?: string;
  miro_link?: string;
  recording_uri?: string;
  archived_at?: string;
}
