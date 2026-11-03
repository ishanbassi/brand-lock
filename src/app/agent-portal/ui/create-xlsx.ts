const encoder = new TextEncoder();

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/** Creates a small, dependency-free XLSX workbook for portal exports. */
export function createXlsx(rows: unknown[][]): Blob {
  const lastColumn = columnName(Math.max(1, ...rows.map(row => row.length)));
  const cells = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${columnName(columnIndex + 1)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`).join('')}</row>`).join('');
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastColumn}${Math.max(1, rows.length)}"/><sheetData>${cells}</sheetData></worksheet>`;
  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>') },
    { name: '_rels/.rels', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
    { name: 'xl/workbook.xml', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="ISO Certificates" sheetId="1" r:id="rId1"/></sheets></workbook>') },
    { name: 'xl/_rels/workbook.xml.rels', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>') },
    { name: 'xl/worksheets/sheet1.xml', data: xml(worksheet) },
  ];
  return new Blob([zipStore(entries)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function xml(value: string): Uint8Array { return encoder.encode(value); }
function escapeXml(value: unknown): string { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!); }
function columnName(index: number): string { let name = ''; for (let current = index; current > 0; current = Math.floor((current - 1) / 26)) name = String.fromCharCode(65 + ((current - 1) % 26)) + name; return name; }

function zipStore(entries: ZipEntry[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const local = new Uint8Array(30 + name.length + entry.data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true); localView.setUint32(14, crc, true); localView.setUint32(18, entry.data.length, true); localView.setUint32(22, entry.data.length, true); localView.setUint16(26, name.length, true);
    local.set(name, 30); local.set(entry.data, 30 + name.length); locals.push(local);
    const directory = new Uint8Array(46 + name.length);
    const directoryView = new DataView(directory.buffer);
    directoryView.setUint32(0, 0x02014b50, true); directoryView.setUint16(4, 20, true); directoryView.setUint16(6, 20, true); directoryView.setUint32(16, crc, true); directoryView.setUint32(20, entry.data.length, true); directoryView.setUint32(24, entry.data.length, true); directoryView.setUint16(28, name.length, true); directoryView.setUint32(42, offset, true);
    directory.set(name, 46); central.push(directory); offset += local.length;
  }
  const centralSize = central.reduce((total, entry) => total + entry.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, entries.length, true); endView.setUint16(10, entries.length, true); endView.setUint32(12, centralSize, true); endView.setUint32(16, offset, true);
  const archive = new Uint8Array(offset + centralSize + end.length);
  let position = 0;
  for (const entry of [...locals, ...central, end]) { archive.set(entry, position); position += entry.length; }
  return archive;
}

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes) { value ^= byte; for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (0xedb88320 & -(value & 1)); }
  return (value ^ 0xffffffff) >>> 0;
}
