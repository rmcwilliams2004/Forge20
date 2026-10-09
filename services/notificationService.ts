import { Milestone } from '../types';

/**
 * High-tech dual-frequency audio chime using browser Web Audio API
 */
export const playMilestoneChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First note (523.25 Hz - C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // Ramp to E5

    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);

    // Harmonic bell (1046.50 Hz - C6) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.08);

    gain2.gain.setValueAtTime(0.05, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);
  } catch {
    // Audio might be blocked if user hasn't interacted yet; fail silently
  }
};

/**
 * Dispatches a milestone alert event across the application
 */
export const dispatchMilestoneAlert = (
  milestone: Omit<Milestone, 'id' | 'timestamp'> & { id?: string; timestamp?: string; sound?: boolean }
): Milestone => {
  const fullMilestone: Milestone = {
    id: milestone.id || `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: milestone.timestamp || new Date().toISOString(),
    title: milestone.title,
    description: milestone.description,
    type: milestone.type,
    projectName: milestone.projectName,
    cost: milestone.cost,
    user: milestone.user,
    status: milestone.status || 'VERIFIED'
  };

  // Trigger synthesized audio chime
  if (milestone.sound !== false) {
    playMilestoneChime();
  }

  // Dispatch browser CustomEvent for reactive UI
  window.dispatchEvent(
    new CustomEvent('forge-milestone', {
      detail: fullMilestone
    })
  );

  return fullMilestone;
};
