import React from "react";
import { Link } from "react-router-dom";

interface FormattedContentProps {
  content: string;
  className?: string;
  maxEnters?: number;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  className = "",
  maxEnters = 2,
}) => {
  if (!content) return null;

  // 1. Normalize carriage returns
  let normalized = content.replace(/\r\n/g, "\n");

  // 2. Collapse enters beyond maxEnters
  if (maxEnters === 1) {
    normalized = normalized.replace(/\n{2,}/g, "\n");
  } else if (maxEnters === 2) {
    normalized = normalized.replace(/\n{3,}/g, "\n\n");
  } else if (maxEnters === 3) {
    normalized = normalized.replace(/\n{4,}/g, "\n\n\n");
  } else if (maxEnters > 3) {
    normalized = normalized.replace(
      new RegExp(`\\n{${maxEnters + 1},}`, "g"),
      "\n".repeat(maxEnters)
    );
  }

  // Regex matching HTTP/HTTPS/WWW URLs or @mentions
  const tokenRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|@[a-zA-Z0-9_]+)/gi;
  const parts = normalized.split(tokenRegex);

  return (
    <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check if part is a URL
        if (part.match(/^(https?:\/\/[^\s]+|www\.[^\s]+)$/i)) {
          const href =
            part.startsWith("http://") || part.startsWith("https://")
              ? part
              : `https://${part}`;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-2 font-medium break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        // Check if part is an @mention
        if (part.startsWith("@") && part.length > 1 && /^@[a-zA-Z0-9_]+$/.test(part)) {
          const handle = part.slice(1);
          return (
            <Link
              key={index}
              to={`/student/${handle}`}
              className="text-primary font-semibold hover:underline underline-offset-2 bg-primary/10 hover:bg-primary/20 px-1 py-0.5 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              @{handle}
            </Link>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default FormattedContent;
