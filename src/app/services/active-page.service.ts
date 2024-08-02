import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivePageService {
  public activePage$: BehaviorSubject<string> = new BehaviorSubject("stats");
  constructor() { }
}
