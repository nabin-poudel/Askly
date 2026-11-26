
"use client";

import { useState, useRef, useEffect } from "react";
import { generateTextAction } from "./actions/aiAction";
import { Copy, Check } from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
    isError?: boolean;
};

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    const handlePrompt = async () => {
        if (!prompt.trim() || loading) return;

        const userMessage = prompt.trim();

        setMessages(prev => [
            ...prev,
            { role: "user", content: userMessage }
        ]);

        setPrompt("");
        setLoading(true);

       
        try {
            const result = await generateTextAction(userMessage);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: result.message,
                    isError: !result.success
                }
            ]);
        } catch (error) {
            console.error(error);
        
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                    isError: true
                }
            ]);
        
        } finally {
            setLoading(false);
        }

    };

    // Copy Message/Response
    const copyMessage = async (content: string, index: number) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIndex(index);

            setTimeout(() => {
                setCopiedIndex(null);
            }, 2000);

        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    return (

        <main className="min-h-screen bg-[#111111] text-white flex flex-col">

            {/* Navbar */}
            <header className="fixed top-0 w-full border-b border-white/10 bg-[#111111]/90 backdrop-blur-md px-6 py-4 z-10">
                <h1 className="text-xl font-semibold text-[#f6a062] tracking-tight">
                    Askly
                </h1>
            </header>

            {/* Chat Body */}
            <section className="flex-1 w-full max-w-3xl mx-auto px-5 pt-24 pb-36">

                {messages.length === 0 && (
                    <div className="min-h-[65vh] flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            What can I help with?
                        </h2>
                        <p className="text-zinc-500 text-sm mt-3">
                            Ask anything. Lets figure it out.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-8">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[85%] ${message.role === "user"
                                        ? "bg-[#7c4219] px-5 py-3 rounded-2xl"
                                        : "py-2"
                                    }`}
                            >
                                <p className="text-sm leading-7 whitespace-pre-wrap">
                                    {message.content}
                                </p>

                                {/* Copy Button */}
                                {message.role === "assistant" && (
                                    <button
                                        onClick={() => copyMessage(message.content, index)}
                                        className="mt-3 flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {copiedIndex === index ? (
                                            <>
                                                <Check size={15} />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={15} />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                            <span className="animate-pulse">●</span>
                            Askly is thinking...
                        </div>
                    )}
                </div>

                <div ref={bottomRef} />
            </section>

            {/* Input */}
            <div className="fixed bottom-0 w-full px-4 pb-6 pt-8 bg-linear-to-t from-[#111111] via-[#111111] to-transparent">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-2xl p-2 focus-within:border-white/25 transition-colors">

                        <input
                            type="text"
                            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-600"
                            placeholder="Message Askly..."
                            value={prompt}
                            disabled={loading}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handlePrompt();
                                }
                            }}
                        />

                        <button
                            onClick={handlePrompt}
                            disabled={!prompt.trim() || loading}
                            className="bg-[#f5924b] text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Send
                        </button>

                    </div>

                    <p className="text-center text-[11px] text-zinc-300 mt-3">
                        Askly can make mistakes. Verify important information.
                    </p>
                </div>
            </div>

        </main>
    );
}
