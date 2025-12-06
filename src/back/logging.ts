import { SocketServer } from "@back/SocketServer";
import { BackOut } from "@shared/back/types";
import { LogFunc } from "@shared/interfaces";
import { ILogEntry } from "@shared/Log/interface";

export function logFactory(socketServer: SocketServer, addLog: (message: ILogEntry) => number, verbose: boolean): LogFunc {
    return function (source: string, content: string): ILogEntry {
        const formedLog: ILogEntry = {
            source: source,
            content: content,
            timestamp: Date.now(),
        };
        const index = addLog(formedLog);
        socketServer.broadcast(BackOut.LOG_ENTRY_ADDED, formedLog, index);
        if (verbose) { console.log(`${Date.now()} - ${content}`); }
        return formedLog;
    };
}
