import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
    IAdditionalApplicationInfo,
    IGameCollection,
    IGameInfo,
} from "@shared/game/interfaces";

export enum GamesInitState {
    WAITING = 0,
    LOADING,
    LOADED,
    ERROR,
}

export type GamesState = {
    initState: GamesInitState;
    totalGames: number;
    libraries: string[];
    errorMessage?: string;
} & IGameCollection;

export type GameUpdatedAction = {
    game: IGameInfo;
};

export type AddAddAppAction = {
    addApp: IAdditionalApplicationInfo;
};

export type AddVideoAction = {
    videoPath: string;
};

const initialState: GamesState = {
    games: [],
    addApps: [],
    initState: GamesInitState.WAITING,
    totalGames: 0,
    libraries: [],
    errorMessage: undefined,
};

const gamesSlice = createSlice({
    name: "games",
    initialState,
    reducers: {
        /** Initialize the games collection */
        initialize: (state: GamesState) => {
            state.initState = Math.max(GamesInitState.LOADING, state.initState);
        },
        /** Overwrite the entire games collection */
        setGames: (
            state: GamesState,
            { payload }: PayloadAction<IGameCollection>
        ) => {
            state.games = payload.games;
            state.addApps = payload.addApps;
            state.totalGames = payload.games.length;
            state.initState = GamesInitState.LOADED;
        },
        /** Set list of libraries */
        setLibraries: (
            state: GamesState,
            { payload }: PayloadAction<string[]>
        ) => {
            state.libraries = payload;
        },
        /** Set whether a game is installed or not */
        updateGame: (
            state: GamesState,
            { payload }: PayloadAction<GameUpdatedAction>
        ) => {
            const gameIdx = state.games.findIndex(
                (g) => g.id === payload.game.id
            );
            if (gameIdx >= 0) state.games[gameIdx] = payload.game;
        },
        addAddAppsForGame: (
            state: GamesState,
            { payload }: PayloadAction<AddAddAppAction>
        ) => {
            state.addApps = [...state.addApps, payload.addApp];
        },
        setInitError: (
            state: GamesState,
            { payload }: PayloadAction<string>
        ) => {
            state.initState = GamesInitState.ERROR;
            state.errorMessage = payload;
        },
    },
});

export const {
    initialize,
    setLibraries,
    setGames,
    updateGame,
    addAddAppsForGame,
    setInitError,
} = gamesSlice.actions;
export default gamesSlice.reducer;
