import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { IonContent, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TournamentDeck } from '@ygodex/app/features/tournament/models/tournament.models';
import { InfiniteScrollComponent } from '@ygodex/app/ui/infinite-scroll';
import { ERROR_IMAGE, NO_DATA_IMAGE, TOURNAMENT_OPTIONS } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { deckImageUrl, gotToTop, orderItemDesc, trackById } from '@ygodex/core/functions/generic.functions';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { TournamentService } from '@ygodex/features/tournament/services/tournament.service';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { SpinnerComponent } from '@ygodex/ui/spinner';
import { Chart, registerables } from 'chart.js';
import { catchError, map, of, switchMap } from 'rxjs';
import { TournamentPageState } from '../models/tournament-page.models';

@Component({
  selector: 'app-tournamnet',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.TOURNAMENT' | translate }}</h1>

      <div class="empty-div"></div>
      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending">
        <app-spinner></app-spinner>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="$any(info)?.archetypes?.length > 0; else noData">

              <div class="card text-color-light margin-bottom-20">
                {{ 'COMMON.TOURNAMENT_DESCRIPTION' | translate: { date: $any(info)?.dateCutoffStart }  }}
              </div>

              <div class="ion-card-chart" *ngIf="chart">
                <canvas id="canvas" width="400" height="400">{{ chart }}</canvas>
              </div>

              <div class="empty-div"></div>
              <div class="empty-div"></div>

              <div class="w-45 mb-10" *ngFor="let deck of $any(info)?.archetypes; let i = index; trackBy: trackById">
                <img
                  loading="lazy"
                  [src]="deckImageUrl(deck?.arch_1_img)"
                  [alt]="deck?.arch_1"
                />
                <div class="text-center">{{ deck?.arch_1 }} ({{ deck?.quantity }})</div>
              </div>

              <app-infinite-scroll *ngIf="$any(info)?.archetypes?.length < $any(info)?.total"
                [slice]="$any(info)?.archetypes?.length || 0"
                [total]="$any(info)?.total || 0"
                (loadDataTrigger)="loadData($event)">
              </app-infinite-scroll>

            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>

      <!-- REFRESH -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- IS NO DATA  -->
      <ng-template #noData>
        <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'30vh'"></app-no-data>
      </ng-template>

      <!-- IS ERROR -->
      <ng-template #serverError>
        <app-no-data [title]="'COMMON.ERROR'" [image]="ERROR_IMAGE" [top]="'30vh'"></app-no-data>
      </ng-template>
    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./tournament.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    NoDataComponent,
    SpinnerComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  deckImageUrl = deckImageUrl;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  TOURNAMENT_OPTIONS = TOURNAMENT_OPTIONS;
  EntityStatus = EntityStatus;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  slice!: number;
  chart: any = [];
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;
  state!: TournamentPageState;

  triggerLoad = new EventEmitter<TournamentPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({reload, dateOption, slice}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.tournamentService.getAll(reload, dateOption).pipe(
        map((tournament) => {
          const { archetypes } = tournament || {}
          this.status = EntityStatus.Loaded;

          setTimeout(() => {
            this.generateChart(archetypes!);
          },0)

          return {
            ...tournament,
            archetypes: archetypes?.slice(0, slice),
            total: archetypes?.length || 0
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_TOURNAMEMT');
          return of({})
        })
      )
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string,
    @Inject(ENVIRONMENT) private env: Environment,
    private tournamentService: TournamentService,
    private notificationService: NotificationService
  ) {
    Chart.register(...registerables);
    this.slice = this.env.perPage
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();

    this.state = {
      dateOption: 'Format',
      slice: this.slice,
      reload: false
    };

    this.triggerLoad.next(this.state);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};
      this.state = {
        ...this.state,
        reload: false,
        slice: this.state.slice! + this.slice,
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.state = {
        dateOption: 'Format',
        slice: this.slice,
        reload: true
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  generateChart(allArchetypes: TournamentDeck[]): void {
    // this.chart.destroy();
    const orderArchetypes = orderItemDesc(allArchetypes, 'quantity');
    const otherDecks = (orderArchetypes?.slice(7) || [])?.reduce((acc, element) => acc + element?.['quantity']! ,0);
    const top8Decks = orderArchetypes?.slice(0, 7);
    const [ firstDeck, secondDeck, thirdDeck, fourthDeck, fifthDeck, sixthDeck, seventhDeck ] = top8Decks || []

    this.chart = new Chart('canvas', {
      type: 'pie',
      data: {
        labels: [
          `${firstDeck?.arch_1} (${firstDeck?.quantity})`,
          `${secondDeck?.arch_1} (${secondDeck?.quantity})`,
          `${thirdDeck?.arch_1} (${thirdDeck?.quantity})`,
          `${fourthDeck?.arch_1} (${fourthDeck?.quantity})`,
          `${fifthDeck?.arch_1} (${fifthDeck?.quantity})`,
          `${sixthDeck?.arch_1} (${sixthDeck?.quantity})`,
          `${seventhDeck?.arch_1} (${seventhDeck?.quantity})`,
          `Other (${otherDecks})`,
        ],
        datasets: [{
          data: [
            ...top8Decks?.map(item => item?.['quantity']),
            ...(otherDecks ? [otherDecks] : [])
          ],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(155, 155, 229)',
            'rgb(229, 196, 155)',
            'rgb(155, 229, 161 )',
            'rgb(217, 155, 229 )',
            'rgb(155, 229, 220 )',
          ],
          hoverOffset: 4
        }]
      },
      // options: {...chartOptions}
    });
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }


}
