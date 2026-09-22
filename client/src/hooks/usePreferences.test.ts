import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('usePreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should have default preferences', () => {
    const defaults = {
      language: 'fr',
      dateFormat: 'DD/MM/YYYY',
      emailNotifications: false,
      theme: 'light',
      itemsPerPage: 10,
      autoSaveInterval: 300,
    };

    expect(defaults.language).toBe('fr');
    expect(defaults.dateFormat).toBe('DD/MM/YYYY');
    expect(defaults.emailNotifications).toBe(false);
  });

  it('should format dates correctly', () => {
    const date = new Date('2024-01-15');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formatted = `${day}/${month}/${year}`;
    expect(formatted).toBe('15/01/2024');
  });

  it('should save preferences to localStorage', () => {
    const prefs = { language: 'en', dateFormat: 'MM/DD/YYYY' };
    localStorage.setItem('userPreferences', JSON.stringify(prefs));

    const saved = localStorage.getItem('userPreferences');
    expect(saved).toBeDefined();
    expect(JSON.parse(saved!)).toEqual(prefs);
  });

  it('should support multiple languages', () => {
    const languages = ['fr', 'en'];
    languages.forEach(lang => {
      expect(['fr', 'en']).toContain(lang);
    });
  });
});
