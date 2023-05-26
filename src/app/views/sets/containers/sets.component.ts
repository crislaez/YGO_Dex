import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { filterItem, gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Deck } from '@ygodex/features/deck';
import { Set, SetService } from '@ygodex/features/set';
import { InfiniteScrollComponent } from '@ygodex/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { SetCardComponent } from '@ygodex/ui/set-card';
import { SetSkeletonComponent } from '@ygodex/ui/set-skeleton';
import { catchError, map, of, switchMap } from 'rxjs';
import { SetsPageState } from '../models/sets-page.models';


@Component({
  selector: 'app-sets',
  template:`
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.SETS' | translate }}</h1>

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

      <ng-container *ngIf="status === EntityStatus.Pending && state?.slice === slice">
        <ng-container *ngFor="let item of skeletonLength; trackBy: trackById">
          <app-set-skeleton></app-set-skeleton>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Pending">
          <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
            <ng-container *ngIf="$any(info)?.sets?.length > 0; else noData">

              <app-set-card
                *ngFor="let item of info?.sets; trackBy: trackById"
                [item]="item"
                [showDate]="true"
                (onClick)="openSetModal($event)">
              </app-set-card>

              <app-infinite-scroll *ngIf="$any(info)?.sets?.length < $any(info)?.total"
                [slice]="$any(info)?.sets?.length|| 0"
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
  styleUrls: ['./sets.component.scss'],
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
export class SetsComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  search = new FormControl(null)
  showButton: boolean = false;
  slice!: number;
  status: EntityStatus = EntityStatus.Initial;
  state!: SetsPageState;

  triggerLoad = new EventEmitter<SetsPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({reload, search, slice}) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.setService.getAll(reload).pipe(
        map(sets => {
          this.status = EntityStatus.Loaded;
          const filterSets = filterItem<Set>(search, 'set_name', sets);

          return {
            sets: filterSets?.slice(0, slice),
            total: filterSets?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_DATA');

          return of({ sets: [], total: 0 })
        })
        // ,tap(d => console.log(d))
      )
    })
  );


  constructor(
    private platform: Platform,
    private setService: SetService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService
  ) {
    this.slice = this.env.perPage
  }


  ionViewWillEnter(): void {
    this.content.scrollToTop();
    this.state = this.changeComponentState({search: null!, reload: false});

    this.triggerLoad.next(this.state);
  }

  get skeletonLength(){
    return new Array(14)?.fill(0)?.map((_,index) => index)
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = this.changeComponentState({search: this.search.value!});

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
        slice: this.state.slice + this.slice,
        reload: false
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.search.reset();
      this.state = this.changeComponentState({search: null!, reload: true});

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  changeComponentState(data?: {search?: string; reload?: boolean}): SetsPageState {
    const { search = null!, reload = false} = data || {};
    return {
      ...this.state,
      slice: this.slice,
      search,
      reload
    };
  }

  openSetModal(set: Set | Deck): void {
    this.modalService.open(set, 'sets');
  }


}
