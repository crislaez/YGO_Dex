import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TournamentDateOption, TournamentResponse } from '../models/tournament.models';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  private baseURL: string = this.env.ygoprodeckBaseEndpoint;
  private tournamnetCache$ = new BehaviorSubject<{ [option:string]:TournamentResponse} >(null!);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  getAll(reload: boolean = false, dateOption: TournamentDateOption = 'Format'): Observable<TournamentResponse> {
    if(!reload && this.tournamnetCache$.value?.[dateOption]){
      return of(this.tournamnetCache$.value?.[dateOption])
    }

    const params = `?placement=All&tier=2&dateStart=${dateOption}`;

    return this.http.get<TournamentResponse>(`${this.baseURL}tournament/getTopArchetypes.php${params}`).pipe(
      map((tournamentResponse) => {
        this.tournamnetCache$.next({
          ...this.tournamnetCache$.value,
          [dateOption]: tournamentResponse
        });

        return tournamentResponse || [];
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }


}
