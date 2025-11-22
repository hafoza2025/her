import { supabase } from './supabaseClient.js';

async function loadEmployeeCard(employee_id) {
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employee_id)
    .single();

  if (error) {
    document.getElementById('card-info').textContent = '[translate:فشل في تحميل بيانات الموظف]';
    return;
  }

  const cardInfo = `
    <p><strong>[translate:الاسم]:</strong> ${employee.name}</p>
    <p><strong>[translate:البريد الإلكتروني]:</strong> ${employee.email}</p>
    <p><strong>[translate:القسم]:</strong> ${employee.department || '[translate:غير محدد]'}</p>
    <p><strong>[translate:حالة الكارنيه]:</strong> ${employee.card_status}</p>
    <img src="${employee.photo_url || 'default-photo.png'}" alt="[translate:صورة الموظف]" width="150" />
  `;

  document.getElementById('card-info').innerHTML = cardInfo;
}

document.addEventListener('DOMContentLoaded', () => {
  const employee_id = 1;  // استبدل بمعرف الموظف الحقيقي بعد تسجيل الدخول
  loadEmployeeCard(employee_id);
});
