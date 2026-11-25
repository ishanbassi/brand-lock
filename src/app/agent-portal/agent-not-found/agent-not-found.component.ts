import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../ui/icon.component';

@Component({
  selector: 'app-agent-not-found',
  standalone: true,
  imports: [RouterModule, IconComponent],
  templateUrl: './agent-not-found.component.html',
  styleUrl: './agent-not-found.component.scss',
})
export class AgentNotFoundComponent {}
