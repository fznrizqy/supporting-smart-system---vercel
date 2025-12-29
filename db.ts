
import { Equipment, User, AuditLog, Notification, CalendarEvent, JobRequest } from './types';

// Utility for handling fetch responses safely
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  const json = await res.json();
  // We now expect wrapped responses to avoid JSON primitive parsing issues
  return json.data !== undefined ? json.data : json;
};

// Frontend API Client to communicate with Vercel Serverless Functions
export const db = {
  // Initialization
  init: async () => {
    const res = await fetch('/api/init');
    return handleResponse(res);
  },

  // Equipment
  equipment: {
    toArray: async () => {
      const res = await fetch('/api/data?table=equipment');
      return handleResponse(res);
    },
    add: async (item: Equipment) => {
      const res = await fetch('/api/data?table=equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return handleResponse(res);
    },
    put: async (item: Equipment) => {
      const res = await fetch('/api/data?table=equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/data?table=equipment&id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    },
    bulkPut: async (items: Equipment[]) => {
      const res = await fetch('/api/data?table=equipment&bulk=true', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      return handleResponse(res);
    }
  },

  // Users
  users: {
    toArray: async () => {
      const res = await fetch('/api/data?table=users');
      return handleResponse(res);
    },
    add: async (user: User) => {
      const res = await fetch('/api/data?table=users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<User>) => {
      const res = await fetch(`/api/data?table=users&id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/data?table=users&id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // Audit Logs
  auditLogs: {
    toArray: async (limit = 100) => {
      const res = await fetch(`/api/data?table=audit_logs&limit=${limit}`);
      return handleResponse(res);
    },
    add: async (log: AuditLog) => {
      const res = await fetch('/api/data?table=audit_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      return handleResponse(res);
    }
  },

  // Notifications
  notifications: {
    toArray: async (limit = 20) => {
      const res = await fetch(`/api/data?table=notifications&limit=${limit}`);
      return handleResponse(res);
    },
    add: async (note: Notification) => {
      const res = await fetch('/api/data?table=notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      return handleResponse(res);
    },
    update: async (id: number, updates: Partial<Notification>) => {
      const res = await fetch(`/api/data?table=notifications&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return handleResponse(res);
    },
    bulkPut: async (notes: Notification[]) => {
      const res = await fetch('/api/data?table=notifications&bulk=true', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes)
      });
      return handleResponse(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`/api/data?table=notifications&id=${id}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // Events
  events: {
    toArray: async () => {
      const res = await fetch('/api/data?table=events');
      return handleResponse(res);
    },
    add: async (event: CalendarEvent) => {
      const res = await fetch('/api/data?table=events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      return handleResponse(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`/api/data?table=events&id=${id}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // Job Requests
  jobRequests: {
    toArray: async () => {
      const res = await fetch('/api/data?table=job_requests');
      return handleResponse(res);
    },
    add: async (req: JobRequest) => {
      const res = await fetch('/api/data?table=job_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      return handleResponse(res);
    },
    put: async (req: JobRequest) => {
      const res = await fetch('/api/data?table=job_requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      return handleResponse(res);
    },
    updateStatus: async (id: number, status: string) => {
      const res = await fetch(`/api/data?table=job_requests&id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    delete: async (id: number) => {
      const res = await fetch(`/api/data?table=job_requests&id=${id}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // Settings
  settings: {
    get: async (id: string) => {
      const res = await fetch(`/api/data?table=settings&id=${id}`);
      return handleResponse(res);
    },
    put: async (setting: { id: string, values: string[] }) => {
      const res = await fetch('/api/data?table=settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting)
      });
      return handleResponse(res);
    }
  },

  // Global reset helper
  reset: async () => {
    const res = await fetch('/api/init?reset=true', { method: 'POST' });
    return handleResponse(res);
  }
};
