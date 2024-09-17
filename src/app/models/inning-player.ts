import { Player } from "./player";

export class InningPlayer {
    id?: number = -1;
    gameId?: number;
    inningId?: number;
    playerId?: number;
    position?: string;

}

export class InningPlayerView extends InningPlayer {
    players?: Player;
    timesBenched: number = 0;
}