import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Zap, 
  ShieldAlert, 
  Radio,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Navigation
} from "lucide-react";

interface EmergencyAlert {
  id: string;
  type: string;
  location: string;
  time: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  reporter: string;
  status: "new" | "responding" | "resolved";
}

export default function EmergencyFeed() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [filter, setFilter] = useState<"all" | "medical" | "fire" | "accident" | "security" | "disaster">("all");

  const mockAlerts: EmergencyAlert[] = [
    {
      id: "1",
      type: "medical",
      location: "MG Road, Pune",
      time: "2 mins ago",
      severity: "critical",
      description: "Person collapsed, needs immediate medical attention",
      reporter: "Anonymous User",
      status: "responding"
    },
    {
      id: "2", 
      type: "fire",
      location: "Koramangala, Bangalore",
      time: "5 mins ago",
      severity: "high",
      description: "Fire reported in commercial building",
      reporter: "Shop Owner",
      status: "new"
    },
    {
      id: "3",
      type: "accident",
      location: "Highway 44, Mumbai-Pune Expressway",
      time: "8 mins ago", 
      severity: "medium",
      description: "Two-car accident, traffic blocked",
      reporter: "Passerby",
      status: "responding"
    },
    {
      id: "4",
      type: "security",
      location: "Connaught Place, Delhi",
      time: "12 mins ago",
      severity: "low", 
      description: "Suspicious activity near ATM",
      reporter: "Security Guard",
      status: "new"
    },
    {
      id: "5",
      type: "disaster",
      location: "Coastal Area, Chennai",
      time: "15 mins ago",
      severity: "high",
      description: "Flooding due to heavy rainfall",
      reporter: "Local Resident",
      status: "responding"
    }
  ];

  useEffect(() => {
    // Filter alerts based on selected filter
    if (filter === "all") {
      setAlerts(mockAlerts);
    } else {
      setAlerts(mockAlerts.filter(alert => alert.type === filter));
    }
  }, [filter]);

  const getAlertIcon = (type: string) => {
    const icons = {
      medical: Heart,
      fire: Zap,
      accident: ShieldAlert,
      security: Radio,
      disaster: Radio
    };
    return icons[type as keyof typeof icons] || ShieldAlert;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700", 
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700"
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      responding: "bg-purple-100 text-purple-700",
      resolved: "bg-gray-100 text-gray-700"
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Feed</h1>
          <p className="text-gray-600">Live emergency reports from your area</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex gap-2">
          {[
            { id: "all", label: "All" },
            { id: "medical", label: "Medical" },
            { id: "fire", label: "Fire" },
            { id: "accident", label: "Accident" },
            { id: "security", label: "Security" },
            { id: "disaster", label: "Disaster" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Alert Icon & Type */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        alert.type === "medical" ? "bg-red-100" :
                        alert.type === "fire" ? "bg-orange-100" :
                        alert.type === "accident" ? "bg-yellow-100" :
                        alert.type === "security" ? "bg-blue-100" :
                        "bg-purple-100"
                      }`}>
                        <AlertIcon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status.toUpperCase()}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {alert.description}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{alert.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{alert.reporter}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="gap-1">
                          <MessageCircle className="h-4 w-4" />
                          Respond
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Navigation className="h-4 w-4" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button variant="outline" size="lg">
            Load More Alerts
          </Button>
        </div>
      </div>
    </div>
  );
}
