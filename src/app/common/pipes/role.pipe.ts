import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  transform(word: string|String): String {
    if (!word) return word;
    word = word.replace(/ROLE_/g, ''); // Replaces all underscores
    let words = word.split(' ');

    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // Capitalize each word
      .join(' '); // Join words back into a single string
  }
}
