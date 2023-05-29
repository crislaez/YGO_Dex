import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { cardsFilter, gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Card, CardService } from '@ygodex/features/card';
import { CardFilterService } from '@ygodex/features/card-filter';
import { CardFilter } from '@ygodex/features/card-filter/models/card-filter.models';
import { CardCardComponent } from '@ygodex/ui/card-card';
import { CardSkeletonComponent } from '@ygodex/ui/card-skeleton';
import { InfiniteScrollComponent } from '@ygodex/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { catchError, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardsPageState } from '../models/card-page.models';

@Component({
  selector: 'app-cards',
  template:`
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.CARDS' | translate }}</h1>

      <div class="empty-div"></div>

      <div class="displays-center w-100">
        <form (submit)="searchSubmit($event)">
          <ion-searchbar animated="true"
            [placeholder]="'FILTERS.BY_NAME' | translate"
            [formControl]="search"
            (ionClear)="clearSearch($event)">
          </ion-searchbar>
        </form>

        <!-- FILTER  -->
        <ng-container *ngIf="(filters$ | async) as filters">
          <ion-button
            *ngIf="[EntityStatus.Loaded]?.includes(status)"
            class="displays-center class-ion-button"
            (click)="openFilterModal($any(filters))">
            <ion-icon name="options-outline"></ion-icon>
          </ion-button>
        </ng-container>
      </div>

      <div class="empty-div"></div>

      <ng-container *ngIf="status === EntityStatus.Pending && state?.slice === slice">
        <ng-container *ngFor="let item of skeletonLength; trackBy: trackById">
          <app-card-skeleton></app-card-skeleton>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="$any(info)?.cards?.length > 0; else noData">

              <app-card-card
                *ngFor="let item of info?.cards; trackBy: trackById"
                [item]="item"
                (onClick)="openCardModal($event)">
              </app-card-card>

              <app-infinite-scroll *ngIf="$any(info)?.cards?.length < $any(info)?.total"
                [slice]="$any(info)?.cards?.length || 0"
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
  styleUrls: ['./cards.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    NoDataComponent,
    CardCardComponent,
    FormsModule,
    ReactiveFormsModule,
    CardSkeletonComponent,
    InfiniteScrollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  slice!: number;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  state!: CardsPageState;

  triggerLoad = new EventEmitter<CardsPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({reload, search, slice, filters}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.cardService.getAll(reload).pipe(
        map((cards) => {
          this.status = EntityStatus.Loaded;

          const filterCards = cardsFilter(cards, {
            ...(filters ?? {}),
            ...(search ? { name: search } : {})
          });

          return {
            cards: filterCards?.slice(0, slice),
            total: filterCards?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_CARDS');

          return of({ cards: [], total: 0 })
        })
      )
    })
  );

  triggerLoadFilter = new EventEmitter<boolean>();
  filters$ = this.triggerLoadFilter.pipe(
    switchMap((reload) => {
      return this.cardFilterService.getAll(reload).pipe(
        catchError(() => {
          this.notificationService.failure('ERRORS.ERROR_LOAD_FILTERS');
          return of({})
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private cdRef: ChangeDetectorRef,
    private cardService: CardService,
    private modalService: ModalService,
    private cardFilterService: CardFilterService,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService
  ) {
    this.slice = this.env.perPage;
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.state = this.changeComponentState({ search: null!, reload: false });

    this.triggerLoad.next(this.state);
    this.triggerLoadFilter.next(false);
  }

  get skeletonLength(){
    return new Array(14)?.fill(0)?.map((_,index) => index)
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = this.changeComponentState({ search: this.search?.value!, filters: this.state?.filters });

    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = this.changeComponentState({ filters: this.state.filters });

    this.triggerLoad.next(this.state);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};
      this.state = {
        ...this.state,
        slice: this.state.slice! + this.slice,
        reload: false,
        filters: this.state.filters
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.search.reset();
      this.state = this.changeComponentState({ reload: true })

      this.triggerLoad.next(this.state);
      this.triggerLoadFilter.next(true);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  changeComponentState(data?: CardsPageState): CardsPageState {
    const { search = null!, reload = false, filters = null! } = data || {};
    return {
      ...this.state,
      slice: this.slice,
      search,
      reload,
      filters
    };
  }

  async openFilterModal(filters: CardFilter) {
    const data = await this.modalService.openFilter(filters, this.state);

    if(!data) return;

    this.state = this.changeComponentState({
      search: this.state?.search,
      filters: {
        ...(this.state?.filters ?? {}),
        ...(data ?? {})
      }
    });

    this.triggerLoad.next(this.state);
  }

  openCardModal(card: Card): void {
    this.modalService.open(card, 'cards');
  }


}
