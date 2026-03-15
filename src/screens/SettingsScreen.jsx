import { useState, useEffect } from 'react';
import { boxes, setHouseholdCode, getHouseholdCode, setBoxesFromCloud, subscribe } from '../store';
import { householdExists, pushAllBoxes, subscribeToBoxes } from '../firestore';
import { colors } from '../theme';
import { SectionHeading, Card, PrimaryButton, GhostButton, FormField } from '../components/UI';

const STORAGE_KEY = 'boxtracker_household';
let _unsubscribe = null;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function startSync(code) {
  if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
  _unsubscribe = subscribeToBoxes(code, setBoxesFromCloud);
}

export default function SettingsScreen() {
  const [currentCode, setCurrentCode] = useState(null);
  const [joinInput, setJoinInput]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [status, setStatus]           = useState('');

  useEffect(() => {
    const code = localStorage.getItem(STORAGE_KEY);
    if (code) { setCurrentCode(code); setHouseholdCode(code); startSync(code); }
  }, []);

  async function handleCreate() {
    setLoading(true); setStatus('Creating household...');
    try {
      const code = generateCode();
      if (boxes.length > 0) { setStatus('Uploading boxes...'); await pushAllBoxes(code, boxes); }
      localStorage.setItem(STORAGE_KEY, code);
      setHouseholdCode(code);
      startSync(code);
      setCurrentCode(code); setStatus('');
      alert(`Household created!\n\nYour code: ${code}\n\nShare this with family members.`);
    } catch (e) { alert('Error: ' + e.message); setStatus(''); }
    setLoading(false);
  }

  async function handleJoin() {
    const code = joinInput.trim().toUpperCase();
    if (code.length < 4) return alert('Please enter a valid code.');
    setLoading(true); setStatus('Looking up household...');
    try {
      const exists = await householdExists(code);
      if (!exists) { alert(`No household found with code "${code}".`); setLoading(false); setStatus(''); return; }
      localStorage.setItem(STORAGE_KEY, code);
      setHouseholdCode(code);
      startSync(code);
      setCurrentCode(code); setJoinInput(''); setStatus('');
      alert(`Joined household ${code}! Your boxes will sync in real time.`);
    } catch (e) { alert('Error: ' + e.message); setStatus(''); }
    setLoading(false);
  }

  function handleLeave() {
    if (!confirm('Leave household? Your local boxes will remain but stop syncing.')) return;
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    localStorage.removeItem(STORAGE_KEY);
    setHouseholdCode(null);
    setCurrentCode(null);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <SectionHeading title="Shared Database" />
      <Card style={{ textAlign: 'center', marginBottom: 28 }}>
        {currentCode ? (
          <>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.text3, letterSpacing: 2, marginBottom: 10 }}>CONNECTED</div>
            <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 700, color: colors.accent2, letterSpacing: 6, marginBottom: 12 }}>
              {currentCode}
            </div>
            <div style={{ fontSize: 13, color: colors.text2, marginBottom: 16 }}>
              Share this code with family members so they can join your household.
            </div>
            <GhostButton label="Leave Household" onClick={handleLeave} danger />
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.text3, letterSpacing: 2, marginBottom: 10 }}>LOCAL ONLY</div>
            <div style={{ fontSize: 13, color: colors.text2 }}>
              Create or join a household to sync with family across all devices.
            </div>
          </>
        )}
      </Card>

      {loading && <div style={{ color: colors.text2, textAlign: 'center', marginBottom: 20 }}>⟳ {status}</div>}

      {!currentCode && !loading && (
        <>
          <SectionHeading title="Create Household" />
          <p style={{ fontSize: 13, color: colors.text2, marginBottom: 16 }}>
            Start a new shared household. A unique code will be generated.
          </p>
          <PrimaryButton label="Create New Household" onClick={handleCreate} style={{ marginBottom: 28 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
            <span style={{ color: colors.text3, fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: colors.border }} />
          </div>

          <SectionHeading title="Join Household" />
          <p style={{ fontSize: 13, color: colors.text2, marginBottom: 16 }}>
            Enter a household code from a family member's device.
          </p>
          <input value={joinInput} onChange={e => setJoinInput(e.target.value.toUpperCase())}
            placeholder="Enter code" maxLength={8}
            style={{ width: '100%', background: '#111', border: `1px solid ${colors.border}`,
              borderRadius: 8, padding: '14px', color: colors.text, fontSize: 20,
              fontFamily: 'monospace', letterSpacing: 4, textAlign: 'center', marginBottom: 12 }}
          />
          <GhostButton label="Join Household" onClick={handleJoin} style={{ marginBottom: 28 }} />
        </>
      )}

      {/* How it works */}
      <SectionHeading title="How It Works" />
      <Card>
        {[
          ['📦', 'One person creates a household and gets a code'],
          ['👨‍👩‍👧', 'Family members enter the code on their devices'],
          ['🔄', 'All box changes sync in real time across all devices'],
          ['✈️', 'Works offline — syncs automatically when back online'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 13, color: colors.text2 }}>{text}</span>
          </div>
        ))}
      </Card>

      {/* About */}
      <SectionHeading title="About" />
      <Card style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: colors.text2, marginBottom: 4 }}>BoxTracker Web</div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: colors.text3 }}>Version 1.0</div>
      </Card>
    </div>
  );
}
