import { supabase } from './supabaseClient.js';

async function loadEmployees() {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('id');

  if (error) {
    console.error('[translate:خطأ في جلب الموظفين]:', error);
    return;
  }

  const list = document.getElementById('employee-list');
  list.innerHTML = '';

  employees.forEach(emp => {
    const div = document.createElement('div');
    div.textContent = `${emp.id} - ${emp.name} - ${emp.email}`;
    list.appendChild(div);
  });
}

document.getElementById('add-employee-btn').addEventListener('click', async () => {
  const name = prompt('[translate:أدخل اسم الموظف:]');
  const email = prompt('[translate:أدخل إيميل الموظف:]');
  if (name && email) {
    const { error } = await supabase
      .from('employees')
      .insert([{ name, email }]);
    if (error) {
      alert('[translate:حدث خطأ أثناء الإضافة]');
      console.error(error);
    } else {
      loadEmployees();
    }
  }
});

loadEmployees();
