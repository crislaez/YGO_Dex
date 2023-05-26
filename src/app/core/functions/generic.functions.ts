import { IonContent } from "@ionic/angular";
import { Card } from "@ygodex/features/card";
import { CARD_IMAGE_URL, DECK_IMAGE_URL } from "../constants/generic.constants";
import { BanlistType } from "../enums/banlist-type.enum";
import { Banlist } from "../enums/banlist.enum";
import { Filter } from "../models/filter.models";
import { SwiperOptions } from './../../../../node_modules/swiper/types/swiper-options.d';

export const trackById = (_: number, item: any): number => {
  return item?.id ?? item;
}

export const gotToTop = (content: IonContent): void => {
  content?.scrollToTop(500);
}

export const isNotEmptyObject = (object: any): boolean => {
  return Object.keys(object || {})?.length > 0
}

export const getObjectKeys = <T>(obj: T): string[] => {
  return Object.keys(obj || {})
}

export const sliceText = (text: string, slice: number = 20) => {
  return text?.length > slice ? text?.slice(0, slice) + '...' : text;
}

export const errorImage = (event:any): void => {
  event.target.src = '../../../../assets/images/image_not_found.png';
}

export const getSliderConfig = (slidesPerView: number = 1): SwiperOptions => {
  return {
    slidesPerView,
    spaceBetween: 10,
    pagination:{ clickable: true },
  };
}

export const orderItemByDateDesc = (list: any[], field: string): any[] => {
  return [...(list || [])]?.sort((a, b) => {
    const firstItemDate = new Date(a?.[field]);
    const secondItemDate = new Date(b?.[field]);

    if(firstItemDate < secondItemDate) return 1;
    if(firstItemDate > secondItemDate) return -1;
    return 0;
  })
}

export const orderItemByDateAsc = (list: any[], field: string): any[] => {
  return [...(list || [])]?.sort((a, b) => {
    const firstItemDate = new Date(a?.[field]);
    const secondItemDate = new Date(b?.[field]);

    if(firstItemDate > secondItemDate) return 1;
    if(firstItemDate < secondItemDate) return -1;
    return 0;
  })
}

export const filterItem = <T>(search: string, searchField: string, list:T[]): T[] => {
  return !search
         ? list
         : (list || [])?.filter(item => (item as any)?.[searchField]?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()))
}

export const filterByItem = <T>(list: any[], byField: string): T[] => {
  return (list || [])?.reduce((acc, item) => {
    const checkIfExistElement = (acc || [])?.find((element: any) => element?.[byField] === (item as any)?.[byField]);
    return [
      ...acc,
      ...(!checkIfExistElement ? [ item ] : [])
    ]
  },[])
}

export const getCardsBySet = (list: Card[], setName: string): Card[] => {
  const setCards = (list || [])?.filter(card => {
    const { card_sets = [] } = card || {};
    return card_sets?.find(( item ) => item?.set_name === setName)
  });

  return [ ...(setCards || []) ]?.sort((a, b) => {
    const setCodeA = a?.card_sets?.find(( item ) => item?.set_name === setName)?.set_code || '';
    const setCodeB = b?.card_sets?.find(( item ) => item?.set_name === setName)?.set_code || '';

    const codeNumberA: string = setCodeA?.replace(/[^0-9]+/g, "") || '';
    const codeNumberB: string = setCodeB?.replace(/[^0-9]+/g, "") || '';

    if(Number(codeNumberA) > Number(codeNumberB)) return 1;
    if(Number(codeNumberA) < Number(codeNumberB)) return -1;
    return 0;
  })
}

export const orderBanlist = (banlist: Card[], banlistType: BanlistType): Card[] => {
  const filterBanlist: any = (banlist || [])?.reduce((acc, card) => {
    const { banlist_info } = card || {};
    const type = banlist_info?.[banlistType];

    return {
      ...acc,
      ...(type
          ? {
            [type]: [
              ...((acc as any)?.[type] ?? []),
              ...(Object.keys(card || {})?.length > 0 ? [ card ] : [])
            ]
          }
          : {}
        )
    }
  },{});

  return [
    ...(filterBanlist?.[Banlist.Banned] ?? []),
    ...(filterBanlist?.[Banlist.Limited] ?? []),
    ...(filterBanlist?.[Banlist.SemiLimited] ?? [])
  ];
}

export const clearDeckItem = (deckItem: string): string[] => {
  const clearDeck = deckItem?.replace?.(/\[/g,'')?.replace?.(/\]/g,'')
  return (clearDeck?.split(',') || [])?.map(card => card?.replace(/"/g,''));
}

export const cardImageUrl = (image: string): string => {
  return CARD_IMAGE_URL?.replace('IMAGE', image);
}

export const deckImageUrl = (image: string): string => {
  return DECK_IMAGE_URL?.replace('IMAGE', image);
}


export const cardsFilter = (cards: Card[] = [], filter: Filter & {name?: string}): Card[] => {
  const filterKeys = Object.keys(filter || {});
  const { name: filterName, types: filterType, attributes: filterAttribute, races: filterRace, level: filterLevel, archetypes: filterArchetype } = filter || {};

  if(filterKeys?.length === 0) return cards;

  let cardFilter = [...(cards ?? [])];

  if(filterName) cardFilter = cardFilter?.filter(item => item?.name?.toLocaleLowerCase()?.includes(filterName?.toLocaleLowerCase()));
  if(filterType) cardFilter = cardFilter?.filter(item => item?.type === filterType);
  if(filterAttribute) cardFilter = cardFilter?.filter(item => item?.attribute?.toLocaleLowerCase() === filterAttribute?.toLocaleLowerCase());
  if(filterRace) cardFilter = cardFilter?.filter(item => item?.race === filterRace);
  if(filterLevel) cardFilter = cardFilter?.filter(item => item?.level === +filterLevel);
  if(filterArchetype) cardFilter = cardFilter?.filter(item => item?.archetype === filterArchetype);

  return cardFilter;
}

export const orderItemAsc = <T>(list:T[], field: string) => {
  return [...(list || [])]?.sort((a, b) => {
    const fieldA = (a as any)?.[field] || '';
    const fieldB = (b as any)?.[field] || '';
    if(fieldA > fieldB) return 1;
    if(fieldA < fieldB) return -1;
    return 0
  })
}

export const orderItemDesc = <T>(list:T[], field: string) => {
  return [...(list || [])]?.sort((a, b) => {
    const fieldA = (a as any)?.[field] || '';
    const fieldB = (b as any)?.[field] || '';
    if(fieldA < fieldB) return 1;
    if(fieldA > fieldB) return -1;
    return 0
  })
}


export const banlistFilter = (cards: Card[] = [], filter: { search: string; banlistOption: Banlist }, banlistType: 'ocg' | 'tcg'): Card[] => {
  const { search = null, banlistOption = null } = filter || {};
  const banlistFormat = banlistType === 'ocg' ? 'ban_ocg' : 'ban_tcg';

  if(!search && !banlistOption) return cards;

  let cardFilter = [...(cards ?? [])];

  if(search) cardFilter = cardFilter?.filter((card) => card?.name?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()));

  if(banlistOption) cardFilter = cardFilter?.filter((card) => {
    const { banlist_info } = card || {};
    return banlist_info?.[banlistFormat] === banlistOption
  });

  return cardFilter;
}
