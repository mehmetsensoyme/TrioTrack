import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import {schema} from './schema';
import {migrations} from './migrations';
import {User, Category, Expense, Currency, Debtor, Debt, Budget} from './models';

let _database: Database | null = null;
let _databaseError: Error | null = null;

/**
 * Returns the database setup error if initialization failed.
 * Check this in App.tsx to show a user-facing fallback.
 */
export const getDatabaseError = (): Error | null => _databaseError;

class MockCollection {
  name: string;
  items: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  async create(recordBuilder: (record: any) => void) {
    const record: any = { id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` };
    recordBuilder(record);
    this.items.set(record.id, record);
    return record;
  }

  async find(id: string) {
    return this.items.get(id) || null;
  }

  query() {
    return {
      fetch: async () => Array.from(this.items.values()),
      observe: () => ({
        subscribe: (cb: any) => {
          cb(Array.from(this.items.values()));
          return { unsubscribe: () => {} };
        }
      })
    };
  }
}

let _mockDb: any = null;
let _hasLoggedFallback = false;

const getMockDatabase = () => {
  if (!_mockDb) {
    const collectionsMap = new Map<string, MockCollection>();
    _mockDb = {
      isMock: true,
      write: async (work: () => Promise<any>) => work(),
      batch: async (..._ops: any[]) => {},
      collections: {
        get: (tableName: string) => {
          if (!collectionsMap.has(tableName)) {
            collectionsMap.set(tableName, new MockCollection(tableName));
          }
          return collectionsMap.get(tableName)!;
        }
      }
    };
  }
  return _mockDb;
};

const getDatabase = (): Database | any => {
  if (_databaseError) {
    if (!_hasLoggedFallback) {
      console.log('TrioTrack Database: Native JSI SQLite bulunamadı (Expo Go). Mock veritabanı devrede.');
      _hasLoggedFallback = true;
    }
    return getMockDatabase();
  }

  if (!_database) {
    try {
      const adapter = new SQLiteAdapter({
        schema,
        migrations,
        jsi: true,
        onSetUpError: error => {
          _databaseError = error instanceof Error ? error : new Error(String(error));
        },
      });

      _database = new Database({
        adapter,
        modelClasses: [User, Category, Expense, Currency, Debtor, Debt, Budget],
      });
    } catch (error) {
      _databaseError = error instanceof Error ? error : new Error(String(error));
      if (!_hasLoggedFallback) {
        console.log('TrioTrack Database: Native JSI SQLite bulunamadı (Expo Go). Mock veritabanı devrede.');
        _hasLoggedFallback = true;
      }
      return getMockDatabase();
    }
  }
  return _database;
};

export const database = new Proxy({} as Database, {
  get(_target, prop) {
    const db = getDatabase();
    const value = db[prop as keyof Database];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
});

export {getDatabase};
export default database;
