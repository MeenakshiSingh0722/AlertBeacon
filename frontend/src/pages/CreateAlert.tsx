import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  MapPin, 
  Upload, 
  Camera, 
  Mic, 
  AlertTriangle,
  Heart,
  Zap,
  ShieldAlert,
  Radio,
  Send
} from "lucide-react";

export default function CreateAlert() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [alertType, setAlertType] = useState("");
  const [severity, setSeverity] = useState([5]); // Medium severity by default
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const alertTypes = [
    { id: "medical", label: "Medical", icon: Heart, color: "bg-red-100 text-red-600" },
    { id: "fire", label: "Fire", icon: Zap, color: "bg-orange-100 text-orange-600" },
    { id: "accident", label: "Accident", icon: ShieldAlert, color: "bg-yellow-100 text-yellow-600" },
    { id: "security", label: "Security", icon: Radio, color: "bg-blue-100 text-blue-600" },
    { id: "disaster", label: "Natural Disaster", icon: AlertTriangle, color: "bg-purple-100 text-purple-600" }
  ];

  const severityLabels = ["Low", "Medium", "High", "Critical"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles([...mediaFiles, ...files]);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
    console.log(isRecording ? "Stopping recording" : "Starting recording");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement alert creation API call
    console.log("Creating alert:", {
      alertType,
      severity: severity[0],
      location,
      description,
      mediaFiles
    });
    navigate("/dashboard");
  };

  const getSeverityColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-700";
    if (level <= 6) return "bg-yellow-100 text-yellow-700";
    if (level <= 8) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Report Emergency</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Alert Type Selection */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Type of Emergency</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {alertTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setAlertType(type.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            alertType === type.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <type.icon className={`h-6 w-6 mx-auto mb-2 ${type.color.split(' ')[0]}`} />
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-medium">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        type="text"
                        placeholder="Auto-detecting location..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // TODO: Get current location
                        setLocation("Current Location Detected");
                      }}
                    >
                      📍 Use Current Location
                    </Button>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what's happening..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Upload Evidence</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Image Upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-20 flex-col gap-2"
                      >
                        <Camera className="h-6 w-6" />
                        <span className="text-xs">Photo/Video</span>
                      </Button>

                      {/* Voice Recording */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVoiceRecord}
                        className={`h-20 flex-col gap-2 ${
                          isRecording ? "bg-red-50 border-red-200" : ""
                        }`}
                      >
                        <Mic className={`h-6 w-6 ${isRecording ? "text-red-600" : ""}`} />
                        <span className="text-xs">
                          {isRecording ? "Stop Recording" : "Voice Note"}
                        </span>
                      </Button>
                    </div>

                    {/* Display uploaded files */}
                    {mediaFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mediaFiles.map((file, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            📎 {file.name.substring(0, 15)}...
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Severity Slider */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Severity Level: <span className={`font-bold ${getSeverityColor(severity[0])}`}>{severityLabels[severity[0] - 1] || "Low"}</span>
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={severity}
                        onValueChange={setSeverity}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-5 w-5" />
                    Send Alert
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  🚨 Panic Button
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  📍 Share Location
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  📞 Call Emergency
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Be as specific as possible</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Include photos/videos if safe</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Stay calm and clear</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Only report real emergencies</span>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">Police</span>
                  <span className="text-red-600 font-bold">100</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">Fire</span>
                  <span className="text-orange-600 font-bold">101</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">Ambulance</span>
                  <span className="text-blue-600 font-bold">108</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
