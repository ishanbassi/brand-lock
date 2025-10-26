import { Pipe, PipeTransform } from '@angular/core';
import { TrademarkStatusTypeList } from '../../enumerations/trademark-status.model';

@Pipe({
  name: 'trademarkStatus'
})
export class TrademarkStatusPipe implements PipeTransform {

  
  transform(value: unknown): any | undefined {
    let recordStatus = TrademarkStatusTypeList.find(status => value == status.value)
    if(recordStatus) return recordStatus.label
    return value || "-"
  }

}
