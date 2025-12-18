"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "./dashboard/header"
import { ContextPanel } from "./dashboard/context-panel"
import { RiskStates } from "./dashboard/risk-states"
import { SignalMetrics } from "./dashboard/signal-metrics"
import { AlertsFeed } from "./dashboard/alerts-feed"
import { TimeSeriesChart } from "./dashboard/time-series-chart"
import type { SignalEvent, RiskState, Alert, SessionContext, SessionMemory } from "@/lib/types"
import { generateMockSignal, calculateRiskStates, detectAlerts } from "@/lib/signal-engine"

const initialRiskStates: RiskState[] = [
  { name: "Stability", probability: 75, trend: "stable", confidence: 0.85 },
  { name: "Volatility", probability: 20, trend: "stable", confidence: 0.8 },
  { name: "Saturation", probability: 15, trend: "stable", confidence: 0.75 },
  { name: "Backlash Risk", probability: 10, trend: "stable", confidence: 0.9 },
  { name: "Commitment Fragility", probability: 25, trend: "stable", confidence: 0.7 },
]

export function NegotiationDashboard() {
  const [isActive, setIsActive] = useState(false)
  const [signals, setSignals] = useState<SignalEvent[]>([])
  const [riskStates, setRiskStates] = useState<RiskState[]>(initialRiskStates)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [context, setContext] = useState<SessionContext>({
    negotiationType: "sales",
    stakesLevel: "medium",
    relationshipStage: "ongoing",
  })

  const [sessionMemory, setSessionMemory] = useState<SessionMemory>({
    baselineRisks: initialRiskStates,
    peakRisks: {},
    sustainedElevation: {},
  })

  const elevationTimers = useRef<Record<string, number>>({})

  const processSignal = useCallback(
    (signal: SignalEvent) => {
      setSignals((prev) => [...prev.slice(-59), signal])
      const newRiskStates = calculateRiskStates(signal, riskStates, context)
      setRiskStates(newRiskStates)

      setSessionMemory((prev) => {
        const newPeaks = { ...prev.peakRisks }
        const newSustained = { ...prev.sustainedElevation }
        const now = Date.now()

        newRiskStates.forEach((state) => {
          // Track peaks
          if (!newPeaks[state.name] || state.probability > newPeaks[state.name].value) {
            newPeaks[state.name] = { value: state.probability, timestamp: new Date().toISOString() }
          }

          // Track sustained elevation for irreversible markers
          if ((state.name === "Backlash Risk" || state.name === "Commitment Fragility") && state.probability > 70) {
            if (!elevationTimers.current[state.name]) {
              elevationTimers.current[state.name] = now
            }
            newSustained[state.name] = {
              startTime: elevationTimers.current[state.name],
              duration: now - elevationTimers.current[state.name],
            }
          } else {
            delete elevationTimers.current[state.name]
            delete newSustained[state.name]
          }
        })

        return { ...prev, peakRisks: newPeaks, sustainedElevation: newSustained }
      })

      const newAlerts = detectAlerts(signal, newRiskStates)
      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20))
      }
    },
    [riskStates, context],
  )

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      const signal = generateMockSignal()
      processSignal(signal)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, processSignal])

  const handleStart = () => {
    setSessionMemory({
      baselineRisks: riskStates,
      peakRisks: {},
      sustainedElevation: {},
    })
    elevationTimers.current = {}
    setIsActive(true)
    setAlerts([
      { id: Date.now().toString(), type: "info", message: "Session started", timestamp: new Date().toISOString() },
    ])
  }

  const handleStop = () => {
    setIsActive(false)
    setAlerts((prev) => [
      { id: Date.now().toString(), type: "info", message: "Session paused", timestamp: new Date().toISOString() },
      ...prev,
    ])
  }

  const handleReset = () => {
    setIsActive(false)
    setSignals([])
    setAlerts([])
    setRiskStates(initialRiskStates)
    setSessionMemory({
      baselineRisks: initialRiskStates,
      peakRisks: {},
      sustainedElevation: {},
    })
    elevationTimers.current = {}
  }

  const latestSignal = signals[signals.length - 1]

  const hasHighSeverity = alerts.some((a) => a.type === "critical")

  return (
    <div className="min-h-screen bg-background">
      <Header
        isActive={isActive}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        signalCount={signals.length}
      />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ContextPanel context={context} onContextChange={setContext} isActive={isActive} />
          </div>
          <div className="lg:col-span-3">
            <RiskStates states={riskStates} sessionMemory={sessionMemory} />
          </div>
        </div>

        <div
          className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-300 ${
            hasHighSeverity ? "xl:grid-cols-[1.95fr_1.05fr]" : ""
          }`}
        >
          <div className="xl:col-span-2">
            <TimeSeriesChart signals={signals} sessionMemory={sessionMemory} />
          </div>
          <div className="xl:col-span-1">
            <AlertsFeed alerts={alerts} hasHighSeverity={hasHighSeverity} />
          </div>
        </div>

        <SignalMetrics signal={latestSignal} />
      </main>
    </div>
  )
}
