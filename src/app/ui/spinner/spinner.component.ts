import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div [style]="{'margin-top':top,  'margin-left': left}"  class="loadingspinner"></div>
  `,
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() top: string = '65%';
  @Input() left: string = '45%';

}
