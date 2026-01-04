import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  imports:[MatIcon,SharedModule]
})
export class FeaturesComponent {
  
}
