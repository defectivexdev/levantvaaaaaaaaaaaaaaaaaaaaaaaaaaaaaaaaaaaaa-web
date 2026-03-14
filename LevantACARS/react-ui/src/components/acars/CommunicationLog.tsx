import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Radio, Send, Download, Mic, RefreshCw, ChevronDown } from "lucide-react";

interface Message {
  id: number;
  timestamp: string;
  type: "ATC" | "DISPATCH" | "AIRLINE" | "SYSTEM" | "CREW";
  sender: string;
  message: string;
  priority?: "NORMAL" | "URGENT" | "EMERGENCY";
  uplink?: boolean;
}

interface CommunicationLogProps {
  messages: Message[];
}

const TYPE_STYLES: Record<string, { badge: string; border: string; dot: string }> = {
  ATC: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    border: "border-l-blue-500",
    dot: "bg-blue-400",
  },
  DISPATCH: {
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    border: "border-l-green-500",
    dot: "bg-green-400",
  },
  AIRLINE: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    border: "border-l-purple-500",
    dot: "bg-purple-400",
  },
  SYSTEM: {
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/50",
    border: "border-l-orange-500",
    dot: "bg-orange-400",
  },
  CREW: {
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/50",
    border: "border-l-teal-500",
    dot: "bg-teal-400",
  },
};

const MESSAGE_TEMPLATES = [
  "Position report: {time}Z, {alt} FL{fl}, ETA {fix} at {eta}",
  "Fuel status: {fuel} kg remaining, burn nominal",
  "Requesting FL{alt} due weather deviation",
  "Maintenance noted: {system} advisory, crew aware",
  "PAX situation normal, on-time operation",
];

export function CommunicationLog({ messages }: CommunicationLogProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeTo, setComposeTo] = useState("DISPATCH");
  const [localMessages, setLocalMessages] = useState(messages);

  const filteredMessages =
    activeTab === "all"
      ? localMessages
      : localMessages.filter((m) => m.type === activeTab.toUpperCase());

  const typeCounts = {
    atc: messages.filter((m) => m.type === "ATC").length,
    dispatch: messages.filter((m) => m.type === "DISPATCH").length,
    airline: messages.filter((m) => m.type === "AIRLINE").length,
    system: messages.filter((m) => m.type === "SYSTEM").length,
  };

  const sendMessage = () => {
    if (!composeText.trim()) return;
    const newMsg: Message = {
      id: localMessages.length + 1,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      type: composeTo as Message["type"],
      sender: "VA123 Crew",
      message: composeText,
      priority: "NORMAL",
      uplink: false,
    };
    setLocalMessages((prev) => [...prev, newMsg]);
    setComposeText("");
    setComposeOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Radio className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Communications Log</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-mono">ACARS LINK ACTIVE</span>
          </div>
        </div>
      </div>

      {/* SELCAL & Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ATC", count: typeCounts.atc, color: "border-blue-500/30 text-blue-400" },
          { label: "Dispatch", count: typeCounts.dispatch, color: "border-green-500/30 text-green-400" },
          { label: "Airline Ops", count: typeCounts.airline, color: "border-purple-500/30 text-purple-400" },
          { label: "System", count: typeCounts.system, color: "border-orange-500/30 text-orange-400" },
        ].map((cat) => (
          <div key={cat.label} className={`bg-slate-900/80 border rounded-lg p-3 flex items-center justify-between ${cat.color}`}>
            <span className="text-xs text-slate-400">{cat.label}</span>
            <span className={`font-mono font-bold ${cat.color.split(" ")[1]}`}>{cat.count}</span>
          </div>
        ))}
      </div>

      {/* Main Log */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-400" />
              Message Log — {localMessages.length} total
            </CardTitle>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <Download className="w-3 h-3" />
                Export
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/80 border border-slate-700 mb-4 w-full">
              <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                All ({localMessages.length})
              </TabsTrigger>
              <TabsTrigger value="atc" className="flex-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                ATC ({typeCounts.atc})
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="flex-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Dispatch ({typeCounts.dispatch})
              </TabsTrigger>
              <TabsTrigger value="system" className="flex-1 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                System ({typeCounts.system})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[380px] pr-3">
                <div className="space-y-2">
                  {filteredMessages.map((msg, idx) => {
                    const style = TYPE_STYLES[msg.type] || TYPE_STYLES.SYSTEM;
                    const isLatest = idx === filteredMessages.length - 1;
                    return (
                      <div
                        key={msg.id}
                        className={`bg-slate-800/50 p-3 rounded-lg border border-slate-700 border-l-2 ${style.border} ${isLatest ? "ring-1 ring-blue-500/20" : ""} hover:bg-slate-800/80 transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <Badge className={`text-xs ${style.badge} border`}>
                              {msg.type}
                            </Badge>
                            <span className="text-xs text-slate-300 font-medium">{msg.sender}</span>
                            {msg.uplink === false && (
                              <span className="text-xs text-slate-600">[DNLK]</span>
                            )}
                            {msg.uplink === true && (
                              <span className="text-xs text-teal-600">[UPLK]</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono">{msg.timestamp}Z</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed font-mono">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Compose Area */}
          <div className="mt-4 border-t border-slate-800 pt-4">
            <button
              onClick={() => setComposeOpen(!composeOpen)}
              className="w-full flex items-center justify-between bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300 hover:bg-blue-600/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Compose ACARS Message
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${composeOpen ? "rotate-180" : ""}`} />
            </button>

            {composeOpen && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="DISPATCH">OCC Dispatch</option>
                    <option value="AIRLINE">Company Ops</option>
                    <option value="ATC">ATC</option>
                    <option value="SYSTEM">ACARS System</option>
                  </select>
                  <select
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 flex-1"
                    onChange={(e) => setComposeText(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Use template...</option>
                    {MESSAGE_TEMPLATES.map((t, i) => (
                      <option key={i} value={t}>{t.slice(0, 40)}...</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="Type ACARS message..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendMessage}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send ACARS
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

