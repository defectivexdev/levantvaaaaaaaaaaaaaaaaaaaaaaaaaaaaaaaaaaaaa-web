/**
 * Simple INI file parser
 * Parses INI format into a nested object structure
 */

export interface IniConfig {
  [section: string]: {
    [key: string]: string | boolean | number;
  };
}

export function parseIni(content: string): IniConfig {
  const config: IniConfig = {};
  let currentSection = '';

  const lines = content.split('\n');

  for (let line of lines) {
    // Remove comments and trim
    line = line.split(';')[0].split('#')[0].trim();

    if (!line) continue;

    // Section header [SectionName]
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim();
      config[currentSection] = {};
      continue;
    }

    // Key-value pair
    const equalIndex = line.indexOf('=');
    if (equalIndex > 0 && currentSection) {
      const key = line.slice(0, equalIndex).trim();
      let value: string | boolean | number = line.slice(equalIndex + 1).trim();

      // Parse boolean values
      if (value.toLowerCase() === 'true') {
        value = true;
      } else if (value.toLowerCase() === 'false') {
        value = false;
      }
      // Parse numeric values
      else if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      }

      config[currentSection][key] = value;
    }
  }

  return config;
}

export function stringifyIni(config: IniConfig): string {
  let result = '';

  for (const section in config) {
    result += `[${section}]\n`;

    for (const key in config[section]) {
      const value = config[section][key];
      result += `${key} = ${value}\n`;
    }

    result += '\n';
  }

  return result.trim();
}
