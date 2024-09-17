export class Player {
    id?: number;
    TeamId?: number;
    Name?: string;
    OffensiveData?: string;
    PitchRanking?: string;
}
enum PitchRankingEnum {
    "A",
    "B",
    "C",
    "D"
}