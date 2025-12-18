"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { RiskState, SessionMemory } from "@/lib/types"

interface RiskStatesProps {
  states: RiskState[]
  sessionMemory: SessionMemory
}

export function RiskStates({ states, sessionMemory }: RiskStatesProps) {
  const getTrendIcon = (trend: RiskState["trend"]) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-3.5 w-3.5 text-destructive" />
      case "decreasing":
        return <TrendingDown className="h-3.5 w-3.5 text-accent" />
      default:
        return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getBarColor = (name: string, probability: number) => {
    if (name === "Stability") {
      if (probability > 60) return "bg-stability"
      if (probability > 30) return "bg-warning"
      return "bg-destructive"
    }
    if (probability > 60) return "bg-destructive"
    if (probability > 30) return "bg-warning"
    return "bg-accent"
  }

  const hasIrreversibleMarker = (name: string) => {
    const sustainedData = sessionMemory.sustainedElevation[name]
    return sustainedData && sustainedData.duration >= 30000 // 30 seconds
  }

  const getBaselineValue = (name: string) => {
    const baseline = sessionMemory.baselineRisks.find((r) => r.name === name)
    return baseline?.probability ?? null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-card-foreground">Risk States</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {states.map((state) => {
            const isStability = state.name === "Stability"
            const showMarker =
              (state.name === "Backlash Risk" || state.name === "Commitment Fragility") &&
              hasIrreversibleMarker(state.name)
            const baselineValue = getBaselineValue(state.name)

            return (
              <div key={state.name} className={`space-y-2 ${isStability ? "lg:scale-[1.02] origin-top" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isStability ? "text-stability font-medium" : "text-muted-foreground"}`}>
                    {state.name}
                  </span>
                  {getTrendIcon(state.trend)}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-semibold text-foreground">{state.probability}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <div className={`relative bg-secondary rounded-full overflow-hidden ${isStability ? "h-2" : "h-1.5"}`}>
                  {/* Ghost baseline indicator */}
                  {baselineValue !== null && baselineValue !== state.probability && (
                    <div
                      className="absolute top-0 h-full w-0.5 bg-muted-foreground/30 transition-all duration-500"
                      style={{ left: `${baselineValue}%` }}
                    />
                  )}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(state.name, state.probability)}`}
                    style={{ width: `${state.probability}%` }}
                  />
                  {showMarker && (
                    <div className="absolute right-1 top-0 bottom-0 flex items-center">
                      <div className="w-0.5 h-full bg-destructive/80 irreversible-marker" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  ±{Math.round((1 - state.confidence) * state.probability)}% CI
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
