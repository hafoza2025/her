import { supabase } from './supabaseClient.js';

let attendanceType = 'in'; // 'in' for حضور, 'out' for انصراف حسب الحالة

async function checkLastAttendance(employee_id) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('type')
    .eq('employee_id', employee_id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return;

  if (data && data.type === 'in') {
    attendanceType = 'out';
    document.getElementById('attendance-btn').textContent = '[translate:تسجيل الانصراف]';
  } else {
    attendanceType = 'in';
    document.getElementById('attendance-btn').textContent = '[translate:تسجيل الحضور]';
  }
}

async function recordAttendance(employee_id, device_id) {
  if (!navigator.geolocation) {
    alert('[translate:الموقع الجغرافي غير مدعوم في هذا المتصفح]');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    const { error } = await supabase.from('attendance_records').insert([{
      employee_id,
      device_id,
      type: attendanceType,
      timestamp: new Date().toISOString(),
      location_lat: latitude,
      location_lng: longitude
    }]);

    const statusMsg = document.getElementById('status-msg');
    if (error) {
      statusMsg.textContent = '[translate:فشل في تسجيل الحضور. حاول مرة أخرى]';
    } else {
      statusMsg.textContent = attendanceType === 'in' ? '[translate:تم تسجيل الحضور بنجاح]' : '[translate:تم تسجيل الانصراف بنجاح]';
      attendanceType = attendanceType === 'in' ? 'out' : 'in';
      document.getElementById('attendance-btn').textContent = attendanceType === 'in' ? '[translate:تسجيل الحضور]' : '[translate:تسجيل الانصراف]';
    }
  }, () => {
    alert('[translate:تعذر الحصول على الموقع الجغرافي]');
  });
}

document.getElementById('attendance-btn').addEventListener('click', async () => {
  const employee_id = 1;  // استبدل بمعرف الموظف الحالي بعد تسجيل الدخول
  const device_id = 1;    // استبدل بمعرف الجهاز الحالي بعد التحقق منه
  await recordAttendance(employee_id, device_id);
  await checkLastAttendance(employee_id);
});

// تهيئة الزر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const employee_id = 1;  // تعيين معرف الموظف الحقيقي
  checkLastAttendance(employee_id);
});
