// vertical-stepper.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, NgModule, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';

interface Step {
  title: string;
  content: string;
}

@Component({
  imports: [
    CommonModule,
  ],
  selector: 'app-vertical-stepper',
  templateUrl: './vertical-stepper.component.html',
  styleUrl:'./vertical-stepper.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('visible', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0.1,
      })),
      transition('hidden => visible', [
        animate('0.5s ease-in-out')
      ])
    ])
  ],
})
export class VerticalStepperComponent implements OnInit, AfterViewInit {
  activeStep = 0;
  
  registrationSteps = RegistrationProcessList;

  @ViewChildren('stepContents') 
  stepContents!: QueryList<ElementRef>;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  checkScrollPosition(): void {
    if (!this.stepContents) return;
    
    const contentElements = this.stepContents.toArray();
    const windowHeight = window.innerHeight;
    const scrollPosition = window.scrollY;
    
    for (let i = 0; i < contentElements.length; i++) {
      const element = contentElements[i].nativeElement;
      const rect = element.getBoundingClientRect();
      
      // Check if element is in viewport
      if (rect.top <= windowHeight * 0.6) {
        this.activeStep = i;
      }
    }
  }
}

