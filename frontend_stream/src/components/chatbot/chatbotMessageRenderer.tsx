import type { ReactNode } from 'react';

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;
const BULLET_PATTERN = /^\s*[-*]\s+/;
const NUMBERED_PATTERN = /^\s*\d+\.\s+/;
const HEADING_PATTERN = /^\s*#{1,3}\s+/;
const QUOTE_PATTERN = /^\s*>\s?/;

function renderInlineText(
  text: string,
  keyPrefix: string,
  isDark: boolean,
  isUser: boolean,
): ReactNode[] {
  const linkAwareParts = text.split(/(https?:\/\/[^\s]+)/g).filter(Boolean);

  return linkAwareParts.flatMap((part, index) => {
    const nodeKey = `${keyPrefix}-inline-${index}`;
    if (URL_PATTERN.test(part)) {
      return (
        <a
          key={nodeKey}
          href={part}
          target="_blank"
          rel="noreferrer"
          className={`underline underline-offset-2 transition ${
            isUser
              ? 'text-blue-100 hover:text-white'
              : isDark
                ? 'text-blue-300 hover:text-blue-200'
                : 'text-[#1152d4] hover:text-[#0d44b3]'
          }`}
        >
          {part}
        </a>
      );
    }

    const inlineTokens = part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
    return inlineTokens.map((token, tokenIndex) => {
      const tokenKey = `${nodeKey}-token-${tokenIndex}`;
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={tokenKey}
            className={`rounded px-1.5 py-0.5 font-mono text-[12px] ${
              isUser
                ? 'bg-white/20 text-white'
                : isDark
                  ? 'bg-slate-900/80 text-slate-100'
                  : 'bg-slate-100 text-slate-800'
            }`}
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={tokenKey}>{token.slice(2, -2)}</strong>;
      }

      return <span key={tokenKey}>{token}</span>;
    });
  });
}

function renderStructuredText(
  text: string,
  keyPrefix: string,
  isDark: boolean,
  isUser: boolean,
): ReactNode[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockIndex = 0;

  const isBlockBoundary = (line: string) =>
    !line.trim() ||
    BULLET_PATTERN.test(line) ||
    NUMBERED_PATTERN.test(line) ||
    HEADING_PATTERN.test(line) ||
    QUOTE_PATTERN.test(line);

  while (index < lines.length) {
    const current = lines[index];

    if (!current.trim()) {
      index += 1;
      continue;
    }

    if (HEADING_PATTERN.test(current)) {
      const level = Math.min(3, (current.match(/^(\s*#{1,3})/)?.[1].trim().length || 1));
      const headingText = current.replace(/^\s*#{1,3}\s+/, '').trim();
      const headingClass =
        level === 1
          ? 'text-[15px] font-black'
          : level === 2
            ? 'text-[14px] font-bold'
            : 'text-[13px] font-bold';

      blocks.push(
        <h4 key={`${keyPrefix}-heading-${blockIndex++}`} className={`${headingClass} mb-1`}>
          {renderInlineText(headingText, `${keyPrefix}-heading-${blockIndex}`, isDark, isUser)}
        </h4>,
      );
      index += 1;
      continue;
    }

    if (BULLET_PATTERN.test(current)) {
      const items: string[] = [];
      while (index < lines.length && BULLET_PATTERN.test(lines[index])) {
        items.push(lines[index].replace(BULLET_PATTERN, '').trim());
        index += 1;
      }
      blocks.push(
        <ul key={`${keyPrefix}-ul-${blockIndex++}`} className="mb-2 list-disc space-y-1 pl-4">
          {items.map((item, itemIndex) => (
            <li key={`${keyPrefix}-ul-item-${itemIndex}`}>
              {renderInlineText(item, `${keyPrefix}-ul-item-${itemIndex}`, isDark, isUser)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (NUMBERED_PATTERN.test(current)) {
      const items: string[] = [];
      while (index < lines.length && NUMBERED_PATTERN.test(lines[index])) {
        items.push(lines[index].replace(NUMBERED_PATTERN, '').trim());
        index += 1;
      }
      blocks.push(
        <ol key={`${keyPrefix}-ol-${blockIndex++}`} className="mb-2 list-decimal space-y-1 pl-4">
          {items.map((item, itemIndex) => (
            <li key={`${keyPrefix}-ol-item-${itemIndex}`}>
              {renderInlineText(item, `${keyPrefix}-ol-item-${itemIndex}`, isDark, isUser)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (QUOTE_PATTERN.test(current)) {
      const quoteLines: string[] = [];
      while (index < lines.length && QUOTE_PATTERN.test(lines[index])) {
        quoteLines.push(lines[index].replace(QUOTE_PATTERN, '').trim());
        index += 1;
      }
      blocks.push(
        <blockquote
          key={`${keyPrefix}-quote-${blockIndex++}`}
          className={`mb-2 border-l-2 pl-3 italic ${
            isUser
              ? 'border-white/60 text-blue-50'
              : isDark
                ? 'border-slate-500 text-slate-200'
                : 'border-slate-300 text-slate-600'
          }`}
        >
          {renderInlineText(quoteLines.join(' '), `${keyPrefix}-quote-${blockIndex}`, isDark, isUser)}
        </blockquote>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockBoundary(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p key={`${keyPrefix}-p-${blockIndex++}`} className="mb-2 last:mb-0">
        {renderInlineText(paragraphLines.join(' '), `${keyPrefix}-p-${blockIndex}`, isDark, isUser)}
      </p>,
    );
  }

  return blocks;
}

export function renderMessageContent(
  content: string,
  keyPrefix: string,
  isDark: boolean,
  isUser: boolean,
): ReactNode {
  if (isUser) {
    return content;
  }

  const blocks: ReactNode[] = [];
  const codeRegex = /```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let segmentIndex = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim();
    if (before) {
      blocks.push(
        <div key={`${keyPrefix}-text-${segmentIndex}`}>
          {renderStructuredText(before, `${keyPrefix}-text-${segmentIndex}`, isDark, false)}
        </div>,
      );
      segmentIndex += 1;
    }

    const language = match[1]?.trim();
    const codeBody = match[2]?.trim() || '';
    blocks.push(
      <div
        key={`${keyPrefix}-code-${segmentIndex}`}
        className={`mb-2 overflow-hidden rounded-xl border ${
          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {language ? (
          <div
            className={`border-b px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
              isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            {language}
          </div>
        ) : null}
        <pre className="overflow-x-auto px-3 py-2.5 text-[12px] leading-relaxed">
          <code className={isDark ? 'text-slate-100' : 'text-slate-800'}>{codeBody}</code>
        </pre>
      </div>,
    );
    segmentIndex += 1;
    lastIndex = codeRegex.lastIndex;
  }

  const remaining = content.slice(lastIndex).trim();
  if (remaining) {
    blocks.push(
      <div key={`${keyPrefix}-text-${segmentIndex}`}>
        {renderStructuredText(remaining, `${keyPrefix}-text-${segmentIndex}`, isDark, false)}
      </div>,
    );
  }

  if (!blocks.length) {
    return content;
  }

  return <div className="space-y-1">{blocks}</div>;
}

