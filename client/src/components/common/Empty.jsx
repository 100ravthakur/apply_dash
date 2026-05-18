export default function Empty({ icon = '📭', title = 'Nothing here', message, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 10 }}>
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--txt)' }}>{title}</div>
      {message && <div style={{ fontSize: 13, color: 'var(--txt2)', maxWidth: 320 }}>{message}</div>}
      {action}
    </div>
  );
}
