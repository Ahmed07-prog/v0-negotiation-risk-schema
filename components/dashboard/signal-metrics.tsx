"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SignalEvent } from "@/lib/types"
import { Mic, MessageSquare, Users, Clock } from "lucide-react"

interface SignalMetricsProps {
  signal?: SignalEvent
}

export function SignalMetrics({ signal }: SignalMetricsProps) {
  if (!signal) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {["Voice Metrics", "Linguistic Metrics", "Interaction Metrics", "Temporal Metrics"].map((title) => (
          <Card key={title} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Awaiting signal data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { voice_metrics, linguistic_metrics, interaction_metrics, temporal_metrics } = signal.signals

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <Mic className="h-4 w-4 text-chart-1" />
            Voice Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Speech Rate" value={`${voice_metrics.speech_rate_wpm?.toFixed(0) ?? "-"}`} unit="wpm" />
          <MetricRow
            label="Pause Freq"
            value={`${voice_metrics.pause_frequency_per_min?.toFixed(1) ?? "-"}`}
            unit="/min"
          />
          <MetricRow label="Avg Pause" value={`${voice_metrics.average_pause_ms?.toFixed(0) ?? "-"}`} unit="ms" />
          <MetricRow label="Volume Var" value={`${voice_metrics.volume_variance?.toFixed(2) ?? "-"}`} />
          <MetricRow
            label="Interruptions"
            value={`${((voice_metrics.interruption_rate ?? 0) * 100).toFixed(0)}`}
            unit="%"
          />
          <MetricRow
            label="Speaking Ratio"
            value={`${((voice_metrics.speaking_time_ratio ?? 0) * 100).toFixed(0)}`}
            unit="%"
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <MessageSquare className="h-4 w-4 text-chart-2" />
            Linguistic Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow
            label="Certainty Ratio"
            value={`${((linguistic_metrics.certainty_ratio ?? 0) * 100).toFixed(0)}`}
            unit="%"
          />
          <MetricRow
            label="Hedging Density"
            value={`${linguistic_metrics.hedging_density?.toFixed(1) ?? "-"}`}
            unit="/100w"
          />
          <MetricRow
            label="Modal Verbs"
            value={`${linguistic_metrics.modal_verb_density?.toFixed(1) ?? "-"}`}
            unit="/100w"
          />
          <MetricRow label="Sentence Var" value={`${linguistic_metrics.sentence_length_variance?.toFixed(1) ?? "-"}`} />
          <MetricRow label="Repetition Idx" value={`${linguistic_metrics.repetition_index?.toFixed(2) ?? "-"}`} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <Users className="h-4 w-4 text-chart-3" />
            Interaction Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow label="Turn Count" value={`${interaction_metrics.turn_count ?? "-"}`} />
          <MetricRow
            label="Turn Balance"
            value={`${((interaction_metrics.turn_balance_index ?? 0) * 100).toFixed(0)}`}
            unit="%"
          />
          <MetricRow
            label="Topic Switches"
            value={`${interaction_metrics.topic_switch_rate?.toFixed(1) ?? "-"}`}
            unit="/min"
          />
          <MetricRow
            label="Topic Re-entry"
            value={`${interaction_metrics.topic_reentry_rate?.toFixed(1) ?? "-"}`}
            unit="/min"
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
            <Clock className="h-4 w-4 text-chart-4" />
            Temporal Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow
            label="Urgency Markers"
            value={`${temporal_metrics.urgency_marker_density?.toFixed(1) ?? "-"}`}
            unit="/100w"
          />
          <MetricRow
            label="Response Latency"
            value={`${temporal_metrics.response_latency_ms?.toFixed(0) ?? "-"}`}
            unit="ms"
          />
          <MetricRow label="Latency Var" value={`${temporal_metrics.latency_variance?.toFixed(0) ?? "-"}`} />
          <MetricRow
            label="Closure Attempts"
            value={`${temporal_metrics.closure_attempt_density?.toFixed(1) ?? "-"}`}
            unit="/min"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono text-foreground">
        {value}
        {unit && <span className="text-muted-foreground text-xs ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}
