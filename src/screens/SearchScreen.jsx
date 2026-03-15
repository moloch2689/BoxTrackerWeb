import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxes, searchAll, subscribe } from '../store';
import { colors } from '../theme';
import { Card, Badge } from '../components/UI';

export default function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const locations = ['All', ...new Set(boxes.map(b => b.location).filter(Boolean))];

  let results = query.trim() ? searchAll(query) :
    location !== 'All' ? boxes.filter(b => b.location === location).map(box => ({ type: 'box', box })) : [];

  if (location !== 'All' && query.trim()) {
    results = results.filter(r => (r.box || r.box).location === location);
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search boxes and items..."
        style={{
          width: '100%', background: '#111', border: `1px solid ${colors.border}`,
          borderRadius: 10, padding: '12px 16px', color: colors.text,
          fontSize: 15, marginBottom: 16,
        }}
      />

      {/* Location chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {locations.map(loc => (
          <button key={loc} onClick={() => setLocation(loc)} style={{
            whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 20,
            border: `1px solid ${location === loc ? colors.accent2 : colors.border}`,
            background: location === loc ? 'rgba(124,156,255,0.15)' : colors.surface,
            color: location === loc ? colors.accent2 : colors.text2,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            {loc}
          </button>
        ))}
      </div>

      {results.length === 0 && (query || location !== 'All') ? (
        <div style={{ textAlign: 'center', color: colors.text3, padding: 40 }}>No results found.</div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', color: colors.text3, padding: 40 }}>
          Type to search or select a location.
        </div>
      ) : (
        results.map((r, i) => r.type === 'box' ? (
          <Card key={i} onClick={() => navigate(`/box/${r.box.id}`)} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3,
                background: 'rgba(176,126,248,0.1)', padding: '2px 8px', borderRadius: 4 }}>{r.box.id}</span>
              <Badge label="box" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{r.box.name}</div>
            <div style={{ fontSize: 13, color: colors.text2 }}>📍 {r.box.location || '—'}</div>
          </Card>
        ) : (
          <Card key={i} onClick={() => navigate(`/box/${r.box.id}`)} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{r.item.name}</div>
              {r.item.desc ? <div style={{ fontSize: 13, color: colors.text2 }}>{r.item.desc}</div> : null}
              <Badge label={`qty: ${r.item.qty || 1}`} />
            </div>
            <div style={{ textAlign: 'right', marginLeft: 16 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3,
                background: 'rgba(176,126,248,0.1)', padding: '2px 8px', borderRadius: 4, marginBottom: 4, display:'inline-block' }}>
                {r.box.id}
              </div>
              <div style={{ fontSize: 12, color: colors.text2 }}>{r.box.name}</div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
