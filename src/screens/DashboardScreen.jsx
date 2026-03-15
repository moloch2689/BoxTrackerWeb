import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxes, getStats, createBox, getHouseholdCode, setBoxesFromCloud, subscribe } from '../store';
import { fetchBoxes } from '../firestore';
import { colors } from '../theme';
import { StatCard, SectionHeading, Card, Badge, Modal, PrimaryButton, GhostButton, FormField } from '../components/UI';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [showNewBox, setShowNewBox] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [boxName, setBoxName] = useState('');
  const [boxLocation, setBoxLocation] = useState('');
  const [boxNotes, setBoxNotes] = useState('');

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const stats = getStats();
  const recent = [...boxes].reverse().slice(0, 3);

  function handleCreate() {
    if (!boxName.trim()) return alert('Please enter a box name.');
    createBox({ name: boxName.trim(), location: boxLocation.trim(), notes: boxNotes.trim() });
    setShowNewBox(false); setBoxName(''); setBoxLocation(''); setBoxNotes('');
  }

  async function handleRefresh() {
    const code = getHouseholdCode();
    if (!code) { setTick(t => t + 1); return; }
    setRefreshing(true);
    try {
      const fetched = await fetchBoxes(code);
      setBoxesFromCloud(fetched);
    } catch (e) { alert('Refresh failed: ' + e.message); }
    setRefreshing(false);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>

      {/* Stats */}
      <SectionHeading title="Overview" right={
        <button onClick={handleRefresh} style={{ background: 'none', color: colors.accent2, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      } />
      <div style={{ display: 'flex', marginBottom: 28 }}>
        <StatCard label="Total Boxes" value={stats.totalBoxes} color={colors.accent2} onClick={() => navigate('/boxes')} />
        <StatCard label="Total Items" value={stats.totalItems} color={colors.green}   onClick={() => navigate('/items')} />
        <StatCard label="Total Qty"   value={stats.totalQty}   color={colors.amber}   onClick={() => navigate('/boxes')} />
      </div>

      {/* Quick Actions */}
      <SectionHeading title="Quick Actions" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '📦', label: 'New Box',  action: () => setShowNewBox(true) },
          { icon: '🔍', label: 'Search',   action: () => navigate('/search') },
          { icon: '📷', label: 'Scan QR',  action: () => navigate('/scan') },
          { icon: '⚙️', label: 'Settings', action: () => navigate('/settings') },
        ].map(({ icon, label, action }) => (
          <button key={label} onClick={action} style={{
            background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: 12, padding: '20px 0', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 8,
            cursor: 'pointer', color: colors.text2, fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ fontSize: 28 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Recent Boxes */}
      <SectionHeading title="Recent Boxes" right={
        <span onClick={() => navigate('/boxes')} style={{ color: colors.accent2, fontSize: 13, cursor: 'pointer' }}>See all →</span>
      } />
      {recent.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div style={{ color: colors.text2, marginBottom: 16 }}>No boxes yet. Create your first one!</div>
          <PrimaryButton label="＋ New Box" onClick={() => setShowNewBox(true)} />
        </Card>
      ) : (
        recent.map(box => (
          <Card key={box.id} onClick={() => navigate(`/box/${box.id}`)} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3,
                background: 'rgba(176,126,248,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                {box.id}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{box.name}</div>
            <div style={{ fontSize: 13, color: colors.text2, marginBottom: 10 }}>📍 {box.location || 'No location set'}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge label={`${box.items.length} items`} purple />
              <Badge label={`${box.items.reduce((a,i) => a+(i.qty||1),0)} total qty`} />
            </div>
          </Card>
        ))
      )}

      {/* New Box Modal */}
      <Modal visible={showNewBox} onClose={() => setShowNewBox(false)} title="NEW BOX">
        <FormField label="Box Name *" value={boxName}     onChange={setBoxName}     placeholder="e.g. Winter Clothes" />
        <FormField label="Location"   value={boxLocation} onChange={setBoxLocation} placeholder="e.g. Garage, Shelf 2" />
        <FormField label="Notes"      value={boxNotes}    onChange={setBoxNotes}    placeholder="Any notes..." multiline />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <GhostButton label="Cancel"     onClick={() => setShowNewBox(false)} />
          <PrimaryButton label="Create Box" onClick={handleCreate} />
        </div>
      </Modal>
    </div>
  );
}
