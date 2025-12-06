import { OpenExternalFunc } from "@back/types";
import { ShowMessageBoxFunc } from "@shared/back/types";
import { IAdditionalApplicationInfo, IGameInfo } from "@shared/game/interfaces";
import { ExecMapping } from "@shared/interfaces";
import { Command, createCommand } from "@shared/mappings/CommandMapping";
import { IAppCommandsMappingData } from "@shared/mappings/interfaces";
import {
    fixSlashes,
    getFilename,
    padStart,
    stringifyArray,
} from "@shared/Util";
import { ChildProcess, exec } from "child_process";
import { EventEmitter } from "events";
import * as path from "path";

export type LaunchAddAppOpts = LaunchBaseOpts & {
    addApp: IAdditionalApplicationInfo;
    native: boolean;
};

export type LaunchGameOpts = LaunchBaseOpts & {
    game: IGameInfo;
    addApps?: IAdditionalApplicationInfo[];
    native: boolean;
};

type LaunchBaseOpts = {
    fpPath: string;
    execMappings: ExecMapping[];
    mappings: IAppCommandsMappingData;
    openDialog: ShowMessageBoxFunc;
    openExternal: OpenExternalFunc;
};

// @TODO we probably doesn't need seperate launch functions for add apps, setup, etc.
// Only one function to launch file with mapper for different file types
export namespace GameLauncher {
    const logSource = "Game Launcher";

    export function launchCommand(
        appPath: string,
        appArgs: string,
        mappings: IAppCommandsMappingData,
    ): Promise<void> {
        const command = createCommand(appPath, appArgs, mappings);
        const proc = exec(command.command, { cwd: command.cwd });
        logProcessOutput(proc);
        log(logSource, `Launch command (PID: ${proc.pid}) [ path: "${appPath}", arg: "${appArgs}", command: ${command} ]`);
        return new Promise((resolve, reject) => {
            if (proc.killed) {
                resolve();
            } else {
                proc.once("exit", () => {
                    resolve();
                });
                proc.once("error", (error) => {
                    reject(error);
                });
            }
        });
    }

    export async function launchAdditionalApplication(
        opts: LaunchAddAppOpts
    ): Promise<void> {
        // @FIXTHIS It is not possible to open dialog windows from the back process (all electron APIs are undefined).
        switch (opts.addApp.applicationPath) {
            case ":message:": {
                opts.openDialog({
                    type: "info",
                    title: "About This Game",
                    message: opts.addApp.launchCommand,
                    buttons: ["Ok"],
                });
                break;
            }
            case ":extras:": {
                const folderPath = fixSlashes(
                    path.join(
                        opts.fpPath,
                        path.posix.join("Extras", opts.addApp.launchCommand)
                    )
                );
                return opts
                .openExternal(folderPath, { activate: true })
                .catch((error) => {
                    if (error) {
                        opts.openDialog({
                            type: "error",
                            title: "Failed to Open Extras",
                            message:
                                    `${error.toString()}\n` +
                                    `Path: ${folderPath}`,
                            buttons: ["Ok"],
                        });
                    }
                });
            }
            default: {
                const appPath: string = fixSlashes(
                    path.join(
                        opts.fpPath,
                        getApplicationPath(
                            opts.addApp.applicationPath,
                            opts.execMappings,
                            opts.native
                        )
                    )
                );
                const appArgs: string = opts.addApp.launchCommand;
                return launchCommand(appPath, appArgs, opts.mappings);
            }
        }
    }

