import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

type Simulation = {
  clientMark: string;
  clientClass: string;
  impugnedMark: string;
  impugnedClass: string;
  score: string;
  conflictType: string;
  action: string;
  grounds: string;
};

@Component({
  selector: 'app-agent-journal-watch-feature',
  standalone: true,
  imports: [RouterLink, AgentPortalNavbarComponent, AgentPortalFooterComponent],
  templateUrl: './agent-journal-watch-feature.component.html',
  styleUrl: './agent-journal-watch-feature.component.scss',
})
export class AgentJournalWatchFeatureComponent {
  readonly activeSimulation = signal(0);
  readonly simulations: Simulation[] = [
    {
      clientMark: 'AURA FLOW',
      clientClass: 'Class 42 · Cloud computing, software development services',
      impugnedMark: 'AURAFY',
      impugnedClass: 'Class 42 · Software as a service (SaaS), IT hosting',
      score: '94%',
      conflictType: 'Phonetic conflict',
      action: 'Section 21 TM-O notice recommended',
      grounds: 'Similarity of marks and allied services may cause confusion under Section 11(1)(b) of the Trade Marks Act, 1999.',
    },
    {
      clientMark: 'GLOVIA',
      clientClass: 'Class 05 · Pharmaceutical preparations and antibacterial formulations',
      impugnedMark: 'ग्लोविया / GLOVIA',
      impugnedClass: 'Class 05 · Dietary supplements and medicament lotions',
      score: '98%',
      conflictType: 'Devanagari transliteration',
      action: 'Urgent Section 21 bar — 118 days left',
      grounds: 'Phonetic and visual identity across Devanagari and Latin scripts creates an immediate consumer-confusion risk.',
    },
    {
      clientMark: 'NEXA LIFESTYLE',
      clientClass: 'Class 25 · Readymade garments, footwear and athleisure',
      impugnedMark: 'NEXA-FIT',
      impugnedClass: 'Class 25 · Sports apparel, activewear and gym accessories',
      score: '89%',
      conflictType: 'Goods and class overlap',
      action: 'Opposition recommended under Section 11(1)',
      grounds: 'A shared dominant prefix with allied goods creates a credible likelihood of confusion.',
    },
  ];
}
