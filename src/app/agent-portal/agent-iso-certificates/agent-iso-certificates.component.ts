import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { IsoCertificate, IsoCertificateDocument, IsoCustomField } from '../../../models/agent.model';
import { IconComponent, IconName } from '../ui/icon.component';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { createXlsx } from '../ui/create-xlsx';
import { printReport } from '../ui/print-report';
import { saveBlob } from '../ui/save-blob';

type SortField = keyof IsoCertificate | string;
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
  private isoTableElement?: HTMLElement;
  private isoHorizontalScrollElement?: HTMLElement;
  private isoHorizontalContentElement?: HTMLElement;
  private horizontalTrackResizeObserver?: ResizeObserver;

  @ViewChild('isoTable') set isoTableRef(ref: ElementRef<HTMLElement> | undefined) {
    this.isoTableElement = ref?.nativeElement;
    this.connectHorizontalTrackObserver();
  }

  @ViewChild('isoHorizontalScroll') set isoHorizontalScrollRef(ref: ElementRef<HTMLElement> | undefined) {
    this.isoHorizontalScrollElement = ref?.nativeElement;
    this.connectHorizontalTrackObserver();
  }

  @ViewChild('isoHorizontalContent') set isoHorizontalContentRef(ref: ElementRef<HTMLElement> | undefined) {
    this.isoHorizontalContentElement = ref?.nativeElement;
    this.connectHorizontalTrackObserver();
  }

  readonly certificates = signal<IsoCertificate[]>([]);
  readonly knownIsoTypes = signal<string[]>([]);
  readonly customFields = signal<IsoCustomField[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editorErrors = signal<Record<string, string>>({});
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
    { field: 'partyName', label: 'Firm name' }, { field: 'isoType', label: 'ISO type' }, { field: 'address', label: 'Address' }, { field: 'city', label: 'City' },
    { field: 'initialRegistrationDate', label: 'Date of certification' }, { field: 'expiryDate', label: 'Date of expiry' },
    { field: 'firstSurveillanceDue', label: '1st surveillance' }, { field: 'secondSurveillanceDue', label: '2nd surveillance' },
    { field: 'certificateNumber', label: 'Certificate no.' }, { field: 'certifyingBody', label: 'Certification body' },
    { field: 'consultant', label: 'Consultant' }, { field: 'phone', label: 'Phone' }, { field: 'email', label: 'Email' },
    { field: 'gst', label: 'GST' }, { field: 'totalPayment', label: 'Total payment' }, { field: 'paymentReceived', label: 'Received' },
    { field: 'balance', label: 'Balance' }, { field: 'remarks', label: 'Remarks' }, { field: 'onlineStatus', label: 'Online status' },
  ];
  /** These certificate details are structural to the portfolio and always remain visible. */
  readonly mandatoryColumns = this.standardColumns;

  constructor(private readonly data: AgentDataService) {}

  ngOnInit(): void {
    try { this.columnWidths = JSON.parse(localStorage.getItem('agent-iso-certificate-column-widths') || '{}'); } catch { this.columnWidths = {}; }
    this.load(); this.loadColumns();
  }
  ngOnDestroy(): void { this.horizontalTrackResizeObserver?.disconnect(); this.clearDocumentPreviews(); }
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
    const defaults: Record<string, number> = { partyName: 230, isoType: 210, address: 230, city: 150, initialRegistrationDate: 175, expiryDate: 155, firstSurveillanceDue: 165, secondSurveillanceDue: 165, certificateNumber: 180, certifyingBody: 210, consultant: 180, phone: 145, email: 220, gst: 160, totalPayment: 140, paymentReceived: 140, balance: 140, remarks: 220, onlineStatus: 140, actions: 76 };
    return this.columnWidths[key] || defaults[key] || 190;
  }
  get tableWidth(): number {
    const fixed = [...this.standardColumns.map(column => column.field), 'actions'];
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
  /** Sizes the compact track to exactly the table's usable horizontal range. */
  private connectHorizontalTrackObserver(): void {
    this.horizontalTrackResizeObserver?.disconnect();
    const table = this.isoTableElement;
    const track = this.isoHorizontalScrollElement;
    const content = this.isoHorizontalContentElement;
    if (!table || !track || !content) return;

    const update = () => {
      const tableRange = Math.max(0, table.scrollWidth - table.clientWidth);
      content.style.width = `${track.clientWidth + tableRange}px`;
      if (tableRange > 0) track.scrollLeft = table.scrollLeft;
    };

    if (typeof ResizeObserver === 'undefined') { update(); return; }
    this.horizontalTrackResizeObserver = new ResizeObserver(update);
    this.horizontalTrackResizeObserver.observe(table);
    this.horizontalTrackResizeObserver.observe(track);
    update();
  }
  /**
   * Keeps the compact horizontal track proportionate to the table viewport. The track is shorter
   * than the table, so copying raw scrollLeft would leave a dead section after the table ended.
   */
  syncHorizontalScroll(source: HTMLElement, target: HTMLElement): void {
    const sourceRange = source.scrollWidth - source.clientWidth;
    const targetRange = target.scrollWidth - target.clientWidth;
    if (sourceRange <= 0 || targetRange <= 0) return;

    const next = (source.scrollLeft / sourceRange) * targetRange;
    if (Math.abs(target.scrollLeft - next) > 0.5) target.scrollLeft = next;
  }
  /** The compact track is visual only; retain native touchpad and Shift+wheel horizontal panning. */
  panHorizontalWheel(event: WheelEvent, table: HTMLElement): void {
    const delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    if (!delta || table.scrollWidth <= table.clientWidth) return;
    // Keep horizontal touchpad swipes inside the data grid instead of letting Chromium navigate.
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    const next = Math.max(0, Math.min(table.scrollWidth - table.clientWidth, table.scrollLeft + delta));
    if (next === table.scrollLeft) return;
    table.scrollLeft = next;
  }

  openAdd(): void { this.clearDocumentPreviews(); this.editor.set({ isoType: '', partyName: '', onlineStatus: false, customFields: {} }); this.customIsoType = ''; this.documents.set([]); this.queuedDocuments.set([]); this.partySuggestions.set([]); this.editorErrors.set({}); this.error.set(''); }
  openEdit(row: IsoCertificate): void {
    this.editor.set({ ...row, customFields: { ...(row.customFields ?? {}) } }); this.customIsoType = ISO_TYPES.includes(row.isoType ?? '') ? '' : row.isoType ?? '';
    if (this.customIsoType) this.editor.update(value => value ? { ...value, isoType: 'OTHER' } : value);
    this.queuedDocuments.set([]); this.partySuggestions.set([]); this.loadDocuments(row.id); this.editorErrors.set({}); this.error.set('');
  }
  closeEditor(): void { if (!this.saving()) { this.clearDocumentPreviews(); this.editor.set(null); this.partySuggestions.set([]); this.queuedDocuments.set([]); this.editorErrors.set({}); } }
  save(): void {
    const value = this.editor();
    if (!value || this.saving()) return;
    if (!this.validateEditor(value)) return;
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
    this.exportCertificates(format, selected);
  }
  exportAll(format: ExportFormat): void { this.exportCertificates(format, this.certificates()); }
  private exportCertificates(format: ExportFormat, certificates: IsoCertificate[]): void {
    if (!certificates.length || this.printing() || this.exporting()) return;
    if (format === 'excel') {
      this.exporting.set('excel');
      const headings = [
        'Firm name', 'Address', 'City', 'Date of certification', 'Date of expiry', '1st surveillance', '2nd surveillance',
        'Certificate number', 'Certification body', 'Consultant', 'Phone', 'Email', 'GST', 'Total payment', 'Received',
        'Balance', 'Remarks', 'Online status', 'ISO type', 'Reference', 'Goods & services', ...this.customFields().map(field => field.label),
      ];
      const rows = certificates.map(certificate => [
        certificate.partyName, certificate.address, certificate.city, certificate.initialRegistrationDate, certificate.expiryDate,
        certificate.firstSurveillanceDue, certificate.secondSurveillanceDue, certificate.certificateNumber, certificate.certifyingBody,
        certificate.consultant, certificate.phone, certificate.email, certificate.gst, certificate.totalPayment,
        certificate.paymentReceived, certificate.balance, certificate.remarks, certificate.onlineStatus ? 'Live' : 'Not live',
        certificate.isoType, certificate.reference, certificate.goodsServices, ...this.customFields().map(field => certificate.customFields?.[field.fieldKey] ?? ''),
      ]);
      saveBlob(createXlsx([headings, ...rows]), 'iso-certificate-portfolio.xlsx');
      this.exporting.set(null);
      return;
    }
    this.printing.set(true); this.error.set('');
    printReport(this.printHtml(certificates)).catch(() => this.error.set('Could not prepare the download. Please try again.')).finally(() => this.printing.set(false));
  }
  private printHtml(certificates: IsoCertificate[]): string {
    const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
    const rows = certificates.map(certificate => `<tr>
      <td><strong>${esc(certificate.partyName)}</strong></td><td>${esc(certificate.address)}</td><td>${esc(certificate.city)}</td>
      <td>${esc(this.date(certificate.initialRegistrationDate))}</td><td>${esc(this.date(certificate.expiryDate))}</td>
      <td>${esc(this.date(certificate.firstSurveillanceDue))}</td><td>${esc(this.date(certificate.secondSurveillanceDue))}</td>
      <td>${esc(certificate.certificateNumber)}</td><td>${esc(certificate.certifyingBody)}</td><td>${esc(certificate.consultant)}</td>
      <td>${esc(certificate.phone)}</td><td>${esc(certificate.email)}</td><td>${esc(certificate.gst)}</td>
      <td>${esc(certificate.totalPayment)}</td><td>${esc(certificate.paymentReceived)}</td><td>${esc(certificate.balance)}</td>
      <td>${esc(certificate.remarks)}</td><td>${certificate.onlineStatus ? 'Live' : 'Not live'}</td>
      <td>${esc(certificate.isoType)}</td><td>${esc(certificate.reference)}</td><td>${esc(certificate.goodsServices)}</td>
    </tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>ISO certificate portfolio</title><style>@page{size:A3 landscape;margin:11mm 9mm}*{box-sizing:border-box}body{font:8pt Arial,sans-serif;color:#202a36;margin:0}header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1f4e79;padding-bottom:10px;margin-bottom:14px}h1{font-size:18pt;margin:0 0 4px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{background:#1f4e79;color:white;text-align:left;padding:5px;font-size:6.5pt;line-height:1.2}td{padding:5px;border-bottom:1px solid #d8dde4;vertical-align:top;overflow-wrap:anywhere;font-size:7pt;line-height:1.3}tr{break-inside:avoid;page-break-inside:avoid}footer{margin-top:10px;border-top:1px solid #d8dde4;padding-top:6px;color:#596575;font-size:7pt}</style></head><body><header><div><h1>ISO Certificate Portfolio</h1><div>${certificates.length} selected certificate${certificates.length === 1 ? '' : 's'}</div></div></header><table><thead><tr><th>Firm name</th><th>Address</th><th>City</th><th>Certification</th><th>Expiry</th><th>1st surveillance</th><th>2nd surveillance</th><th>Certificate no.</th><th>Certification body</th><th>Consultant</th><th>Phone</th><th>Email</th><th>GST</th><th>Total payment</th><th>Received</th><th>Balance</th><th>Remarks</th><th>Online</th><th>ISO type</th><th>Reference</th><th>Goods &amp; services</th></tr></thead><tbody>${rows}</tbody></table><footer>Generated ${esc(new Date().toLocaleDateString('en-IN'))}.</footer></body></html>`;
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
  onCertificationDateChanged(initialRegistrationDate: string): void {
    const record = this.editor();
    if (!record) return;
    this.editor.update(current => current ? {
      ...current,
      initialRegistrationDate,
      firstSurveillanceDue: this.addYears(initialRegistrationDate, 1),
      secondSurveillanceDue: this.addYears(initialRegistrationDate, 2),
      expiryDate: current.expiryDate || this.addYears(initialRegistrationDate, 3),
    } : null);
  }
  editorError(field: string): string | undefined { return this.editorErrors()[field]; }
  clearEditorFieldError(field: string): void {
    if (!this.editorErrors()[field]) return;
    this.editorErrors.update(errors => { const { [field]: removed, ...remaining } = errors; return remaining; });
  }
  private validateEditor(value: Partial<IsoCertificate>): boolean {
    const errors: Record<string, string> = {};
    if (!value.partyName?.trim() && !value.certificateNumber?.trim()) {
      errors['partyName'] = 'Enter a firm name or certificate number.';
      errors['certificateNumber'] = 'Enter a firm name or certificate number.';
    }
    if (value.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) errors['email'] = 'Enter a valid email address.';
    if (value.phone?.trim() && !/^[0-9+()\s-]{7,20}$/.test(value.phone.trim())) errors['phone'] = 'Enter a valid phone number.';
    if (value.gst?.trim() && !/^[0-9A-Z]{15}$/i.test(value.gst.trim())) errors['gst'] = 'GST must be a 15-character GSTIN.';
    this.editorErrors.set(errors);
    return Object.keys(errors).length === 0;
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
  tableValue(certificate: IsoCertificate, field: string): string {
    if (field === 'initialRegistrationDate') return this.date(certificate.initialRegistrationDate);
    if (field === 'expiryDate') return this.date(certificate.expiryDate);
    if (field === 'firstSurveillanceDue') return this.date(certificate.firstSurveillanceDue);
    if (field === 'secondSurveillanceDue') return this.date(certificate.secondSurveillanceDue);
    if (field === 'onlineStatus') return certificate.onlineStatus ? 'Live' : 'Not live';
    const value = (certificate as unknown as Record<string, unknown>)[field];
    return value == null || value === '' ? '—' : String(value);
  }
  date(value?: string): string { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }
  expiryTone(value?: string): string { if (!value) return ''; const days = (new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86400000; return days < 0 ? 'overdue' : days <= 90 ? 'due' : ''; }
}
