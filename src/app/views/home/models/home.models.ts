import { CardType } from "@ygodex/core/enums/card-type.enum";

export interface HomeInfoIterator {
  slidesPerView: any;
  field: FieldType;
  type: CardType;
  title: string;
  showMore: boolean;
}

export type FieldType = 'news' | 'sets' | 'cards' | 'decks';
