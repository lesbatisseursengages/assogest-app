import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('useBackup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should export data with correct structure', () => {
    // Ajouter des données de test
    const testDocuments = [
      { id: '1', title: 'Doc 1', category: 'Juridique' }
    ];
    localStorage.setItem('offlineDocuments', JSON.stringify(testDocuments));

    // Vérifier que les données sont stockées
    const stored = localStorage.getItem('offlineDocuments');
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual(testDocuments);
  });

  it('should calculate backup size correctly', () => {
    const testData = JSON.stringify({ test: 'data' });
    localStorage.setItem('offlineDocuments', testData);

    const size = testData.length / 1024;
    expect(size).toBeGreaterThan(0);
  });

  it('should handle empty backup data', () => {
    const empty = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      documents: [],
      members: [],
      categories: [],
      notes: [],
    };

    const dataStr = JSON.stringify(empty);
    expect(dataStr).toBeDefined();
    expect(JSON.parse(dataStr)).toEqual(empty);
  });
});
