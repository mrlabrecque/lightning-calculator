import { Inning } from "./inning";

export class Game {
    id: number = -1;
    teamId?: number;
    innings?: Inning[];
    active?: boolean;
}