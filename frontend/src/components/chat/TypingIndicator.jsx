export default function TypingIndicator() {
  return (
    <div className="glass-card neural-outline inline-flex items-center gap-2 rounded-full px-4 py-3">
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="h-2.5 w-2.5 rounded-full bg-cyan/75"
          style={{
            animation: `pulse-dot 1s ${item * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