    /**
     * Launch a game
     * @param game Game to launch
     */
    export async function launchGame(opts: LaunchGameOpts): Promise<void> {
        // Abort if placeholder (placeholders are not "actual" games)
        if (opts.game.placeholder) {
            return;
        }
        // Run all provided additional applications with "AutoRunBefore" enabled
        if (opts.addApps) {
            const addAppOpts: Omit<LaunchAddAppOpts, "addApp"> = {
                fpPath: opts.fpPath,
                native: opts.native,
                execMappings: opts.execMappings,
                mappings: opts.mappings,
                openDialog: opts.openDialog,
                openExternal: opts.openExternal,
            };
            for (const addApp of opts.addApps) {
                if (addApp.autoRunBefore) {
                    const promise = launchAdditionalApplication({
                        ...addAppOpts,
                        addApp,
                    });
                    if (addApp.waitForExit) {
                        await promise;
                    }
                }
            }
        }
        // Launch game
        const gamePath: string = fixSlashes(
            path.join(
                opts.fpPath,
                getApplicationPath(
                    opts.game.applicationPath,
                    opts.execMappings,
                    opts.native
                )
            )
        );
        const gameArgs: string = opts.game.launchCommand;

        let command: Command;
        try {
            command = createCommand(gamePath, gameArgs, opts.mappings);
        } catch (e) {
            log(logSource, `Launch Game "${opts.game.title}" failed. Error: ${e}`);
            return;
        }

        const proc = exec(command.command, { cwd: command.cwd });
        logProcessOutput(proc);
        log(logSource, `Launch Game "${opts.game.title}" (PID: ${proc.pid}) [\n` +
            `    applicationPath: "${opts.game.applicationPath}",\n` +
            `    launchCommand:   "${opts.game.launchCommand}",\n` +
            `    command:         "${command}" ]`);
    }

    /**
     * Launch a game
     * @param game Game to launch
     */
    export async function launchGameSetup(opts: LaunchGameOpts): Promise<void> {
        // Launch game
        const setupPath = opts.game.applicationPath.replace(
            getFilename(opts.game.applicationPath),
            "install.command"
        );
        const gamePath: string = fixSlashes(
            path.join(
                opts.fpPath,
                getApplicationPath(setupPath, opts.execMappings, opts.native)
            )
        );

        const gameArgs: string = opts.game.launchCommand;
        const command = createCommand(
            gamePath,
            gameArgs,
            opts.mappings
        );

        const proc = exec(command.command, { cwd: command.cwd });
        logProcessOutput(proc);
        log(logSource, `Launch Game Setup "${opts.game.title}" (PID: ${proc.pid}) [\n` +
            `    applicationPath: "${opts.game.applicationPath}",\n` +
            `    launchCommand:   "${opts.game.launchCommand}",\n` +
            `    command:         "${command}" ]`);
    }

    /**
     * The paths provided in the Game/AdditionalApplication XMLs are only accurate
     * on Windows. So we replace them with other hard-coded paths here.
     */
    function getApplicationPath(
        filePath: string,
        execMappings: ExecMapping[],
        native: boolean
    ): string {
        const platform = process.platform;

        // Bat files won't work on Wine, force a .sh file on non-Windows platforms instead. Sh File may not exist.
        if (platform !== "win32" && filePath.endsWith(".bat")) {
            return filePath.substring(0, filePath.length - 4) + ".command";
        }

        // Skip mapping if on Windows or Native application was not requested
        if (platform !== "win32" && native) {
            for (let i = 0; i < execMappings.length; i++) {
                const mapping = execMappings[i];
                if (mapping.win32 === filePath) {
                    switch (platform) {
                        case "linux":
                            return mapping.linux || mapping.win32;
                        case "darwin":
                            return mapping.darwin || mapping.win32;
                        default:
                            return filePath;
                    }
                }
            }
        }

        // No Native exec found, return Windows/XML application path
        return filePath;
    }

    function logProcessOutput(proc: ChildProcess): void {
        // Log for debugging purposes
        // (might be a bad idea to fill the console with junk?)
        const logStuff = (event: string, args: any[]): void => {
            log(logSource, `${event} (PID: ${padStart(
                proc.pid ?? -1,
                5
            )}) ${stringifyArray(args, stringifyArrayOpts)}`);
        };
        doStuffs(
            proc,
            [/* 'close', */ "disconnect", "error", "exit", "message"],
            logStuff
        );
        if (proc.stdout) {
            proc.stdout.on("data", (data) => {
                logStuff("stdout", [data.toString("utf8")]);
            });
        }
        if (proc.stderr) {
            proc.stderr.on("data", (data) => {
                logStuff("stderr", [data.toString("utf8")]);
            });
        }
    }
}

const stringifyArrayOpts = {
    trimStrings: true,
};

function doStuffs(
    emitter: EventEmitter,
    events: string[],
    callback: (event: string, args: any[]) => void
): void {
    for (let i = 0; i < events.length; i++) {
        const e: string = events[i];
        emitter.on(e, (...args: any[]) => {
            callback(e, args);
        });
    }
}
