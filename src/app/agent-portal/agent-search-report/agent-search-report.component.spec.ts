import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { SearchReport, SearchReportRow } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentSearchReportComponent } from './agent-search-report.component';

describe('AgentSearchReportComponent', () => {
  let component: AgentSearchReportComponent;
  let agentData: jasmine.SpyObj<AgentDataService>;

  const row: SearchReportRow = {
    trademarkId: 7,
    name: 'ALPHA',
    applicationNo: 123456,
    tmClass: 9,
    proprietorName: 'Alpha Industries',
    proprietorAddress: '1 Registry Road, Delhi',
    applicationDate: '2025-01-15',
    renewalDate: '2035-01-15',
    trademarkStatus: 'Registered',
    journalNo: 2199,
    details: 'Software and scientific instruments',
    score: 0.9,
    riskBand: 'HIGH',
    hasArtwork: false,
  };

  const report: SearchReport = {
    query: 'ALPHA',
    tmClasses: [9],
    generatedOn: '2026-10-04T00:00:00Z',
    totalResults: 1,
    countsByRisk: { HIGH: 1, MEDIUM: 0, LOW: 0 },
    rows: [row],
  };

  beforeEach(async () => {
    agentData = jasmine.createSpyObj<AgentDataService>('AgentDataService', [
      'getProfile',
      'getLogo',
      'previewSearchReport',
      'getSearchResultArtwork',
      'downloadSearchReportExcel',
    ]);
    agentData.getProfile.and.returnValue(of({ companyName: 'Test firm' }));
    agentData.getLogo.and.returnValue(EMPTY);
    agentData.previewSearchReport.and.returnValue(of(report));

    await TestBed.configureTestingModule({
      imports: [AgentSearchReportComponent],
      providers: [{ provide: AgentDataService, useValue: agentData }],
    }).compileComponents();

    component = TestBed.createComponent(AgentSearchReportComponent).componentInstance;
  });

  it('defaults to Starts with and requires a class', () => {
    expect(component.searchType).toBe('startswith');
    expect(component.selectedClasses()).toEqual([]);
    expect(component.classSummary()).toBe('Select classes');

    component.query = 'ALPHA';
    component.run();

    expect(agentData.previewSearchReport).not.toHaveBeenCalled();
    expect(component.error()).toBe('Select at least one class to search.');
    expect(component.classPickerOpen()).toBeTrue();
  });

  it('runs a new search when the match rule changes after a search', () => {
    component.query = 'ALPHA';
    component.selectedClasses.set([9]);
    component.run();

    component.searchType = 'contains';
    component.onSearchTypeChange();

    expect(agentData.previewSearchReport).toHaveBeenCalledTimes(2);
    expect(agentData.previewSearchReport.calls.mostRecent().args).toEqual(['ALPHA', [9], 'contains', 0, 100]);
  });

  it('includes every on-screen result field in the printable PDF markup', () => {
    component.reportSearchType = 'phonetic';
    const html = (component as unknown as { printableResults(rows: SearchReportRow[]): string }).printableResults([row]);

    for (const label of [
      'Name',
      'Application',
      'Class',
      'Proprietor',
      'Proprietor address',
      'Status',
      'Filed',
      'Renewal',
      'Journal no.',
      'Details',
      'Similarity',
    ]) {
      expect(html).withContext(`missing ${label}`).toContain(label);
    }
    expect(html).toContain('1 Registry Road, Delhi');
    expect(html).toContain('Software and scientific instruments');
  });
});
