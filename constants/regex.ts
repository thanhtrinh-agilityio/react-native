export const REGEX_CODE_LANGUAGE =
  /([`"']?(?:[a-zA-Z0-9_.-]+(?:\.config)?\.(html|css|js|ts|jsx|tsx|json|yml|yaml|sh|py|java|c|cpp|rb|php|go|swift|md|txt)|package\.json|\.eslintrc\.(?:js|json|yml)|\.prettierrc\.(?:js|json|yml))["'`]?)/;

export const REGEX_BY_CODE_LANGUAGE = {
  js: [/^\/\/\s*(.+\.\w+)$/],
  ts: [/^\/\/\s*(.+\.\w+)$/],
  json: [/^\/\/\s*(.+\.\w+)$/],
  css: [/^\/\*\s*(.+\.\w+)\s*\*\/$/],
  scss: [/^\/\*\s*(.+\.\w+)\s*\*\/$/],
  bash: [/^#\s*(.+\.\w+)$/],
  sh: [/^#\s*(.+\.\w+)$/],
  markdown: [/^<!--\s*(.+\.\w+)\s*-->$/],
  html: [/^<!--\s*(.+\.\w+)\s*-->$/],
  default: [
    /^\/\/\s*(.+\.\w+)$/,
    /^\/\*\s*(.+\.\w+)\s*\*\/$/,
    /^#\s*(.+\.\w+)$/,
    /^<!--\s*(.+\.\w+)\s*-->$/,
  ],
};
