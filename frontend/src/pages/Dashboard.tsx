import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  IndianRupee, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  Award,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon: React.ElementType;
  gradient: string;
}

function StatCard({ title, value, description, trend, icon: Icon, gradient }: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className="relative overflow-hidden hover-lift transition-all duration-300 group border-border/50">
      {/* Gradient background overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        gradient
      )} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
          "group-hover:scale-110 group-hover:shadow-glow",
          gradient
        )}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold group-hover:text-primary-foreground transition-colors">
          {value}
        </div>
        {(description || trend !== undefined) && (
          <div className="mt-2 flex items-center gap-2">
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                "group-hover:text-primary-foreground"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const stats = [
    {
      title: "Total Groups",
      value: 12,
      description: "2 new this month",
      trend: 15.3,
      icon: Users,
      gradient: "gradient-primary"
    },
    {
      title: "Active Members",
      value: 240,
      description: "+12 from last month",
      trend: 5.2,
      icon: UserPlus,
      gradient: "gradient-success"
    },
    {
      title: "Pending Payments",
      value: "₹45,000",
      description: "18 pending",
      trend: -8.1,
      icon: IndianRupee,
      gradient: "gradient-warning"
    },
    {
      title: "Active Auctions",
      value: 3,
      description: "2 ending soon",
      icon: Award,
      gradient: "gradient-info"
    }
  ];

  const recentActivities = [
    { action: "New group created", details: "Premium Gold Group", time: "2 hours ago" },
    { action: "Auction completed", details: "Silver Circle - Cycle 3", time: "4 hours ago" },
    { action: "Payment received", details: "₹15,000 from Member #42", time: "6 hours ago" },
    { action: "Member joined", details: "John Doe - Diamond Group", time: "1 day ago" },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your chit funds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your chit fund groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Create Group", icon: Users },
                { label: "Add Member", icon: UserPlus },
                { label: "Record Payment", icon: IndianRupee },
                { label: "Start Auction", icon: Award }
              ].map((action, index) => (
                <button
                  key={index}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-lg",
                    "border-2 border-dashed border-border hover:border-primary",
                    "hover:bg-primary/5 transition-all duration-200",
                    "group cursor-pointer"
                  )}
                >
                  <action.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>All systems operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Database", status: "Operational", color: "status-success" },
              { label: "Payment Gateway", status: "Operational", color: "status-success" },
              { label: "Notifications", status: "Operational", color: "status-success" }
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">{system.label}</span>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", system.color)}>
                  {system.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}