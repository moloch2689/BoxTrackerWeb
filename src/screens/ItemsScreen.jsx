import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxes, subscribe } from '../store';
import { colors } from '../theme';
import { SectionHeading, Card, Badge } from '../components/UI';

export default function ItemsScreen() {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const allItems = boxes.flatMap(box =>
    box.items.map(item => ({ item, box }))
  );

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <SectionHeading title={`All Items (${allItems.length})`} />

      {allItems.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
          <div style={{ color: colors.text2 }}>No items yet. Add items to your boxes.</div>
        </Card>
      ) : (
        allItems.map(({ item, box }) => (
          <Card key={item.id} onClick={() => navigate(`/box/${box.id}`)} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
              {item.desc ? <div style={{ fontSize: 13, color: colors.text2, marginBottom: 6 }}>{item.desc}</div> : null}
              <Badge label={`qty: ${item.qty || 1}`} />
            </div>
            <div style={{ textAlign: 'right', marginLeft: 16 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3,
                background: 'rgba(176,126,248,0.1)', padding: '2px 8px', borderRadius: 4, marginBottom: 4, display: 'inline-block' }}>
                {box.id}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{box.name}</div>
              <div style={{ fontSize: 12, color: colors.text2 }}>📍 {box.location || '—'}</div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
