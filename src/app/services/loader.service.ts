import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  pageLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }
}
