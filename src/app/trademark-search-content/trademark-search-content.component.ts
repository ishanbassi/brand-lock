import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
}

export interface FAQ {
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-trademark-search-content',
  imports: [SharedModule],
  templateUrl: './trademark-search-content.component.html',
  styleUrl: './trademark-search-content.component.scss'
})
export class TrademarkSearchContentComponent {
  @Output() searchTrademark: EventEmitter<boolean> = new EventEmitter()
  benefits: Benefit[] = [
    {
      icon: 'shield',
      title: 'Brand Protection',
      description: 'Secure your brand identity and prevent unauthorized use of your trademark by competitors.',
    },
    {
      icon: 'search',
      title: 'Avoid Legal Issues',
      description: 'Identify potential conflicts early and avoid costly legal disputes down the road.',
    },
    {
      icon: 'check-circle',
      title: 'Faster Registration',
      description: 'Streamline your trademark registration process with comprehensive search results.',
    },
    {
      icon: 'trending-up',
      title: 'Build Brand Value',
      description: 'Establish a strong brand foundation and increase your business market value.',
    },
  ];

  processSteps: ProcessStep[] = [
    {
      stepNumber: 1,
      title: 'Enter Your Trademark',
      description: 'Type your desired trademark name or phrase into our advanced search tool.',
      icon: 'edit',
    },
    {
      stepNumber: 2,
      title: 'AI-Powered Analysis',
      description: 'Our system searches through millions of registered trademarks and identifies potential conflicts.',
      icon: 'cpu',
    },
    {
      stepNumber: 3,
      title: 'Review Results',
      description: 'Get detailed reports on similar trademarks, their status, and potential conflict levels.',
      icon: 'file-text',
    },
    {
      stepNumber: 4,
      title: 'Expert Consultation',
      description: 'Connect with our trademark experts to get personalized guidance on next steps.',
      icon: 'users',
    },
  ];

  whyChooseUs = [
    {
      title: 'Comprehensive Database',
      description: 'Access to 2+ million trademark records updated in real-time.',
      metric: '2M+',
      label: 'Trademarks',
    },
    {
      title: 'Lightning Fast',
      description: 'Get instant search results powered by advanced algorithms.',
      metric: '<1s',
      label: 'Search Time',
    },
    {
      title: 'Expert Support',
      description: 'Backed by a team of experienced trademark attorneys.',
      metric: '24/7',
      label: 'Available',
    },
    {
      title: 'Real-Time Trademark Updates',
      description: 'We update the latest trademarks every hour to keep you ahead.',
      metric: '1 Hr',
      label: 'Update Frequency',
    }
  ];

  faqs: FAQ[] = [
    {
      question: 'What is a trademark search?',
      answer: 'A trademark search is a comprehensive investigation of existing trademarks to determine if your proposed trademark is available for registration. It helps identify potential conflicts with existing marks and reduces the risk of infringement.',
      isOpen: false,
    },
    {
      question: 'How long does a trademark search take?',
      answer: 'Our automated trademark search provides instant results. For a comprehensive analysis including expert review, we typically deliver a detailed report within 10 minutes.',
      isOpen: false,
    },
    {
      question: 'Is trademark search mandatory before filing?',
      answer: 'While not legally mandatory, conducting a trademark search is highly recommended before filing an application. It helps avoid rejection and saves time and money by identifying conflicts early.',
      isOpen: false,
    },
    {
      question: 'What does your trademark search cover?',
      answer: 'Our search covers registered trademarks, pending applications, common law trademarks, domain names, and business name registrations across all trademark classes.',
      isOpen: false,
    },
  ];

  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSearchTrademark() {
    this.searchTrademark.emit(true);
  }



}
