import React from "react";

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

  // 2. Collapse enters beyond maxEnters:
  if (maxEnters === 1) {
    normalized = normalized.replace(/\n{2,}/g, "\n");
  } else if (maxEnters === 2) {
    normalized = normalized.replace(/\n{3,}/g, "\n\n");
  } else if (maxEnters === 3) {
    normalized = normalized.replace(/\n{4,}/g, "\n\n\n");
  } else if (maxEnters > 3) {
    normalized = normalized.replace(new RegExp(`\\n{${maxEnters + 1},}`, "g"), "\n".repeat(maxEnters));
  }

  // Regex matching HTTP/HTTPS/WWW URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = normalized.split(urlRegex);

  return (
    <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
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
        return part;
      })}
    </div>
  );
};

export default FormattedContent;
