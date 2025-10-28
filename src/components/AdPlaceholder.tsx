interface AdPlaceholderProps {
  width: number;
  height: number;
  label?: string;
  className?: string;
}

export function AdPlaceholder({ width, height, label, className = "" }: AdPlaceholderProps) {
  return (
    <div
      className={`bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <div className="text-center text-slate-500">
        <div className="mb-1">Ad Placeholder</div>
        <div className="text-sm">{label || `${width} × ${height}`}</div>
      </div>
    </div>
  );
}
