"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import type { Alert } from "@/lib/types"

interface AlertsFeedProps {
  alerts: Alert[]
  hasHighSeverity: boolean
}

export function AlertsFeed({ alerts, hasHighSeverity }: AlertsFeedProps) {
  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-warning" />
      case "critical":
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
      default:
        return <Info className="h-3.5 w-3.5 text-primary" />
    }
  }

  const getAlertBorder = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "border-l-warning"
      case "critical":
        return "border-l-destructive"
      default:
        return "border-l-primary"
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 }
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityDiff = severityOrder[a.type] - severityOrder[b.type]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return (
    <Card
      className={`bg-card border-border h-full transition-all duration-500 ${
        hasHighSeverity ? "bg-gradient-to-r from-card to-destructive/5" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between text-card-foreground">
          <span>Alerts</span>
          <span className="text-xs font-normal text-muted-foreground">{alerts.length} events</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-4 pb-4">
          {sortedAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No alerts yet</p>
          ) : (
            <div className="space-y-2">
              {sortedAlerts.map((alert) => (
                <div key={alert.id} className={`p-2.5 rounded bg-secondary border-l-2 ${getAlertBorder(alert.type)}`}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{formatTime(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
