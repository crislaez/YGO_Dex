import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { BANNED, LIMIT, SEMI_LIMIT } from '@ygodex/core/constants/generic.constants';
import { Banlist } from '@ygodex/core/enums/banlist.enum';
import { errorImage, getObjectKeys, sliceText, trackById } from '@ygodex/core/functions/generic.functions';
import { Card } from '@ygodex/features/card';

@Component({
  selector: 'app-card-card',
  template: `
  <ion-card
    class="ion-activatable ripple-parent"
    [ngStyle]="{'height': height}"
    (click)="onClick.next($any(item))">

    <img class="card-image" loading="lazy"
      [ngSrc]="image"
      [alt]="'albun picture'"
      (error)="errorImage($event)"
      fill
    />

      <div *ngIf="item?.banlist_info" class="banlist-wrapper">
        <ng-container *ngFor="let banlistKey of getObjectKeys(item?.banlist_info); trackBy: trackById">
          <ng-container *ngIf="$any(item)?.banlist_info?.[banlistKey] as itemBanlist">
            <div class="displays-center-end">
              <span
                class="span-bold capital-letter"
                [ngClass]="{'forbidden': itemBanlist === Banlist.Banned, 'limited': itemBanlist === Banlist.Limited, 'semi-limited': itemBanlist === Banlist.SemiLimited}">
                {{ clearText(banlistKey) }}:
              </span>

              <img [src]="(itemBanlist === Banlist.Banned
                          ? BANNED
                          : itemBanlist === Banlist.Limited
                          ? LIMIT
                          : itemBanlist === Banlist.SemiLimited
                          ? SEMI_LIMIT
                          : SEMI_LIMIT)"
              />
            </div>
          </ng-container>
        </ng-container>
      </div>

    <ion-ripple-effect></ion-ripple-effect>
  </ion-card>

  <div *ngIf="showTitle" class="text-color-light displays-center margin-top-10 font-medium">
    <ng-container *ngIf="setName">
      <ng-container *ngIf="getSetInfo() as setInfo">
        <div class="text-color-seventiary">{{ setInfo?.setCode }} {{ setInfo?.setRarity }}</div>
      </ng-container>
    </ng-container>

    <div>{{ sliceText(name, nameSlice) }}</div>
  </div>
  `,
  styleUrls: ['./card-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardCardComponent {

  trackById = trackById;
  sliceText = sliceText;
  errorImage = errorImage;
  getObjectKeys = getObjectKeys;
  Banlist = Banlist;
  LIMIT = LIMIT;
  BANNED = BANNED;
  SEMI_LIMIT = SEMI_LIMIT;
  @Input() item!: Card;
  @Input() nameSlice: number = 20;
  @Input() setName!: string;
  @Input() height: string = '15em';
  @Input() showTitle: boolean = true;
  @Output() onClick = new EventEmitter<Card>()


  get name() {
    const { name } = this.item || {};
    return name || '-'
  }

  get image() {
    const { card_images } = this.item || {};
    const [ firstIamge ] = card_images || [];
    const { image_url } = firstIamge || {};
    return image_url || '';
  }

  clearText(text: string): string {
    return !text ? '' : text?.replace(/ban_/g,' ');
  }

  getSetInfo(): {setCode: string; setRarity: string} {
    const { card_sets = []} = this.item || {};
    const rarity = card_sets?.find(element => element?.set_name === this.setName)
    return {
      setCode: rarity?.set_code!,
      setRarity: rarity?.set_rarity_code!
    };
  }



}
