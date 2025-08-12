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