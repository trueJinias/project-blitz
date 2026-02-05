import ja from './ja.json';
import enUS from './en-us.json';
import enIN from './en-in.json';

export const languages = {
    ja: '日本語',
    'en-us': 'English (US)',
    'en-in': 'English (India)'
};

export const defaultLang = 'ja';

export const ui = {
    ja,
    'en-us': enUS,
    'en-in': enIN,
} as const;

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: string) {
        const keys = key.split('.');
        let value: any = ui[lang];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };
}
