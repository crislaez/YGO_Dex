import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Banlist } from '@ygodex/app/core/enums/banlist.enum';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { banlistFilter, gotToTop, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { BanlistService } from '@ygodex/features/banlist';
import { Card } from '@ygodex/features/card';
import { CardCardComponent } from '@ygodex/ui/card-card';
import { CardSkeletonComponent } from '@ygodex/ui/card-skeleton';
import { InfiniteScrollComponent } from '@ygodex/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/ui/no-data';
import { catchError, map, of, switchMap } from 'rxjs';
import { BanlistPageState } from '../models/banlist-page.models';

@Component({
  selector: 'app-banlist',
  template: `
  <ion-content [fullscreen]="true" [scrollEvents]="true" (ionScroll)="logScrolling($any($event))">

    <div class="empty-header components-background-dark">
    </div>

    <div class="container components-background-dark">
      <h1 class="text-color-gradient">{{ 'COMMON.BANLIST' | translate }}
        <span class="capital-letter">{{ $any(state)?.banlistType }}</span>
      </h1>

      <div class="empty-div"></div>

      <div class="displays-center w-100">
        <form (submit)="searchSubmit($event)">
          <ion-searchbar animated="true"
            [placeholder]="'FILTERS.BY_NAME' | translate"
            [formControl]="search"
            (ionClear)="clearSearch($event)">
          </ion-searchbar>
        </form>

        <ion-button
          *ngIf="[EntityStatus.Loaded]?.includes(status)"
          class="displays-center class-ion-button"
          (click)="openFilterModal()">
          <ion-icon name="options-outline"></ion-icon>
        </ion-button>
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
            <ng-container *ngIf="$any(info)?.banlist?.length > 0; else noData">

              <app-card-card
                *ngFor="let item of info?.banlist; trackBy: trackById"
                [item]="item"
                (onClick)="openCardModal($event)">
              </app-card-card>

              <app-infinite-scroll *ngIf="$any(info)?.banlist?.length < $any(info)?.total"
                [slice]="$any(info)?.banlist?.length || 0"
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
  styleUrls: ['./banlist.component.scss'],
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
export class BanlistComponent {

  gotToTop = gotToTop;
  trackById = trackById;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @ViewChild(IonContent, {static: true}) content!: IonContent;
  showButton: boolean = false;
  filters: string[] = [
    Banlist.Banned,
    Banlist.Limited,
    Banlist.SemiLimited
  ];

  slice!: number;
  search = new FormControl(null);
  status: EntityStatus = EntityStatus.Initial;
  state!: BanlistPageState;

  triggerLoad = new EventEmitter<BanlistPageState>();
  info$ = this.triggerLoad.pipe(
    switchMap(({ banlistType, reload, search, slice, banlistOption }) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.banlistService.getAll(reload).pipe(
        map(banlist => {
          this.status = EntityStatus.Loaded;

          const filterCards = banlistFilter(
            banlist?.[banlistType!],
            {
              search: search!,
              banlistOption: banlistOption!
            },
            banlistType!
          );

          return {
            banlist: filterCards?.slice(0, slice),
            total: filterCards?.length
          }
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('COMMON.ERROR_LOAD_BANLIST');

          return of({ banlist: [], total: 0});
        })
      )
    })
  );


  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    private banlistService: BanlistService,
    @Inject(ENVIRONMENT) private env: Environment,
    private notificationService: NotificationService
  ) {
    this.slice = this.env.perPage;
   }


  ionViewWillEnter(): void {
    this.content.scrollToTop();

    this.state = this.changeComponentState({
      search: null!,
      reload: false
    });

    this.triggerLoad.next(this.state);
  }

  get skeletonLength(){
    return new Array(15)?.fill(0)?.map((_,index) => index)
  }

  searchSubmit(event: Event): void{
    event.preventDefault();
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.state = this.changeComponentState({ search: this.search.value!, banlistOption: this.state?.banlistOption });

    this.triggerLoad.next(this.state);
  }

  clearSearch(event: any): void{
    if(!this.platform.is('mobileweb')) Keyboard.hide();
    this.search.reset();
    this.state = this.changeComponentState({ banlistOption: this.state?.banlistOption });

    this.triggerLoad.next(this.state);
  }

  loadData(data: {event: any, total: number}): void {
    setTimeout(() => {
      const { event } = data || {};
      this.state = {
        ...this.state,
        slice: this.state.slice! + this.slice,
        reload: false,
        banlistOption: this.state.banlistOption
      };

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  doRefresh(event: any) {
    setTimeout(() => {
      this.search.reset();
      this.state = this.changeComponentState({ reload: true });

      this.triggerLoad.next(this.state);
      event.target.complete();
    }, 500);
  }

  logScrolling({detail:{scrollTop = 0}}): void{
    this.showButton = scrollTop >= 300;
  }

  changeComponentState(data?:BanlistPageState): BanlistPageState {
    const { reload = false, search = null!, slice = this.slice, banlistOption = null! } = data || {};

    return {
      banlistType: this.route.snapshot.data?.['route'] || 'tcg',
      reload,
      slice,
      search,
      banlistOption
    };
  }

  openCardModal(card: Card): void {
    this.modalService.open(card, 'cards');
  }

  async openFilterModal() {
    const { banlistOption } = this.state || {};

    const data: any = await this.modalService.openFilter({
      banlistOption: this.filters
    }, {
      filters: {
        banlistOption
      }
    }, 0.15);

    if(!data) return;

    this.state = this.changeComponentState({ search: this.state?.search, ...(data ?? {}) })
    this.triggerLoad.next(this.state);
  }


}
