import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxes, createBox, subscribe } from '../store';
import { colors } from '../theme';
import { SectionHeading, Card, Badge, Modal, PrimaryButton, GhostButton, FormField } from '../components/UI';

export default function BoxesScreen() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [showNewBox, setShowNewBox] = useState(false);
  const [boxName, setBoxName] = useState('');
  const [boxLocation, setBoxLocation] = useState('');
  const [boxNotes, setBoxNotes] = useState('');

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  function handleCreate() {
    if (!boxName.trim()) return alert('Please enter a box name.');
    createBox({ name: boxName.trim(), location: boxLocation.trim(), notes: boxNotes.trim() });
    setShowNewBox(false); setBoxName(''); setBoxLocation(''); setBoxNotes('');
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <SectionHeading title="All Boxes" right={
        <button onClick={() => setShowNewBox(true)} style={{
          background: colors.accent2, color: '#0d0d0d', border: 'none',
          borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>＋ New Box</button>
      } />

      {boxes.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ color: colors.text2, marginBottom: 20 }}>No boxes yet.</div>
          <PrimaryButton label="＋ Create First Box" onClick={() => setShowNewBox(true)} />
        </Card>
      ) : (
        boxes.map(box => (
          <Card key={box.id} onClick={() => navigate(`/box/${box.id}`)} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3,
                background: 'rgba(176,126,248,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                {box.id}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge label={`${box.items.length} items`} purple />
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{box.name}</div>
            <div style={{ fontSize: 13, color: colors.text2 }}>📍 {box.location || 'No location set'}</div>
            {box.notes ? <div style={{ fontSize: 12, color: colors.text3, marginTop: 6 }}>{box.notes}</div> : null}
          </Card>
        ))
      )}

      <Modal visible={showNewBox} onClose={() => setShowNewBox(false)} title="NEW BOX">
        <FormField label="Box Name *" value={boxName}     onChange={setBoxName}     placeholder="e.g. Winter Clothes" />
        <FormField label="Location"   value={boxLocation} onChange={setBoxLocation} placeholder="e.g. Garage, Shelf 2" />
        <FormField label="Notes"      value={boxNotes}    onChange={setBoxNotes}    placeholder="Any notes..." multiline />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <GhostButton   label="Cancel"     onClick={() => setShowNewBox(false)} />
          <PrimaryButton label="Create Box" onClick={handleCreate} />
        </div>
      </Modal>
    </div>
  );
}
