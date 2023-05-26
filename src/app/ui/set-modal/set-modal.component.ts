import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, ViewChild } from '@angular/core';
import { IonContent, IonicModule, ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { getCardsBySet, gotToTop, isNotEmptyObject, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { ItemInfo } from '@ygodex/core/models/item-info.models';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Card, CardService } from '@ygodex/features/card';
import { Set } from '@ygodex/features/set';
import { catchError, map, of, switchMap } from 'rxjs';
import { CardCardComponent } from '../card-card';
import { InfiniteScrollComponent } from '../infinite-scroll';
import { NoDataComponent } from '../no-data';
import { SetCardComponent } from '../set-card';
import { SpinnerComponent } from '../spinner';

interface SetComponentState {
  setName?: string;
  slice?: number;
  reload?: boolean;
}

@Component({
  selector: 'app-set-modal',
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
        <app-set-card
          [item]="item"
          [showTitle]="false"
          [height]="'47em'">
        </app-set-card>

        <!-- INFORMATION  -->
        <div class="div-center radius-25">
          <h2 class="text-color-light">{{ 'COMMON.INFORMATION' | translate }}</h2>
        </div>

        <div class="card text-color-light margin-bottom-20">
          <ng-container *ngFor="let info of setInfo; trackBy: trackById">
            <ng-container *ngIf="$any(item)?.[$any(info)?.field] as field">
              <div class="w-45 mb-10"> {{ $any(info)?.label | translate }}: </div>
              <div class="w-45 mb-10"> {{ field }} </div>
            </ng-container>
          </ng-container>
        </div>

        <!-- CARDS  -->
        <div class="div-center">
          <h2 class="text-color-light">{{ 'COMMON.CARDS' | translate }}</h2>
        </div>

        <ng-container *ngIf="status === EntityStatus.Pending && state?.slice === slice">
          <app-spinner [top]="'15%'"></app-spinner>
        </ng-container>

        <ng-container *ngIf="info$ | async as info">
          <ng-container *ngIf="status !== EntityStatus.Pending">
            <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
              <ng-container *ngIf="$any(info)?.cards?.length > 0; else noData">
                <div class="card displays-between text-color-light margin-bottom-20">

                  <app-card-card
                    *ngFor="let item of info?.cards; trackBy: trackById"
                    [item]="$any(item)"
                    [setName]="$any(state)?.setName"
                    [nameSlice]="15"
                    (onClick)="openCardModal($event)">
                  </app-card-card>

                  <app-infinite-scroll *ngIf="$any(info)?.cards?.length < $any(info)?.total"
                    [slice]="$any(info)?.cards?.length|| 0"
                    [total]="$any(info)?.total || 0"
                    [left]="'38%'"
                    (loadDataTrigger)="loadData($event)">
                  </app-infinite-scroll>

                </div>
              </ng-container>
            </ng-container>
          </ng-container>
        </ng-container>
      </div>

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

    <!-- TO TOP BUTTON  -->
    <ion-fab *ngIf="showButton" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button class="color-button-text" (click)="gotToTop(content)"> <ion-icon name="arrow-up-circle-outline"></ion-icon></ion-fab-button>
    </ion-fab>
  </ion-content>
  `,
  styleUrls: ['./set-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NoDataComponent,
    SpinnerComponent,
    SetCardComponent,
    CardCardComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetModalComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  isNotEmptyObject = isNotEmptyObject;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  @Input() item!: Set;
  showButton: boolean = false;
  setInfo: ItemInfo[] = [
    { id: 1, label: 'COMMON.DATE', field:'tcg_date' },
    { id: 2, label: 'COMMON.SET_CODE', field:'set_code' },
    { id: 3, label: 'COMMON.TOTAL_CARDS', field:'num_of_cards' },
  ];
  slice!: number;
  status: EntityStatus = EntityStatus.Initial;
  state!: SetComponentState;

  triggerLoad = new EventEmitter<SetComponentState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ reload, setName, slice }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.cardService.getAll(reload).pipe(
        map(cards => {
          this.status = EntityStatus.Loaded;
          const getCards = getCardsBySet(cards, setName!);

          return {
            cards: getCards?.slice(0, slice),
            total: getCards?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_CARD');

          return of({
            cards: [],
            total: 0
          })
        })
      )
    })
  );


  constructor(
    private cdRef: ChangeDetectorRef,
    private cardService: CardService,
    private modalService: ModalService,
    private modalController: ModalController,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService
  ) {
    this.slice = this.env.perPage
  }


  ionViewWillEnter(): void {
    this.state = this.changeComponentState()
    this.triggerLoad.next(this.state);
  }

  get name(){
    const { set_name = ''} = this.item || {};
    return set_name
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
      // this.search.reset();
      this.state = this.changeComponentState({reload: true});

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  openCardModal(card: Card): void {
    this.modalService.open(card, 'cards');
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  changeComponentState(data?: SetComponentState): SetComponentState {
    const { setName = this.name, reload = false, slice = this.slice } = data || {};
    return {
      setName,
      reload,
      slice
    };
  }


}
