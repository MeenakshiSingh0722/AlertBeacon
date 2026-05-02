import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Shield,
  Settings,
  Clock,
  AlertTriangle,
  History,
  Bell
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "emergency" | "notifications" | "history">("profile");
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@alertbeacon.io",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    role: "admin" as "user" | "responder" | "admin"
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "Emergency Contact 1", phone: "+91 98765 43211", relation: "Spouse" },
    { name: "Emergency Contact 2", phone: "+91 98765 43212", relation: "Parent" }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    pushAlerts: true,
    smsAlerts: true,
    emailAlerts: false,
    locationSharing: true,
    voiceAlerts: true
  });

  const pastReports = [
    {
      id: "1",
      type: "Medical",
      date: "2024-04-15",
      status: "Resolved",
      location: "Pune, Maharashtra"
    },
    {
      id: "2", 
      type: "Fire",
      date: "2024-03-22",
      status: "Resolved",
      location: "Mumbai, Maharashtra"
    },
    {
      id: "3",
      type: "Accident",
      date: "2024-02-10", 
      status: "Resolved",
      location: "Bangalore, Karnataka"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "emergency", label: "Emergency Contacts", icon: Phone },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "history", label: "Report History", icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>

                {/* Role Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Current Role</div>
                          <div className="text-sm text-gray-600 capitalize">{profileData.role}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          {profileData.role === "admin" ? "Administrator" : 
                           profileData.role === "responder" ? "Responder" : "User"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {profileData.role === "admin" ? "You have full system access and can manage all users and alerts." :
                       profileData.role === "responder" ? "You can respond to emergencies and help people in need." :
                       "You can report emergencies and get help during crises."}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Request Role Change
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">12</div>
                      <div className="text-sm text-gray-600">Reports Made</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">8</div>
                      <div className="text-sm text-gray-600">People Helped</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700">4.8</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === "emergency" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                        <div className="text-xs text-gray-500">{contact.relation}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Add Emergency Contact
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "pushAlerts", label: "Push Notifications", desc: "Receive instant alerts on your device" },
                  { key: "smsAlerts", label: "SMS Alerts", desc: "Get text messages for emergencies" },
                  { key: "emailAlerts", label: "Email Alerts", desc: "Receive emergency updates via email" },
                  { key: "locationSharing", label: "Location Sharing", desc: "Share location with responders" },
                  { key: "voiceAlerts", label: "Voice Alerts", desc: "Voice announcements for critical alerts" }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-gray-500">{setting.desc}</div>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, [setting.key]: checked})
                      }
                    />
                  </div>
                ))}
                <Button className="w-full mt-6">Save Settings</Button>
              </CardContent>
            </Card>
          )}

          {/* Report History Tab */}
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Past Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{report.type}</div>
                        <div className="text-sm text-gray-600">{report.location}</div>
                        <div className="text-xs text-gray-500">{report.date}</div>
                      </div>
                      <Badge className={
                        report.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
