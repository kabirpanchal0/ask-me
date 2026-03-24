"use client";

import { useState } from "react";
import PromptBar from "./ui/PromptBar";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Copy, Pencil, RefreshCw } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect } from 'react';
import { useCallback } from 'react';

export default function ChatUI() {
    const [messages, setMessages] = useState<any>([]);
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

    console.log('messages', messages)

    const sendMessage = async (text: string) => {
        const newMessages = [...messages, { role: "user", content: text }];
        setMessages(newMessages);
        setThinking(true);

        try {
            const res = await fetch("http://localhost:4545/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await res.json();

            // data.reply is expected to be { role, content }
            const assistantMsg = data?.reply || { role: "assistant", content: String(data) };
            setMessages((prev: any) => [...newMessages, assistantMsg]);
        } catch (err) {
            console.error('sendMessage error', err);
            setMessages((prev: any) => [...newMessages, { role: 'assistant', content: 'Error: failed to get response' }]);
        } finally {
            setThinking(false);
        }
    }

    console.log('messages', messages)

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

                                                            <div className="mt-4 flex gap-4 justify-end text-xs">
                                                                {copiedIndex === i ? (
                                                                    <div className="text-xs font-semibold">Copied!</div>
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
                                                                    onClick={() => sendMessage(m.content)}
                                                                    className="cursor-pointer hover:rotate-180 transition-all duration-300"
                                                                >
                                                                    <RefreshCw size={14} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="absolute top-0 right-0">
                                                                {copiedIndex === i ? (
                                                                    <div className="text-xs font-semibold mt-1">Copied!</div>
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
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : thinking ? (
                            <div className="thinking text-center py-6">Thinking...</div>
                        ) : null
                    }
                    <div className={messages.length > 0 ? "sticky bottom-0 mb-4 mx-4 w-[80%]" : "w-[80%]"}>
                        <PromptBar input={input} setInput={setInput} onSend={sendMessage} loading={thinking} />
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
