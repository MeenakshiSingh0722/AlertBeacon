import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  X,
  Navigation,
  AlertTriangle,
  User,
  Activity
} from "lucide-react";

interface EmergencyAssignment {
  id: string;
  type: string;
  location: string;
  reportedTime: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "accepted" | "on_way" | "resolved";
  reporter: string;
  description: string;
  distance?: string;
}

interface PastResponse {
  id: string;
  type: string;
  location: string;
  date: string;
  status: string;
  responseTime: string;
  outcome: string;
}

export default function ResponderPanel() {
  const [activeTab, setActiveTab] = useState<"assigned" | "available" | "history">("assigned");
  const [assignments, setAssignments] = useState<EmergencyAssignment[]>([
    {
      id: "1",
      type: "medical",
      location: "MG Road, Pune - 2.3 km away",
      reportedTime: "2 mins ago",
      severity: "critical",
      status: "pending",
      reporter: "Anonymous User",
      description: "Person collapsed, needs immediate medical attention",
      distance: "2.3 km"
    },
    {
      id: "2",
      type: "fire",
      location: "Koramangala, Bangalore - 5.1 km away",
      reportedTime: "5 mins ago",
      severity: "high",
      status: "accepted",
      reporter: "Shop Owner",
      description: "Fire reported in commercial building",
      distance: "5.1 km"
    },
    {
      id: "3",
      type: "accident",
      location: "Highway 44, Mumbai-Pune Expressway - 8.7 km away",
      reportedTime: "8 mins ago",
      severity: "medium",
      status: "on_way",
      reporter: "Passerby",
      description: "Two-car accident, traffic blocked",
      distance: "8.7 km"
    }
  ]);

  const [availableEmergencies, setAvailableEmergencies] = useState<EmergencyAssignment[]>([
    {
      id: "4",
      type: "security",
      location: "Connaught Place, Delhi - 12.5 km away",
      reportedTime: "12 mins ago",
      severity: "low" as const,
      status: "pending" as const,
      reporter: "Security Guard",
      description: "Suspicious activity near ATM",
      distance: "12.5 km"
    }
  ]);

  const pastResponses: PastResponse[] = [
    {
      id: "1",
      type: "medical",
      location: "Pune Station",
      date: "2024-04-15",
      status: "resolved",
      responseTime: "3 mins",
      outcome: "Successful"
    },
    {
      id: "2",
      type: "fire",
      location: "Koramangala, Bangalore", 
      date: "2024-04-10",
      status: "resolved",
      responseTime: "5 mins",
      outcome: "Successful"
    }
  ];

  const acceptAssignment = (id: string) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: "accepted" as EmergencyAssignment["status"] } : a
    ));
  };

  const rejectAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const updateStatus = (id: string, status: EmergencyAssignment["status"]) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status } : a
    ));
  };

  const getEmergencyIcon = (type: string) => {
    const icons = {
      medical: User,
      fire: AlertTriangle,
      accident: Activity,
      security: Users
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
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
      pending: "bg-gray-100 text-gray-700",
      accepted: "bg-blue-100 text-blue-700",
      on_way: "bg-purple-100 text-purple-700",
      resolved: "bg-green-100 text-green-700"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Responder Panel</h1>
          <p className="text-gray-600">Manage and respond to emergencies</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-1">
          {[
            { id: "assigned", label: "Assigned", count: assignments.length },
            { id: "available", label: "Available", count: availableEmergencies.length },
            { id: "history", label: "History", count: pastResponses.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Assigned Emergencies */}
        {activeTab === "assigned" && (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const EmergencyIcon = getEmergencyIcon(assignment.type);
              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Emergency Icon & Type */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          assignment.type === "medical" ? "bg-red-100" :
                          assignment.type === "fire" ? "bg-orange-100" :
                          assignment.type === "accident" ? "bg-yellow-100" :
                          "bg-blue-100"
                        }`}>
                          <EmergencyIcon className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(assignment.severity)}>
                                {assignment.severity.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              {assignment.distance && (
                                <Badge variant="outline">
                                  {assignment.distance}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {assignment.description}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{assignment.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{assignment.reportedTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{assignment.reporter}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          {assignment.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => acceptAssignment(assignment.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => rejectAssignment(assignment.id)}
                                className="gap-1"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {assignment.status === "accepted" && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus(assignment.id, "on_way")}
                              className="gap-1"
                            >
                              <Navigation className="h-4 w-4" />
                              On My Way
                            </Button>
                          )}
                          {assignment.status === "on_way" && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus(assignment.id, "resolved")}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Available Emergencies */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {availableEmergencies.map((emergency) => {
              const EmergencyIcon = getEmergencyIcon(emergency.type);
              return (
                <Card key={emergency.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Emergency Icon & Type */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          emergency.type === "medical" ? "bg-red-100" :
                          emergency.type === "fire" ? "bg-orange-100" :
                          emergency.type === "accident" ? "bg-yellow-100" :
                          "bg-blue-100"
                        }`}>
                          <EmergencyIcon className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Emergency Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(emergency.severity)}>
                                {emergency.severity.toUpperCase()}
                              </Badge>
                              {emergency.distance && (
                                <Badge variant="outline">
                                  {emergency.distance}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {emergency.description}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{emergency.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{emergency.reportedTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{emergency.reporter}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm"
                            onClick={() => {
                              setAssignments([...assignments, emergency]);
                              setAvailableEmergencies(availableEmergencies.filter(e => e.id !== emergency.id));
                            }}
                            className="gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept Assignment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Response History */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {pastResponses.map((response) => {
              const EmergencyIcon = getEmergencyIcon(response.type);
              return (
                <Card key={response.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Emergency Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        response.type === "medical" ? "bg-red-100" :
                        response.type === "fire" ? "bg-orange-100" :
                        "bg-blue-100"
                      }`}>
                        <EmergencyIcon className="h-6 w-6" />
                      </div>

                      {/* Response Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{response.type} Emergency</div>
                            <div className="text-sm text-gray-600">{response.location}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{response.date}</div>
                            <Badge className="bg-green-100 text-green-700">
                              {response.outcome}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Response time: {response.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
