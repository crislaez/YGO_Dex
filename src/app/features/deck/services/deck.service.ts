import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Deck } from '../models/deck.models';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private baseURL: string = this.env.ygoprodeckBaseEndpoint;
  private decksCache$ = new BehaviorSubject<Deck[]>([]);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  get decksCache() {
    return this.decksCache$.value;
  }

  set decksCache(decks: Deck[]) {
    this.decksCache$.next(decks);
  }

  getAll(reload: boolean = false): Observable<Deck[]> {
    if(!reload && this.decksCache$.value?.length > 0){
      return of(this.decksCache$.value)
    }

    return this.http.get<Deck[]>(`${this.baseURL}decks/getDecks.php`).pipe(
      map((decks) => {
        this.decksCache$.next(decks);
        return decks || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getAllPaginated(offset: number, name?:string): Observable<Deck[]> {
    const baseUrl = `decks/getDecks.php?limit=20&offset=${offset}`;
    const url = !name ? baseUrl : baseUrl + `&name=${name}`

    return this.http.get<Deck[]>(`${this.baseURL}${url}`).pipe(
      map((decks) => {
        return decks || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }


}
