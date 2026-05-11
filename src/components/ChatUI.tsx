"use client";

import { useState } from "react";
import PromptBar from "./ui/PromptBar";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect } from 'react';
import { useCallback } from 'react';

interface SentimentAnalysis {
    text: string;
    label: "POSITIVE" | "NEGATIVE";
    confidence: number;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sentiment?: SentimentAnalysis;
}

export default function ChatUI() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [thinking, setThinking] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isDark, setIsDark] = useState<boolean>(() => {
        try {
            return document?.documentElement?.getAttribute('data-theme') === 'dark';
        } catch {
            return false;
        }
    });

    const sendMessage = async (text: string) => {
        setThinking(true);

        // Get sentiment analysis for user message
        const sentiment = await getSentiment(text);

        const newMessage: Message = {
            role: "user",
            content: text,
            sentiment: sentiment || undefined
        };
        
        // Create assistant response with sentiment summary
        let assistantResponse = "";
        if (sentiment) {
            const emoji = sentiment.label === "POSITIVE" ? "😊" : "😔";
            const confidencePercent = (sentiment.confidence * 100).toFixed(1);
            assistantResponse = `${emoji} Your message has a **${sentiment.label.toLowerCase()}** sentiment with ${confidencePercent}% confidence.`;
        } else {
            assistantResponse = "Unable to analyze sentiment at this time.";
        }
        
        const assistantMessage: Message = {
            role: "assistant",
            content: assistantResponse
        };
        
        setMessages([...messages, newMessage, assistantMessage]);

        setThinking(false);
    }

    const getSentiment = async (userText: string): Promise<SentimentAnalysis | null> => {
        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8001/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: userText }),
            });

            const data = await response.json();
            console.log("AI Analysis:", data);
            return data;
        } catch (error) {
            console.error("Sentiment analysis error:", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    const handleSummarize = async (longText: string) => {
        setThinking(true);
        
        // Add user message
        const userMessage: Message = {
            role: "user",
            content: longText
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Get sentiment analysis
        const sentiment = await getSentiment(longText);
        
        // Update user message with sentiment
        if (sentiment) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], sentiment };
                return updated;
            });
        }
        
        // Get summary
        try {
            const res = await fetch('http://127.0.0.1:8001/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: longText }),
            });

            const data = await res.json();
            console.log("Summary:", data.summary);

            // Add assistant message with summary
            const assistantMessage: Message = {
                role: "assistant",
                content: data.summary
            };
            
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Summarization error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Unable to generate summary at this time."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setThinking(false);
        }
    };

    console.log('data', messages)

    const updateMessageSentiment = async (index: number, text: string) => {
        const sentiment = await getSentiment(text);
        setMessages(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], sentiment: sentiment || undefined };
            return updated;
        });
    }

    useEffect(() => {
        const root = document?.documentElement;
        if (!root) return;
        const apply = () => setIsDark(root.getAttribute('data-theme') === 'dark');
        apply();
        const obs = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.type === 'attributes' && m.attributeName === 'data-theme') apply();
            }
        });
        obs.observe(root, { attributes: true });
        return () => obs.disconnect();
    }, []);

    function CodeBlock({ language, value }: { language?: string; value: string }) {
        const [copied, setCopied] = useState(false);
        const doCopy = useCallback(async () => {
            try {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (e) { }
        }, [value]);

        return (
            <div className="group rounded-2xl overflow-hidden my-4" style={{ border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between px-3 py-2 text-xs" style={{ background: 'var(--panel-bg)', color: 'var(--panel-text)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] opacity-80">{language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {copied ? <span className="text-xs text-green-400">Copied</span> : null}
                        <button onClick={doCopy} className="cursor-pointer ">
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
                <SyntaxHighlighter
                    language={language || ''}
                    style={isDark ? vscDarkPlus : oneLight}
                    PreTag="div"
                    className="rounded-b-2xl"
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        );
    }

    return (
        <div className="container md:px-12 px-4 max-w-7xl m-auto pb-4 pt-10 relative">
            <div className="flex flex-col gap-10 my-auto">
                {messages.length === 0 && <h1 className="text-3xl font-semibold text-center">Ask.</h1>}
                <div className="flex flex-col gap-4 items-center">
                    {/* Messages/ Response Div */}
                    {messages.length > 0 ?
                        (
                            <div className="md:w-[80%] w-full">
                                {messages.map((m: any, i: number) => {
                                    const isUser = m.role === "user";
                                    const bubbleStyle: any = isUser
                                        ? { background: 'var(--bubble-bg-user)', color: 'var(--bubble-text-user)', border: '1px solid var(--border-color)' }
                                        : { color: 'var(--bubble-text-assistant)', };
                                    return (
                                        <div key={i} className={`flex mx-auto ${isUser ? "justify-end mb-10 " : "justify-start"}`} >
                                            <div
                                                className={`py-2 rounded-2xl text-sm markdown ${isUser ? "px-4" : "w-full"}`}
                                                style={bubbleStyle}>
                                                <div className="relative">
                                                    {isUser ? (
                                                        <>
                                                            <div className="mb-4 flex gap-4 justify-end text-xs">
                                                                {copiedIndex === i ? (
                                                                    <div className="text-xs font-semibold"><Check size={14} /></div>
                                                                ) :
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await navigator.clipboard.writeText(m.content);
                                                                                setCopiedIndex(i);
                                                                                setTimeout(() => setCopiedIndex((prev) => (prev === i ? null : prev)), 2000);
                                                                            } catch (e) { }
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Copy size={14} />
                                                                    </button>
                                                                }
                                                                <button
                                                                    onClick={() => {
                                                                        setInput(m.content);
                                                                        const el = document.getElementById('chat-input') as HTMLTextAreaElement | null;
                                                                        if (el) el.focus();
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateMessageSentiment(i, m.content)}
                                                                    className="cursor-pointer hover:rotate-180 transition-all duration-300"
                                                                >
                                                                    <RefreshCw size={14} />
                                                                </button>
                                                            </div>
                                                            <Markdown
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                                                                    p: ({ node, ...props }) => <div className={isUser ? 'text-md' : 'mb-2'} {...props} style={isUser ? { fontFamily: "var(--font-iosevka-charon)" } : {}} />,
                                                                    ul: ({ node, ...props }) => <ul className="mb-4" {...props} />,
                                                                    li: ({ node, ...props }) => <li className="ml-4 list-disc" {...props} />,
                                                                    code: ({ inline, className, children, ...props }: any) => {
                                                                        const match = /language-(\w+)/.exec(className || '') || [];
                                                                        if (inline) {
                                                                            return <code className="px-1 rounded text-sm" style={{ background: 'rgba(0,0,0,0.12)' }} {...props}>{children}</code>;
                                                                        }
                                                                        return <CodeBlock language={match[1] || ''} value={String(children).replace(/\n$/, '')} />;
                                                                    },
                                                                }}
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                            >
                                                                {m.content}
                                                            </Markdown>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="ml-auto w-fit">
                                                                {copiedIndex === i ? (
                                                                    <div className="text-xs font-semibold mt-1"><Check size={14} /></div>
                                                                )
                                                                    :
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await navigator.clipboard.writeText(m.content);
                                                                                setCopiedIndex(i);
                                                                                setTimeout(() => setCopiedIndex((prev) => (prev === i ? null : prev)), 2000);
                                                                            } catch (e) { }
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Copy size={14} />
                                                                    </button>
                                                                }
                                                            </div>

                                                            <Markdown
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-2" {...props} />,
                                                                    p: ({ node, ...props }) => <p className={` text-lg ${isUser ? '' : 'mb-2'}`} {...props} />,
                                                                    ul: ({ node, ...props }) => <ul className="mb-4  text-lg " {...props} />,
                                                                    li: ({ node, ...props }) => <li className="ml-4 list-disc  text-lg " {...props} />,
                                                                    code: ({ inline, className, children, ...props }: any) => {
                                                                        const match = /language-(\w+)/.exec(className || '') || [];
                                                                        if (inline) {
                                                                            return <code className="px-1 rounded text-sm" style={{ background: 'rgba(0,0,0,0.12)' }} {...props}>{children}</code>;
                                                                        }
                                                                        return <CodeBlock language={match[1] || ''} value={String(children).replace(/\n$/, '')} />;
                                                                    },
                                                                }}
                                                                remarkPlugins={[remarkGfm]}
                                                                rehypePlugins={[rehypeRaw]}
                                                            >
                                                                {m.content}
                                                            </Markdown>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Sentiment Analysis for this message */}
                                                {isUser && m.sentiment && (
                                                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                                        <div className="flex items-center gap-3">
                                                            <span
                                                                className="px-2 py-1 rounded-full text-[10px] font-semibold"
                                                                style={{
                                                                    background: m.sentiment.label === 'POSITIVE'
                                                                        ? 'rgba(34, 197, 94, 0.2)'
                                                                        : 'rgba(239, 68, 68, 0.2)',
                                                                    color: m.sentiment.label === 'POSITIVE'
                                                                        ? 'rgb(34, 197, 94)'
                                                                        : 'rgb(239, 68, 68)'
                                                                }}
                                                            >
                                                                {m.sentiment.label}
                                                            </span>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="h-1.5 rounded-full flex-1"
                                                                        style={{ background: 'rgba(0,0,0,0.1)' }}
                                                                    >
                                                                        <div
                                                                            className="h-1.5 rounded-full transition-all duration-500"
                                                                            style={{
                                                                                width: `${m.sentiment.confidence * 100}%`,
                                                                                background: m.sentiment.label === 'POSITIVE'
                                                                                    ? 'rgb(34, 197, 94)'
                                                                                    : 'rgb(239, 68, 68)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] font-mono opacity-70">
                                                                        {(m.sentiment.confidence * 100).toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : thinking ? (
                            <div className="thinking text-center py-6">Thinking...</div>
                        ) : null
                    }
                    <div className={messages.length > 0 ? "sticky bottom-0 mb-4 mx-4 sm:w-[80%] w-full" : "sm:w-[80%] w-full"}>
                        <PromptBar input={input} setInput={setInput} onSend={handleSummarize} loading={thinking} />
                    </div>
                </div>
            </div>
            <style>{`
                    @keyframes fadeLinear {
                        0% { opacity: 0.2; }
                        50% { opacity: 1; }
                        100% { opacity: 0.2; }
                    }
                    .thinking {
                        animation: fadeLinear 1s linear infinite;
                    }
                `}</style>
        </div>
    )
}
