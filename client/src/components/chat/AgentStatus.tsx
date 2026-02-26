import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AgentState = "active" | "idle" | "stopped" | "initializing";

interface AgentStatusProps {
  state: AgentState;
  onToggle?: (active: boolean) => void;
  showToggle?: boolean;
  className?: string;
}

export function AgentStatus({
  state,
  onToggle,
  showToggle = true,
  className,
}: AgentStatusProps) {
  const getStatusConfig = (state: AgentState) => {
    switch (state) {
      case "active":
        return {
          label: "Active",
          color: "bg-[hsl(var(--success))]",
          variant: "success" as const,
          pulse: true,
        };
      case "initializing":
        return {
          label: "Initializing",
          color: "bg-[hsl(var(--warning))]",
          variant: "warning" as const,
          pulse: true,
        };
      case "idle":
        return {
          label: "Idle",
          color: "bg-muted-foreground",
          variant: "secondary" as const,
          pulse: false,
        };
      case "stopped":
        return {
          label: "Stopped",
          color: "bg-destructive",
          variant: "destructive" as const,
          pulse: false,
        };
    }
  };

  const config = getStatusConfig(state);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2 items-center justify-center">
          <div className={cn("h-2 w-2 rounded-full", config.color)} />
          {config.pulse && (
            <div
              className={cn(
                "absolute h-2 w-2 rounded-full pulse-ring",
                config.color,
                "opacity-75",
              )}
            />
          )}
        </div>
        <Badge variant={config.variant} className="gap-1">
          <Bot className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {showToggle && onToggle && (
        <div className="flex items-center gap-2">
          <Switch
            checked={state === "active" || state === "initializing"}
            onCheckedChange={onToggle}
            disabled={state === "initializing"}
            id="agent-toggle"
          />
          <Label htmlFor="agent-toggle" className="text-sm cursor-pointer">
            {state === "active" || state === "initializing"
              ? "Disable"
              : "Enable"}{" "}
            Agent
          </Label>
        </div>
      )}
    </div>
  );
}
