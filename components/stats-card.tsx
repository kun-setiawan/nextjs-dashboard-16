import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Award, Target, CheckCircle } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: "up" | "down"
  trendValue?: string
  icon: "users" | "award" | "target" | "check"
}

const iconMap = {
  users: Users,
  award: Award,
  target: Target,
  check: CheckCircle,
}

export function StatsCard({ title, value, subtitle, trend, trendValue, icon }: StatsCardProps) {
  const Icon = iconMap[icon]

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {trend && trendValue && (
              <div
                className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-success" : "text-destructive"}`}
              >
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
