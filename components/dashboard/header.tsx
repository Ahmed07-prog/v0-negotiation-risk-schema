"use client"

import { Activity, Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isActive: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  signalCount: number
}

export function Header({ isActive, onStart, onStop, onReset, signalCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Negotiation Risk Simulator</h1>
              <p className="text-xs text-muted-foreground">Real-time risk & stability monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              <div
                className={`h-2 w-2 rounded-full ${isActive ? "bg-accent animate-heartbeat" : "bg-muted-foreground"}`}
              />
              <span className="text-sm font-mono text-secondary-foreground">{isActive ? "LIVE" : "IDLE"}</span>
            </div>

            <div className="text-sm font-mono text-muted-foreground">{signalCount} signals</div>

            <div className="flex items-center gap-2">
              {isActive ? (
                <Button variant="outline" size="sm" onClick={onStop}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" onClick={onStart}>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
