import { Inning } from "./inning";

export class InningPlayer {
    id?: number;
    inning?: Inning;
    playerName?: string;
    playerId?: number;
    position?: string;
    timesBenched: number = 0;

}