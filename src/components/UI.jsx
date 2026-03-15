import { colors } from '../theme';

export function PrimaryButton({ label, onClick, style = {}, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: colors.accent2, color: '#0d0d0d',
        fontWeight: 700, fontSize: 14, padding: '12px 20px',
        borderRadius: 10, width: '100%', opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

export function GhostButton({ label, onClick, style = {}, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${danger ? colors.red : colors.border}`,
        color: danger ? colors.red : colors.text2,
        fontWeight: 600, fontSize: 14, padding: '12px 20px',
        borderRadius: 10, width: '100%',
        ...style,
      }}
    >
      {label}
    </button>
  );
}

export function SectionHeading({ title, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: colors.text3, letterSpacing: 2 }}>
        // {title.toUpperCase()}
      </span>
      {right}
    </div>
  );
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ label, purple }) {
  return (
    <span style={{
      background: purple ? 'rgba(176,126,248,0.15)' : 'rgba(255,255,255,0.06)',
      color: purple ? colors.accent3 : colors.text2,
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
    }}>
      {label}
    </span>
  );
}

export function FormField({ label, value, onChange, placeholder, multiline, type = 'text' }) {
  const style = {
    background: '#111', border: `1px solid ${colors.border}`,
    borderRadius: 8, padding: '10px 12px', color: colors.text,
    fontSize: 14, width: '100%', marginBottom: 12,
    resize: multiline ? 'vertical' : 'none',
  };
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: colors.text3, marginBottom: 6, fontFamily: 'monospace', letterSpacing: 1 }}>
        {label}
      </div>
      {multiline
        ? <textarea rows={3} style={style} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} style={style} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

export function Modal({ visible, onClose, title, children }) {
  if (!visible) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">// {title}</div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, background: colors.surface,
        border: `1px solid ${colors.border}`, borderRadius: 12,
        padding: '16px 12px', textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default', margin: '0 4px',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color }}>{value}</div>
      <div style={{ fontSize: 11, color: colors.text3, marginTop: 4 }}>{label}</div>
    </div>
  );
}
