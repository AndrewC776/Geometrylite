import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

export function AnalyticsSidebar() {
  const stats = [
    { label: "Monthly Visits", value: "1.6M", change: "+12.7%", positive: true },
    { label: "Bounce Rate", value: "61.27%", subtext: "Bounce Rate" },
    { label: "Pages Per Visit", value: "1.90", subtext: "Pages Per Visit" },
  ];

  const metrics = [
    { label: "Visit Duration", value: "00:02:39" },
    { label: "Direct Rank", value: "42,707" },
    { label: "Country Rank", value: "25,836" },
  ];

  const trafficSources = [
    { source: "search", percentage: 61.86, color: "bg-red-500" },
    { source: "Direct", percentage: 38.61, color: "bg-blue-500" },
    { source: "Referrals", percentage: 0.53, color: "bg-green-500" },
    { source: "Social", percentage: 1.42, color: "bg-yellow-500" },
    { source: "paid Referrals", percentage: 0.34, color: "bg-purple-500" },
    { source: "mail", percentage: 0.01, color: "bg-pink-500" },
  ];

  const keywords = [
    { keyword: "geometry dash", traffic: "67M", volume: "3M", cpc: "$0.27" },
    { keyword: "geometry dash lite", traffic: "43K", volume: "110K", cpc: "$0.26" },
    { keyword: "geometry dash", traffic: "2K", volume: "6K", cpc: "$0.3" },
    { keyword: "geomety", traffic: "3K", volume: "84K", cpc: "$1.4" },
    { keyword: "geometry lite", traffic: "7K", volume: "8K", cpc: "$0.16" },
  ];

  const regions = [
    { region: "United States", percentage: "28.64%" },
    { region: "Brazil", percentage: "9.70%" },
    { region: "Vietnam", percentage: "8.56%" },
    { region: "Indonesia", percentage: "4.47%" },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            <div>
              <div className="text-sm text-slate-500">Traffic</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">AITDK</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  .com
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.slice(0, 3).map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.subtext || stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {metrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-1">{metric.value}</div>
              <div className="text-xs text-slate-500">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Visits Over Time Chart Placeholder */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm mb-2">Visits Over Time</div>
          <div className="h-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded flex items-end justify-around p-2">
            {[40, 60, 45, 70, 55, 80, 65, 75].map((height, idx) => (
              <div
                key={idx}
                className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
      </Card>

      {/* Traffic Sources */}
      <Card className="p-4">
        <h3 className="mb-4">Traffic Sources</h3>
        <div className="mb-4">
          {/* Donut Chart */}
          <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray={`${61.86 * 2.51} ${100 * 2.51}`}
                strokeDashoffset="0"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${38.61 * 2.51} ${100 * 2.51}`}
                strokeDashoffset={`-${61.86 * 2.51}`}
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {trafficSources.map((source, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                <span className="text-slate-600">{source.source}</span>
              </div>
              <span>{source.percentage.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Keywords */}
      <Card className="p-4">
        <h3 className="mb-4">Top Keywords</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Keyword</TableHead>
              <TableHead className="text-xs text-right">Traffic</TableHead>
              <TableHead className="text-xs text-right">Volume</TableHead>
              <TableHead className="text-xs text-right">CPC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs">{kw.keyword}</TableCell>
                <TableCell className="text-xs text-right">{kw.traffic}</TableCell>
                <TableCell className="text-xs text-right">{kw.volume}</TableCell>
                <TableCell className="text-xs text-right">{kw.cpc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Top Regions */}
      <Card className="p-4">
        <h3 className="mb-4">Top Regions</h3>
        <div className="space-y-3">
          {regions.map((region, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{region.region}</span>
              <span className="text-sm">{region.percentage}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
