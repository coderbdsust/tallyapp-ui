import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string|String, maxLength: number = 25): String {
    if (!value || value.length <= maxLength) {
        return value;
      }
  
      const half = Math.floor((maxLength - 3) / 2);
      return `${value.substring(0, half)} * * * * * * * * * * * * * * * * * * ${value.substring(value.length - half)}`;
    }
}
