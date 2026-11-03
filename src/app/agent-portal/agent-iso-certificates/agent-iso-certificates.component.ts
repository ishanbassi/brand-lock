import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { IsoCertificate, IsoCertificateDocument, IsoCustomField } from '../../../models/agent.model';
import { IconComponent, IconName } from '../ui/icon.component';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { createXlsx } from '../ui/create-xlsx';
import { printReport } from '../ui/print-report';
import { saveBlob } from '../ui/save-blob';

type SortField = 'isoType' | 'partyName' | 'reference' | 'certificateNumber' | 'initialRegistrationDate' | 'expiryDate';
interface PartySuggestion { name: string; address?: string; source: 'Portfolio proprietor' | 'ISO certificate'; }

const ISO_TYPES = [
  'ISO 9001:2015 — Quality management', 'ISO 14001:2015 — Environmental management', 'ISO 45001:2018 — Occupational health & safety',
  'ISO 22000:2018 — Food safety management', 'ISO/IEC 27001:2022 — Information security', 'ISO 13485:2016 — Medical devices quality',
  'ISO 50001:2018 — Energy management', 'ISO 22301:2019 — Business continuity', 'ISO/IEC 20000-1:2018 — IT service management',
  'ISO 37001:2016 — Anti-bribery management', 'ISO 37301:2021 — Compliance management', 'ISO 39001:2012 — Road traffic safety',
  'ISO 28000:2022 — Security management', 'ISO 41001:2018 — Facility management', 'ISO 55001:2024 — Asset management',
  'ISO 21001:2018 — Educational organisations', 'ISO 20121:2024 — Sustainable events', 'ISO 56001:2024 — Innovation management',
  'ISO 30401:2018 — Knowledge management', 'ISO 10002:2018 — Quality / complaints handling', 'ISO/IEC 17025:2017 — Testing & calibration laboratories',
  'IATF 16949:2016 — Automotive quality management', 'OTHER',
];

