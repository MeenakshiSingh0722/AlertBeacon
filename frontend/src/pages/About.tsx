import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Radio, Smartphone, Globe, Users, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "CAP Integrated Alert System",
    description: "Common Alerting Protocol integration for standardized emergency communications across all platforms and agencies."
  },
  {
    icon: Radio,
    title: "SMS & Mobile Application",
    description: "Instant alerts delivered via SMS and mobile applications to ensure maximum reach during emergencies."
  },
  {
    icon: Smartphone,
    title: "Browser Notifications",
    description: "Real-time web browser notifications for desktop users with customizable alert preferences."
  },
  {
    icon: Globe,
    title: "Geographic Targeting",
    description: "Precise location-based alerting system to notify only affected areas and reduce alert fatigue."
  },
  {
    icon: Users,
    title: "Multi-Agency Coordination",
    description: "Seamless integration with national disaster management agencies and emergency response teams."
  },
  {
    icon: AlertTriangle,
    title: "AI-Powered Analysis",
    description: "Advanced artificial intelligence for threat assessment and predictive crisis modeling."
  }
];

const stats = [
  { label: "States Covered", value: "28+" },
  { label: "Active Users", value: "50M+" },
  { label: "Alerts Sent", value: "1M+" },
  { label: "Response Time", value: "< 30s" }
];

export default function About() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-wide">About AlertBeacon</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Autonomous Crisis & Need Response Agent - India's Premier Disaster Management Alert System
        </p>
      </div>

      {/* Mission Statement */}
      <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            To provide timely, accurate, and actionable emergency information to all citizens through 
            innovative technology and multi-channel communication, ensuring communities are prepared 
            and responsive during crises.
          </p>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Technology & Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Protocols & Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">CAP 1.2</Badge>
                <Badge variant="outline">RSS 2.0</Badge>
                <Badge variant="outline">Atom</Badge>
                <Badge variant="outline">XML</Badge>
                <Badge variant="outline">GeoJSON</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Fully compliant with international emergency alert standards for seamless integration 
                with global disaster management systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Integration Partners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">NDMA</Badge>
                <Badge variant="outline">IMD</Badge>
                <Badge variant="outline">NCS</Badge>
                <Badge variant="outline">State DMA</Badge>
                <Badge variant="outline">Emergency Services</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Direct integration with National Disaster Management Authority, 
                India Meteorological Department, and state emergency response centers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Get Involved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">For Emergency Services</h3>
              <p className="text-sm text-muted-foreground">
                Partner with us to enhance your emergency response capabilities.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-2">For Developers</h3>
              <p className="text-sm text-muted-foreground">
                Access our APIs and integrate alert systems into your applications.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-2">For Citizens</h3>
              <p className="text-sm text-muted-foreground">
                Stay informed and prepared with real-time emergency alerts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
