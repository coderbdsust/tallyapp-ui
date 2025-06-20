import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  transform(word: string[]): string {
    if (!word) return word;
    let wordRes = word[0].replace(/ROLE_/g, ''); // Replaces all underscores
    let words = wordRes.split(' ');
    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // Capitalize each word
      .join(' '); // Join words back into a single string
  }
}