@Component({
  selector: 'app-agent-iso-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ExportMenuComponent],
  templateUrl: './agent-iso-certificates.component.html',
  styleUrl: './agent-iso-certificates.component.scss',
})
export class AgentIsoCertificatesComponent implements OnInit, OnDestroy {
  readonly certificates = signal<IsoCertificate[]>([]);
  readonly knownIsoTypes = signal<string[]>([]);
  readonly customFields = signal<IsoCustomField[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editor = signal<Partial<IsoCertificate> | null>(null);
  readonly saving = signal(false);
  readonly showColumns = signal(false);
  readonly creatingColumn = signal(false);
  readonly columnPickerError = signal('');
  readonly deletingId = signal<number | null>(null);
  readonly selectedIds = new Set<number>();
  private readonly selectedCertificates = new Map<number, IsoCertificate>();
  readonly confirmBulkDelete = signal(false);
  readonly bulkDeleting = signal(false);
  readonly printing = signal(false);
  readonly exporting = signal<ExportFormat | null>(null);
  readonly partySuggestions = signal<PartySuggestion[]>([]);
  readonly partySearching = signal(false);
  readonly documents = signal<IsoCertificateDocument[]>([]);
  readonly queuedDocuments = signal<File[]>([]);
  readonly documentsLoading = signal(false);
  readonly documentsDragging = signal(false);
  readonly documentPreviewUrls = signal<Record<number, string>>({});
  private previewBatch = 0;

  search = '';
  isoTypeFilter = '';
  sort: string = 'partyName';
  direction: 'asc' | 'desc' = 'asc';
  newColumn = '';
  newColumnType: IsoCustomField['dataType'] = 'TEXT';
  fieldSearch = '';
  fieldPickerTab: 'create' | 'existing' = 'create';
  customIsoType = '';
  readonly isoTypeOptions = ISO_TYPES;
  columnWidths: Record<string, number> = {};
  private resizeState: { key: string; pointerId: number; startX: number; startWidth: number } | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private partyTimer: ReturnType<typeof setTimeout> | null = null;
  readonly standardColumns: { field: SortField; label: string }[] = [
    { field: 'partyName', label: 'Party name' }, { field: 'isoType', label: 'ISO type' },
    { field: 'reference', label: 'Reference' }, { field: 'certificateNumber', label: 'Certificate no.' },
    { field: 'initialRegistrationDate', label: 'Initial registration' }, { field: 'expiryDate', label: 'Expiry' },
  ];
  /** These certificate details are structural to the portfolio and always remain visible. */
  readonly mandatoryColumns = [
    { field: 'partyName', label: 'Party name' }, { field: 'isoType', label: 'ISO type' },
    { field: 'reference', label: 'Reference' }, { field: 'certificateNumber', label: 'Certificate no.' },
    { field: 'initialRegistrationDate', label: 'Initial registration' }, { field: 'expiryDate', label: 'Expiry' },
    { field: 'address', label: 'Address' }, { field: 'goodsServices', label: 'Goods & services' },
    { field: 'certifyingBody', label: 'Certifying body' }, { field: 'paymentReceived', label: 'Payment received' },
    { field: 'remarks', label: 'Remarks' }, { field: 'firstSurveillanceDue', label: '1st surveillance due' },
    { field: 'secondSurveillanceDue', label: '2nd surveillance due' },
  ];

  constructor(private readonly data: AgentDataService) {}

  ngOnInit(): void {
    try { this.columnWidths = JSON.parse(localStorage.getItem('agent-iso-certificate-column-widths') || '{}'); } catch { this.columnWidths = {}; }
    this.load(); this.loadColumns();
  }
  ngOnDestroy(): void { this.clearDocumentPreviews(); }
  get shownCustomFields(): IsoCustomField[] { return this.customFields().filter(f => f.showInList); }
  get filteredCustomFields(): IsoCustomField[] {
    const query = this.fieldSearch.trim().toLowerCase();
    return query ? this.customFields().filter(field => field.label.toLowerCase().includes(query)) : this.customFields();
  }
  get filteredMandatoryColumns(): { field: string; label: string }[] {
    const query = this.fieldSearch.trim().toLowerCase();
    return query ? this.mandatoryColumns.filter(column => column.label.toLowerCase().includes(query)) : this.mandatoryColumns;
  }
  get allCustomFieldsShown(): boolean { const fields = this.customFields(); return fields.length > 0 && fields.every(field => field.showInList); }
  get isoTypes(): string[] { return this.knownIsoTypes(); }

  load(): void {
    this.loading.set(true); this.error.set('');
    this.data.getIsoCertificates({ q: this.search, isoType: this.isoTypeFilter, sort: this.sort, dir: this.direction }).subscribe({
      next: rows => {
        this.certificates.set(rows);
        this.knownIsoTypes.update(types => [...new Set([...types, ...rows.map(x => x.isoType?.trim()).filter((x): x is string => !!x)])].sort());
        this.loading.set(false);
      },
      error: () => { this.certificates.set([]); this.error.set('Could not load ISO certificates. Please try again.'); this.loading.set(false); },
    });
  }
  private loadColumns(): void { this.data.getIsoCustomFields().subscribe({ next: f => this.customFields.set(f), error: () => this.customFields.set([]) }); }
  onSearch(): void { this.clearSelection(); if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => this.load(), 300); }
  changeFilter(): void { this.clearSelection(); this.load(); }
  sortBy(field: string): void { this.direction = this.sort === field ? (this.direction === 'asc' ? 'desc' : 'asc') : 'asc'; this.sort = field; this.load(); }
  sortIcon(field: string): 'sort' | 'sort-asc' | 'sort-desc' { return this.sort !== field ? 'sort' : this.direction === 'asc' ? 'sort-asc' : 'sort-desc'; }
  columnWidth(key: string): number {
    const defaults: Record<string, number> = { isoType: 210, partyName: 230, reference: 165, certificateNumber: 180, initialRegistrationDate: 160, expiryDate: 145, address: 230, goodsServices: 250, certifyingBody: 210, paymentReceived: 165, remarks: 220, firstSurveillanceDue: 165, secondSurveillanceDue: 165, actions: 82 };
    return this.columnWidths[key] || defaults[key] || 190;
  }
  get tableWidth(): number {
    const fixed = ['isoType', 'partyName', 'reference', 'certificateNumber', 'initialRegistrationDate', 'expiryDate', 'address', 'goodsServices', 'certifyingBody', 'paymentReceived', 'remarks', 'firstSurveillanceDue', 'secondSurveillanceDue', 'actions'];
    return fixed.reduce((total, key) => total + this.columnWidth(key), 0) + this.shownCustomFields.reduce((total, field) => total + this.columnWidth(`custom:${field.fieldKey}`), 0);
  }
  startResize(event: PointerEvent, key: string): void {
    event.preventDefault(); event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeState = { key, pointerId: event.pointerId, startX: event.clientX, startWidth: this.columnWidth(key) };
  }
  resizeColumn(event: PointerEvent): void {
    if (!this.resizeState || event.pointerId !== this.resizeState.pointerId) return;
    const { key, startX, startWidth } = this.resizeState;
    this.columnWidths = { ...this.columnWidths, [key]: Math.max(100, Math.min(620, startWidth + event.clientX - startX)) };
  }
  endResize(): void {
    if (!this.resizeState) return;
    this.resizeState = null;
    try { localStorage.setItem('agent-iso-certificate-column-widths', JSON.stringify(this.columnWidths)); } catch { /* Storage can be unavailable. */ }
  }
  resizeWithKeyboard(event: KeyboardEvent, key: string): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 16 : -16;
    this.columnWidths = { ...this.columnWidths, [key]: Math.max(100, Math.min(620, this.columnWidth(key) + delta)) };
    try { localStorage.setItem('agent-iso-certificate-column-widths', JSON.stringify(this.columnWidths)); } catch { /* Storage can be unavailable. */ }
  }

  openAdd(): void { this.clearDocumentPreviews(); this.editor.set({ isoType: '', partyName: '', customFields: {} }); this.customIsoType = ''; this.documents.set([]); this.queuedDocuments.set([]); this.partySuggestions.set([]); this.error.set(''); }
  openEdit(row: IsoCertificate): void {
    this.editor.set({ ...row, customFields: { ...(row.customFields ?? {}) } }); this.customIsoType = ISO_TYPES.includes(row.isoType ?? '') ? '' : row.isoType ?? '';
    if (this.customIsoType) this.editor.update(value => value ? { ...value, isoType: 'OTHER' } : value);
    this.queuedDocuments.set([]); this.partySuggestions.set([]); this.loadDocuments(row.id); this.error.set('');
  }
  closeEditor(): void { if (!this.saving()) { this.clearDocumentPreviews(); this.editor.set(null); this.partySuggestions.set([]); this.queuedDocuments.set([]); } }
  save(): void {
    const value = this.editor();
    if (!value || this.saving()) return;
    if (!value.partyName?.trim() && !value.certificateNumber?.trim()) { this.error.set('Enter a party name or certificate number to save this record.'); return; }
    this.saving.set(true); this.error.set('');
    const payload = { ...value, isoType: value.isoType === 'OTHER' ? this.customIsoType.trim() : value.isoType };
    const request = value.id ? this.data.updateIsoCertificate(value.id, payload) : this.data.addIsoCertificate(payload);
    request.subscribe({ next: saved => this.uploadQueuedDocuments(saved), error: err => { this.saving.set(false); this.error.set(err?.error?.message || 'Could not save this certificate.'); } });
  }
  confirmDelete(id: number): void { this.deletingId.set(id); }
  delete(): void { const id = this.deletingId(); if (!id) return; this.data.deleteIsoCertificate(id).subscribe({ next: () => { this.deletingId.set(null); this.load(); }, error: () => { this.deletingId.set(null); this.error.set('Could not remove this certificate.'); } }); }
  isSelected(certificate: IsoCertificate): boolean { return certificate.id != null && this.selectedIds.has(certificate.id); }
  isPageSelected(): boolean {
    const rows = this.certificates().filter((certificate): certificate is IsoCertificate & { id: number } => certificate.id != null);
    return rows.length > 0 && rows.every(certificate => this.selectedIds.has(certificate.id));
  }
  isPagePartlySelected(): boolean {
    const rows = this.certificates().filter((certificate): certificate is IsoCertificate & { id: number } => certificate.id != null);
    return rows.some(certificate => this.selectedIds.has(certificate.id)) && !this.isPageSelected();
  }
  togglePageSelection(): void {
    const rows = this.certificates().filter((certificate): certificate is IsoCertificate & { id: number } => certificate.id != null);
    const remove = this.isPageSelected();
    for (const certificate of rows) this.setSelected(certificate, !remove);
  }
  toggleSelection(certificate: IsoCertificate): void {
    if (certificate.id == null) return;
    this.setSelected(certificate, !this.selectedIds.has(certificate.id));
  }
  private setSelected(certificate: IsoCertificate, selected: boolean): void {
    if (certificate.id == null) return;
    if (selected) { this.selectedIds.add(certificate.id); this.selectedCertificates.set(certificate.id, certificate); }
    else { this.selectedIds.delete(certificate.id); this.selectedCertificates.delete(certificate.id); }
  }
  clearSelection(): void { this.selectedIds.clear(); this.selectedCertificates.clear(); }
  openBulkDeleteConfirmation(): void { if (this.selectedIds.size && !this.bulkDeleting()) this.confirmBulkDelete.set(true); }
  cancelBulkDelete(): void { if (!this.bulkDeleting()) this.confirmBulkDelete.set(false); }
  deleteSelected(): void {
    const selected = [...this.selectedCertificates.values()].filter((certificate): certificate is IsoCertificate & { id: number } => certificate.id != null);
    if (!selected.length || this.bulkDeleting()) return;
    this.bulkDeleting.set(true); this.error.set('');
    forkJoin(selected.map(certificate => this.data.deleteIsoCertificate(certificate.id).pipe(map(() => certificate.id), catchError(() => of(null))))).subscribe({
      next: results => {
        const deleted = new Set(results.filter((id): id is number => id != null));
        const failed = selected.length - deleted.size;
        this.certificates.update(rows => rows.filter(certificate => !deleted.has(certificate.id ?? -1)));
        for (const id of deleted) { this.selectedIds.delete(id); this.selectedCertificates.delete(id); }
        this.confirmBulkDelete.set(false); this.bulkDeleting.set(false);
        if (failed) this.error.set(`${failed} selected certificate${failed === 1 ? '' : 's'} could not be deleted. Please try again.`);
      },
      error: () => { this.bulkDeleting.set(false); this.error.set('Could not delete the selected certificates. Please try again.'); },
    });
  }
  exportSelected(format: ExportFormat): void {
    const selected = [...this.selectedCertificates.values()];
    if (!selected.length || this.printing() || this.exporting()) return;
    if (format === 'excel') {
      this.exporting.set('excel');
      const headings = ['Party name', 'ISO type', 'Reference', 'Certificate number', 'Initial registration date', 'Expiry date', 'Address', 'Goods & services', 'Certifying body', 'Payment received', 'Remarks', '1st surveillance due', '2nd surveillance due', ...this.customFields().map(field => field.label)];
      const rows = selected.map(certificate => [certificate.partyName, certificate.isoType, certificate.reference, certificate.certificateNumber, certificate.initialRegistrationDate, certificate.expiryDate, certificate.address, certificate.goodsServices, certificate.certifyingBody, certificate.paymentReceived, certificate.remarks, certificate.firstSurveillanceDue, certificate.secondSurveillanceDue, ...this.customFields().map(field => certificate.customFields?.[field.fieldKey] ?? '')]);
      saveBlob(createXlsx([headings, ...rows]), 'iso-certificate-portfolio.xlsx');
      this.exporting.set(null);
      return;
    }
    this.printing.set(true); this.error.set('');
    printReport(this.printHtml(selected)).catch(() => this.error.set('Could not prepare the download. Please try again.')).finally(() => this.printing.set(false));
  }
  private printHtml(certificates: IsoCertificate[]): string {
    const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
    const rows = certificates.map(certificate => `<tr><td><strong>${esc(certificate.partyName)}</strong></td><td>${esc(certificate.isoType)}</td><td>${esc(certificate.certificateNumber)}</td><td>${esc(certificate.reference)}</td><td>${esc(certificate.certifyingBody)}</td><td>${esc(this.date(certificate.initialRegistrationDate))}</td><td>${esc(this.date(certificate.expiryDate))}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>ISO certificate portfolio</title><style>@page{size:A4 landscape;margin:14mm 12mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#202a36;margin:0}header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1f4e79;padding-bottom:10px;margin-bottom:18px}h1{font-size:20pt;margin:0 0 4px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{background:#1f4e79;color:white;text-align:left;padding:7px;font-size:8pt}td{padding:7px;border-bottom:1px solid #d8dde4;vertical-align:top;overflow-wrap:anywhere}tr{break-inside:avoid;page-break-inside:avoid}footer{margin-top:12px;border-top:1px solid #d8dde4;padding-top:7px;color:#596575;font-size:8pt}</style></head><body><header><div><h1>ISO Certificate Portfolio</h1><div>${certificates.length} selected certificate${certificates.length === 1 ? '' : 's'}</div></div></header><table><thead><tr><th>Party</th><th>ISO standard</th><th>Certificate no.</th><th>Reference</th><th>Certifying body</th><th>Registered</th><th>Expires</th></tr></thead><tbody>${rows}</tbody></table><footer>Generated ${esc(new Date().toLocaleDateString('en-IN'))}.</footer></body></html>`;
  }
  createColumn(): void {
    const label = this.newColumn.trim(); if (!label || this.creatingColumn()) return;
    this.columnPickerError.set('');
    this.creatingColumn.set(true);
    this.data.createIsoCustomField(label, this.newColumnType).subscribe({ next: f => { this.customFields.update(x => [...x, f]); this.newColumn = ''; this.creatingColumn.set(false); }, error: () => { this.columnPickerError.set('Could not add that column.'); this.creatingColumn.set(false); } });
  }
  toggleColumn(field: IsoCustomField): void {
    this.columnPickerError.set('');
    this.data.updateIsoCustomField(field.id, { showInList: !field.showInList }).subscribe({ next: updated => this.customFields.update(x => x.map(f => f.id === updated.id ? updated : f)), error: () => this.columnPickerError.set('Could not update column visibility.') });
  }
  toggleAllColumns(show: boolean): void {
    const changed = this.customFields().filter(field => field.showInList !== show);
    if (!changed.length) return;
    this.columnPickerError.set('');
    forkJoin(changed.map(field => this.data.updateIsoCustomField(field.id, { showInList: show }))).subscribe({
      next: updated => this.customFields.update(fields => fields.map(field => updated.find(item => item.id === field.id) ?? field)),
      error: () => this.columnPickerError.set('Could not update all column choices.'),
    });
  }
  setCustomValue(key: string, value: string): void {
    const record = this.editor();
    if (!record) return;
    record.customFields ??= {};
    record.customFields[key] = value;
  }
  recalculateSurveillanceDates(initialRegistrationDate: string): void {
    const record = this.editor();
    if (!record) return;
    this.editor.update(current => current ? {
      ...current,
      initialRegistrationDate,
      firstSurveillanceDue: this.addYears(initialRegistrationDate, 1),
      secondSurveillanceDue: this.addYears(initialRegistrationDate, 2),
      expiryDate: this.addYears(initialRegistrationDate, 3),
    } : null);
  }
  private addYears(date: string, years: number): string | undefined {
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    const targetYear = year + years;
    const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
    return `${targetYear}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
  }
  onIsoTypeChanged(): void { if (this.editor()?.isoType !== 'OTHER') this.customIsoType = ''; }
  onPartyInput(value: string): void {
    if (this.partyTimer) clearTimeout(this.partyTimer);
    const query = value.trim();
    if (query.length < 2) { this.partySuggestions.set([]); this.partySearching.set(false); return; }
    this.partySearching.set(true);
    this.partyTimer = setTimeout(() => forkJoin({
      proprietors: this.data.searchProprietors(query, 8), isoParties: this.data.getIsoPartySuggestions(query),
    }).subscribe({
      next: ({ proprietors, isoParties }) => {
        const choices: PartySuggestion[] = [
          ...isoParties.map(p => ({ name: p.name, address: p.address, source: 'ISO certificate' as const })),
          ...proprietors.map(p => ({ name: p.displayName, address: p.primaryAddress, source: 'Portfolio proprietor' as const })),
        ];
        const seen = new Set<string>();
        this.partySuggestions.set(choices.filter(choice => { const key = choice.name.trim().toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; }));
        this.partySearching.set(false);
      },
      error: () => { this.partySuggestions.set([]); this.partySearching.set(false); },
    }), 250);
  }
  selectParty(suggestion: PartySuggestion): void {
    this.editor.update(record => record ? { ...record, partyName: suggestion.name, address: suggestion.address || record.address || '' } : record);
    this.partySuggestions.set([]);
  }
  onDocumentFiles(files: FileList | null): void {
    const valid = Array.from(files ?? []).filter(file => file.size <= 25 * 1024 * 1024);
    if (valid.length !== (files?.length ?? 0)) this.error.set('Files larger than 25 MB were not added.');
    this.queuedDocuments.update(existing => [...existing, ...valid.filter(file => !existing.some(current => current.name === file.name && current.size === file.size))]);
    this.documentsDragging.set(false);
  }
  removeQueuedDocument(file: File): void { this.queuedDocuments.update(files => files.filter(current => current !== file)); }
  onDocumentsDrop(event: DragEvent): void { event.preventDefault(); this.onDocumentFiles(event.dataTransfer?.files ?? null); }
  private loadDocuments(id?: number): void {
    this.clearDocumentPreviews();
    if (!id) { this.documents.set([]); return; }
    this.documentsLoading.set(true);
    this.data.listIsoDocuments(id).subscribe({ next: docs => { this.documents.set(docs); this.loadImagePreviews(id, docs); this.documentsLoading.set(false); }, error: () => { this.documents.set([]); this.documentsLoading.set(false); } });
  }
  private uploadQueuedDocuments(certificate: IsoCertificate): void {
    const queue = this.queuedDocuments();
    if (!certificate.id || !queue.length) { this.saving.set(false); this.clearDocumentPreviews(); this.editor.set(null); this.load(); return; }
    forkJoin(queue.map(file => this.data.uploadIsoDocument(certificate.id!, file))).subscribe({
      next: () => { this.saving.set(false); this.clearDocumentPreviews(); this.editor.set(null); this.queuedDocuments.set([]); this.load(); },
      error: () => { this.saving.set(false); this.error.set('The certificate was saved, but one or more documents could not upload. Reopen it to try again.'); this.loadDocuments(certificate.id); },
    });
  }
  deleteDocument(document: IsoCertificateDocument): void {
    const certificateId = this.editor()?.id; if (!certificateId) return;
    this.data.deleteIsoDocument(certificateId, document.id).subscribe({ next: () => { this.revokeDocumentPreview(document.id); this.documents.update(docs => docs.filter(item => item.id !== document.id)); }, error: () => this.error.set('Could not remove that document.') });
  }
  documentPreviewUrl(documentId: number): string | undefined { return this.documentPreviewUrls()[documentId]; }
  isImageDocument(document: IsoCertificateDocument): boolean { return this.isImage(document.contentType, document.originalFileName); }
  documentIcon(document: IsoCertificateDocument): IconName { return this.fileIcon(document.originalFileName, document.contentType); }
  fileIcon(filename: string, contentType?: string): IconName {
    const descriptor = `${contentType ?? ''} ${filename}`.toLowerCase();
    if (descriptor.includes('pdf')) return 'file-pdf';
    if (/excel|spreadsheet|csv|\\.(xlsx|xls|csv)\b/.test(descriptor)) return 'file-excel';
    return 'documents';
  }
  openDocument(document: IsoCertificateDocument): void {
    const preview = this.documentPreviewUrl(document.id);
    if (this.isImageDocument(document) && preview) { window.open(preview, '_blank', 'noopener,noreferrer'); return; }
    this.downloadDocument(document);
  }
  downloadDocument(document: IsoCertificateDocument): void {
    const certificateId = this.editor()?.id;
    if (!certificateId) return;
    this.data.downloadIsoDocument(certificateId, document.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob); const link = globalThis.document.createElement('a');
        link.href = url; link.download = document.originalFileName || `iso-document-${document.id}`; link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('Could not download that document.'),
    });
  }
  private loadImagePreviews(certificateId: number, docs: IsoCertificateDocument[]): void {
    const batch = this.previewBatch;
    docs.filter(document => this.isImageDocument(document)).forEach(document => this.data.downloadIsoDocument(certificateId, document.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        if (batch !== this.previewBatch) { URL.revokeObjectURL(url); return; }
        this.documentPreviewUrls.update(urls => ({ ...urls, [document.id]: url }));
      },
    }));
  }
  private isImage(contentType?: string, filename = ''): boolean { return contentType?.startsWith('image/') === true || /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(filename); }
  private revokeDocumentPreview(documentId: number): void {
    const url = this.documentPreviewUrls()[documentId]; if (url) URL.revokeObjectURL(url);
    this.documentPreviewUrls.update(urls => { const { [documentId]: removed, ...rest } = urls; return rest; });
  }
  private clearDocumentPreviews(): void { this.previewBatch += 1; Object.values(this.documentPreviewUrls()).forEach(url => URL.revokeObjectURL(url)); this.documentPreviewUrls.set({}); }
  documentSize(bytes: number): string { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
  date(value?: string): string { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
  expiryTone(value?: string): string { if (!value) return ''; const days = (new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86400000; return days < 0 ? 'overdue' : days <= 90 ? 'due' : ''; }
}
