import { IMainWindowExternal } from "../src/shared/interfaces";

/** Custom modifications made by this project */
declare global {
  interface Window {
    log: LogFunc;
    External: IMainWindowExternal;
  }
  let log: LogFunc;

  type ILogPreEntry = {
    /** Name of the source of the log entry (name of what added the log entry) */
    source: string;
    /** Content of the log entry */
    content: string;
  }

  type ILogEntry = ILogPreEntry & {
    /** Timestamp of when the entry was added to the main's log */
    timestamp: number;
  }

  type LogFunc = (source: string, message: string) => ILogEntry;
}

/** Add missing declarations ("polyfill" type information) */
declare global {
  interface Clipboard {
    writeText(newClipText: string): Promise<void>;
    // Add any other methods you need here.
  }
  interface NavigatorClipboard {
    // Only available in a secure context.
    readonly clipboard?: Clipboard;
  }
  interface Navigator extends NavigatorClipboard {}
}
