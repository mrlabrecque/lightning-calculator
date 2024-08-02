import { Inning } from "./inning";

export class Game {
    id?: number;
    teamId?: number;
    innings?: Inning[];
    active?: boolean;
}