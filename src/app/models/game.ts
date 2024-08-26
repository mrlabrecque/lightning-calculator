import { Inning } from "./inning";

export class Game {
    id: number = 0;
    teamId?: number;
    innings?: Inning[];
    active?: boolean;
}