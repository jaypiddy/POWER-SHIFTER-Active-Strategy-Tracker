
import { GoogleGenAI, Type } from "@google/genai";
import { Bet, Comment, User, Outcome1Y, Theme, Canvas } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ACTIVE_STRATEGY_FRAMEWORK = `
Active Strategy Framework: System Architecture & Knowledge Base

1. System Overview
Active Strategy is a dynamic, 21st-century planning system designed to replace static annual plans. It functions as a "living architecture" that evolves through regular rhythms of learning, accountability, and adaptation.

Core Philosophy:
- Aware-Responsive: Constantly sensing and reacting to environmental changes.
- Mutually Beneficial: Rooted in shared outcomes rather than siloed departmental goals.
- Supported: Strategies must be backed by actual resources and capabilities.
- Social: Strategy is shared across teams and activated through stories, not hidden in decks.
- Tangible: Shifts from abstract ideas to clear prototypes and experiments.
- Adaptive: Revisited continuously through rhythms of learning and prioritization.

The "Asks" (Mindsets):
- Build to Align: Prioritize conversations even over process. Challenge each other to make the implicit explicit.
- Build to Think: Prioritize iteration even over perfection. Take a guess, draft it, and assume it will change.
- Build to Learn: Prioritize learning even over comfort. Capture uncertainty and list assumptions rather than feigning certainty.

2. The Active Strategy Canvas (Hierarchy of Goals)
Level 1: The North Star
- Purpose: The organization’s "raison d’etre".
- Vision / BHAG: The world we hope to see in 10 years.

Level 2: 3-Year Ambitions
- Competitive Position: The ambitious and differentiated market position.
- Client Promise: The role or function customers perceive the organization plays for them.
- Employer Brand & Experience: The value proposition and experience offered to talent.
- Scalable Ops: The internal backbone (technology, processes) required to thrive.
- Company Scorecard: High-level metrics tracking progress toward 3-year ambitions.

Level 3: Strategic Themes
- A balanced portfolio of 3–5 categories used to prioritize projects.

Level 4: The Execution Cascade (1-Year Horizon)
- Outcomes: Specific impact desired (changes in behavior or state).
- Measures: Quantifiable markers tracking validity and progress.
- Bets: Specific tactics, experiments, or projects to achieve Outcomes.

3. The Adaptive Cycle (System Logic)
The Four Phases:
- Renewal (Exploration): Dreaming, brainstorming. Competencies: Experimentation, prioritization.
- Growth (Expansion): Seizing opportunities, scaling. Competencies: Standardizing, producing.
- Maturity (Conservation): Stability, maintenance. Competencies: Feedback, systems thinking, efficiency.
- Release (Liberation): Creative destruction. Competencies: Courageous conversations, closure.

The Four Traps (Failure Modes):
- The Scarcity Trap (Renewal → Growth): Lack of focus, fear of commitment. Fix: Prioritize ruthlessly.
- The Liability Trap (Growth → Maturity): Scaling without systems. Fix: Establish norms/feedback.
- The Rigidity Trap (Maturity → Release): Refusing to innovate. Fix: Courage to kill legacy.
- The Lethargy Trap (Release → Renewal): Powerless after collapse. Fix: Reconnect to purpose.

4. Execution Definitions & Rules
Bets vs. "Lights-On" Work:
- "Lights-On": BAU, predictable maintenance. Constraint: <50% of resources.
- Bets: Novel, unpredictable strategic initiatives. Must use Agile teaming.

Bet Types (Taxonomy):
- Discovery Bets (Renewal): Explore unknowns. Success Metric: Learning velocity. Risk: High uncertainty.
- Delivery Bets (Growth): Scale core value. Success Metric: Adoption/Revenue. Risk: Execution.
- Enablement Bets (Maturity): Build supporting systems. Success Metric: Efficiency/Stability. Risk: Implementation.

Outcomes vs. Outputs:
- Output: A tactic (e.g., "Launch training").
- Outcome: The result (e.g., "Managers have skills").
- Rule: Measure Outcomes, not just Outputs.

Measures:
- Reliable, Learning-Oriented, Actionable.

5. Common Strategy Failure Points
- Ambition Mismatch
- Prioritization Failure
- Sunk Cost Fallacy
- BAU Confusion
- Silos
- Missing Metrics
`;

