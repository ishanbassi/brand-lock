import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationConfigService } from './core/config/application-config.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'trademarx';
  constructor(
    private readonly applicationConfigService:ApplicationConfigService
  ){
    this.applicationConfigService.setEndpointPrefix(environment.BaseApiUrl)
  }
}
