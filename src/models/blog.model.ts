import dayjs from "dayjs/esm";

export interface Blog{
    data:BlogData[],
    meta:BlogMeta



}
export interface BlogData{
    id:number;
    documentId?:string;
    title:string;
    content:string;
    slug:string;
    excerpt:string;
    featuredImage:FeaturedImage;
    metaTitle?:string;
    metaDescription?:string;
    author:string;
    category:string;
    createdAt?:dayjs.Dayjs | null;
    updatedAt?:dayjs.Dayjs | null
    campaignBlock?:CampaignBlock
    backgroundColor?:string


}

export interface BlogMeta{
    pagination:BlogMetaPagination
}

export interface BlogMetaPagination{
    page:number;
    pageSize:number;
    pageCount:number;
    total:number;
}

export interface FeaturedImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: ImageFormats;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}


export interface ImageFormats {
  thumbnail?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  large?: ImageFormat;
}

export interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}
export interface CampaignBlock{
    id:number;
    title:string;
    description?:string;
    ctaText:string;
    ctaLink:string;
    position?:number;
    backgroundColor?:string
    campaignImage?:string
}

