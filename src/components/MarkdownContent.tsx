import React, { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

// The default Prism themes (incl. oneDark) style some tokens — operators,
// punctuation, entities — with a translucent white background (a leftover
// from Prism's base CSS meant for light themes). On a dark UI that renders
// as ugly "highlighter" stripes across the code. We strip any background
// from every token style but keep the outer pre/code wrapper untouched.
function stripTokenBackgrounds(
  theme: Record<string, React.CSSProperties>,
): Record<string, React.CSSProperties> {
  const sanitized: Record<string, React.CSSProperties> = {};
  for (const [key, value] of Object.entries(theme)) {
    if (key.includes("pre[") || key.includes("code[")) {
      sanitized[key] = value;
      continue;
    }
    const rest: Record<string, unknown> = { ...value };
    delete rest.background;
    delete rest.backgroundColor;
    sanitized[key] = rest as React.CSSProperties;
  }
  return sanitized;
}

const codeTheme = stripTokenBackgrounds(oneDark);

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed, ignore
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
        <span className="text-[11px] font-medium text-slate-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
          title="Salin kode"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" /> Disalin
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Salin
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={codeTheme}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "0.85rem 1rem",
          background: "rgb(15 23 42 / 0.9)",
          fontSize: "0.8rem",
          lineHeight: 1.55,
        }}
        codeTagProps={{ style: { background: "transparent" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const components: Components = {
  p: ({ ...props }) => (
    <p className="mb-3 last:mb-0 leading-relaxed" {...props} />
  ),

  strong: ({ ...props }) => (
    <strong className="font-semibold text-slate-50" {...props} />
  ),
  em: ({ ...props }) => <em className="italic" {...props} />,

  a: ({ ...props }) => (
    <a
      className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  ul: ({ ...props }) => (
    <ul className="list-disc list-outside pl-5 space-y-1 mb-3" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="list-decimal list-outside pl-5 space-y-1 mb-3" {...props} />
  ),
  li: ({ ...props }) => <li className="leading-relaxed" {...props} />,

  h1: ({ ...props }) => (
    <h1 className="text-lg font-bold mt-4 mb-2 text-slate-50" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="text-base font-bold mt-4 mb-2 text-slate-50" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="text-sm font-bold mt-3 mb-1.5 text-slate-50" {...props} />
  ),

  blockquote: ({ ...props }) => (
    <blockquote
      className="border-l-2 border-cyan-500/50 pl-3 my-3 italic text-slate-400"
      {...props}
    />
  ),

  hr: ({ ...props }) => <hr className="my-4 border-slate-800" {...props} />,

  table: ({ ...props }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
      <table className="w-full border-collapse text-xs" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className="bg-slate-800/80" {...props} />,
  th: ({ ...props }) => (
    <th
      className="border-b border-slate-800 px-3 py-2 text-left font-semibold text-slate-200"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="border-b border-slate-800/60 px-3 py-2 text-slate-300"
      {...props}
    />
  ),

  code(props) {
    const { className, children, ...rest } = props as {
      className?: string;
      children?: React.ReactNode;
      inline?: boolean;
    };
    const match = /language-(\w+)/.exec(className || "");
    const isBlock = Boolean(match) || String(children).includes("\n");

    if (isBlock) {
      return (
        <CodeBlock
          language={match?.[1] || "text"}
          code={String(children).replace(/\n$/, "")}
        />
      );
    }

    return (
      <code
        className="bg-slate-800/80 text-cyan-300 px-1.5 py-0.5 rounded-md text-[0.85em]"
        {...rest}
      >
        {children}
      </code>
    );
  },
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
}) => {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
