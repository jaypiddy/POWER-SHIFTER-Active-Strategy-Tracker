
import { GoogleGenAI, Type } from "@google/genai";
import { Bet, Comment, User, Outcome1Y } from "../types";

// Always use named parameter for apiKey and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function tightenHypothesis(problem: string, hypothesis: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a world-class strategy consultant, tighten the following hypothesis. 
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
  const prompt = `You are a Chief Strategy Officer. Analyze the following strategic data and generate a Quarterly Performance Report.
    
    OUTCOMES:
    ${outcomes.map(o => `- ${o.title}: Status ${o.status}, Theme ${o.theme_id}`).join('\n')}
    
    BETS:
    ${bets.map(b => `- ${b.title}: Stage ${b.stage}, Progress ${b.progress}%, Type ${b.bet_type}`).join('\n')}

    Format the report in Markdown with these sections:
    1. EXECUTIVE SCORECARD (High level health)
    2. PILLAR PERFORMANCE (Analysis of themes)
    3. PORTFOLIO VELOCITY (Discovery vs Delivery balance)
    4. STRATEGIC RECOMMENDATIONS (3 concrete actions for the next quarter)
    
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
export function startStrategicCouncil(bet: Bet) {
  const systemInstruction = `You are the Strategic Council, a world-class Active Strategy Coach. 
  Your goal is to stress-test and refine Strategic Bets. 
  
  CORE PRINCIPLES:
  1. A Bet is a hypothesis: 'If we [action], then [outcome], because [reason]'.
  2. Discovery Bets are for learning; Delivery Bets are for scaling.
  3. Success Signals must be observable and definitive, not just 'task complete'.
  4. Measurements must be sanity-checked. No vanity metrics.

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

  When the user says hello or starts the chat, provide a punchy 2-sentence initial assessment of their bet, identifying the weakest link in their logic immediately.`;

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
    3. Be professional, concise, and strategic.`;

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
  
  Please provide:
  1. A concise EXECUTIVE SUMMARY of the meeting.
  2. KEY DECISIONS made (linked to bets or outcomes if possible).
  3. CRITICAL OBSERVATIONS about current strategic bets.
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
