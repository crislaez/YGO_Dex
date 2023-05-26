import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CARD_ATTRIBUTES, CARD_LEVEL, CARD_RACES, CARD_TYPES } from '@ygodex/core/constants/generic.constants';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Archetype, CardFilter } from '../models/card-filter.models';

@Injectable({
  providedIn: 'root'
})
export class CardFilterService {

  baseURL: string = this.env.baseEndpoint;
  cardFilterCache$ = new BehaviorSubject<CardFilter>(null!);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) {
    this.cardFilterCache$.next({
      types: CARD_TYPES,
      attributes: CARD_ATTRIBUTES,
      races: CARD_RACES,
      level: CARD_LEVEL,
      archetypes: []
    });
  }


  getAll(reload: boolean = false): Observable<CardFilter> {
    if(!reload && this.cardFilterCache$.value?.['archetypes']!?.length > 0){
      return of(this.cardFilterCache$.value)
    }

    return this.http.get<Archetype[]>(`${this.baseURL}archetypes.php`).pipe(
      map((response) => {
        const archetypes = (response || [])?.map(item => item?.archetype_name);

        this.cardFilterCache$.next({
          ...this.cardFilterCache$?.value,
          archetypes: archetypes
        });

        return this.cardFilterCache$.value || {};
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }


}
