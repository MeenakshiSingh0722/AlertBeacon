import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Filter
} from "lucide-react";

interface Notification {
  id: string;
  type: "incoming" | "nearby" | "system" | "response";
  title: string;
  message: string;
  time: string;
  severity: "low" | "medium" | "high" | "critical";
  read: boolean;
  action?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "incoming",
      title: "New Emergency Alert",
      message: "Medical emergency reported 500m from your location",
      time: "2 mins ago",
      severity: "critical",
      read: false,
      action: "View Details"
    },
    {
      id: "2",
      type: "nearby", 
      title: "Nearby Emergency",
      message: "Fire reported in your area - please stay alert",
      time: "5 mins ago",
      severity: "high",
      read: false,
      action: "View Map"
    },
    {
      id: "3",
      type: "system",
      title: "System Update",
      message: "New safety features added to AlertBeacon",
      time: "1 hour ago",
      severity: "low",
      read: true
    },
    {
      id: "4",
      type: "response",
      title: "Response Confirmation",
      message: "Your report has been acknowledged by emergency services",
      time: "2 hours ago",
      severity: "medium",
      read: true,
      action: "Track Response"
    },
    {
      id: "5",
      type: "incoming",
      title: "Community Alert",
      message: "Multiple accidents reported on highway - avoid area",
      time: "3 hours ago",
      severity: "medium",
      read: true,
      action: "View Details"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "unread" | "incoming" | "nearby" | "system" | "response">("all");

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "critical") return AlertTriangle;
    if (type === "response") return CheckCircle;
    return Bell;
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

  const getTypeColor = (type: string) => {
    const colors = {
      incoming: "bg-blue-100 text-blue-700",
      nearby: "bg-purple-100 text-purple-700",
      system: "bg-gray-100 text-gray-700",
      response: "bg-green-100 text-green-700"
    };
    return colors[type as keyof typeof colors] || colors.incoming;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with emergency alerts</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: "Unread" },
              { id: "incoming", label: "Incoming" },
              { id: "nearby", label: "Nearby" },
              { id: "system", label: "System" },
              { id: "response", label: "Responses" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type, notification.severity);
            return (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "incoming" ? "bg-blue-100" :
                      notification.type === "nearby" ? "bg-purple-100" :
                      notification.type === "system" ? "bg-gray-100" :
                      "bg-green-100"
                    }`}>
                      <NotificationIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type.toUpperCase()}
                            </Badge>
                            <Badge className={getSeverityColor(notification.severity)}>
                              {notification.severity.toUpperCase()}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{notification.time}</span>
                        </div>
                        {notification.action && (
                          <Button size="sm" variant="outline">
                            {notification.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredNotifications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === "unread" ? "You have no unread notifications." : 
                   filter === "all" ? "You're all caught up!" :
                   `No ${filter} notifications found.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="text-center py-6">
            <Button variant="outline" size="lg">
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
