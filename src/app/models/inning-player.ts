import { Inning } from "./inning";

export class InningPlayer {
    id: number = -1;
    inning: Inning = new Inning();
    playerName?: string;
    playerId?: number;
    position?: string;
    timesBenched: number = 0;

}