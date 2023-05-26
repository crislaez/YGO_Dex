import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DECK_IMAGE_URL } from '@ygodex/core/constants/generic.constants';
import { errorImage, sliceText } from '@ygodex/core/functions/generic.functions';
import { Deck } from '@ygodex/features/deck/models/deck.models';
import { Set } from '@ygodex/features/set';


@Component({
  selector: 'app-set-card',
  template: `
  <ion-card
    class="ion-activatable ripple-parent"
    [ngStyle]="{'height': height}"
    (click)="onClick.next($any(item))">

    <img class="card-image" loading="lazy"
      [ngSrc]="image"
      [alt]="'albun picture'"
      (error)="errorImage($event)"
      fill/>

    <!-- RIPLE EFFECT  -->
    <ion-ripple-effect></ion-ripple-effect>
  </ion-card>

  <div *ngIf="showTitle" class="text-color-light displays-center margin-top-10 font-medium">
    <div>{{ sliceText(name, 25) }}</div>
  </div>

  <div *ngIf="showDate && $any(item)?.tcg_date" class="text-color-light displays-center margin-top-10 font-medium">
    <div>{{ $any(item)?.tcg_date }}</div>
  </div>
  `,
  styleUrls: ['./set-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetCardComponent {

  sliceText = sliceText;
  errorImage = errorImage;
  @Input() item!: Set | Deck;
  @Input() height: string = '16em';
  @Input() showTitle: boolean = true;
  @Input() showDate: boolean = false;
  @Output() onClick = new EventEmitter<Set | Deck>();


  get name() {
    const { set_name, deck_name } = (this.item as any) || {};
    return set_name || deck_name || '-'
  }

  get image() {
    const { set_image, cover_card } = (this.item as any)|| {};
    return set_image || DECK_IMAGE_URL?.replace('IMAGE', cover_card);
  }

}
