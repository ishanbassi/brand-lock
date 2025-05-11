import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input() endValue: number = 0;
  @Input() duration: number = 2000; // Duration in milliseconds
  @Input() prefix: string = '';
  @Input() suffix: string = '';

  private observer: IntersectionObserver;
  private hasAnimated = false;

  constructor(private el: ElementRef) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.startCounting();
            this.hasAnimated = true;
          }
        });
      },
      { threshold: 0.5 }
    );
  }

  ngOnInit() {
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private startCounting() {
    const element = this.el.nativeElement;
    const startValue = 0;
    const startTime = performance.now();
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (this.endValue - startValue) * easeOutQuart);
      
      element.textContent = `${this.prefix}${currentValue}${this.suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = `${this.prefix}${this.endValue}${this.suffix}`;
      }
    };
    
    requestAnimationFrame(updateNumber);
  }
} 