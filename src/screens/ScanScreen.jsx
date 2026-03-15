import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import { boxes } from '../store';
import { colors } from '../theme';
import { Card, PrimaryButton, GhostButton } from '../components/UI';

export default function ScanScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('idle'); // idle | scanning | found | error
  const [manual, setManual] = useState('');
  const [foundBox, setFoundBox] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    return () => { controlsRef.current?.stop(); };
  }, []);

  function processCode(raw) {
    const id = raw.replace('BOX_TRACKER:', '').toUpperCase().trim();
    const box = boxes.find(b => b.id === id);
    if (box) { setFoundBox(box); setMode('found'); }
    else { setErrorMsg(`No box found for "${id}"`); setMode('error'); }
  }

  async function startScan() {
    setMode('scanning');
    try {
      readerRef.current = new BrowserQRCodeReader();
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined, videoRef.current,
        (result, err) => {
          if (result) { controlsRef.current?.stop(); processCode(result.getText()); }
        }
      );
    } catch (e) {
      setErrorMsg('Camera access denied. Please allow camera permission in your browser.');
      setMode('error');
    }
  }

  function reset() { controlsRef.current?.stop(); setMode('idle'); setFoundBox(null); setManual(''); setErrorMsg(''); }

  if (mode === 'found' && foundBox) {
    return (
      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
        <Card style={{ textAlign: 'center', padding: 32, borderColor: colors.green, marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.green, marginBottom: 12 }}>Box Found!</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{foundBox.name}</div>
          <div style={{ fontSize: 13, color: colors.text2 }}>{foundBox.id} · {foundBox.items.length} items</div>
          {foundBox.location && <div style={{ fontSize: 13, color: colors.text2 }}>📍 {foundBox.location}</div>}
        </Card>
        <div style={{ display: 'flex', gap: 12 }}>
          <GhostButton   label="Scan Another"    onClick={reset} />
          <PrimaryButton label="View Contents →" onClick={() => { reset(); navigate(`/box/${foundBox.id}`); }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>

      {mode === 'scanning' ? (
        <div>
          <video ref={videoRef} style={{ width: '100%', borderRadius: 12, background: '#000', display: 'block' }} />
          <div style={{ textAlign: 'center', color: colors.text2, fontSize: 13, margin: '12px 0' }}>
            Point at a BoxTracker QR label
          </div>
          <GhostButton label="✕ Cancel" onClick={reset} />
        </div>
      ) : (
        <>
          <button onClick={startScan} style={{
            width: '100%', background: colors.surface,
            border: `2px dashed ${colors.border}`, borderRadius: 16,
            padding: '40px 0', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24,
          }}>
            <span style={{ fontSize: 48 }}>📷</span>
            <span style={{ color: colors.text, fontSize: 16, fontWeight: 600 }}>Tap to Scan QR Code</span>
            <span style={{ color: colors.text3, fontSize: 13 }}>Opens your camera</span>
          </button>

          {mode === 'error' && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: `1px solid ${colors.red}`,
              borderRadius: 8, padding: '12px 16px', color: colors.red, fontSize: 13, marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
            <span style={{ color: colors.text3, fontSize: 12 }}>or enter manually</span>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
          </div>

          <input value={manual} onChange={e => setManual(e.target.value.toUpperCase())}
            placeholder="e.g. BOX001"
            style={{ width: '100%', background: '#111', border: `1px solid ${colors.border}`,
              borderRadius: 8, padding: '12px', color: colors.text, fontSize: 16,
              fontFamily: 'monospace', textAlign: 'center', letterSpacing: 4, marginBottom: 12 }}
          />
          <PrimaryButton label="🔍 Find Box" onClick={() => manual.trim() && processCode(manual.trim())} />

          {boxes.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.text3, letterSpacing: 2, marginBottom: 10 }}>
                // QUICK TEST
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {boxes.slice(0, 4).map(b => (
                  <button key={b.id} onClick={() => processCode(b.id)} style={{
                    background: colors.surface, border: `1px solid ${colors.border}`,
                    borderRadius: 8, padding: '6px 14px', color: colors.text2,
                    fontFamily: 'monospace', fontSize: 12, cursor: 'pointer',
                  }}>{b.id}</button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div ref={videoRef} style={{ display: mode !== 'scanning' ? 'none' : undefined }} />
    </div>
  );
}
