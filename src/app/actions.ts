"use server";

import { generateImprovementCode } from "@/ai/flows/generate-improvement-code";
import { findFileToModify } from "@/ai/flows/find-file-to-modify";
import { z } from "zod";

// In a real application, this would be a dynamic file reading system.
// For this prototype, we'll pre-load the content of files Trinity can modify.
const modifiableFiles: Record<string, string> = {
  "src/app/page.tsx": `import { ChatPanel } from '@/components/chat-panel';
import { MonitoringPanel } from '@/components/monitoring-panel';
import { TrinityLogo } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center h-16 px-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <TrinityLogo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight font-headline">
            TrinityGen
          </h1>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
        <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          <ChatPanel />
        </div>
        <aside className="hidden md:flex flex-col h-full gap-4">
          <MonitoringPanel />
        </aside>
      </main>
    </div>
  );
}
`,
  "src/components/chat-panel.tsx": `"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { processInstruction } from '@/app/actions';
import { TrinityLogo } from './icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  filePath?: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I am Trinity, a self-improving AI agent. How can I assist you today? I can analyze and modify my own source code based on your instructions.",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await processInstruction(input);
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: result.response,
        code: result.code,
        filePath: result.filePath,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to process your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(e).catch(console.error);
  }

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-sm">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 flex flex-col gap-6">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
              {message.role === 'assistant' && (
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <TrinityLogo className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "max-w-xl p-4 rounded-lg",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.code && (
                  <div className="mt-4 bg-background/50 rounded-md border">
                    {message.filePath && (
                        <div className="px-4 py-2 border-b">
                            <p className="text-xs font-code text-muted-foreground font-semibold">{message.filePath}</p>
                        </div>
                    )}
                    <ScrollArea className="max-h-80">
                      <pre className="p-4 text-sm">
                        <code className="font-code">{message.code}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-4">
               <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <TrinityLogo className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-xl p-4 rounded-lg bg-muted flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Trinity is thinking...</span>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Instruct Trinity to modify her code..."
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // a bit of a hack to get the form to submit
                    (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
`,
  "src/components/monitoring-panel.tsx": `"use client"

import { useState, useEffect } from 'react';
import { Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Cpu, MemoryStick, Database, ShieldCheck } from 'lucide-react';

const generateData = () => Array.from({ length: 10 }, (_, i) => ({
  time: i.toString(),
  value: Math.floor(Math.random() * 50) + 20,
}));

const chartConfig = {
  value: {
    label: "Usage",
    color: "hsl(var(--primary))",
  },
};

const StatusItem = ({ title, value, variant }: { title: string; value: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Badge variant={variant}>
            {value}
        </Badge>
    </div>
);

export function MonitoringPanel() {
  const [cpuData, setCpuData] = useState(generateData());
  const [memoryData, setMemoryData] = useState(generateData());
  const [storageData, setStorageData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = () => Math.floor(Math.random() * 50) + 20;
      setCpuData(prev => [...prev.slice(1), { time: 'now', value: newValue() }]);
      setMemoryData(prev => [...prev.slice(1), { time: 'now', value: Math.floor(Math.random() * 40) + 40 }]);
      setStorageData(prev => [...prev.slice(1), { time: 'now', value: Math.floor(Math.random() * 10) + 75 }]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data: any[], gradientId: string) => (
    <div className="h-[100px] -mx-4">
      <ChartContainer config={chartConfig}>
        <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} fillOpacity={1} fill={\`url(#\${gradientId})\`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>System Status</span>
            </CardTitle>
            <CardDescription>Live metrics and deployment status.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
            <StatusItem title="Deployment" value="Stable" variant="secondary" />
            <StatusItem title="Last Backup" value="Just now" variant="secondary" />
            <StatusItem title="Version" value="v1.2.3" variant="outline" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Cpu className="w-5 h-5 text-muted-foreground" /> CPU Usage
          </CardTitle>
          <span className="text-2xl font-bold font-mono">{cpuData.length > 0 ? \`\${cpuData[cpuData.length - 1].value}%\` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(cpuData, 'fillCpu')}</CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MemoryStick className="w-5 h-5 text-muted-foreground" /> Memory
          </CardTitle>
           <span className="text-2xl font-bold font-mono">{memoryData.length > 0 ? \`\${memoryData[memoryData.length - 1].value}%\` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(memoryData, 'fillMemory')}</CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Database className="w-5 h-5 text-muted-foreground" /> Storage
          </CardTitle>
           <span className="text-2xl font-bold font-mono">{storageData.length > 0 ? \`\${storageData[storageData.length - 1].value}%\` : '...'}</span>
        </CardHeader>
        <CardContent>{renderChart(storageData, 'fillStorage')}</CardContent>
      </Card>
    </div>
  );
}
`,
};

const instructionSchema = z.string().min(1, "Instruction cannot be empty.");

export async function processInstruction(instruction: string): Promise<{ response: string, code?: string, filePath?: string }> {
  const parsedInstruction = instructionSchema.safeParse(instruction);

  if (!parsedInstruction.success) {
    throw new Error("Invalid instruction provided.");
  }

  try {
    // Step 1: Find out which file to modify
    const { filePath } = await findFileToModify({
      instructions: parsedInstruction.data,
      filePaths: Object.keys(modifiableFiles),
    });

    const sourceCode = modifiableFiles[filePath];
    if (!sourceCode) {
       return {
         response: `I apologize, but I was unable to find a suitable file to modify for your request. I can currently only modify one of the following files: ${Object.keys(modifiableFiles).join(', ')}.`,
       };
    }
    
    // Step 2: Generate the improved code for that file
    const result = await generateImprovementCode({
      sourceCode,
      instructions: parsedInstruction.data,
    });
    
    return {
      response: "I have analyzed the request and generated the following code modifications. This is a simulation of my self-improvement capability. The code below can be reviewed and applied.",
      code: result.improvedCode,
      filePath: filePath,
    };

  } catch (error) {
    console.error("Error processing instruction with GenAI:", error);
    // In a real app, you might want to call another AI flow to analyze the error.
    return {
      response: "I encountered an error while processing your request. My apologies. I will log this for my own learning process. Please try rephrasing your instruction."
    };
  }
}
