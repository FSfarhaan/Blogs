import type { BlogContentResponse } from "@/lib/blog-content";
import { highlightCode } from "@/lib/prism-highlight";

type Props = {
  content: BlogContentResponse;
};

export function NotionContent({ content }: Props) {
  return (
    <div className="space-y-6 text-[1.0625rem] leading-8 text-[var(--foreground)]">
      {content.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "text") {
          return (
            <p key={key} className="text-[var(--foreground)]/90">
              {block.content}
            </p>
          );
        }

        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1
                key={key}
                className="pt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
              >
                {block.content}
              </h1>
            );
          }

          if (block.level === 2) {
            return (
              <h2
                key={key}
                className="pt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl"
              >
                {block.content}
              </h2>
            );
          }

          return (
            <h3
              key={key}
              className="pt-3 text-xl font-semibold tracking-tight text-[var(--foreground)] md:text-2xl"
            >
              {block.content}
            </h3>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={key} className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- The pipeline returns Cloudinary URLs and we intentionally keep blog rendering simple and reliable. */}
              <img
                src={block.url}
                alt={block.alt}
                loading="lazy"
                className="h-auto md:w-2/3 rounded-[1.75rem] border border-[var(--border)] object-cover shadow-[var(--shadow-soft)]"
              />
              {block.caption ? (
                <figcaption className="text-sm leading-6 text-[var(--muted)]">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "bulleted_list") {
          return (
            <ul key={key} className="list-disc space-y-2 pl-6 text-[var(--foreground)]/90">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "numbered_list") {
          return (
            <ol key={key} className="list-decimal space-y-2 pl-6 text-[var(--foreground)]/90">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{item}</li>
              ))}
            </ol>
          );
        }

        const highlightedCode = highlightCode(block.code, block.language);

        return (
          <div
            key={key}
            className="code-block overflow-x-auto rounded-[1.75rem] border border-[var(--border)] bg-[var(--code-surface)] px-5 py-4 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)] md:w-2/3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--code-caption)]">
                {block.language}
              </p>
              {block.caption ? (
                <p className="text-right text-xs uppercase tracking-[0.18em] text-[var(--code-muted)]">
                  {block.caption}
                </p>
              ) : null}
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono leading-7">
              <code
                className={`language-${highlightedCode.language}`}
                dangerouslySetInnerHTML={{
                  __html: highlightedCode.html,
                }}
              />
            </pre>
          </div>
        );
      })}
    </div>
  );
}
