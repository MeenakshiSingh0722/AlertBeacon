import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Users, 
  Activity,
  ChevronRight,
  AlertTriangle,
  Heart,
  Zap,
  Radio
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const alertTypes = [
    { icon: Heart, label: "Medical", color: "bg-red-100 text-red-600" },
    { icon: Zap, label: "Fire", color: "bg-orange-100 text-orange-600" },
    { icon: ShieldAlert, label: "Accident", color: "bg-yellow-100 text-yellow-600" },
    { icon: Radio, label: "Security", color: "bg-blue-100 text-blue-600" },
    { icon: AlertTriangle, label: "Natural Disaster", color: "bg-purple-100 text-purple-600" }
  ];

  const stats = [
    { label: "Active Alerts", value: "2,847", change: "+12%" },
    { label: "Response Time", value: "2.3 min", change: "-18%" },
    { label: "People Helped", value: "45.2K", change: "+24%" },
    { label: "Success Rate", value: "98.7%", change: "+2%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-orange-600 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">AlertBeacon</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
          <Button onClick={() => navigate("/signup")}>Sign Up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-green-100 text-green-800">
            🚨 Live System Active
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Instant Crisis Detection
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              & Response System
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Report emergencies in seconds. Get immediate help from nearby responders. 
            Save lives with real-time coordination.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-red-600 hover:bg-red-700"
              onClick={() => navigate("/create-alert")}
            >
              🚨 Report Emergency
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => navigate("/signup")}
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Detect",
                description: "AI-powered system automatically detects emergencies from multiple sources and user reports",
                icon: Activity
              },
              {
                step: "2", 
                title: "Verify",
                description: "Our system verifies authenticity and severity of each emergency report",
                icon: ShieldAlert
              },
              {
                step: "3",
                title: "Respond", 
                description: "Instantly notify nearby responders and emergency services",
                icon: Users
              }
            ].map((step, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{step.step}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Alert Types */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Types of Alerts Supported</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {alertTypes.map((type, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${type.color}`}>
                    <type.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{type.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Live Impact</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                  <div className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {stat.change} from last month
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of responders and citizens saving lives every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => navigate("/signup")}
            >
              Become a Responder
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              Access Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldAlert className="h-6 w-6" />
            <span className="font-bold text-lg">AlertBeacon</span>
          </div>
          <p className="text-gray-400 mb-4">
            Autonomous Crisis & Need Response Agent
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <button className="hover:text-white transition-colors">About</button>
            <button className="hover:text-white transition-colors">How It Works</button>
            <button className="hover:text-white transition-colors">Safety</button>
            <button className="hover:text-white transition-colors">Contact</button>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            © 2024 AlertBeacon. Saving lives, one alert at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
