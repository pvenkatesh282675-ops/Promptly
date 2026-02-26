import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  message?: string;
  className?: string;
}

export function TypingIndicator({
  message = "AI is thinking...",
  className,
}: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex gap-1">
        <div className="thinking-dot h-2 w-2 rounded-full bg-[hsl(var(--ai-thinking))]" />
        <div className="thinking-dot h-2 w-2 rounded-full bg-[hsl(var(--ai-thinking))]" />
        <div className="thinking-dot h-2 w-2 rounded-full bg-[hsl(var(--ai-thinking))]" />
      </div>
      <span>{message}</span>
    </div>
  );
}
