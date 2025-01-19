import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  loadingOn() {
    //console.log('loading:on');
    this.loadingSubject.next(true);
  }

  loadingOff() {
    //console.log('loading:off');
    this.loadingSubject.next(false);
  }
}
