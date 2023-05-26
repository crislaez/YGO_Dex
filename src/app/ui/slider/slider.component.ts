import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { CardType } from '@ygodex/core/enums/card-type.enum';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { errorImage, getSliderConfig, sliceText, trackById } from '@ygodex/core/functions/generic.functions';
import SwiperCore, { Navigation } from 'swiper';
import { SwiperModule } from 'swiper/angular';
import { CardCardComponent } from '../card-card';
import { CardSkeletonComponent } from '../card-skeleton';
import { NewCardComponent } from '../new-card';
import { NewSkeletonComponent } from '../new-skeleton';
import { NoDataComponent } from '../no-data';
import { SetCardComponent } from '../set-card';
import { SetSkeletonComponent } from '../set-skeleton';

SwiperCore.use([Navigation]);

@Component({
  selector: 'app-slider',
  template: `
    <div class="header" no-border>
      <div class="div-center">
        <h2 class="text-color-ligth">{{ title | translate }}</h2>

        <span class="ion-activatable ripple-parent font-medium-4"
          *ngIf="showMore && !['pending','error']?.includes(status)"
          (click)="redirectTo.next(cardType)">
          {{ 'COMMON.SHEE_ALL' | translate }}

          <!-- RIPLE EFFECT  -->
          <ion-ripple-effect></ion-ripple-effect>
        </span>
      </div>
    </div>

    <ng-container *ngIf="status === EntityStatus.Loaded">
      <ng-container *ngIf="$any(items)?.length > 0; else noData">
        <swiper #swiper [ngStyle]="{'min-height': getMinHeigth() }" effect="fade" [config]="getSliderConfig(slidesPerView)" >
          <ng-template swiperSlide *ngFor="let item of items; trackBy: trackById" >

            <app-card-card
              *ngIf="cardType === CardType.Card"
              [item]="item"
              (onClick)="onClick.next(item)">
            </app-card-card>

            <app-set-card
              *ngIf="cardType === CardType.Set"
              [item]="item"
              (onClick)="onClick.next(item)">
            </app-set-card>

            <app-new-card
              *ngIf="cardType === CardType.New"
              [item]="item"
              (onClick)="onClick.next(item)">
            </app-new-card>

            <app-set-card
              *ngIf="cardType === CardType.Deck"
              [item]="item"
              (onClick)="onClick.next(item)">
            </app-set-card>

          </ng-template>
        </swiper>
      </ng-container>
    </ng-container>

    <ng-container *ngIf="status === EntityStatus.Pending">
      <swiper #swiper [ngStyle]="{'min-height': getMinHeigth() }" effect="fade" [config]="getSliderConfig(slidesPerView)">
        <ng-template swiperSlide *ngFor="let item of skeletonIndex">

          <app-card-skeleton
            *ngIf="cardType === CardType.Card">
          </app-card-skeleton>

          <app-set-skeleton
            *ngIf="cardType === CardType.Set">
          </app-set-skeleton>

          <app-new-skeleton
            *ngIf="cardType === CardType.New">
          </app-new-skeleton>

          <app-set-skeleton
            *ngIf="cardType === CardType.Deck">
          </app-set-skeleton>

        </ng-template>
      </swiper>
    </ng-container>

    <!-- IS ERROR -->
    <ng-container *ngIf="status === 'error'">
      <app-no-data [title]="'COMMON.ERROR'" [image]="ERROR_IMAGE" [top]="'3vh'"></app-no-data>
    </ng-container>

    <!-- IS NO DATA  -->
    <ng-template #noData>
      <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'15vh'"></app-no-data>
    </ng-template>
  `,
  styleUrls: ['./slider.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SwiperModule,
    TranslateModule,
    NoDataComponent,
    CardCardComponent,
    SetCardComponent,
    NewCardComponent,
    SetSkeletonComponent,
    CardSkeletonComponent,
    NewSkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent {

  sliceText = sliceText;
  trackById = trackById;
  errorImage = errorImage;
  getSliderConfig = getSliderConfig;
  EntityStatus = EntityStatus;
  CardType = CardType;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @Input() slidesPerView!: number;
  @Input() cardType!: CardType;
  @Input() title!: string;
  @Input() items!: any[];
  @Input() status!: EntityStatus;
  @Input() showMore!: boolean;
  @Output() onClick = new EventEmitter<any>();
  @Output() redirectTo = new EventEmitter<CardType>();
  skeletonIndex!: number [];


  ngOnInit(): void {
    this.skeletonIndex = [
      0,
      ...(this.cardType === CardType.New ? [ 1 ] : []),
      ...([CardType.Card, CardType.Set, CardType.Deck]?.includes(this.cardType) ? [1,2] : [])
    ]
  }

  getMinHeigth(): string {
    return {
      [CardType.Set]: '150px',
      [CardType.New]: '110px',
      [CardType.Card]: '250px',
      [CardType.Deck]: '150px',
      [CardType.BanlistOcg]: null,
      [CardType.BanlistTcg]: null,
      [CardType.Tournament]: null,
    }?.[this.cardType] || '150px'
  }

}
