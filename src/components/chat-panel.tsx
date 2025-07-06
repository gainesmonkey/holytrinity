"use client";

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
