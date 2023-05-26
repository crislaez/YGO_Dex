import { BanlistService } from "@ygodex/app/features/banlist";
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from "@angular/common/http";
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';

describe('BanlistService', () => {
  let banlistService: BanlistService;

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

    banlistService = TestBed.inject(BanlistService);
  });

  it('should be create', async () => {
    expect(banlistService).toBeTruthy();
  });

  it('getAll: should return true if the array contains data', (done: DoneFn) => {
    banlistService.getAll()
    .pipe(take(1))
    .subscribe(banlistResponse => {
      const { tcg, ocg } = banlistResponse || {};

      expect(tcg?.length > 0).toEqual(true);
      expect(ocg?.length > 0).toEqual(true);
      done();
    })
  });

  it('getAll: should have the same cache length as the response', (done: DoneFn) => {
    banlistService.getAll()
    .pipe(take(1))
    .subscribe(banlistResponse => {
      const { tcg, ocg } = banlistResponse || {}
      const { tcg: tcgCache, ocg: ocgCache } = banlistService.banlistCache$.value || {};

      expect(tcg?.length).toEqual(tcgCache?.length);
      expect(ocg?.length).toEqual(ocgCache?.length);
      done();
    })
  });


});
