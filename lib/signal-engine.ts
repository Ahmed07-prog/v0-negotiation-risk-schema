import type { SignalEvent, RiskState, Alert, SessionContext } from "./types"

export function generateMockSignal(): SignalEvent {
  const baseRate = 120 + Math.random() * 80
  const volatilityFactor = Math.random()

  return {
    session_id: "demo-session",
    timestamp: new Date().toISOString(),
    channel: "mixed",
    window: {
      duration_seconds: 10,
      window_type: "rolling",
    },
    signals: {
      voice_metrics: {
        speech_rate_wpm: baseRate + (volatilityFactor > 0.7 ? 40 : 0),
        pause_frequency_per_min: 8 + Math.random() * 12,
        average_pause_ms: 300 + Math.random() * 700,
        volume_variance: Math.random() * 2.5,
        interruption_rate: Math.random() * 0.3,
        speaking_time_ratio: 0.3 + Math.random() * 0.4,
      },
      linguistic_metrics: {
        certainty_ratio: 0.4 + Math.random() * 0.5,
        hedging_density: Math.random() * 8,
        modal_verb_density: Math.random() * 6,
        sentence_length_variance: 5 + Math.random() * 20,
        repetition_index: Math.random() * 0.5,
      },
      interaction_metrics: {
        turn_count: Math.floor(3 + Math.random() * 8),
        turn_balance_index: 0.3 + Math.random() * 0.4,
        topic_switch_rate: Math.random() * 3,
        topic_reentry_rate: Math.random() * 2,
      },
      temporal_metrics: {
        urgency_marker_density: Math.random() * 5,
        response_latency_ms: 200 + Math.random() * 2000,
        latency_variance: Math.random() * 500,
        closure_attempt_density: Math.random() * 3,
      },
    },
  }
}

export function calculateRiskStates(
  signal: SignalEvent,
  previousStates: RiskState[],
  context: SessionContext,
): RiskState[] {
  const { voice_metrics, linguistic_metrics, interaction_metrics, temporal_metrics } = signal.signals

  // Context-based threshold adjustments
  const stakesMultiplier = context.stakesLevel === "high" ? 1.3 : context.stakesLevel === "medium" ? 1.0 : 0.7

  // Calculate new probabilities based on signal metrics
  const volatilityScore = Math.min(
    100,
    ((voice_metrics.volume_variance ?? 0) * 20 +
      (voice_metrics.interruption_rate ?? 0) * 50 +
      (linguistic_metrics.sentence_length_variance ?? 0) * 1.5) *
      stakesMultiplier,
  )

  const stabilityScore = Math.max(0, 100 - volatilityScore * 0.8)

  const saturationScore = Math.min(
    100,
    (temporal_metrics.urgency_marker_density ?? 0) * 15 +
      (temporal_metrics.closure_attempt_density ?? 0) * 20 +
      (linguistic_metrics.repetition_index ?? 0) * 100,
  )

  const backlashScore = Math.min(
    100,
    saturationScore * 0.3 +
      (1 - (interaction_metrics.turn_balance_index ?? 0.5)) * 60 +
      (voice_metrics.interruption_rate ?? 0) * 100,
  )

  const fragilityScore = Math.min(
    100,
    (linguistic_metrics.hedging_density ?? 0) * 8 +
      (linguistic_metrics.modal_verb_density ?? 0) * 10 +
      (1 - (linguistic_metrics.certainty_ratio ?? 0.5)) * 50,
  )

  const newValues = [
    { name: "Stability", probability: Math.round(stabilityScore) },
    { name: "Volatility", probability: Math.round(volatilityScore) },
    { name: "Saturation", probability: Math.round(saturationScore) },
    { name: "Backlash Risk", probability: Math.round(backlashScore) },
    { name: "Commitment Fragility", probability: Math.round(fragilityScore) },
  ]

  return previousStates.map((state) => {
    const newValue = newValues.find((v) => v.name === state.name)
    if (!newValue) return state

    const delta = newValue.probability - state.probability
    const smoothedProbability = Math.round(state.probability + delta * 0.3)

    let trend: RiskState["trend"] = "stable"
    if (delta > 5) trend = "increasing"
    else if (delta < -5) trend = "decreasing"

    return {
      ...state,
      probability: Math.max(0, Math.min(100, smoothedProbability)),
      trend,
      confidence: 0.7 + Math.random() * 0.25,
    }
  })
}

export function detectAlerts(signal: SignalEvent, riskStates: RiskState[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date().toISOString()

  const volatility = riskStates.find((s) => s.name === "Volatility")
  const saturation = riskStates.find((s) => s.name === "Saturation")
  const stability = riskStates.find((s) => s.name === "Stability")
  const backlash = riskStates.find((s) => s.name === "Backlash Risk")

  // Structural shift detection
  if (signal.signals.voice_metrics.volume_variance && signal.signals.voice_metrics.volume_variance > 2) {
    alerts.push({
      id: `alert-${Date.now()}-1`,
      type: "warning",
      message: "Structural shift detected: pacing variance elevated",
      timestamp: now,
    })
  }

  if (volatility && volatility.probability > 60 && volatility.trend === "increasing") {
    alerts.push({
      id: `alert-${Date.now()}-2`,
      type: "warning",
      message: "Volatility increasing",
      timestamp: now,
    })
  }

  if (saturation && saturation.probability > 70) {
    alerts.push({
      id: `alert-${Date.now()}-3`,
      type: "critical",
      message: "Pressure saturation approaching",
      timestamp: now,
    })
  }

  if (stability && stability.probability < 40 && stability.trend === "decreasing") {
    alerts.push({
      id: `alert-${Date.now()}-4`,
      type: "warning",
      message: "Commitment stability decreasing",
      timestamp: now,
    })
  }

  if (
    signal.signals.interaction_metrics.turn_balance_index &&
    signal.signals.interaction_metrics.turn_balance_index < 0.35
  ) {
    alerts.push({
      id: `alert-${Date.now()}-5`,
      type: "info",
      message: "Asymmetry widening",
      timestamp: now,
    })
  }

  if (backlash && backlash.probability > 50 && backlash.trend === "increasing") {
    alerts.push({
      id: `alert-${Date.now()}-6`,
      type: "critical",
      message: "Backlash risk elevated",
      timestamp: now,
    })
  }

  // Limit to prevent alert spam
  return alerts.slice(0, 2)
}
