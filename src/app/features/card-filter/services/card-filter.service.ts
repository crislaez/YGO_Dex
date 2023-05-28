import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { Archetype, CardFilter, CardFilterResponse } from '../models/card-filter.models';

@Injectable({
  providedIn: 'root'
})
export class CardFilterService {

  private baseURL: string = this.env.baseEndpoint; //ygoprodeckBaseEndpoint
  private baseURLTest: string = this.env.ygoprodeckInternalBaseEndpoint;
  private cardFilterCache$ = new BehaviorSubject<CardFilter>(null!);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getAll(reload: boolean = false): Observable<CardFilter> {
    if(!reload && Object.keys(this.cardFilterCache$.value || {})?.length > 0){
      return of(this.cardFilterCache$.value)
    }

    return forkJoin({
      archetypes: this.http.get<Archetype[]>(`${this.baseURL}archetypes.php`).pipe(catchError(() => of([]))),
      filters: this.http.get<CardFilterResponse>(`${this.baseURLTest}cardvalues.php`).pipe(catchError(() => of({}))),
    }).pipe(
      map(responses => {
        const { archetypes: responseArchetypes, filters } = responses || {};
        const { types: responseTypes, MONSTER: responseAttributes, SPELL: responseSpell, TRAP: responseTrap } = (filters as CardFilterResponse) || {};
        const { attributes = [], race = [], level = [] } = responseAttributes || {};
        const { race: raceSpell = [] } = responseSpell || {};
        const { race: raceTrap = [] } = responseTrap || {};

        const archetypes = (responseArchetypes || [])?.map(item => item?.archetype_name);

        const types = (responseTypes || [])?.map(({name}) => name);
        const races = [
          ...race,
          ...raceSpell,
          ...raceTrap,
        ]?.reduce((acc: any, item: any) => {
          return [
            ...acc,
            ...(!acc?.includes(item) ? [ item ] : [])
          ]
        },[]);

        this.cardFilterCache$.next({
          types,
          races,
          archetypes,
          attributes: (attributes || [])?.map(item => item?.toLocaleLowerCase()),
          level: level?.map(item => item?.toString()),
        });

        return this.cardFilterCache$.value || {};
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }


}
