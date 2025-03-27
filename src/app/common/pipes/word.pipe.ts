import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'word',
  standalone: true
})
export class WordPipe implements PipeTransform {
  transform(word: string|String): String {
    if (!word) return word;
    word = word.replace(/_/g, ' '); // Replaces all underscores
    let words = word.split(' ');

    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // Capitalize each word
      .join(' '); // Join words back into a single string
  }
}
