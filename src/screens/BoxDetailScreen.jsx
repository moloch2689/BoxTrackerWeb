import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { boxes, updateBox, addItemToBox, updateItem, deleteBox, deleteItem, subscribe } from '../store';
import { colors } from '../theme';
import { SectionHeading, Card, Badge, Modal, PrimaryButton, GhostButton, FormField } from '../components/UI';

export default function BoxDetailScreen() {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const [qrUrl, setQrUrl] = useState('');

  // Modals
  const [showEditBox,  setShowEditBox]  = useState(false);
  const [showAddItem,  setShowAddItem]  = useState(false);
  const [showEditItem, setShowEditItem] = useState(null); // item
  const [showQR,       setShowQR]       = useState(false);

  // Edit box fields
  const [boxName, setBoxName]         = useState('');
  const [boxLocation, setBoxLocation] = useState('');
  const [boxNotes, setBoxNotes]       = useState('');

  // Item fields
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty,  setItemQty]  = useState('1');

  useEffect(() => subscribe(() => setTick(t => t + 1)), []);

  const box = boxes.find(b => b.id === boxId);
  if (!box) return <div style={{ padding: 40, textAlign: 'center', color: colors.text2 }}>Box not found.</div>;

  function openEditBox() {
    setBoxName(box.name); setBoxLocation(box.location || ''); setBoxNotes(box.notes || '');
    setShowEditBox(true);
  }

  function handleSaveBox() {
    if (!boxName.trim()) return alert('Box name required.');
    updateBox(boxId, { name: boxName.trim(), location: boxLocation.trim(), notes: boxNotes.trim() });
    setShowEditBox(false);
  }

  function handleAddItem() {
    if (!itemName.trim()) return alert('Item name required.');
    addItemToBox(boxId, { name: itemName.trim(), desc: itemDesc.trim(), qty: parseInt(itemQty)||1 });
    setShowAddItem(false); setItemName(''); setItemDesc(''); setItemQty('1');
  }

  function openEditItem(item) {
    setItemName(item.name); setItemDesc(item.desc||''); setItemQty(String(item.qty||1));
    setShowEditItem(item);
  }

  function handleSaveItem() {
    if (!itemName.trim()) return alert('Item name required.');
    updateItem(boxId, showEditItem.id, { name: itemName.trim(), desc: itemDesc.trim(), qty: parseInt(itemQty)||1 });
    setShowEditItem(null);
  }

  function handleDeleteBox() {
    if (!confirm(`Delete box "${box.name}" and all its items?`)) return;
    deleteBox(boxId);
    navigate('/boxes');
  }

  async function handleShowQR() {
    const url = await QRCode.toDataURL(`BOX_TRACKER:${box.id}`, { width: 300, margin: 2 });
    setQrUrl(url);
    setShowQR(true);
  }

  function handlePrintQR() {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>BoxTracker QR - ${box.id}</title>
      <style>body{font-family:monospace;text-align:center;padding:40px;background:#fff;color:#000;}
      h2{font-size:18px;margin-bottom:4px;}p{font-size:13px;color:#555;margin-bottom:16px;}</style>
      </head><body>
      <h2>${box.name}</h2>
      <p>${box.id}${box.location ? ' · ' + box.location : ''}</p>
      <img src="${qrUrl}" style="width:250px;height:250px;" />
      <p style="margin-top:16px;font-size:11px;">BoxTracker</p>
      <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.accent3, marginBottom: 4 }}>{box.id}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{box.name}</div>
          <div style={{ fontSize: 13, color: colors.text2, marginTop: 4 }}>📍 {box.location || 'No location'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleShowQR} style={{ background: colors.surface, border: `1px solid ${colors.border}`,
            color: colors.text2, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
            QR
          </button>
          <button onClick={openEditBox} style={{ background: colors.surface, border: `1px solid ${colors.border}`,
            color: colors.text2, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
            ✏️ Edit
          </button>
          <button onClick={handleDeleteBox} style={{ background: 'transparent', border: `1px solid ${colors.red}`,
            color: colors.red, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>
            🗑
          </button>
        </div>
      </div>

      {box.notes ? (
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: colors.text2, marginBottom: 20 }}>
          {box.notes}
        </div>
      ) : null}

      {/* Items */}
      <SectionHeading title={`Items (${box.items.length})`} right={
        <button onClick={() => { setItemName(''); setItemDesc(''); setItemQty('1'); setShowAddItem(true); }} style={{
          background: colors.accent2, color: '#0d0d0d', border: 'none',
          borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>＋ Add Item</button>
      } />

      {box.items.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ color: colors.text2 }}>No items yet. Add your first item!</div>
        </Card>
      ) : (
        box.items.map(item => (
          <Card key={item.id} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
              {item.desc ? <div style={{ fontSize: 13, color: colors.text2, marginBottom: 4 }}>{item.desc}</div> : null}
              <Badge label={`qty: ${item.qty || 1}`} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
              <button onClick={() => openEditItem(item)} style={{ background: 'none', border: `1px solid ${colors.border}`,
                color: colors.text2, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>✏️</button>
              <button onClick={() => { if(confirm(`Delete "${item.name}"?`)) deleteItem(boxId, item.id); }}
                style={{ background: 'none', border: `1px solid ${colors.red}`,
                color: colors.red, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>🗑</button>
            </div>
          </Card>
        ))
      )}

      {/* Edit Box Modal */}
      <Modal visible={showEditBox} onClose={() => setShowEditBox(false)} title="EDIT BOX">
        <FormField label="Box Name *" value={boxName}     onChange={setBoxName}     placeholder="Box name" />
        <FormField label="Location"   value={boxLocation} onChange={setBoxLocation} placeholder="e.g. Garage" />
        <FormField label="Notes"      value={boxNotes}    onChange={setBoxNotes}    placeholder="Notes..." multiline />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <GhostButton   label="Cancel" onClick={() => setShowEditBox(false)} />
          <PrimaryButton label="Save"   onClick={handleSaveBox} />
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal visible={showAddItem} onClose={() => setShowAddItem(false)} title="ADD ITEM">
        <FormField label="Item Name *"   value={itemName} onChange={setItemName} placeholder="e.g. Winter jacket" />
        <FormField label="Description"   value={itemDesc} onChange={setItemDesc} placeholder="Optional description" />
        <FormField label="Quantity"      value={itemQty}  onChange={setItemQty}  type="number" placeholder="1" />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <GhostButton   label="Cancel"   onClick={() => setShowAddItem(false)} />
          <PrimaryButton label="Add Item" onClick={handleAddItem} />
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal visible={!!showEditItem} onClose={() => setShowEditItem(null)} title="EDIT ITEM">
        <FormField label="Item Name *" value={itemName} onChange={setItemName} placeholder="Item name" />
        <FormField label="Description" value={itemDesc} onChange={setItemDesc} placeholder="Description" />
        <FormField label="Quantity"    value={itemQty}  onChange={setItemQty}  type="number" placeholder="1" />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <GhostButton   label="Cancel" onClick={() => setShowEditItem(null)} />
          <PrimaryButton label="Save"   onClick={handleSaveItem} />
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal visible={showQR} onClose={() => setShowQR(false)} title="QR CODE">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{box.name}</div>
          <div style={{ fontSize: 13, color: colors.text2, marginBottom: 16 }}>{box.id}</div>
          {qrUrl && <img src={qrUrl} alt="QR Code" style={{ width: 240, height: 240, borderRadius: 8 }} />}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <GhostButton   label="Close" onClick={() => setShowQR(false)} />
            <PrimaryButton label="🖨️ Print" onClick={handlePrintQR} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
