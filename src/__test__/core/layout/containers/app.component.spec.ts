import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from '@ygodex/app/core/layout';
import { NotificationService } from '@ygodex/app/core/notification/notification.service';
import { ENVIRONMENT, Environment } from '@ygodex/core/environments/environment.token';
import { environment } from 'src/environments/environment';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        CommonModule,
        IonicModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers:[
        NotificationService,
        {
          provide: ENVIRONMENT,
          useValue: new Environment(environment, window)
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should be create', async() => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

});
