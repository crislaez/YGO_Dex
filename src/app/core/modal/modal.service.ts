import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Card } from '@ygodex/features/card';
import { CardFilter } from '@ygodex/features/card-filter';
import { Deck } from '@ygodex/features/deck';
import { New } from '@ygodex/features/new';
import { Set } from '@ygodex/features/set';
import { CardModalComponent } from '@ygodex/ui/card-modal';
import { DeckModalComponent } from '@ygodex/ui/deck-modal';
import { FilterModalComponent } from '@ygodex/ui/filter-modal';
import { SetModalComponent } from '@ygodex/ui/set-modal';
import { FieldType } from 'src/app/views/home/models/home.models';

@Injectable({
  providedIn: 'root'
})
export class ModalService {


  constructor(
    private modalController: ModalController,
  ) { }


  async open(item: Card | Set | New | Deck, field: FieldType): Promise<void> {
    const selectedComponent = {
      news: null,
      sets: SetModalComponent,
      cards: CardModalComponent,
      decks: DeckModalComponent,
    }?.[field];

    if(!selectedComponent) return;

    const modal = await this.modalController.create({
      component: selectedComponent,
      componentProps: {
        ...(field === 'cards' ? { card: item } : {}),
        ...(field !== 'cards' ? { item } : {})
      },
      ...(field === 'cards'
          ? {
              cssClass: 'my-custom-modal-css',
              breakpoints: [0, 0.2, 0.5, 1],
              initialBreakpoint: 0.50,
            }
          : {}
        )
    })

    await modal.present();
  }

  async openFilter<T>(filters: CardFilter, state: any, initialBreakpoint: number = 0.47): Promise<T | null> {
    const { types = [], attributes = [], races = [], level = [], archetypes = [], banlistOption = [] } = filters || {};
    const { filters: stateFilter } = state || {};

    const modal = await this.modalController.create({
      component: FilterModalComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        ...(types?.length > 0 ? { types } : {}),
        ...(attributes?.length ? { attributes } : {}),
        ...(races?.length > 0 ? { races } : {}),
        ...(level?.length > 0 ? { level } : {}),
        ...(archetypes?.length > 0 ? { archetypes } : {}),
        ...(banlistOption?.length > 0 ? { banlistOption } : {}),
        stateFilter
      },
      breakpoints: [0, 0.2, 0.5, 1],
      initialBreakpoint,
    });

    await modal.present();

    const { data = null } = await modal.onDidDismiss();

    return data
  }

}
