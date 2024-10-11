export class Player {
  id: number = -1;
  TeamId?: number;
  Name?: string;
  OffensiveData?: string;
  DefensiveData?: string;
  PitchingData?: string;
  PitchRanking?: string;
  avg?: number;
  obp?: number;
  ops?: number;
  slg?: number;
  rbi?: number;
  bb?: number;
  so?: number;
  jersey_number?: number;
}
export enum PitchRankingEnum {
  'A',
  'B',
  'C',
  'D',
}
