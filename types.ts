export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface CatchDetails {
  fishType: string;
  weight: string;
  location: string;
  story: string;
}

export interface GeneratedImageResult {
  imageUrl: string;
  timestamp: number;
}

export interface LocationInfo {
  text: string;
  mapLink?: string;
  sourceTitle?: string;
}