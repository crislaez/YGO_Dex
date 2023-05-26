import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { filterByItem, gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Deck, DeckService } from '@ygodex/features/deck';
import { Set } from '@ygodex/features/set';
import { InfiniteScrollComponent } from '@ygodex/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { SetCardComponent } from '@ygodex/ui/set-card';
import { SetSkeletonComponent } from '@ygodex/ui/set-skeleton';
import { catchError, map, of, switchMap } from 'rxjs';
import { DecksPageState } from '../models/decks-page.models';

@Component({
  selector: 'app-decks',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.DECKS' | translate }}</h1>

      <div class="empty-div"></div>

      <div class="displays-center w-100">
        <form (submit)="searchSubmit($event)">
          <ion-searchbar animated="true"
            [placeholder]="'FILTERS.BY_NAME' | translate"
            [formControl]="search"
            (ionClear)="clearSearch($event)">
          </ion-searchbar>
        </form>
      </div>

      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending && state?.offset === offset">
        <ng-container *ngFor="let item of skeletonLength; trackBy: trackById">
          <app-set-skeleton></app-set-skeleton>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
          <ng-container *ngIf="$any(info)?.decks?.length > 0; else noData">

            <app-set-card
              *ngFor="let item of $any(info)?.decks; trackBy: trackById"
              [item]="item"
              (onClick)="openDeckModal($event)">
            </app-set-card>

            <app-infinite-scroll *ngIf="!state?.endsOffset"
              [slice]="$any(info)?.decks?.length|| 0"
              [total]="$any(info)?.total || 0"
              (loadDataTrigger)="loadData($event)">
            </app-infinite-scroll>

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
  styleUrls: ['./decks.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    NoDataComponent,
    SetCardComponent,
    FormsModule,
    ReactiveFormsModule,
    SetSkeletonComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecksComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  search = new FormControl(null);
  showButton: boolean = false;
  offset: number = 0;
  nextOffset: number = 20;
  deckChache: Deck[] = [];
  status: EntityStatus = EntityStatus.Initial;
  state!: DecksPageState;

  triggerLoad = new EventEmitter<DecksPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ offset, search }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.deckService.getAllPaginated(offset, search).pipe(
        map((decks) => {
          this.status = EntityStatus.Loaded;

          this.state = {
            ...this.state,
            endsOffset: decks?.length < this.offset
          };

          this.deckChache = filterByItem([
            ...this.deckChache,
            ...(decks ?? [])
          ], 'deckNum')

          return {
            decks: this.deckChache || []
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_DECKS');
          this.deckChache = [];

          return of({deck: []})
        })
      )
    })
    // ,tap(d => console.log(d))
  )

  constructor(
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private deckService: DeckService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) { }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.search.reset();
    this.state = this.changeComponentState();

    this.triggerLoad.next(this.state);
  }

  get skeletonLength(){
    return new Array(14)?.fill(0)?.map((_,index) => index)
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = this.changeComponentState({ search: this.search.value! });

    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = this.changeComponentState();

    this.triggerLoad.next(this.state);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};
      this.state = {
        ...this.state,
        offset: this.state.offset + this.nextOffset,
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.search.reset();
      this.state = this.changeComponentState();
      this.search.reset();

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  changeComponentState(data?: { offset?: number, search?: string }): DecksPageState {
    const { offset = this.offset, search = null! } = data || {};

    this.deckChache = [];

    return {
      offset,
      search,
      endsOffset: false
    };
  }

  async openDeckModal(item: Deck | Set): Promise<void> {
    this.modalService.open(item, 'decks');
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

}
