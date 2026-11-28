import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { SearchReport, SearchReportRow } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentSearchReportComponent } from './agent-search-report.component';

describe('AgentSearchReportComponent', () => {
  let component: AgentSearchReportComponent;
  let agentData: jasmine.SpyObj<AgentDataService>;
  let router: jasmine.SpyObj<Router>;

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
      'startPhoneticSearchRun',
      'getPhoneticSearchRun',
      'getSearchResultArtwork',
      'downloadSearchReportExcel',
    ]);
    agentData.getProfile.and.returnValue(of({ companyName: 'Test firm' }));
    agentData.getLogo.and.returnValue(EMPTY);
    agentData.previewSearchReport.and.returnValue(of(report));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AgentSearchReportComponent],
      providers: [
        { provide: AgentDataService, useValue: agentData },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {}, queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();

    component = TestBed.createComponent(AgentSearchReportComponent).componentInstance;
  });

  it('defaults to Starts with and searches all classes when none are selected', () => {
    expect(component.searchType).toBe('startswith');
    expect(component.selectedClasses()).toEqual([]);
    expect(component.classSummary()).toBe('All classes (1–45)');

    component.query = 'ALPHA';
    component.run();

    expect(agentData.previewSearchReport).toHaveBeenCalledWith(
      'ALPHA', Array.from({ length: 45 }, (_, index) => index + 1), 'startswith', 0, 100, '',
    );
  });

  it('runs a new search when the match rule changes after a search', () => {
    component.query = 'ALPHA';
    component.selectedClasses.set([9]);
    component.run();

    component.searchType = 'contains';
    component.onSearchTypeChange();

    expect(agentData.previewSearchReport).toHaveBeenCalledTimes(2);
    expect(agentData.previewSearchReport.calls.mostRecent().args).toEqual(['ALPHA', [9], 'contains', 0, 100, '']);
  });

  it('offers independent status filters for objected, opposed, examination, and advertised marks', () => {
    expect(component.statusBuckets.map(bucket => bucket.value)).toEqual([
      'REGISTERED',
      'OBJECTED',
      'OPPOSED',
      'UNDER_EXAMINATION',
      'ADVERTISED',
      'ABANDONED_WITHDRAWN_REJECTED',
      'OTHER_UNKNOWN',
    ]);
  });

  it('keeps the skeleton visible through an empty in-progress phonetic response', () => {
    component.query = 'ALPHA';
    component.selectedClasses.set([9]);
    component.searchType = 'phonetic';
    agentData.startPhoneticSearchRun.and.returnValue(of({
      ...report,
      rows: [],
      totalResults: 0,
      status: 'RUNNING',
      candidatesScored: 12,
      runId: 'run-1',
    }));

    component.run();

    expect(component.awaitingInitialResult()).toBeTrue();
  });

  it('does not render an empty results table while the phonetic skeleton is visible', () => {
    const fixture = TestBed.createComponent(AgentSearchReportComponent);
    const viewComponent = fixture.componentInstance;
    viewComponent.query = 'ALPHA';
    viewComponent.selectedClasses.set([9]);
    viewComponent.searchType = 'phonetic';
    agentData.startPhoneticSearchRun.and.returnValue(of({
      ...report,
      rows: [],
      totalResults: 0,
      status: 'RUNNING',
      candidatesScored: 12,
      runId: 'run-1',
    }));

    viewComponent.run();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-agent-page-skeleton')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.results')).toBeNull();
    fixture.destroy();
  });

  it('replaces the skeleton when the first phonetic match arrives', () => {
    component.query = 'ALPHA';
    component.selectedClasses.set([9]);
    component.searchType = 'phonetic';
    agentData.startPhoneticSearchRun.and.returnValue(of({
      ...report,
      status: 'RUNNING',
      candidatesScored: 12,
      runId: 'run-1',
    }));

    component.run();

    expect(component.awaitingInitialResult()).toBeFalse();
  });

  it('renders the match-rule picker with every supported search type', () => {
    const fixture = TestBed.createComponent(AgentSearchReportComponent);
    fixture.detectChanges();

    expect(component.matchRules).toEqual(['startswith', 'contains', 'phonetic']);
    expect(fixture.nativeElement.querySelector('.match-picker')).withContext('match-rule picker').not.toBeNull();
  });

  it('opens a result in the Agent Portal trademark detail route', () => {
    component.openDetails(row);

    expect(router.navigate).toHaveBeenCalledWith(['/agent-portal/trademarks', row.trademarkId]);
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
