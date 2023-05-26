import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@ygodex/app/core/notification/notification.service';
import { BanlistService } from '@ygodex/app/features/banlist';
import { CardCardComponent } from '@ygodex/app/ui/card-card';
import { CardSkeletonComponent } from '@ygodex/app/ui/card-skeleton';
import { InfiniteScrollComponent } from '@ygodex/app/ui/infinite-scroll';
import { NoDataComponent } from '@ygodex/app/ui/no-data';
import { BanlistComponent } from '@ygodex/app/views/banlists/containers/banlist.component';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { environment } from 'src/environments/environment';

describe('BanlistPageComponent', () => {
  let component: BanlistComponent;
  let fixture: ComponentFixture<BanlistComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BanlistComponent,
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
        BanlistService,
        NotificationService,
        {
          provide: ENVIRONMENT,
          useValue: new Environment(environment, window)
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BanlistComponent);
    component = fixture.componentInstance;
  });

  it('should be create', async() => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

});
