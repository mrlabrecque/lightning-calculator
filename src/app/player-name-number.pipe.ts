import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'playerNameNumber',
})
export class PlayerNameNumberPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    if (value) {
      const newName = value.split(' ')[1];
      const number = args[0];
      return `#${number} ${newName}`;
    } else {
      return '';
    }
  }
}
