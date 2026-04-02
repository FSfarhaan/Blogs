export type ThemeMode = "light" | "dark";

export const defaultTheme: ThemeMode = "dark";
export const themeStorageKey = "fs-theme";

export function normalizeTheme(theme: string | null | undefined): ThemeMode {
  return theme === "dark" ? "dark" : "light";
}

export const themeInitializerScript = `(() => {
  const storageKey = "${themeStorageKey}";
  const defaultTheme = "${defaultTheme}";
  const root = document.documentElement;
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };

  try {
    const storedTheme = localStorage.getItem(storageKey);
    applyTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : defaultTheme);
  } catch {
    applyTheme(defaultTheme);
  }
})();`;
