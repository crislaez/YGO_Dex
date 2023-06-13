import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Preferences  } from '@capacitor/preferences';
import { APP_LANG_KEY } from '../constants/generic.constants';



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}


export const appInitTranslations = async (translate: TranslateService, languages: string[], defaultLang: string): Promise<any> => {
  const item = await Preferences.get({key: APP_LANG_KEY});
  const storeLang = item?.value || '';
  const currentDefaultLang = storeLang || defaultLang;

  return new Promise<void>(resolve => {
    translate.addLangs(languages);
    saveLang(currentDefaultLang);
    translate.setDefaultLang(currentDefaultLang);
    translate.use(currentDefaultLang).subscribe(() => resolve());
  });
}

const saveLang = async (lang: string) => {
  await Preferences.set({key: APP_LANG_KEY, value: lang})
}
