import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { IonicModule, MenuController, ModalController, Platform } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { trackById } from '@ygodex/core/functions/generic.functions';
import { GenericObj } from '@ygodex/core/models/generic.models';
import { NotificationModalComponent } from '@ygodex/ui/notification-modal';
import { filter, map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
    <!-- HEADER  -->
    <ion-header class="ion-no-border" >
      <ion-toolbar *ngIf="(currentSection$ | async) as currentSection">

        <!-- nav icon  -->
        <ion-back-button
          *ngIf="!excludesURL?.includes(currentSection?.route!)"
          class="text-color-light"
          slot="start"
          [defaultHref]="redirectoTo(currentSection)"
          [text]="''">
        </ion-back-button>

        <!-- title  -->
        <ion-title class="text-color-light text-center">
        {{ $any(currentSection)?.title | translate }}
        </ion-title>

        <ion-icon
          class="text-color-light"
          slot="end"
          name="ellipsis-horizontal-outline"
          (click)="presentModal()">
        </ion-icon>
      </ion-toolbar>

    </ion-header>

    <!-- RUTER  -->
    <ion-router-outlet id="main"></ion-router-outlet>

  </ion-app>
  `,
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    RouterModule,
  ]
})
export class AppComponent {

  trackById = trackById;
  excludesURL: string [] = ['home'];

  modal!: HTMLIonModalElement;
  currentSection$ = this.router.events.pipe(
    filter((event: any) => event instanceof NavigationStart),
    map((event: NavigationEnd) => {
      const { url = ''} = event || {};
      const [, route = 'home', params = null ] = url?.split('/') || [];
      return {
        'home':{route, title: 'COMMON.TITLE'},
        'sets':{route, title: 'COMMON.TITLE'},
        'cards':{route, title: 'COMMON.TITLE'},
        'news':{route, title: 'COMMON.TITLE'},
        'decks':{route, title: 'COMMON.TITLE'},
        'banlist':{route, title: 'COMMON.TITLE'},
        'tournament':{route, title: 'COMMON.TITLE'},
      }?.[route] || {route: 'home', title:'COMMON.TITLE'};
    }),
    // tap(d => console.log(d)),
    shareReplay(1)
  );

  constructor(
    private router: Router,
    // private location: Location,
    private platform: Platform,
    private menu: MenuController,
    private modalController: ModalController,
  ) {
    if(!this.platform.is('mobileweb')){
      this.lockAppOrientation();
    }
  }


  redirectoTo(currentSection: GenericObj<any>): string{
    // this.location.back();
    const { route, params } = currentSection || {};
    // if(['predicaciones']?.includes(params)) return '/albums';

    const redirectTo: {[key:string]: string} = {
      'home':'/home',
    };

    return redirectTo?.[route] || '/home';
  }

  // OPEN FILTER MODAL
  async presentModal() {
    const modal = await this.modalController.create({
      component: NotificationModalComponent,
    });

    modal.present();
    await modal.onDidDismiss();
  }

  async lockAppOrientation(): Promise<void> {
    await ScreenOrientation.lock({orientation: 'portrait'})
  }
}
