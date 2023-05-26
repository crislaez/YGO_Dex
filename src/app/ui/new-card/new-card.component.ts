import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { errorImage, sliceText } from '@ygodex/core/functions/generic.functions';
import { New } from '@ygodex/features/new';

@Component({
  selector: 'app-new-card',
  template: `
  <ion-card class="ion-activatable ripple-parent" (click)="onClick.next($any(item))">
    <img class="card-image" loading="lazy"
      [ngSrc]="image"
      [alt]="'albun picture'"
      (error)="errorImage($event)"
      fill/>

    <!-- RIPLE EFFECT  -->
    <ion-ripple-effect></ion-ripple-effect>
  </ion-card>

  <div class="text-color-light displays-center margin-top-10 font-medium">
    <div>{{ sliceText(name, 30) }}</div>
  </div>
  `,
  styleUrls: ['./new-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    NgOptimizedImage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCardComponent {

  sliceText = sliceText;
  errorImage = errorImage;
  @Input() item!: New;
  @Output() onClick = new EventEmitter<New>()

  get name() {
    const { title } = this.item || {};
    return title || '-'
  }

  get image() {
    const { image_card } = this.item || {};
    return image_card || '';
  }

}
