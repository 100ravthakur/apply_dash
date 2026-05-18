export default function LoadingSpinner({ size = 24, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
      <div style={{ width: size, height: size, border: `2px solid var(--border)`, borderTop: `2px solid var(--accent)`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      {text && <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{text}</div>}
    </div>
  );
}
