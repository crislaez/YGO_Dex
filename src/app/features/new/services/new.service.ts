import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { New } from '../models/new.models';


@Injectable({
  providedIn: 'root'
})
export class NewService {

  private baseURL: string = this.env.ygoprodeckBaseEndpoint;
  private cardsCache$ = new BehaviorSubject<New[]>([]);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  get cardsCache() {
    return this.cardsCache$.value;
  }

  set cardsCache(news: New[]) {
    this.cardsCache$.next(news);
  }

  getAll(reload: boolean = false): Observable<New[]> {
    if(!reload && this.cardsCache$.value?.length > 0){
      return of(this.cardsCache$.value)
    }

    return this.http.get<New[]>(`${this.baseURL}articles/getArticles.php`).pipe(
      map((news) => {
        this.cardsCache$.next(news);
        return news || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

  getAllPaginated(offset: number, name?:string): Observable<New[]> {
    const baseUrl = `articles/getArticles.php?limit=10&offset=${offset}`;
    const url = !name ? baseUrl : baseUrl + `&name=${name}`

    return this.http.get<New[]>(`${this.baseURL}${url}`).pipe(
      map((news) => {
        return news || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }

}
