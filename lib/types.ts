export interface SignalEvent {
  session_id: string
  timestamp: string
  channel: "voice" | "text" | "mixed"
  window: {
    duration_seconds: number
    window_type: "rolling" | "fixed"
  }
  signals: {
    voice_metrics: {
      speech_rate_wpm?: number
      pause_frequency_per_min?: number
      average_pause_ms?: number
      volume_variance?: number
      interruption_rate?: number
      speaking_time_ratio?: number
    }
    linguistic_metrics: {
      certainty_ratio?: number
      hedging_density?: number
      modal_verb_density?: number
      sentence_length_variance?: number
      repetition_index?: number
    }
    interaction_metrics: {
      turn_count?: number
      turn_balance_index?: number
      topic_switch_rate?: number
      topic_reentry_rate?: number
    }
    temporal_metrics: {
      urgency_marker_density?: number
      response_latency_ms?: number
      latency_variance?: number
      closure_attempt_density?: number
    }
  }
}

export interface RiskState {
  name: string
  probability: number
  trend: "increasing" | "decreasing" | "stable"
  confidence: number
}

export interface Alert {
  id: string
  type: "info" | "warning" | "critical"
  message: string
  timestamp: string
}

export interface SessionContext {
  negotiationType: "sales" | "salary" | "partnership" | "conflict"
  stakesLevel: "low" | "medium" | "high"
  relationshipStage: "first-contact" | "ongoing" | "closing"
}

export interface SessionMemory {
  baselineRisks: RiskState[]
  peakRisks: Record<string, { value: number; timestamp: string }>
  sustainedElevation: Record<string, { startTime: number; duration: number }>
}
