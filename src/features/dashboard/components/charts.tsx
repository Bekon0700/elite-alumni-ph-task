"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

interface PriorityChartProps {
  data: { name: string; value: number }[];
}

export function TasksByPriorityChart({ data }: PriorityChartProps) {
  const priorityColors: Record<string, string> = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#10b981",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={priorityColors[entry.name] || "#6366f1"} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface StatusChartProps {
  data: { name: string; value: number }[];
}

export function TaskStatusChart({ data }: StatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Task Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ProductivityProps {
  data: { name: string; total: number; completed: number }[];
}

export function TeamProductivityChart({ data }: ProductivityProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#6366f1" name="Total Tasks" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ProjectProgressTrendProps {
  chartData: Record<string, string | number>[];
  projectNames: string[];
}

export function ProjectProgressTrendChart({ chartData, projectNames }: ProjectProgressTrendProps) {
  if (projectNames.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Project Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No active projects to chart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Project Progress Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, "Progress"]} />
            <Legend />
            {projectNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
