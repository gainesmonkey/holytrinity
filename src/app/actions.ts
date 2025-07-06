"use server";

import { generateImprovementCode } from "@/ai/flows/generate-improvement-code";
import { z } from "zod";

const dummySourceCode = `
// src/components/monitoring-panel.tsx

"use client"

import { useState, useEffect } from 'react';
import { Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Cpu } from 'lucide-react';

// A simple component to show CPU usage.
export function MonitoringPanel() {
  const [data, setData] = useState([{ time: '0', value: 0 }]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [...prev.slice(1), { time: 'now', value: Math.random() * 100 }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>CPU Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[150px]">
          <ChartContainer config={{ value: { color: 'hsl(var(--primary))' } }}>
            <AreaChart data={data}>
              <Area dataKey="value" type="monotone" />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
`;

const instructionSchema = z.string().min(1, "Instruction cannot be empty.");

export async function processInstruction(instruction: string): Promise<{ response: string, code?: string }> {
  const parsedInstruction = instructionSchema.safeParse(instruction);

  if (!parsedInstruction.success) {
    throw new Error("Invalid instruction provided.");
  }

  try {
    const result = await generateImprovementCode({
      sourceCode: dummySourceCode,
      instructions: parsedInstruction.data,
    });
    
    return {
      response: "I have analyzed the request and generated the following code modifications. This is a simulation of my self-improvement capability. The code below can be reviewed and applied.",
      code: result.improvedCode,
    };

  } catch (error) {
    console.error("Error processing instruction with GenAI:", error);
    // In a real app, you might want to call another AI flow to analyze the error.
    return {
      response: "I encountered an error while processing your request. My apologies. I will log this for my own learning process. Please try rephrasing your instruction."
    };
  }
}
