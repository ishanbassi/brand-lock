import { Component } from '@angular/core';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { RouterOutlet } from '@angular/router';
import { ResumeApplicationComponent } from '../resume-application/resume-application.component';

@Component({
  selector: 'app-public-layout-component',
  imports: [TopHeaderComponent,NavbarV2Component,FooterV2Component,RouterOutlet,ResumeApplicationComponent],
  templateUrl: './public-layout-component.component.html',
  styleUrl: './public-layout-component.component.scss'
})
export class PublicLayoutComponentComponent {

}
