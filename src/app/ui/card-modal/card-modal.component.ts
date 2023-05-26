import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ERROR_IMAGE, NO_DATA_IMAGE } from '@ygodex/core/constants/generic.constants';
import { EntityStatus } from '@ygodex/core/enums/status.enum';
import { errorImage, gotToTop, isNotEmptyObject, trackById } from '@ygodex/core/functions/generic.functions';
import { ModalService } from '@ygodex/core/modal/modal.service';
import { ItemInfo } from '@ygodex/core/models/item-info.models';
import { NotificationService } from '@ygodex/core/notification/notification.service';
import { Card } from '@ygodex/features/card';
import { Set } from '@ygodex/features/set';
import { SetService } from '@ygodex/features/set/services/set.service';
import { CardCardComponent } from '@ygodex/ui/card-card';
import { catchError, map, of, switchMap } from 'rxjs';
import { NoDataComponent } from '../no-data';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-card-modal',
  template: `
  <ion-content class="modal-wrapper components-background-dark">
    <ion-header translucent class="ion-no-border components-background-dark">
      <ion-toolbar class="components-background-dark">
        <ion-title class="text-color-light text-center">
          {{ name }}
        </ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="dismiss()"><ion-icon name="close-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <div class="displays-around modal-container components-background-dark">
      <ng-container *ngIf="isNotEmptyObject(card); else noData">
        <div class="empty-div"></div>

        <app-card-card
          [item]="card"
          [height]="'34em'"
          [showTitle]="false">
        </app-card-card>

        <ng-container *ngIf="status === EntityStatus.Pending">
          <app-spinner></app-spinner>
        </ng-container>

        <ng-container *ngIf="(sets$ | async) as sets">

          <!-- DESCRIPTION  -->
          <div class="div-center radius-25">
            <h2 class="text-color-light">{{ 'COMMON.DESCRIPTION' | translate }}</h2>
          </div>

          <div class="card text-color-light margin-bottom-20">
            {{ $any(card)?.desc}}
          </div>

          <!-- INFO  -->
          <div class="div-center">
            <h2 class="text-color-light">{{ 'COMMON.INFORMATION' | translate }}</h2>
          </div>

          <div class="card text-color-light margin-bottom-20">
            <ng-container *ngFor="let item of cardInfo; trackBy: trackById">
              <ng-container *ngIf="$any(card)?.[$any(item)?.field] as field">
                <div class="w-45 mb-10"> {{ $any(item)?.label | translate }}:</div>
                <div class="w-45 mb-10"> {{ field }} </div>
              </ng-container>
            </ng-container>
          </div>

          <!-- SETS  -->
          <ng-container *ngIf="$any(card?.card_sets)?.length > 0">
            <div class="div-center">
              <h2 class="text-color-light">{{ 'COMMON.SETS' | translate }}</h2>
            </div>

            <div class="card displays-between text-color-light margin-bottom-20">
              <ng-container *ngFor="let set of card?.card_sets">
                <ng-container *ngIf="getSet(set, sets) as selectedSet">
                  <div class="w-30 pl-5 pr-5">
                    <img
                      loading="lazy"
                      [src]="selectedSet?.set_image"
                      [alt]="selectedSet?.set_image"
                      (error)="errorImage($event)"
                      (click)="openSetModal(selectedSet)"
                    />
                    <label> {{ 'COMMON.PRICE' | translate }}:
                      <span class="text-color-seventiary">{{ $any(selectedSet)?.set_price }} $</span>
                    </label>
                    <br>
                    <label> {{ 'COMMON.RARITY' | translate }}:
                      <span class="text-color-seventiary">{{ $any(selectedSet)?.set_rarity_code }}</span>
                    </label>
                  </div>
                </ng-container>
              </ng-container>
            </div>
          </ng-container>
        </ng-container>
      </ng-container>

      <!-- IS NO DATA  -->
      <ng-template #noData>
        <app-no-data [title]="'COMMON.NORESULT'" [image]="NO_DATA_IMAGE" [top]="'10vh'"></app-no-data>
      </ng-template>

    </div>
  </ion-content>
  `,
  styleUrls: ['./card-modal.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    IonicModule,
    TranslateModule,
    NoDataComponent,
    SpinnerComponent,
    CardCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardModalComponent  {

  gotToTop = gotToTop;
  trackById = trackById;
  errorImage = errorImage;
  isNotEmptyObject = isNotEmptyObject;
  EntityStatus = EntityStatus;
  ERROR_IMAGE = ERROR_IMAGE;
  NO_DATA_IMAGE = NO_DATA_IMAGE;
  @Input() card!: Card;
  showButton: boolean = false;
  cardInfo: ItemInfo[] = [
    { id: 1, label: 'COMMON.LEVEL', field:'level' },
    { id: 2, label: 'COMMON.TYPE', field:'type' },
    { id: 3, label: 'COMMON.RACE', field:'race' },
    { id: 4, label: 'COMMON.ATTACK', field:'atk' },
    { id: 5, label: 'COMMON.DEFENSE', field:'def' },
  ];
  status: EntityStatus = EntityStatus.Initial;

  triggerLoad = new EventEmitter<boolean>();
  sets$ = this.triggerLoad.pipe(
    switchMap((reload) => {
      this.status = EntityStatus.Pending;
      this.cdRef.detectChanges();

      return this.SetService.getAll(reload).pipe(
        map(sets => {
          this.status = EntityStatus.Loaded;
          return sets
        }),
        catchError(() => {
          this.status = EntityStatus.Error;
          this.notificationService.failure('COMMON.ERROR_LOAD_SETS');

          return of([])
        })
      )
    })
  );


  constructor(
    private SetService: SetService,
    private cdRef: ChangeDetectorRef,
    private modalService: ModalService,
    private modalController: ModalController,
    private notificationService: NotificationService
  ) { }


  ionViewWillEnter(): void {
    this.triggerLoad.next(false);
  }

  get name(){
    const { name = '' } = this.card || {};
    return name
  }

  get image(){
    const { card_images } = this.card || {};
    const [ firstImages ] = card_images || [];
    const { image_url = '' } = firstImages || {};
    return image_url;
  }

  getSet(item: Partial<Set>, sets: Set[]): Set {
    const { set_name } = item || {};
    const selectedSet = sets?.find((item) => item?.set_name === set_name);

    return {
      ...(selectedSet ?? {}),
      ...(item ?? {})
    }
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  openSetModal(set: Set): void {
    this.dismiss();
    this.modalService.open(set, 'sets');
  }


}
