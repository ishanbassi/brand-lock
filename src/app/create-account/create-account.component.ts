import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-create-account',
  imports: [ReactiveFormsModule, MatFormField,SharedModule,],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  



}
