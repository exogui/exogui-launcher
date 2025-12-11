import { englishTranslation } from "@renderer/lang/en";
import * as React from "react";

export type SplashScreenProps = {
    gamesLoaded: boolean;
    playlistsLoaded: boolean;
    miscLoaded: boolean;
    errorMessage?: string;
    onGoToConfig?: () => void;
};

export function SplashScreen(props: SplashScreenProps) {
    const {
        gamesLoaded,
        playlistsLoaded,
        miscLoaded,
        errorMessage,
        onGoToConfig,
    } = props;
    const strings = englishTranslation.splash;
    const [dismissed, setDismissed] = React.useState(false);

    const allLoaded = gamesLoaded && playlistsLoaded && miscLoaded;
    const shouldFadeOut = allLoaded || dismissed;
    const extraClass = shouldFadeOut ? " splash-screen--fade-out" : "";

    const handleGoToConfig = () => {
        setDismissed(true);
        onGoToConfig?.();
    };

    return (
        <div className={"splash-screen" + extraClass}>
            <div className="splash-screen__logo fp-logo-box">
                <div className="exo-logo" />
            </div>
            <div className="splash-screen__status-block">
                {errorMessage && !dismissed ? (
                    <>
                        <div className="splash-screen__status-header splash-screen__status-header--error">
                            {strings.errorLoading}
                        </div>
                        <div className="splash-screen__status splash-screen__status--error">
                            {errorMessage || strings.unknownError}
                        </div>
                        <div className="splash-screen__hint">
                            {strings.configHint}
                        </div>
                        <button
                            className="splash-screen__button"
                            onClick={handleGoToConfig}
                        >
                            {strings.goToConfig}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="splash-screen__status-header">
                            {strings.loading}
                        </div>
                        {!gamesLoaded ? (
                            <div className="splash-screen__status">
                                {strings.games}
                            </div>
                        ) : undefined}
                        {!playlistsLoaded ? (
                            <div className="splash-screen__status">
                                {strings.playlists}
                            </div>
                        ) : undefined}
                        {!miscLoaded ? (
                            <div className="splash-screen__status">
                                {strings.misc}
                            </div>
                        ) : undefined}
                    </>
                )}
            </div>
        </div>
    );
}
