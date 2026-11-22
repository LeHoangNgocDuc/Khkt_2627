import type { UserFirmwareFile } from '../data/firmwareData';
const KEY='visionbot3d_session_firmware_v1';
export function loadFirmwareFiles():UserFirmwareFile[] {
  try {
    const raw=localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed:unknown=JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((f):f is UserFirmwareFile => f != null && typeof f === 'object' && typeof f.name === 'string' && (f.kind==='code'||f.kind==='bin')).slice(0,8);
  } catch { return []; }
}
export function saveFirmwareFiles(files:UserFirmwareFile[]) {
  try { localStorage.setItem(KEY,JSON.stringify(files.slice(0,8))); return true; }
  catch { return false; }
}
