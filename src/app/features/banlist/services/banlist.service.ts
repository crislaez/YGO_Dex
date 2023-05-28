import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BanlistType } from '@ygodex/core/enums/banlist-type.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { orderBanlist } from '@ygodex/core/functions/generic.functions';
import { BackendResponse } from '@ygodex/core/models/backend-response.models';
import { Card } from '@ygodex/features/card';
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Banlist } from '../models/banlist.models';

@Injectable({
  providedIn: 'root'
})
export class BanlistService {

  private baseURL: string = this.env.baseEndpoint;
  private banlistCache$ = new BehaviorSubject<Banlist>(null!);


  constructor(
    private http: HttpClient,
    @Inject(ENVIRONMENT) private env: Environment,
  ) { }


  get banlistCache() {
    return this.banlistCache$.value;
  }

  set banlistCache(banlist: Banlist) {
    this.banlistCache$.next(banlist);
  }

  getAll(reload: boolean = false): Observable<Banlist> {
    if(!reload && Object.keys(this.banlistCache$.value || {})?.length > 0){
      return of(this.banlistCache$.value);
    }

    return forkJoin({
      tcg: this.http.get<BackendResponse<Card>>(`${this.baseURL}cardinfo.php?banlist=tcg`).pipe(catchError(() => of({data: []}))),
      ocg: this.http.get<BackendResponse<Card>>(`${this.baseURL}cardinfo.php?banlist=ocg`).pipe(catchError(() => of({data: []})))
    }).pipe(
      map(responses => {
        const { tcg = null, ocg = null } = responses || {};
        const { data: tcgData = [] } = tcg || {};
        const { data: ocgData = [] } = ocg || {};

        const response = {
          tcg: orderBanlist(tcgData, BanlistType.Tcg),
          ocg: orderBanlist(ocgData, BanlistType.Ocg)
        };

        this.banlistCache$.next(response);

        return response
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    );
  }



}
