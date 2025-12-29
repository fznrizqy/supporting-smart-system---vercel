import { Dexie, type Table } from 'dexie';
import { 
  Equipment, User, AuditLog, Notification, 
  CalendarEvent, JobRequest, UserRole, 
  Category, Division, EquipmentStatus, 
  JobRequestStatus, JobCategory 
} from './types';
import { INITIAL_EQUIPMENT, MOCK_USERS } from './constants';

class LabDatabase extends Dexie {
  equipment!: Table<Equipment>;
  users!: Table<User>;
  auditLogs!: Table<AuditLog>;
  notifications!: Table<Notification>;
  events!: Table<CalendarEvent>;
  jobRequests!: Table<JobRequest>;
  settings!: Table<{ id: string; values: any }>;

  constructor() {
    super('LabNexusDB');
    this.version(2).stores({
      equipment: 'id, category, status, division, personInCharge',
      users: 'id, name, email, role',
      auditLogs: '++id, action, targetId, userId, timestamp',
      notifications: '++id, timestamp, isRead, type',
      events: '++id, startDate, type, equipmentId, createdBy',
      jobRequests: '++id, requestorId, assignedToId, status, category',
      settings: 'id'
    });
  }
}

const localDb = new LabDatabase();

export const db = {
  init: async () => {
    // Check if we need to seed
    const userCount = await localDb.users.count();
    if (userCount === 0) {
      // 1. Seed Users
      await localDb.users.bulkAdd(MOCK_USERS);

      // 2. Seed Equipment
      await localDb.equipment.bulkAdd(INITIAL_EQUIPMENT);

      // 3. Seed Settings (Categories)
      await localDb.settings.add({
        id: 'categories',
        values: Object.values(Category)
      });

      // 4. Seed Initial Job Requests (To ensure the board isn't empty)
      await localDb.jobRequests.bulkAdd([
        {
          title: 'Maintenance HPLC AP-1367',
          requestorId: '5', // Emily Chen (Chemist)
          requestorName: 'Emily Chen',
          division: Division.MS,
          description: 'Routine maintenance and seal check for HPLC pump.',
          category: JobCategory.Maintenance,
          requestedAt: new Date(Date.now() - 86400000).toISOString(),
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          assignedToId: '2', // Fauzan Rizqy Kanz (Supporting)
          status: JobRequestStatus.Requests
        },
        {
          title: 'Troubleshooting IN-0188',
          requestorId: '6', // Mike Ross (Analyst)
          requestorName: 'Mike Ross',
          division: Division.HPLC,
          description: 'Baseline instability on the detector. Requires immediate check.',
          category: JobCategory.Troubleshooting,
          requestedAt: new Date().toISOString(),
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          assignedToId: '3', // Muhammad Luthfi (Supporting)
          status: JobRequestStatus.OnProgress
        }
      ]);

      // 5. Initial Audit Log
      await localDb.auditLogs.add({
        action: 'CREATE',
        targetId: 'SYSTEM',
        targetName: 'Database Initialization',
        userId: '1',
        userName: 'Administrator',
        timestamp: new Date().toISOString(),
        details: 'System database initialized with mock corporate data.'
      });
    }
    return { success: true };
  },

  equipment: {
    toArray: () => localDb.equipment.toArray(),
    add: (item: Equipment) => localDb.equipment.add(item),
    put: (item: Equipment) => localDb.equipment.put(item),
    delete: (id: string) => localDb.equipment.delete(id),
    bulkPut: (items: Equipment[]) => localDb.equipment.bulkPut(items)
  },

  users: {
    toArray: () => localDb.users.toArray(),
    add: (user: User) => localDb.users.add(user),
    update: (id: string, updates: Partial<User>) => localDb.users.update(id, updates),
    delete: (id: string) => localDb.users.delete(id)
  },

  auditLogs: {
    toArray: async (limit = 100) => {
      return localDb.auditLogs.orderBy('timestamp').reverse().limit(limit).toArray();
    },
    add: (log: AuditLog) => localDb.auditLogs.add(log)
  },

  notifications: {
    toArray: async (limit = 20) => {
      return localDb.notifications.orderBy('timestamp').reverse().limit(limit).toArray();
    },
    add: (note: Notification) => localDb.notifications.add(note),
    update: (id: number, updates: Partial<Notification>) => localDb.notifications.update(id, updates),
    bulkPut: (notes: Notification[]) => localDb.notifications.bulkPut(notes),
    delete: (id: number) => localDb.notifications.delete(id)
  },

  events: {
    toArray: () => localDb.events.toArray(),
    add: (event: CalendarEvent) => localDb.events.add(event),
    delete: (id: number) => localDb.events.delete(id)
  },

  jobRequests: {
    toArray: () => localDb.jobRequests.toArray(),
    add: (req: JobRequest) => localDb.jobRequests.add(req),
    put: (req: JobRequest) => localDb.jobRequests.put(req),
    updateStatus: (id: number, status: string) => localDb.jobRequests.update(id, { status: status as any }),
    delete: (id: number) => localDb.jobRequests.delete(id)
  },

  settings: {
    get: (id: string) => localDb.settings.get(id),
    put: (setting: { id: string, values: any }) => localDb.settings.put(setting)
  },

  reset: async () => {
    await localDb.delete();
    window.location.reload();
  }
};