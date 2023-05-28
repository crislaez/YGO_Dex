import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { orderItemByDateDesc } from '@ygodex/core/functions/generic.functions';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Set } from '../models/set.models';


@Injectable({
  providedIn: 'root'
})
export class SetService {

  private baseURL: string = this.env.baseEndpoint;
  private setsCache$ = new BehaviorSubject<Set[]>([]);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  get setsCache() {
    return this.setsCache$.value;
  }

  set setsCache(sets: Set[]) {
    this.setsCache$.next(sets);
  }

  getAll(reload: boolean = false): Observable<Set[]> {
    if(!reload && this.setsCache$.value?.length > 0){
      return of(this.setsCache$.value)
    }

    return this.http.get<Set[]>(`${this.baseURL}cardsets.php`).pipe(
      map((sets) => {
        const orderSets = orderItemByDateDesc(sets, 'tcg_date')
        this.setsCache$.next(orderSets);
        return orderSets || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

}
