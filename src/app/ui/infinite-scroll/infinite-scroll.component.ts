import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'app-infinite-scroll',
  template: `
    <ion-infinite-scroll threshold="100px" (ionInfinite)="loadData($event, total)">
      <ion-infinite-scroll-content class="loadingspinner">
        <app-spinner [top]="'0%'" [left]="left"></app-spinner>
      </ion-infinite-scroll-content>
    </ion-infinite-scroll>
  `,
  styleUrls: ['./infinite-scroll.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfiniteScrollComponent {

  @Input() slice!: number;
  @Input() total!: number;
  @Input() left: string = '45%';
  @Output() loadDataTrigger = new EventEmitter<{event: any, total:number}>();


  loadData(event: any, total:number): void{
    this.loadDataTrigger.next({event, total})
  }

}
