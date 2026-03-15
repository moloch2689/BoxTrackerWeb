// ─────────────────────────────────────────────────────────────
//  store.js  —  App state (mirrors the Android store)
// ─────────────────────────────────────────────────────────────
import { syncBoxToCloud, deleteBoxFromCloud } from './firestore';

export let boxes = [];
let _householdCode = null;
let _listeners = [];

export function getHouseholdCode() { return _householdCode; }

export function setHouseholdCode(code) { _householdCode = code; }

export function subscribe(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function notify() {
  _listeners.forEach(fn => fn([...boxes]));
}

export function setBoxesFromCloud(cloudBoxes) {
  boxes = [...cloudBoxes];
  notify();
}

export function generateBoxId() {
  let max = 0;
  boxes.forEach(b => {
    const n = parseInt(b.id.replace(/^BOX/, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return 'BOX' + String(max + 1).padStart(3, '0');
}

export function generateItemId() {
  return 'IT' + Date.now();
}

export function createBox({ name, location, notes }) {
  const box = {
    id: generateBoxId(), name, location, notes,
    items: [], created: new Date().toISOString(),
  };
  boxes = [...boxes, box];
  notify();
  if (_householdCode) syncBoxToCloud(_householdCode, box).catch(console.warn);
  return box;
}

export function updateBox(boxId, { name, location, notes }) {
  const box = boxes.find(b => b.id === boxId);
  if (!box) return;
  box.name = name; box.location = location; box.notes = notes;
  boxes = [...boxes];
  notify();
  if (_householdCode) syncBoxToCloud(_householdCode, box).catch(console.warn);
}

export function addItemToBox(boxId, { name, desc, qty }) {
  const box = boxes.find(b => b.id === boxId);
  if (!box) return null;
  const item = { id: generateItemId(), name, desc, qty };
  box.items.push(item);
  boxes = [...boxes];
  notify();
  if (_householdCode) syncBoxToCloud(_householdCode, box).catch(console.warn);
  return item;
}

export function updateItem(boxId, itemId, { name, desc, qty, photo }) {
  const box = boxes.find(b => b.id === boxId);
  if (!box) return;
  const item = box.items.find(i => i.id === itemId);
  if (!item) return;
  item.name = name; item.desc = desc; item.qty = qty;
  if (photo !== undefined) item.photo = photo;
  boxes = [...boxes];
  notify();
  if (_householdCode) syncBoxToCloud(_householdCode, box).catch(console.warn);
}

export function deleteBox(boxId) {
  boxes = boxes.filter(b => b.id !== boxId);
  notify();
  if (_householdCode) deleteBoxFromCloud(_householdCode, boxId).catch(console.warn);
}

export function deleteItem(boxId, itemId) {
  const box = boxes.find(b => b.id === boxId);
  if (!box) return;
  box.items = box.items.filter(i => i.id !== itemId);
  boxes = [...boxes];
  notify();
  if (_householdCode) syncBoxToCloud(_householdCode, box).catch(console.warn);
}

export function searchAll(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = [];
  boxes.forEach(box => {
    if (box.name.toLowerCase().includes(q) || box.location?.toLowerCase().includes(q))
      results.push({ type: 'box', box });
    box.items.forEach(item => {
      if (item.name.toLowerCase().includes(q) || item.desc?.toLowerCase().includes(q))
        results.push({ type: 'item', item, box });
    });
  });
  return results;
}

export function getStats() {
  return {
    totalBoxes: boxes.length,
    totalItems: boxes.reduce((s, b) => s + b.items.length, 0),
    totalQty:   boxes.reduce((s, b) => s + b.items.reduce((ss, i) => ss + (i.qty || 1), 0), 0),
  };
}

export function exportToCSV() {
  const header = ['Box ID','Box Name','Location','Notes','Item Name','Item Description','Item Qty'];
  const f = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const rows = [header.map(f).join(',')];
  boxes.forEach(box => {
    if (box.items.length === 0) {
      rows.push([box.id, box.name, box.location||'', box.notes||'','','',''].map(f).join(','));
    } else {
      box.items.forEach(item => {
        rows.push([box.id, box.name, box.location||'', box.notes||'', item.name, item.desc||'', item.qty||1].map(f).join(','));
      });
    }
  });
  return rows.join('\n');
}

export function exportToJSON() {
  return JSON.stringify({ exported: new Date().toISOString(), version: 1, boxes }, null, 2);
}
