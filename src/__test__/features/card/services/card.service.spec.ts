import { CardService } from "@ygodex/app/features/card";
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from "@angular/common/http";
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';

describe('CardService', () => {
  let cardService: CardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers:[
        {
          provide: ENVIRONMENT,
          useValue: new Environment(environment, window)
        },
      ]
    });

    cardService = TestBed.inject(CardService);
  });

  it('should be create', async () => {
    expect(cardService).toBeTruthy();
  });

  it('getAll: the length of the response should have more than 0', (done: DoneFn) => {
    cardService.getAll()
    .pipe(take(1))
    .subscribe(cards => {
      expect(cards?.length > 0).toEqual(true);
      done();
    })
  });

  it('getAll: the cache should have the same length as the response.', (done: DoneFn) => {
    cardService.getAll()
    .pipe(take(1))
    .subscribe(cards => {

      expect(cards?.length).toEqual(cardService.cardsCache$.value?.length);
      done();
    })
  });

  // TODO

});
