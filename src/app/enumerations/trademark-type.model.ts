export enum TrademarkType {
  IMAGEMARK = 'IMAGEMARK',

  TRADEMARK = 'TRADEMARK',

  SOUNDMARK = 'SOUNDMARK',

  TRADEMARK_WITH_IMAGE = 'TRADEMARK_WITH_IMAGE',

  SLOGAN = 'SLOGAN',
  ALL = 'ALL'
}
export const TrademarkTypeList = Object.values(TrademarkType).map(value => ({
  value,
  label: value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}));
export const TrademarkTypeValues = [
  {label: 'Imagemark', value: TrademarkType.IMAGEMARK},
  {label: 'Trademark', value: TrademarkType.TRADEMARK},
  {label: 'Soundmark', value: TrademarkType.SOUNDMARK},
  {label: 'Trademark With Logo', value: TrademarkType.TRADEMARK_WITH_IMAGE},
  {label: 'Slogan', value: TrademarkType.SLOGAN},
  {label: 'All', value: TrademarkType.ALL},
]