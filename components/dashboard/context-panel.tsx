"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SessionContext } from "@/lib/types"
import { Settings2 } from "lucide-react"

interface ContextPanelProps {
  context: SessionContext
  onContextChange: (context: SessionContext) => void
  isActive: boolean
}

export function ContextPanel({ context, onContextChange, isActive }: ContextPanelProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          Session Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Negotiation Type</Label>
          <Select
            value={context.negotiationType}
            onValueChange={(v) =>
              onContextChange({ ...context, negotiationType: v as SessionContext["negotiationType"] })
            }
            disabled={isActive}
          >
            <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="conflict">Conflict</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Stakes Level</Label>
          <Select
            value={context.stakesLevel}
            onValueChange={(v) => onContextChange({ ...context, stakesLevel: v as SessionContext["stakesLevel"] })}
            disabled={isActive}
          >
            <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Relationship Stage</Label>
          <Select
            value={context.relationshipStage}
            onValueChange={(v) =>
              onContextChange({ ...context, relationshipStage: v as SessionContext["relationshipStage"] })
            }
            disabled={isActive}
          >
            <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-contact">First Contact</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="closing">Closing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Context adjusts thresholds only, not conclusions. All processing is observation-based.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
