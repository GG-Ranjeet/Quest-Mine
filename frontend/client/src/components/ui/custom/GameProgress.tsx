export function GameProgress({ value, tone = "gold" }: { value: number; tone?: string }) {
  return (
    <div className={`progress-track ${tone}`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}
