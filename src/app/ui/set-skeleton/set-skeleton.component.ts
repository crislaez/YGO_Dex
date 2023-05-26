import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-set-skeleton',
  template:`
  <ion-card class="slide-ion-card" >

    <div class="mat-card-header">
      <div class="div-image"></div>
    </div>

    <!-- <div class="card-content">
      <div class="div-p"></div>
    </div> -->
  </ion-card>
  `,
  styleUrls: ['./set-skeleton.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetSkeletonComponent {


}
