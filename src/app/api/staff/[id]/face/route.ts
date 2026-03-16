import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const admin = await getSessionUser();
    // Require valid logged in user to perform this action
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { faceDescriptor } = await request.json();

    if (!faceDescriptor) {
      return NextResponse.json({ success: false, message: 'Missing face descriptor' }, { status: 400 });
    }

    // Update the user's face_descriptor in the database
    // Store as JSON string since we use TEXT column
    const descriptorStr = JSON.stringify(faceDescriptor);

    console.log(`[FACE_SAVE] Attempting to save face for ID: ${params.id}, Descriptor length: ${faceDescriptor.length}`);

    const result = await pool.query(
      'UPDATE users SET face_descriptor = $1 WHERE id = $2',
      [descriptorStr, params.id]
    );

    console.log(`[FACE_SAVE] Update result rowCount: ${result.rowCount}`);

    if (result.rowCount === 0) {
      console.error(`[FACE_SAVE] Error: No user found with ID: ${params.id}`);
      return NextResponse.json({ success: false, message: 'Lỗi: Không tìm thấy nhân viên trong Database' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Dữ liệu khuôn mặt đã được lưu.' });
  } catch (error) {
    console.error('Save face descriptor error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lưu khuôn mặt.' }, { status: 500 });
  }
}
