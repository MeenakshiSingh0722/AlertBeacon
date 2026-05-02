import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Radio, Download, ExternalLink, Clock, MapPin } from "lucide-react";
import { useState } from "react";

const mockCapFeeds = [
  {
    id: 1,
    title: "Flood Warning - Brahmaputra River",
    source: "India Meteorological Department",
    timestamp: "2024-05-02T14:30:00Z",
    severity: "high",
    areas: ["Assam", "Arunachal Pradesh"],
    status: "Active",
    description: "Heavy rainfall expected in the next 48 hours. River levels rising above danger mark."
  },
  {
    id: 2,
    title: "Cyclone Alert - Bay of Bengal",
    source: "Regional Specialized Meteorological Center",
    timestamp: "2024-05-02T12:15:00Z",
    severity: "critical",
    areas: ["West Bengal", "Odisha", "Andhra Pradesh"],
    status: "Active",
    description: "Cyclonic storm forming in Bay of Bengal, expected to make landfall in 72 hours."
  },
  {
    id: 3,
    title: "Earthquake - Northeast Region",
    source: "National Center for Seismology",
    timestamp: "2024-05-02T08:45:00Z",
    severity: "medium",
    areas: ["Sikkim", "Bhutan Border"],
    status: "Monitoring",
    description: "Magnitude 4.2 earthquake recorded. Aftershocks expected."
  }
];

const severityColors = {
  low: "bg-severity-low-soft text-severity-low border-severity-low/30",
  medium: "bg-severity-medium-soft text-severity-medium border-severity-medium/30",
  high: "bg-severity-high-soft text-severity-high border-severity-high/30",
  critical: "bg-severity-critical-soft text-severity-critical border-severity-critical/30"
};

export default function CapFeed() {
  const [selectedFeed, setSelectedFeed] = useState(mockCapFeeds[0]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">CAP RSS Feed</h1>
          <p className="text-muted-foreground">Common Alerting Protocol feeds from disaster management agencies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Feed
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View XML
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Radio className="h-4 w-4 text-severity-low" />
            <span>Live Feed • Last updated: 2 minutes ago</span>
          </div>

          {mockCapFeeds.map((feed) => (
            <Card 
              key={feed.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFeed.id === feed.id ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedFeed(feed)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{feed.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{feed.source}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(feed.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={severityColors[feed.severity as keyof typeof severityColors]}>
                    {feed.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{feed.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>{feed.areas.join(", ")}</span>
                  </div>
                  <Badge variant="outline">{feed.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feed Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feed Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedFeed.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedFeed.description}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Source:</span>
                  <p className="text-sm text-muted-foreground">{selectedFeed.source}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Severity:</span>
                  <Badge className={`ml-2 ${severityColors[selectedFeed.severity as keyof typeof severityColors]}`}>
                    {selectedFeed.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Affected Areas:</span>
                  <p className="text-sm text-muted-foreground">{selectedFeed.areas.join(", ")}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="outline" className="ml-2">{selectedFeed.status}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Timestamp:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFeed.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CAP XML
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feed Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Alerts Today:</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Alerts:</span>
                <span className="font-medium text-severity-high">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Critical Alerts:</span>
                <span className="font-medium text-severity-critical">2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Areas Covered:</span>
                <span className="font-medium">15 States</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
