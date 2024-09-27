export class Player {
    id: number = -1;
    TeamId?: number;
    Name?: string;
    OffensiveData?: string;
    DefensiveData?: string;
    PitchingData?: string;
    PitchRanking?: string;
}
export enum PitchRankingEnum {
    "A",
    "B",
    "C",
    "D"
}