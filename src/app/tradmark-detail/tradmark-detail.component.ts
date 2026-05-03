import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademark } from '../../models/trademark.model';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, tap } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { SearchCtaSectionComponent } from '../search-cta-section/search-cta-section.component';
import { DataUtils } from '../shared/services/data-util.service';


@Component({
  selector: 'app-tradmark-detail',
  imports: [SharedModule, NavbarV2Component, FooterV2Component,MobileBottomNavbarComponent, SearchCtaSectionComponent],
  templateUrl: './tradmark-detail.component.html',
  styleUrl: './tradmark-detail.component.scss'
})
export class TradmarkDetailComponent implements OnInit, OnDestroy {
  trademark?: ITrademark | null;
  private isBrowser = false;
  baseUrl = environment.BaseApiUrl;
  whatsappQuery:string = '';
  private faqSchemaScript!: HTMLScriptElement;



  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    private trademarkService: TrademarkService,
    private loadingService: LoadingService,
    private toastService: ToastrService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataUtils:DataUtils

  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }
  ngOnDestroy(): void {
    if(this.isBrowser && this.faqSchemaScript){
      document.head.removeChild(this.faqSchemaScript);
    }

  }
  ngOnInit(): void {
    if(this.isBrowser){
      this.loadingService.show();
    }
    const url = this.route.snapshot.paramMap.get('url')!;
    this.trademarkService.findBySlug(url)
      .pipe(
        tap(res => {
          this.setSeoTags(res.body);
          this.whatsappQuery = `Application Number: ${res.body?.applicationNo?.toString()}`
        }),
        finalize(() => {
          if(this.isBrowser){
            this.loadingService.hide();
          }
        })
      )
      .subscribe(res => {
         this.trademark = res.body;
         if(this.isBrowser && this.trademark?.faqs){
          this.faqSchemaScript = document.createElement('script');
          this.faqSchemaScript.type = 'application/ld+json';
          this.faqSchemaScript.text = JSON.stringify(this.dataUtils.generateFaqSchema(this.trademark.faqs));
          document.head.appendChild(this.faqSchemaScript);
         }

        })
  }
  setSeoTags(tm: ITrademark | null) {
    if(!tm) return;
      this.title.setTitle(`${tm.name || ''} Trademark Status, Class ${tm.tmClass} & Application Details`);
      this.meta.updateTag({ name: 'description', 
        content: `Check ${tm.name} trademark status, class, application number (${tm.applicationNo}), and proprietor details in India. Verify availability before filing.` });
      this.meta.updateTag({
        property: 'og:title',
        content: tm.name || `Check Trademark Status for application number: ${tm.applicationNo}`
      });

      this.meta.updateTag({
        property: 'og:description',
        content: `Check ${tm.name} trademark status, class, application number (${tm.applicationNo}), and proprietor details in India. Verify availability before filing.`
      });
      
      this.meta.updateTag({
        property: 'og:image',
        content: tm.imgUrl ? this.baseUrl + 'files/files/' + tm?.imgUrl : '/assets/images/trademark.png'
      });

      if (isPlatformBrowser(this.platformId)){
          const url = this.document.location.href;
          this.meta.updateTag({
          property: 'og:url',
          content: url
        });

      };
  }



  toggleFaq(index: number) {
    this.trademark!.faqs![index].opened = !this.trademark!.faqs![index].opened;
  }


}
