import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { TrademarkSearchFAQSchema } from '../enums/trademark-search-faq';
import { BlogService } from '../shared/services/blog-service.service';
import { BlogData } from '../../models/blog.model';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
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
  imports: [SharedModule, BlogMarkdownComponent],
  templateUrl: './trademark-search-content.component.html',
  styleUrl: './trademark-search-content.component.scss'
})
export class TrademarkSearchContentComponent implements OnInit {
  blog?: BlogData;
  constructor(
    private blogService: BlogService,
  ) { }

  ngOnInit(): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(TrademarkSearchFAQSchema);
    document.head.appendChild(script);
    this.blogService.getBlogBySlug("complete-guide-to-trademark-search-in-india").subscribe(res => {
      this.blog = res?.data[0];
      if (!this.blog) return;
    });
  }
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

  steps = [
    {
      stepNumber: 1,
      title: 'Enter Your Trademark Keyword',
      description: 'Type your brand name, company name, or keyword into the trademark search tool to begin checking availability.',
      icon: 'edit',
      keywords: ['trademark search', 'brand name search', 'check trademark availability', 'trademark name search']
    },
    {
      stepNumber: 2,
      title: 'Select Search Type',
      description: 'Choose between Wordmark Search, Phonetic Search, or Logo (Vienna Code) Search depending on your trademark type.',
      icon: 'filter_alt',
      keywords: ['wordmark search', 'phonetic trademark search', 'logo trademark search', 'vienna code search']
    },
    {
      stepNumber: 3,
      title: 'Apply Search Filters',
      description: 'Use filters like “Starts With”, “Contains”, or “Exact Match” to refine your trademark search results.',
      icon: 'tune',
      keywords: ['trademark search filter', 'exact match trademark', 'starts with search', 'contains keyword search']
    },
    {
      stepNumber: 4,
      title: 'Choose Trademark Class',
      description: 'Select the correct trademark class (1–45) based on your business category to ensure accurate results.',
      icon: 'category',
      keywords: ['trademark class search', 'nice classification', 'class 35 trademark', 'class 25 trademark']
    },
    {
      stepNumber: 5,
      title: 'Search Multiple Variations',
      description: 'Try different spellings, synonyms, prefixes, and suffixes to identify similar or conflicting trademarks.',
      icon: 'shuffle',
      keywords: ['similar trademark search', 'alternate spelling trademark', 'brand variation search', 'name variations']
    },
    {
      stepNumber: 6,
      title: 'Run Phonetic Search',
      description: 'Check for similar-sounding trademarks to avoid conflicts due to pronunciation similarities.',
      icon: 'record_voice_over',
      keywords: ['phonetic trademark search', 'sound alike trademark', 'similar sounding brand names']
    },
    {
      stepNumber: 7,
      title: 'Review Trademark Results',
      description: 'Analyze the list of existing trademarks including registered, objected, and pending applications.',
      icon: 'list',
      keywords: ['trademark registry search', 'tm status check', 'trademark database india', 'ipindia public search']
    },
    {
      stepNumber: 8,
      title: 'Check Trademark Status',
      description: 'Verify the status of similar trademarks such as Registered, Objected, Opposed, or Abandoned.',
      icon: 'fact_check',
      keywords: ['trademark status check', 'tm application status', 'registered trademark search']
    },
    {
      stepNumber: 9,
      title: 'Analyze Similarity Risk',
      description: 'Evaluate visual, phonetic, and conceptual similarity to determine chances of rejection or objection.',
      icon: 'warning',
      keywords: ['trademark conflict check', 'similar trademark risk', 'likelihood of confusion trademark']
    },
    {
      stepNumber: 10,
      title: 'Search Across Relevant Classes',
      description: 'Check additional related classes to ensure broader protection and avoid hidden conflicts.',
      icon: 'layers',
      keywords: ['multi class trademark search', 'cross class trademark', 'related class search']
    },
    {
      stepNumber: 11,
      title: 'Check Global Trademark Databases',
      description: 'Search international databases to ensure your brand name is globally available if needed.',
      icon: 'public',
      keywords: ['global trademark search', 'wipo trademark search', 'international brand database']
    },
    {
      stepNumber: 12,
      title: 'Perform Logo Search (if applicable)',
      description: 'Use Vienna Classification codes to search for similar logos or graphical trademarks.',
      icon: 'image',
      keywords: ['logo trademark search', 'device mark search', 'vienna classification trademark']
    },
    {
      stepNumber: 13,
      title: 'Avoid Generic or Descriptive Names',
      description: 'Ensure your trademark is unique and not generic to improve chances of approval.',
      icon: 'block',
      keywords: ['distinctive trademark', 'generic trademark rejection', 'descriptive trademark issue']
    },
    {
      stepNumber: 14,
      title: 'Interpret Search Results Carefully',
      description: 'Do not rely only on exact matches—evaluate similar and confusingly similar trademarks.',
      icon: 'psychology',
      keywords: ['interpret trademark results', 'similarity analysis trademark', 'tm search analysis']
    },
    {
      stepNumber: 15,
      title: 'Make a Final Availability Decision',
      description: 'Based on your search, decide whether your trademark is safe to use or needs modification.',
      icon: 'check_circle',
      keywords: ['trademark availability check', 'brand name approval', 'tm clearance search']
    }
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


  toggleFaq(event: any) {
    const btn = event.target;
    console.log(btn)
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      (el.querySelector('.faq-answer') as any)!.style.maxHeight = '0';
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }



}
