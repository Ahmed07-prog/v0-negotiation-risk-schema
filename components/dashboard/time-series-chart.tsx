"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import type { SignalEvent, SessionMemory } from "@/lib/types"

interface TimeSeriesChartProps {
  signals: SignalEvent[]
  sessionMemory: SessionMemory
}

export function TimeSeriesChart({ signals, sessionMemory }: TimeSeriesChartProps) {
  const chartData = signals.map((signal, index) => ({
    index,
    symmetry: (signal.signals.interaction_metrics.turn_balance_index ?? 0.5) * 100,
    stability: 100 - (signal.signals.voice_metrics.volume_variance ?? 0) * 20,
    pressure:
      (signal.signals.temporal_metrics.urgency_marker_density ?? 0) * 10 +
      (signal.signals.temporal_metrics.closure_attempt_density ?? 0) * 15,
  }))

  const latestData = chartData[chartData.length - 1]
  const dominantLine = useMemo(() => {
    if (!latestData) return null
    const values = [
      { key: "symmetry", value: latestData.symmetry },
      { key: "stability", value: latestData.stability },
      { key: "pressure", value: latestData.pressure },
    ]
    return values.reduce((max, curr) => (curr.value > max.value ? curr : max)).key
  }, [latestData])

  const sessionPeak = useMemo(() => {
    if (chartData.length === 0) return null
    const maxPressure = Math.max(...chartData.map((d) => d.pressure))
    return maxPressure > 50 ? maxPressure : null
  }, [chartData])

  const baselineStability = sessionMemory.baselineRisks.find((r) => r.name === "Stability")?.probability ?? 75

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between text-card-foreground">
          <span>Aggregate Indices</span>
          <div className="flex items-center gap-4 text-xs font-normal">
            <div className="flex items-center gap-1.5">
              <div
                className={`rounded-full bg-chart-1 transition-all ${dominantLine === "symmetry" ? "h-2.5 w-2.5" : "h-2 w-2 opacity-70"}`}
              />
              <span
                className={`text-muted-foreground transition-opacity ${dominantLine === "symmetry" ? "" : "opacity-70"}`}
              >
                Symmetry
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`rounded-full bg-chart-2 transition-all ${dominantLine === "stability" ? "h-2.5 w-2.5" : "h-2 w-2 opacity-70"}`}
              />
              <span
                className={`text-muted-foreground transition-opacity ${dominantLine === "stability" ? "" : "opacity-70"}`}
              >
                Stability
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`rounded-full bg-chart-3 transition-all ${dominantLine === "pressure" ? "h-2.5 w-2.5" : "h-2 w-2 opacity-70"}`}
              />
              <span
                className={`text-muted-foreground transition-opacity ${dominantLine === "pressure" ? "" : "opacity-70"}`}
              >
                Pressure
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Start session to view time series</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="symmetryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.7 0.15 220)"
                    stopOpacity={dominantLine === "symmetry" ? 0.4 : 0.2}
                  />
                  <stop offset="100%" stopColor="oklch(0.7 0.15 220)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="stabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.75 0.18 145)"
                    stopOpacity={dominantLine === "stability" ? 0.4 : 0.2}
                  />
                  <stop offset="100%" stopColor="oklch(0.75 0.18 145)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.75 0.18 85)"
                    stopOpacity={dominantLine === "pressure" ? 0.4 : 0.2}
                  />
                  <stop offset="100%" stopColor="oklch(0.75 0.18 85)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="index"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.005 260)",
                  border: "1px solid oklch(0.25 0.005 260)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.6 0 0)" }}
              />
              <ReferenceLine y={baselineStability} stroke="oklch(0.5 0 0)" strokeDasharray="3 3" strokeOpacity={0.4} />
              {sessionPeak && (
                <ReferenceLine
                  y={sessionPeak}
                  stroke="oklch(0.6 0.2 25)"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                  label={{ value: "Peak", position: "right", fontSize: 9, fill: "oklch(0.6 0.2 25)" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="symmetry"
                stroke="oklch(0.7 0.15 220)"
                fill="url(#symmetryGradient)"
                strokeWidth={dominantLine === "symmetry" ? 2.5 : 1.5}
                strokeOpacity={dominantLine === "symmetry" ? 1 : 0.6}
              />
              <Area
                type="monotone"
                dataKey="stability"
                stroke="oklch(0.75 0.18 145)"
                fill="url(#stabilityGradient)"
                strokeWidth={dominantLine === "stability" ? 2.5 : 1.5}
                strokeOpacity={dominantLine === "stability" ? 1 : 0.6}
              />
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="oklch(0.75 0.18 85)"
                fill="url(#pressureGradient)"
                strokeWidth={dominantLine === "pressure" ? 2.5 : 1.5}
                strokeOpacity={dominantLine === "pressure" ? 1 : 0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
