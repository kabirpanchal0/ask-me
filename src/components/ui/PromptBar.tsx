"use client";

import { useState } from "react";
import CustomButton from "./CustomButton";
import { ArrowUp, Plus } from "lucide-react";

export default function PromptBar({ input, setInput, onSend, loading }: any) {
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input?.trim() || loading || localLoading) return;

    setLocalLoading(true);
    await onSend(input);
    setInput("");
    setLocalLoading(false);
  };

  const styleObj: any = { border: ' 1px solid var(--button-text)' };

  return (
    <div className="flex flex-col justify-between items-start gap-2 rounded-2xl px-2 py-3 shadow-lg"
      style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-color)', minHeight: '96px', maxHeight: '360px' }}>

      {/* Input */}
      <textarea
        id="chat-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);

          // Auto resize logic
          const el = e.target;
          el.style.height = "auto"; // reset
          const minH = 40; // px (~1 line)
          const maxH = 320; // px (~10 lines)
          const newH = Math.min(Math.max(el.scrollHeight, minH), maxH);
          el.style.height = `${newH}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="What do you want to know ?"
        rows={1}
        className="resize-none px-2 lg:py-2 py-1 rounded-md outline-none max-h-[320px] w-full block"
        style={{ background: 'transparent', color: 'var(--input-text)', minHeight: '40px' }}
      />
      <div className="flex justify-between items-center gap-2 w-full pl-2 mt-auto">
        <button>
          <Plus />
        </button>
        {/* Button / Loader */}
        {(loading || localLoading) ? (
          <div className={`${styleObj} w-9 h-9 flex items-center justify-center border rounded-full `}>
            <div className={`${styleObj} w-4 h-4 border-2 border-t-transparent rounded-full animate-spin `} />
          </div>
        ) : (
          <CustomButton variant="icon" onClick={handleSend} className="rotate-45 hover:rotate-0">
            <ArrowUp size={18} />
          </CustomButton>
        )}
      </div>
    </div>
  );
}