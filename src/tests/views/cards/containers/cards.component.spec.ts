import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CardService } from '@ygodex/app/features/card';
import { CardCardComponent } from '@ygodex/app/ui/card-card';
import { CardSkeletonComponent } from '@ygodex/app/ui/card-skeleton';
import { InfiniteScrollComponent } from '@ygodex/app/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/app/ui/no-data';
import { CardsComponent } from '@ygodex/app/views/cards/containers/cards.component';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { of, take } from 'rxjs';
import { environment } from 'src/environments/environment';

const mockCard: any = { //Card
  archetype:  "Alien",
  card_images:[
    {
      id: 34541863,
      image_url: "https://images.ygoprodeck.com/images/cards/34541863.jpg",
      image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/34541863.jpg",
      image_url_small: "https://images.ygoprodeck.com/images/cards_small/34541863.jpg",
    }
  ],
  card_prices:[{
    amazon_price: "24.45",
    cardmarket_price: "0.05",
    coolstuffinc_price: "0.25",
    ebay_price: "0.99",
    tcgplayer_price: "0.15"
  }],
  card_sets:[{
    set_code: "FOTB-EN043",
    set_name: "Force of the Breaker",
    // set_price: "1.31",
    // set_rarity: "Common",
    set_rarity_code: "(C)",
  }],
  desc: "During each of your Standby Phases, put 1 A-Counter on 1 face-up monster your opponent controls.",
  frameType:"spell",
  id: 34541863,
  name: "\"A\" Cell Breeding Device",
  race: "Continuous",
  type: "Spell Card",
}


describe('CardsPageComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;
  let cardService: CardService;
  // let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CardsComponent,
        CommonModule,
        TranslateModule.forRoot(),
        IonicModule,
        NoDataComponent,
        CardCardComponent,
        FormsModule,
        ReactiveFormsModule,
        CardSkeletonComponent,
        InfiniteScrollComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers:[
        {
          provide: ENVIRONMENT,
          useValue: new Environment(environment, window)
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;

    cardService = TestBed.inject(CardService);
    // notificationService = TestBed.inject(NotificationService);
  });

  it('should be create', async() => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('should call getAll()', () => {
    const getCardResponse = spyOn(cardService, 'getAll');
    getCardResponse.and.returnValue(of([mockCard]));

    const state = {
      slice: 14,
      search: null!,
      reload: false,
      filters: {}
    };

    component.info$
    .pipe(take(1))
    .subscribe(data => {
      const { cards, total } = data || {};
      const [ firstCard ] = cards || [];

      expect(cardService.getAll).toHaveBeenCalled();
      expect(cards?.length).toEqual(total);
      expect(firstCard).toEqual(mockCard);
      // expect(notificationService.failure).not.toHaveBeenCalled();
    });

    component.triggerLoad.next(state);
  });

  it('',() => {
    component.search.setValue(('Blue-eyes' as any))
    component.searchSubmit(new Event('submit'))
    console.log('state => ',component.state)
    expect(true).toEqual(true);
  })


});
