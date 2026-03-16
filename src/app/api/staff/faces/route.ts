export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Fetch all users that have a face descriptor recorded (role staff/admin)
    // We only need id, full_name, and face_descriptor
    const res = await pool.query(`
      SELECT id, full_name, face_descriptor 
      FROM users 
      WHERE face_descriptor IS NOT NULL
    `);

    // Parse the JSON string back into an array for the client
    const faces = res.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      faceDescriptor: JSON.parse(row.face_descriptor)
    }));

    return NextResponse.json({ success: true, faces });
  } catch (error) {
    console.error('Fetch faces error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lấy dữ liệu khuôn mặt.' }, { status: 500 });
  }
}
