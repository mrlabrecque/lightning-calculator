export class Player {
    id?: number;
    TeamId?: number;
    Name?: string;
    OffensiveData?: string;
    PitchRanking?: PitchRankingEnum;
}
enum PitchRankingEnum {
    "A",
    "B",
    "C",
    "D"
}