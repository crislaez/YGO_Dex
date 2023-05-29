import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { filterByItem, gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { New, NewService } from '@ygodex/features/new';
import { InfiniteScrollComponent } from '@ygodex/ui/infinite-scroll';
import { NewCardComponent } from '@ygodex/ui/new-card';
import { NewSkeletonComponent } from '@ygodex/ui/new-skeleton';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { catchError, map, of, switchMap } from 'rxjs';
import { NewsPageState } from '../models/news-page.models';


@Component({
  selector: 'app-news',
  template:`
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.NEWS' | translate }}</h1>

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
          <app-new-skeleton></app-new-skeleton>
        </ng-container>
      </ng-container>

      <ng-container *ngIf="(info$ | async) as info">
        <ng-container *ngIf="status !== EntityStatus.Error; else serverError">
          <ng-container *ngIf="$any(info)?.news?.length > 0; else noData">

            <app-new-card
              *ngFor="let item of info?.news; trackBy: trackById"
              [item]="item"
              (onClick)="openNewModal($event)">
            </app-new-card>

            <app-infinite-scroll *ngIf="!state?.endsOffset"
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
  styleUrls: ['./news.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    TranslateModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NoDataComponent,
    NewCardComponent,
    NewSkeletonComponent,
    InfiniteScrollComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  offset: number = 0;
  nextOffset: number = 10;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  state!: NewsPageState;
  newsChache: New[] = []
  triggerLoad = new EventEmitter<NewsPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ offset, search }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.newsService.getAllPaginated(offset, search).pipe(
        map(news => {
          this.status = EntityStatus.Loaded;

          this.state = {
            ...this.state,
            endsOffset: news?.length < this.nextOffset
          };

          this.newsChache = filterByItem<New>([
            ...this.newsChache,
            ...(news ?? [])
          ], 'number');

          return {
            news: this.newsChache || []
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('ERRORS.ERROR_LOAD_DATA');
          this.newsChache = [];

          return of({ news: []})
        })
      )
    })
    // ,tap(d => console.log(d))
  );


  constructor(
    private platform: Platform,
    private newsService: NewService,
    private cdRef: ChangeDetectorRef,
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

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  changeComponentState(data?: { offset?: number, search?: string }): NewsPageState {
    const { offset = this.offset, search = null! } = data || {};

    this.newsChache = [];

    return {
      offset,
      search,
      endsOffset: false
    };
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  openNewModal(news: New): any { // Promise<void>
    // console.log(news)
    // TODO
  }


}
