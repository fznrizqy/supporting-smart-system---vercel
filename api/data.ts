
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  const { table, id, limit, bulk } = req.query;

  const getParsedBody = () => {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch (e) { return {}; }
    }
    return req.body;
  };

  try {
    if (req.method === 'GET') {
      if (table === 'equipment') {
        const rows = await sql`SELECT * FROM equipment ORDER BY id ASC`;
        return res.status(200).json({ data: rows.map(mapEquipment) });
      }
      if (table === 'users') {
        const rows = await sql`SELECT * FROM users ORDER BY name ASC`;
        return res.status(200).json({ data: rows });
      }
      if (table === 'audit_logs') {
        const l = limit ? parseInt(limit) : 100;
        const rows = await sql`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ${l}`;
        return res.status(200).json({ data: rows.map(mapAuditLog) });
      }
      if (table === 'notifications') {
        const l = limit ? parseInt(limit) : 20;
        const rows = await sql`SELECT * FROM notifications ORDER BY timestamp DESC LIMIT ${l}`;
        return res.status(200).json({ data: rows.map(mapNotification) });
      }
      if (table === 'events') {
        const rows = await sql`SELECT * FROM events ORDER BY start_date ASC`;
        return res.status(200).json({ data: rows.map(mapEvent) });
      }
      if (table === 'job_requests') {
        const rows = await sql`SELECT * FROM job_requests ORDER BY requested_at DESC`;
        return res.status(200).json({ data: rows.map(mapJobRequest) });
      }
      if (table === 'settings') {
        const rows = await sql`SELECT * FROM settings WHERE id = ${id}`;
        return res.status(200).json({ data: rows[0] || null });
      }
    }

    if (req.method === 'POST') {
      const body = getParsedBody();
      if (table === 'equipment') {
        await sql`INSERT INTO equipment (id, category, brand, model, serial_number, installation_date, status, division, location, calibration_point, pic, image, cal_cert, ver_cert) 
                 VALUES (${body.id}, ${body.category}, ${body.brand}, ${body.model}, ${body.serialNumber}, ${body.installationDate}, ${body.status}, ${body.division}, ${body.location}, ${body.calibrationMeasuringPoint}, ${body.personInCharge}, ${body.image}, ${body.calibrationCert}, ${body.verificationCert})`;
        return res.status(201).json({ data: { success: true } });
      }
      if (table === 'audit_logs') {
        await sql`INSERT INTO audit_logs (action, target_id, target_name, user_id, user_name, timestamp, details)
                 VALUES (${body.action}, ${body.targetId}, ${body.targetName}, ${body.userId}, ${body.userName}, ${body.timestamp}, ${body.details})`;
        return res.status(201).json({ data: { success: true } });
      }
      if (table === 'notifications') {
        await sql`INSERT INTO notifications (title, message, timestamp, is_read, type)
                 VALUES (${body.title}, ${body.message}, ${body.timestamp}, ${body.isRead}, ${body.type})`;
        return res.status(201).json({ data: { success: true } });
      }
      if (table === 'events') {
        const rows = await sql`INSERT INTO events (title, description, start_date, end_date, type, equipment_id, created_by)
                 VALUES (${body.title}, ${body.description}, ${body.startDate}, ${body.endDate}, ${body.type}, ${body.equipmentId}, ${body.createdBy}) RETURNING id`;
        return res.status(201).json({ data: { id: rows[0].id } });
      }
      if (table === 'users') {
        await sql`INSERT INTO users (id, name, email, role, avatar, password, status)
                 VALUES (${body.id}, ${body.name}, ${body.email}, ${body.role}, ${body.avatar}, ${body.password}, 'active')`;
        return res.status(201).json({ data: { success: true } });
      }
      if (table === 'job_requests') {
        const rows = await sql`INSERT INTO job_requests (title, requestor_id, requestor_name, division, description, category, requested_at, start_date, due_date, assigned_to_id, status)
                 VALUES (${body.title}, ${body.requestorId}, ${body.requestorName}, ${body.division}, ${body.description}, ${body.category}, ${body.requestedAt}, ${body.startDate}, ${body.dueDate}, ${body.assignedToId}, ${body.status}) RETURNING id`;
        return res.status(201).json({ data: { id: rows[0].id } });
      }
    }

    if (req.method === 'PUT') {
      const body = getParsedBody();
      if (table === 'equipment') {
        if (bulk) {
           for (const item of body) {
             await sql`INSERT INTO equipment (id, category, brand, model, serial_number, installation_date, status, division, location, calibration_point, pic, image, cal_cert, ver_cert) 
                      VALUES (${item.id}, ${item.category}, ${item.brand}, ${item.model}, ${item.serialNumber}, ${item.installationDate}, ${item.status}, ${item.division}, ${item.location}, ${item.calibrationMeasuringPoint}, ${item.personInCharge}, ${item.image}, ${item.calibrationCert}, ${item.verificationCert})
                      ON CONFLICT (id) DO UPDATE SET 
                      category = EXCLUDED.category, brand = EXCLUDED.brand, model = EXCLUDED.model, serial_number = EXCLUDED.serial_number, installation_date = EXCLUDED.installation_date, status = EXCLUDED.status, division = EXCLUDED.division, location = EXCLUDED.location, calibration_point = EXCLUDED.calibration_point, pic = EXCLUDED.pic, image = EXCLUDED.image, cal_cert = EXCLUDED.cal_cert, ver_cert = EXCLUDED.ver_cert`;
           }
        } else {
          await sql`UPDATE equipment SET 
            category = ${body.category}, brand = ${body.brand}, model = ${body.model}, serial_number = ${body.serialNumber}, installation_date = ${body.installationDate}, status = ${body.status}, division = ${body.division}, location = ${body.location}, calibration_point = ${body.calibrationMeasuringPoint}, pic = ${body.personInCharge}, image = ${body.image}, cal_cert = ${body.calibrationCert}, ver_cert = ${body.verificationCert}
            WHERE id = ${body.id}`;
        }
        return res.status(200).json({ data: { success: true } });
      }
      if (table === 'settings') {
        await sql`INSERT INTO settings (id, values) VALUES (${body.id}, ${JSON.stringify(body.values)})
                 ON CONFLICT (id) DO UPDATE SET values = EXCLUDED.values`;
        return res.status(200).json({ data: { success: true } });
      }
      if (table === 'job_requests') {
        await sql`UPDATE job_requests SET 
            title = ${body.title}, 
            division = ${body.division}, 
            description = ${body.description}, 
            category = ${body.category}, 
            start_date = ${body.startDate}, 
            due_date = ${body.dueDate}, 
            assigned_to_id = ${body.assignedToId}, 
            status = ${body.status}
            WHERE id = ${body.id}`;
        return res.status(200).json({ data: { success: true } });
      }
    }

    if (req.method === 'PATCH') {
      const body = getParsedBody();
      if (table === 'users') {
        await sql`UPDATE users SET name = ${body.name}, email = ${body.email}, role = ${body.role}, avatar = ${body.avatar}, status = ${body.status || 'active'} WHERE id = ${id}`;
        return res.status(200).json({ data: { success: true } });
      }
      if (table === 'notifications') {
        await sql`UPDATE notifications SET is_read = ${body.isRead} WHERE id = ${id}`;
        return res.status(200).json({ data: { success: true } });
      }
      if (table === 'job_requests') {
        await sql`UPDATE job_requests SET status = ${body.status} WHERE id = ${id}`;
        return res.status(200).json({ data: { success: true } });
      }
    }

    if (req.method === 'DELETE') {
      if (table === 'equipment') await sql`DELETE FROM equipment WHERE id = ${id}`;
      if (table === 'users') await sql`DELETE FROM users WHERE id = ${id}`;
      if (table === 'events') await sql`DELETE FROM events WHERE id = ${id}`;
      if (table === 'notifications') await sql`DELETE FROM notifications WHERE id = ${id}`;
      if (table === 'job_requests') await sql`DELETE FROM job_requests WHERE id = ${id}`;
      return res.status(200).json({ data: { success: true } });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

function mapEquipment(row: any) {
  return {
    id: row.id,
    category: row.category,
    brand: row.brand,
    model: row.model,
    serialNumber: row.serial_number,
    installationDate: row.installation_date,
    status: row.status,
    division: row.division,
    location: row.location,
    calibrationMeasuringPoint: row.calibration_point,
    personInCharge: row.pic,
    image: row.image,
    calibrationCert: row.cal_cert,
    verificationCert: row.ver_cert
  };
}

function mapAuditLog(row: any) {
  return {
    id: row.id,
    action: row.action,
    targetId: row.target_id,
    targetName: row.target_name,
    userId: row.user_id,
    userName: row.user_name,
    timestamp: row.timestamp,
    details: row.details
  };
}

function mapNotification(row: any) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp,
    isRead: row.is_read,
    type: row.type
  };
}

function mapEvent(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    type: row.type,
    equipmentId: row.equipment_id,
    createdBy: row.created_by
  };
}

function mapJobRequest(row: any) {
  return {
    id: row.id,
    title: row.title,
    requestorId: row.requestor_id,
    requestorName: row.requestor_name,
    division: row.division,
    description: row.description,
    category: row.category,
    requestedAt: row.requested_at,
    startDate: row.start_date,
    dueDate: row.due_date,
    assignedToId: row.assigned_to_id,
    status: row.status
  };
}
