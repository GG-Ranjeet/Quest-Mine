import { ChevronRight } from "lucide-react";

export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button">
          {action}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