export async function tightenHypothesis(problem: string, hypothesis: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a world-class strategy consultant using the Active Strategy Framework, tighten the following hypothesis. 
    Problem: ${problem}
    Draft Hypothesis: ${hypothesis}
    
    Make it punchy, measurable, and clearly connected to the problem. Format as a single paragraph.`,
    config: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text;
}

export async function suggestMeasures(outcome: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 effective measures for this strategic outcome: "${outcome}". 
    Use the Active Strategy Framework definition of Measures: Reliable, Learning-Oriented, and Actionable.
    For each, provide:
    - Name
    - Definition
    - Success threshold`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            definition: { type: Type.STRING },
            threshold: { type: Type.STRING }
          },
          required: ["name", "definition", "threshold"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function generateStrategyReport(outcomes: Outcome1Y[], bets: Bet[]) {
  const prompt = `You are a Chief Strategy Officer. Analyze the following strategic data using the Active Strategy Framework and generate a Quarterly Performance Report.

    REFERENCE FRAMEWORK:
    ${ACTIVE_STRATEGY_FRAMEWORK}
    
    DATA - OUTCOMES:
    ${outcomes.map(o => `- ${o.title}: Status ${o.status}, Theme ${o.theme_id}`).join('\n')}
    
    DATA - BETS:
    ${bets.map(b => `- ${b.title}: Stage ${b.stage}, Progress ${b.progress}%, Type ${b.bet_type}`).join('\n')}

    Format the report in Markdown with these sections:
    1. EXECUTIVE SCORECARD (High level health based on the "Adaptive Cycle" balance)
    2. PILLAR PERFORMANCE (Analysis of Themes/Outcomes)
    3. PORTFOLIO VELOCITY (Discovery/Renewal vs Delivery/Growth vs Enablement/Maturity balance)
    4. SYSTEM HEALTH CHECKS (Identify any potential "Traps" like Scarcity, Liability, Rigidity, or Lethargy based on the data)
    5. STRATEGIC RECOMMENDATIONS (3 concrete actions for the next quarter)
    
    Keep it professional, evidence-based, and concise.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text;
}

/**
 * Starts a Strategic Council session with a specific persona and context.
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export function startStrategicCouncil(bet: Bet, theme?: Theme, outcomes: Outcome1Y[] = [], canvas?: Canvas) {
  const systemInstruction = `You are the Strategic Council, a world-class Active Strategy Coach. 
  Your goal is to stress-test and refine Strategic Bets using the Active Strategy Framework.
  
  CORE FRAMEWORK REFERENCE:
  ${ACTIVE_STRATEGY_FRAMEWORK}

  STRATEGIC ALIGNMENT CONTEXT:
  - Theme (Pillar): ${theme ? `${theme.name} - ${theme.description} (Success: ${theme.successCriteria})` : 'None defined'}
  - Org Vision: ${canvas ? canvas.vision : 'Not defined'}
  - Linked Outcomes: ${outcomes.length > 0 ? outcomes.map(o => `${o.title} (${o.status})`).join(', ') : 'None linked'}
  
  CRITICAL INSTRUCTION:
  Assess if this bet actually moves the needle on the specific Theme and Outcomes listed above. 
  Check if it falls into any of the "Traps" (Scarcity, Liability, Rigidity, Lethargy).
  Ensure the Bet Type (${bet.bet_type}) matches the intent (Discovery=Renewal, Delivery=Growth, Enablement=Maturity).

  TONE:
  - Empathetic to the complexity of leadership, but provocative and direct. 
  - Do NOT be a mirror. If a user's bet is safe or vague, call it out. 
  - Challenge weak problem statements. If they are addressing symptoms instead of root causes, push back.
  - Ask "So what?" and "How will we actually know if this failed?".
  - Be a truth-seeker, not a cheerleader.

  CONTEXT OF THE CURRENT BET:
  - Title: ${bet.title}
  - Type: ${bet.bet_type}
  - Problem: ${bet.problem_statement}
  - Hypothesis: ${bet.hypothesis}
  - Success Signals: ${bet.success_signals}
  - Risks: ${bet.risks_assumptions}
  - Progress: ${bet.progress}%

  When the user says hello or starts the chat, provide a punchy 2-sentence initial assessment of their bet based on the Active Strategy Framework, identifying the weakest link in their logic immediately.`;

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
      temperature: 0.8,
    },
  });

  return chat;
}

export async function generateMeetingBrief(bets: Bet[], comments: Comment[], users: User[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const teamContext = users.map(u => {
    const userBets = bets.filter(b => b.owner_user_ids.includes(u.id));
    return `${u.firstName} ${u.lastName} (${u.role}) - Responsibilities: ${userBets.map(b => b.title).join(', ') || 'General Support'}`;
  }).join('\n');

  const betsSummary = bets.map(b => `- ${b.title}: ${b.stage}, ${b.progress}% progress. (Last update: ${b.updated_at})`).join('\n');
  const commentsSummary = comments
    .filter(c => new Date(c.created_at) > oneWeekAgo)
    .map(c => `- ${c.author_name} on ${c.entity_type}: "${c.body}"`)
    .join('\n');

  const prompt = `Generate a high-level executive meeting brief for an Active Strategy rhythm check-in.
    
    ### CONTEXT:
    CURRENT BETS STATUS:
    ${betsSummary}
    
    RECENT COMMENTS/DISCUSSION (Last 7 days):
    ${commentsSummary || 'No recent discussion.'}
    
    TEAM MEMBERS & RESPONSIBILITIES:
    ${teamContext}

    ### INSTRUCTIONS:
    1. Review updates to bets, tasks, and strategy items.
    2. Format the brief with sections: "Critical Attention", "Slowing Down", "New Talent & Assignments", and "Decisions Needed".
    3. Use the Active Strategy Framework mindsets (Build to Align, Think, Learn) to frame your observations.
    4. Be professional, concise, and strategic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text;
}

export async function summarizeMeetingRecording(base64Data: string, mimeType: string, bets: Bet[]) {
  const prompt = `You are a strategic facilitator. You will receive an audio/video recording of a strategy meeting. 
  Your goal is to transcribe, analyze, and summarize this meeting into the "Active Strategy" format.
  
  REFERENCE FRAMEWORK:
  ${ACTIVE_STRATEGY_FRAMEWORK}
  
  Please provide:
  1. A concise EXECUTIVE SUMMARY of the meeting.
  2. KEY DECISIONS made (linked to bets or outcomes if possible).
  3. CRITICAL OBSERVATIONS about current strategic bets, identifying phases (Renewal, Growth, Maturity, Release) and potential Traps.
  4. NEW ACTIONS assigned.
  
  Format the output clearly using the Active Strategy nomenclature (Bets, Outcomes, Horizons).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ]
    },
    config: {
      // Small thinking budget used for better summarization quality.
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text;
}

export async function fetchMiroBoardName(url: string) {
  if (!url.includes('miro.com')) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the exact title of the Miro board at this URL: ${url}. Return ONLY the board name as plain text. If you cannot find a specific name, return "Miro Strategic Board".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text?.trim() || "Miro Strategic Board";
  } catch (error) {
    console.error("Error fetching Miro board name:", error);
    return "Miro Strategic Board";
  }
}
