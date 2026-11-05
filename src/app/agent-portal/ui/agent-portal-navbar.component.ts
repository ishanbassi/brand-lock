import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-agent-portal-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './agent-portal-navbar.component.html',
  styleUrl: './agent-portal-navbar.component.scss',
})
export class AgentPortalNavbarComponent {
  /** Identifies the highlighted navigation item on marketing feature pages. */
  @Input() activeLink = 'features';
}
