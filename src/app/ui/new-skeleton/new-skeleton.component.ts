import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-new-skeleton',
  template: `
  <ion-card class="ion-activatable ripple-parent slide-ion-card"  >

    <div class="mat-card-header">
      <div class="div-image"></div>
    </div>

    <!-- <div class="card-content">
      <div class="div-p"></div>
    </div> -->
  </ion-card>
  `,
  styleUrls: ['./new-skeleton.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewSkeletonComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
