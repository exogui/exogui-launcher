import {
    BooleanFilter,
    CompareFilter,
    FieldFilter,
    GameFilter,
} from "../interfaces";

export function getDefaultFieldFilter(): FieldFilter {
    return {
        generic: [],
        id: [],
        title: [],
        series: [],
        developer: [],
        publisher: [],
        platform: [],
        genre: [],
        playMode: [],
        region: [],
        rating: [],
        releaseYear: [],
    };
}

export function getDefaultCompareFilter(): CompareFilter {
    return {};
}

export function getDefaultBooleanFilter(): BooleanFilter {
    return {
        installed: undefined,
    };
}

export function getDefaultGameFilter(): GameFilter {
    return {
        subfilters: [],
        whitelist: getDefaultFieldFilter(),
        blacklist: getDefaultFieldFilter(),
        exactWhitelist: getDefaultFieldFilter(),
        exactBlacklist: getDefaultFieldFilter(),
        equalTo: getDefaultCompareFilter(),
        greaterThan: getDefaultCompareFilter(),
        lessThan: getDefaultCompareFilter(),
        booleans: getDefaultBooleanFilter(),
        matchAny: false,
    };
}