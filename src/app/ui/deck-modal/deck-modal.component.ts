import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, ViewChild } from '@angular/core';
import { IonContent, IonicModule, ModalController, } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DECK_IMAGE_URL, ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { cardImageUrl, clearDeckItem, errorImage, gotToTop, isNotEmptyObject, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Card, CardService } from '@ygodex/features/card';
import { Deck } from '@ygodex/features/deck';
import { CardCardComponent } from '@ygodex/ui/card-card';
import { catchError, map, of, switchMap } from 'rxjs';
import { NoDataComponent } from '../no-data';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-deck-modal',
  template: `
  <ion-header class="ion-no-border" >
    <ion-toolbar >
      <ion-title class="text-color-light text-center">{{ name }}</ion-title>
      <ion-buttons class="text-color-light" slot="end">
        <ion-button class="ion-button-close" (click)="dismiss()"><ion-icon fill="clear" class="text-color-light" name="close-outline"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">
    <ng-container *ngIf="isNotEmptyObject(item); else noData">

      <div class="container components-background-dark container-top-radius">
        <ion-card class="banner-card card-card">
          <ion-img
            loading="lazy"
            [src]="image"
            [alt]="image"
            (ionError)="errorImage($event)">
          </ion-img>
        </ion-card>

        <ng-container *ngIf="status === EntityStatus.Pending">
          <app-spinner></app-spinner>
        </ng-container>

        <ng-container *ngIf="(cards$ | async) as cards">

          <!-- DESCRIPTION  -->
          <div class="div-center radius-25">
            <h2 class="text-color-light">{{ 'COMMON.DESCRIPTION' | translate }}</h2>
          </div>

          <div class="card text-color-light margin-bottom-20" [innerHTML]="$any(item)?.deck_description">
          </div>

          <!-- MAIN DECK  -->
          <div class="div-center">
            <h2 class="text-color-light">{{ 'COMMON.MAIN_DECK' | translate }} ({{ $any(mainDeck)?.length }} {{ 'COMMON.CARDS' | translate }})</h2>
          </div>

          <div class="card text-color-light margin-bottom-20">
            <img *ngFor="let item of mainDeck; let i = index; trackBy: trackById"
              loading="lazy"
              [ngStyle]="{ 'z-index': i, 'margin-left': !noMarginLeft.includes(i) ? '-11.5%' : '0' }"
              [src]="cardImageUrl(item)"
              [alt]="item"
              (click)="openCardModal(item, cards)"
            />
          </div>

          <!-- EXTRA DECK  -->
          <div class="div-center">
            <h2 class="text-color-light">{{ 'COMMON.EXTRA_DECK' | translate }} ({{ $any(extraDeck)?.length }} {{ 'COMMON.CARDS' | translate }})</h2>
          </div>

          <div class="card text-color-light margin-bottom-20">
            <ng-container *ngFor="let item of extraDeck; let i = index; trackBy: trackById">
              <img
                [ngStyle]="{ 'z-index': i, 'margin-left': !noMarginLeft.includes(i) ? '-11.5%' : '0' }"
                [src]="cardImageUrl(item)"
                [alt]="item"
                (click)="openCardModal(item, cards)"
              />
            </ng-container>
          </div>
        </ng-container>
      </div>

    </ng-container>

    <!-- IS NO DATA  -->
    <ng-template #noData>
      <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'30vh'"></app-no-data>
    </ng-template>

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./deck-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NoDataComponent,
    SpinnerComponent,
    CardCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeckModalComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  errorImage = errorImage;
  cardImageUrl = cardImageUrl;
  isNotEmptyObject = isNotEmptyObject;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  @Input() item!: Deck;
  noMarginLeft = [0,10,20,30,40,50,60]
  showButton: boolean = false;
  mainDeck!: string[];
  extraDeck!: string[];
  status: EntityStatus = EntityStatus.Initial;

  triggerLoad = new EventEmitter<boolean>();
  cards$ = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.cardService.getAll(reload).pipe(
        map(cards => {
          this.status = EntityStatus.Loaded;
          return cards || []
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('COMMON.ERROR_LOAD_BANLIST');

          return of([])
        })
      )
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    private cardService: CardService,
    private modalService: ModalService,
    private modalController: ModalController,
    private notificationService: NotificationService
  ) { }


  ionViewWillEnter(): void {
    const { main_deck, extra_deck } = (this.item as any) || {};
    this.mainDeck = clearDeckItem(main_deck);
    this.extraDeck = clearDeckItem(extra_deck);
    this.triggerLoad.next(false);

    this.cdRef.detectChanges();
  }

  get name() {
    return this.item?.deck_name || ''
  }

  get image() {
    const { set_image, cover_card } = (this.item as any)|| {};
    return set_image || DECK_IMAGE_URL?.replace('IMAGE', cover_card);
  }

  openCardModal(cardId: string, allCard: Card[]): void {
    const card = (allCard || [])?.find(({id}) => id === +cardId)

    if(!card) return;

    this.modalService.open(card, 'cards');
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
