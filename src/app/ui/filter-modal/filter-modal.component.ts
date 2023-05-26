import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { trackById } from '@ygodex/core/functions/generic.functions';
import { Filter } from '@ygodex/core/models/filter.models';
import { FiltersCard } from '@ygodex/features/card-filter';

interface FilterState {
  id: number;
  field?: FiltersCard;
  label?: string;
  values?: string[];
  defaultValue?: string;
};

@Component({
  selector: 'app-filter-modal',
  template:`
  <ion-content class="modal-wrapper components-background-dark">
    <ion-header translucent class="ion-no-border components-background-dark">
      <ion-toolbar class="components-background-dark">
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="dimiss()"><ion-icon name="close-outline"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <div class="displays-around modal-container components-background-dark">

      <ng-container *ngFor="let filter of filters; trackBy: trackById">
        <ng-container *ngIf="$any(filter)?.values?.length > 0">
          <ion-item  class="item-select font-medium">
            <ion-label>{{ $any(filter)?.label | translate }}</ion-label>

            <!-- interface="alert" -->
            <ion-select
              justify="space-between"
              interface="action-sheet"
              aria-label="filters"
              [placeholder]="$any(filter)?.label | translate"
              [value]="$any(filter)?.defaultValue"
              (ionChange)="changeFilter($any($event), $any(filter)?.field)">
              <ion-select-option value="">{{ 'COMMON.EVERYONE' | translate }}</ion-select-option>
              <ion-select-option  *ngFor="let value of $any(filter)?.values; trackBy: trackById" [value]="value">
                {{ value }}
              </ion-select-option>
            </ion-select>

          </ion-item>
        </ng-container>
      </ng-container>

    </div>

  </ion-content>
  `,
  styleUrls: ['./filter-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterModalComponent {

  trackById = trackById;
  @Input() types!: string[];
  @Input() attributes!: string[];
  @Input() races!: string[];
  @Input() level!: string[];
  @Input() archetypes!: string[];
  @Input() banlistOption!: string[];
  @Input() stateFilter!: Filter;
  filters!: any[]; //FilterState


  constructor(
    private cdRef: ChangeDetectorRef,
    public modalController: ModalController
  ) { }


  ionViewWillEnter(): void {
    const { types = null, attributes = null, races = null, level = null, archetypes = null, banlistOption = null } = this.stateFilter || {};

    this.filters = [
      ...(this.types?.length > 0
          ?
            [
              { id:1, field: 'types', label:'FILTERS.BY_TYPE', values: this.types, defaultValue: types! }
            ]
          : []
      ),
      ...(this.attributes?.length > 0
          ?
            [
              { id:2, field: 'attributes', label:'FILTERS.BY_ATTRIBUTE', values: this.attributes, defaultValue: attributes! }
            ]
          : []),
      ...(this.races?.length > 0
          ?
            [
              { id:3, field: 'races', label:'FILTERS.BY_RACE', values: this.races, defaultValue: races! }
            ]
          : []
          ),
      ...(this.level?.length > 0
          ?
            [
              { id:4, field: 'level', label:'FILTERS.BY_LEVEL', values: this.level, defaultValue: level! }
            ]
          : []
        ),
      ...(this.archetypes?.length > 0
          ?
            [
              { id:5, field: 'archetypes', label:'FILTERS.BY_ARCHETYPE', values: this.archetypes, defaultValue: archetypes! }
            ]
          : []
        ),
      ...(this.banlistOption?.length > 0
          ?
            [
              { id:6, field: 'banlistOption', label:'FILTERS.BY_BANLIST_OPTION', values: this.banlistOption, defaultValue: banlistOption! }
            ]
          : []
        ),
    ];

    this.cdRef.detectChanges();
  }

  changeFilter(event: any, field: FiltersCard): void {
    const { detail } = event || {};
    const { value = null } = detail || {};
    this.modalController.dismiss({[field]: value});
  }

  dimiss() {
    this.modalController.dismiss(false);
  }

}
