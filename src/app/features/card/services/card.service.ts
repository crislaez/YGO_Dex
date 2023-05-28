import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BackendResponse } from '@ygodex/core/models/backend-response.models';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Card } from '../models/card.models';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  private baseURL: string = this.env.baseEndpoint;
  private cardsCache$ = new BehaviorSubject<Card[]>([]);
  private cardsBySetCodeCache$ = new BehaviorSubject<{[setCode: string]: Card[]}>(null!);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getAll(reload: boolean = false): Observable<Card[]> {
    if(!reload && this.cardsCache$.value?.length > 0){
      return of(this.cardsCache$.value)
    }

    return this.http.get<BackendResponse<Card>>(`${this.baseURL}cardinfo.php`).pipe(
      map((response) => {
        const { data: cards } = response || {};
        this.cardsCache$.next(cards);
        return cards || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getBySetCode(reload: boolean = false, setCode: string): Observable<Card[]> {
    if(!reload && this.cardsBySetCodeCache$.value?.[setCode]?.length > 0){
      return of(this.cardsBySetCodeCache$.value?.[setCode])
    }

    return this.http.get<BackendResponse<Card>>(`${this.baseURL}cardinfo.php?cardset=${setCode}`).pipe(
      map((response) => {
        const { data: cards } = response || {};
        this.cardsBySetCodeCache$.next({
          ...this.cardsBySetCodeCache$.value,
          [setCode]: cards
        });
        return cards || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }



}
