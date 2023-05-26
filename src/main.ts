
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigService } from './app/core/config/config.service';
import { ENVIRONMENT, Environment } from './app/core/environments/environment.token';
import { DynamicLocaleId, appInitTranslations, createTranslateLoader } from './app/core/i18n';
import { HttpErrorInterceptor } from './app/core/interceptors/http-error.interceptor';
import { AppComponent, appConfig, routes } from './app/core/layout';
import { environment } from './environments/environment';

function appInitializerFactory(translate: TranslateService, coreConfig: ConfigService): Function {
  coreConfig.importConfig(appConfig);
  return () => appInitTranslations(translate, appConfig.Languages, appConfig.DefaultLang);
};


bootstrapApplication(AppComponent, {
  providers:[
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, ConfigService],
      multi: true
    },
    {
      provide: ENVIRONMENT,
      useValue: new Environment(environment, window)
    },
    {
      provide: LOCALE_ID,
      useClass: DynamicLocaleId,
      deps: [TranslateService]
    },
    importProvidersFrom(BrowserModule),
    importProvidersFrom(IonicModule.forRoot()),
    importProvidersFrom(
      TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, ENVIRONMENT]
      }
    })),
    provideHttpClient(withInterceptors([HttpErrorInterceptor])),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
