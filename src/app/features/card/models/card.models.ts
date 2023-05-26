import { CardImage } from "@ygodex/core/models/card-images.models";
import { CardPrice } from "@ygodex/core/models/card-price.models";
import { Set } from "@ygodex/features/set";

export interface Card {
  id: number;
  archetype?: string;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk: number;
  def: number;
  level: number;
  race: string;
  attribute?: string;
  card_sets?: Set[];
  card_images?: CardImage[];
  card_prices?: CardPrice[]
  banlist_info?: any;
}
