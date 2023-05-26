import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Preferences  } from '@capacitor/preferences';

const LANG = 'YGODexLang';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}


export const appInitTranslations = async (translate: TranslateService, languages: string[], defaultLang: string): Promise<any> => {
  const item = await Preferences.get({key: LANG});
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
  await Preferences.set({key: LANG, value: lang})
}
