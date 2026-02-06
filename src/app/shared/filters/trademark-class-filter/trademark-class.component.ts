import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, OperatorFunction, Subject, switchMap, tap } from 'rxjs';
import { ITrademarkClass } from '../../../../models/trademark-class.model';
import { HttpResponse } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrademarkClassService } from '../../services/trademark-class.service';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatInputModule, MatSuffix } from '@angular/material/input';
import { ITrademark } from '../../../../models/trademark.model';
import { TrademarkFormService } from '../../services/trademark-form.service';
import { Router } from '@angular/router';
import { TrademarkService } from '../../services/trademark.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { LoadingService } from '../../../common/loading.service';
import { TrademarkOnboardingBtnSectionComponent } from '../../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-trademark-class',
  imports: [
    SharedModule,
    ReactiveFormsModule,
    NgbModule,
    MatFormFieldModule,
    MatIconModule,
    MatListOption,
    MatInputModule,
    MatSelectionList,
    TrademarkOnboardingBtnSectionComponent,
    MatChipsModule,
    MatButtonModule,
      ],
  templateUrl: './trademark-class.component.html',
  styleUrl: './trademark-class.component.scss'
})
export class TrademarkClassComponent implements OnInit{

  @Input() filterChanges?: Subject<boolean>;
  @Output("onChange") onChange: EventEmitter<ITrademarkClass> = new EventEmitter();
  @ViewChild('searchElement') searchElement?: ElementRef;
  @Input()
  trademark?:ITrademark|null;
  searching: boolean = false;
  searchControl = new FormControl("",{});
  searchFailed: boolean = false;
  selectedFieldId: number = 0;
  trademarkClassesSharedCollection: ITrademarkClass[] = [];
  selectedTrademarkClasses: ITrademarkClass[] = [];
  selectedTrademarkClassesChips:{tmClass:number,description:string}[] = []
  showCloseIcon = false;

  filteredClasses:ITrademarkClass[] = [];
  isSubmitting: boolean = false;
  onClickValidation: boolean = false;

  protected trademarkFormService = inject(TrademarkFormService);
  trademarkDetailsForm = this.trademarkFormService.createTrademarkFormGroup();
  
  constructor(
    protected readonly trademarkClassService:TrademarkClassService,
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly sessionStorageService: SessionStorageService,  
    private readonly toastService:ToastrService,
    private readonly loadingService: LoadingService,

  ) {
 

  }

  ngOnInit() {
    if(this.sessionStorageService.getObject('trademark')?.id){
          this.trademarkService.find(this.sessionStorageService.getObject('trademark').id).subscribe({
            next: (response) => {
              this.trademark = response.body; 
              if(this.trademark) {
                this.updateForm(this.trademark);
                this.updateTmClassChips();
              }
            }
          })
        }
        else{
        this.router.navigate(['trademark-registration/step-3']);
        } 
    

    if (this.filterChanges) {
      this.filterChanges.subscribe((v: any) => {
        if (v.state === "CLEAR_PROVIDER_FILTER") {
          this.searchControl.setValue(null);
        } else if (v.state === "PRE_SET_PROVIDER_VALUE") {
          this.selectedFieldId = (v.values && v.values.length > 0) ? v.values[0] : 0;
        } 
      });
    }
    this.searchControl.valueChanges.pipe(
      tap((text$) => this.showCloseIcon = text$?.trim() !== ''),
      filter((text$): text$ is string => text$ != null && text$.length > 2),
      debounceTime(300),
      distinctUntilChanged(),
      tap((text$) =>{
        this.searching = true;
      }),
      switchMap(term => {
        return this.loadRelationshipsOptions(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      }),
      tap(() => {
        this.searching = false;
      }),

      
    ).subscribe(val => {
      this.filteredClasses = val;
      this.updateSelectedItems();

    })

  }
  updateSelectedItems(){

    const selectedTmClasses = this.selectedTrademarkClasses.map(item => {
      const idx = this.filteredClasses.findIndex(classItem => classItem.id === item.id);
      if(idx !== -1) {
        return this.filteredClasses[idx];
      }
      return item;
    })
    
    this.trademarkDetailsForm.patchValue({ trademarkClasses: selectedTmClasses });
  }


  protected loadRelationshipsOptions(term: string) {
    const input = {} as any;
    input["keyword.contains"] = term;
    input["sort"] = "tmClass,asc";
   
    return this.trademarkClassService
      .query(input)
      .pipe(
        map((res: HttpResponse<ITrademarkClass[]>) => {
          return res.body ?? [];
        }),
      )
    }
  formatter(value: any) {
    return `${value.keyword}`;
  }

  onTrademarkClassSelection($event: any) {
    this.onChange.emit($event.item);
  }

  clearFilter() {
    this.onChange.emit(undefined);
    
  }

    
  protected updateForm(trademark:ITrademark): void {
    this.trademark = trademark;
    this.trademarkFormService.resetForm(this.trademarkDetailsForm, trademark);
    this.selectedTrademarkClasses = this.trademarkClassService.addTrademarkClassToCollectionIfMissing<ITrademarkClass>(
      this.trademarkClassesSharedCollection,
      ...(trademark.trademarkClasses ?? []),
    );
  }

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.trademarkDetailsForm.markAllAsTouched();
    if (this.trademarkDetailsForm.invalid) {
      return;
    }
    this.loadingService.show();
    const trademark  = this.trademarkFormService.getTrademark(this.trademarkDetailsForm);
    if(!trademark.id) return;
    this.trademarkService.partialUpdate(trademark)
    .subscribe((res) => {
    })

    
    
  }

  back(){
    this.router.navigateByUrl("trademark-registration/step-3")
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.filteredClasses = [];
    this.updateSelectedItems()
  }

  onSelectionChange($event: MatSelectionListChange) {
    const selectedItem = $event.options[0].value as ITrademarkClass;
    if($event.options[0].selected){
      this.selectedTrademarkClasses.push(selectedItem);    
    }
    else{
      this.selectedTrademarkClasses = this.selectedTrademarkClasses.filter(tm => tm.id !== selectedItem.id)
    }
    this.updateSelectedItems();
    this.updateTmClassChips();
    
    
  }

  removeClass(tmClassItem: { tmClass: number; description: string; }) {
    this.selectedTrademarkClasses = this.selectedTrademarkClasses.filter(item => item.tmClass !== tmClassItem.tmClass);
    this.updateSelectedItems();
    this.updateTmClassChips();
  }

  updateTmClassChips(){
    this.selectedTrademarkClassesChips = [];
    this.selectedTrademarkClasses.forEach(tmClass => {
      if(!tmClass.tmClass || !tmClass.keyword) return;

    const idx = this.selectedTrademarkClassesChips.findIndex(tm => tm.tmClass === tmClass.tmClass)
      if(idx === -1){
        this.selectedTrademarkClassesChips.push({tmClass:tmClass.tmClass, description:tmClass.keyword})
        return;
      }
      this.selectedTrademarkClassesChips[idx].description =  `${this.selectedTrademarkClassesChips[idx].description},${tmClass.keyword}`
    })

  }
  
}
