import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CardType } from '@ygodex/core/enums/card-type.enum';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Card, CardService } from '@ygodex/features/card';
import { Deck, DeckService } from '@ygodex/features/deck';
import { New, NewService } from '@ygodex/features/new';
import { Set, SetService } from '@ygodex/features/set';
import { SliderComponent } from '@ygodex/ui/slider/slider.component';
import { catchError, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import { FieldType, HomeInfoIterator } from '../models/home.models';

@Component({
  selector: 'app-home',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.HOME' | translate }}</h1>

      <ng-container *ngFor="let item of infoIterator; trackBy: trackById">
        <app-slider
          [cardType]="item?.type!"
          [slidesPerView]="item?.slidesPerView!"
          [title]="item?.title!"
          [items]="$any((info$ | async))?.[item?.field!]!"
          [status]="status"
          [showMore]="item?.showMore!"
          (redirectTo)="redirectTo($event)"
          (onClick)="onClick($event, item?.field!)">
        </app-slider>

        <div class="empty-div"></div>
      </ng-container>

      <div class="header" no-border>
        <div class="div-center">
          <h2 class="text-color-ligth">{{ 'COMMON.BANLIST' | translate }}</h2>
        </div>
      </div>

      <div class="displays-around div-banlist">
        <div class="displays-center components-background-primary w-45 height-100"
          (click)="redirectTo(CardType.BanlistTcg)">
          <div class="span-bold">{{ 'COMMON.TCG' | translate }}</div>
        </div>
        <div class="displays-center components-background-sixtiary w-45 height-100"
        (click)="redirectTo(CardType.BanlistOcg)">
          <div class="span-bold">{{ 'COMMON.OCG' | translate }}</div>
        </div>
      </div>

      <!-- <div class="header" no-border>
        <div class="div-center">
          <h2 class="text-color-ligth">{{ 'COMMON.LAST_TOURNAMENT' | translate }}</h2>
        </div>
      </div>

      <div class="displays-around div-banlist">
        <div class="displays-center components-background-seventiary w-96 height-100"
          (click)="redirectTo(CardType.Tournament)">
          <div class="span-bold">{{ 'COMMON.TOURNAMENT' | translate }}</div>
        </div>
      </div> -->

      <!-- REFRESH -->
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

    </div>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    SliderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  CardType = CardType;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  status: EntityStatus = EntityStatus.Initial;

  infoIterator: HomeInfoIterator[] = [
    // { slidesPerView: 1, field: 'news', type: CardType.New, title: 'COMMON.NEWS', showMore: true },
    { slidesPerView: 1.5, field: 'sets',  type: CardType.Set, title: 'COMMON.LAST_SETS', showMore: true },
    { slidesPerView: 2.5, field: 'cards',  type: CardType.Card, title: 'COMMON.CARDS', showMore: true },
    // { slidesPerView: 1.5, field: 'decks',  type: CardType.Deck, title: 'COMMON.DECKS', showMore: true },
  ];

  triggerLoad = new EventEmitter<boolean>();
  info$ = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return forkJoin({
        cards: this.carService.getAll(reload).pipe(catchError(() => of([]))),
        sets: this.setService.getAll(reload).pipe(catchError(() => of([]))),
        news: this.newService.getAll(reload).pipe(catchError(() => of([]))),
        decks: this.deckService.getAll(reload).pipe(catchError(() => of([]))),
      }).pipe(
        map((response) => {
          this.status = EntityStatus.Loaded;
          const { cards = [], sets = [], news = [], decks = [] } = response || {};
          return {
            cards: cards?.slice(0,7),
            sets: sets?.slice(0,7),
            news: news?.slice(0,7),
            decks: decks?.slice(0,7),
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_DATA');
          return of({ cards: [], sets: [], news: [], decks: [] })
        })
      )
    })
    // ,tap(d => console.log(d))
    ,shareReplay(1)
  );


  constructor(
    private router: Router,
    private newService: NewService,
    private setService: SetService,
    private carService: CardService,
    private deckService: DeckService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) { }


  ionViewWillEnter(): void {
    this.content.scrollToTop();

    this.triggerLoad.next(false);
  }

  onClick(item: Card | Set | New | Deck, field: FieldType): void {
    // console.log(field, ' => ' ,item) //TODO
    this.modalService.open(item, field);
  }

  redirectTo(cardType: CardType): void {
    const urls = {
      Card: '/cards',
      Set: '/sets',
      New: '/news',
      Deck: '/decks',
      Tcg: '/banlist/tcg',
      Ocg: '/banlist/ocg',
      Tournament: '/tournament'
    }?.[cardType] || '/home';

    this.router.navigate([urls])
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.triggerLoad.next(true);

      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
   this.showButton = scrollTop >= 300;
  }

}
