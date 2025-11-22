const SUPABASE_URL = 'https://rrsfrnamnbvcjcozezqk.supabase.co';
const SUPABASE_KEY = 'eyJhbGc...';
const supabase = supabeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2ZybmFtbmJ2Y2pjb3plenFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MDc0NTQsImV4cCI6MjA3OTM4MzQ1NH0.mO0hTrzCqrxRRephLFPxR7W_5fn1FVXS_c6ZCQNA3ckase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.showAddForm = ()=>{document.getElementById('addForm').style.display='block';};
window.hideAddForm = ()=>{document.getElementById('addForm').style.display='none';};

window.addEmp = async () => {
  const name = document.getElementById('empName').value.trim();
  const code = document.getElementById('empCode').value.trim().toUpperCase();
  const dept = document.getElementById('empDept').value.trim();

  if(!name || !code) return showMsg('addMsg','كل البيانات مطلوبة',1);

  // تحقق من التفرد
  let { data: chk } = await supabase.from('employees').select('id').eq('employee_code', code).maybeSingle();
  if(chk) return showMsg('addMsg','الكود مستخدم بالفعل!',1);

  let { error } = await supabase.from('employees').insert({ name, employee_code: code, department: dept, company_id: 1 });
  showMsg('addMsg', error ? '❌ خطأ' : '✅ تمت الإضافة!', error);
  hideAddForm();
  loadEmployees();
};

async function loadEmployees() {
  let { data: employees } = await supabase.from('employees').select('*').order('id', { ascending: false });
  let html = `<table class="table"><tr>
    <th>الكود</th><th>الاسم</th><th>القسم</th><th>IP</th>
    <th>ربط/تغيير IP</th><th>حذف</th></tr>`;
  for(const e of employees||[]) {
    html += `<tr>
      <td>${e.employee_code}</td>
      <td>${e.name}</td>
      <td>${e.department||''}</td>
      <td>${e.mobile_ip||'<span style="color:#aaa;">غير مربوط</span>'}</td>
      <td>
        <button onclick="showBindForm('${e.id}','${e.name}','${e.employee_code}')">
          ${e.mobile_ip?'تغيير':'ربط'} IP
        </button>
        ${e.mobile_ip?`<button onclick="unbindIP('${e.id}')">إلغاء الربط</button>`:''}
      </td>
      <td><button onclick="delEmp('${e.id}')">🗑️ حذف</button></td>
    </tr>`;
  }
  html += `</table>
  <div id="bindFormDiv" style="margin-top:14px;"></div>`;
  document.getElementById('empTable').innerHTML = html;
}
window.loadEmployees = loadEmployees;

window.delEmp = async (id) => {
  if(confirm("سيتم حذف الموظف وكل حضوره!")) {
    await supabase.from('attendance').delete().eq('employee_id', id);
    await supabase.from('employees').delete().eq('id', id);
    loadEmployees(); loadAttendance();
  }
};

window.showBindForm = (id, name, code) => {
  document.getElementById('bindFormDiv').innerHTML = `
    <div style="background:#f4f4f7;padding:10px; margin-top:5px;">
      <b>ربط/تغيير IP للموظف ${name} (${code})</b>
      <input id="bindIP" placeholder="IP">
      <button onclick="bindIP('${id}')">حفظ</button>
    </div>`;
};

window.bindIP = async (id) => {
  const ip = document.getElementById('bindIP').value.trim();
  if(!ip) return alert('اكتب IP أولاً');
  let { data: exist } = await supabase.from('employees').select('id').eq('mobile_ip', ip).maybeSingle();
  if(exist) return alert('❗ هذا الIP مرتبط بموظف آخر');
  await supabase.from('employees').update({ mobile_ip: ip }).eq('id', id);
  document.getElementById('bindFormDiv').innerHTML = '';
  loadEmployees();
};

window.unbindIP = async (id) => {
  await supabase.from('employees').update({ mobile_ip: null }).eq('id', id);
  loadEmployees();
};

window.showMsg = function(id, msg, err){ let d=document.getElementById(id); d.textContent=msg; d.style.color=err?'#d22':'#187'; };

// سجل الحضور (آخر 30 حضور)
async function loadAttendance() {
  let { data: atts } = await supabase.from('attendance').select('*,employees(name,employee_code)').order('time',{ascending:false}).limit(30);
  let html = `<table class="table"><tr>
    <th>اسم الموظف</th><th>الكود</th><th>النوع</th><th>الوقت</th><th>IP</th></tr>`;
  for(const att of atts||[]) {
    let name = att.employees?.name || 'غير معروف';
    let code = att.employees?.employee_code || '--';
    let type = att.action === 'checkin' ? 'حضور' : 'انصراف';
    let badge = att.action === 'checkin' ? 'badge in' : 'badge out';
    let time = new Date(att.time).toLocaleString('ar-EG');
    html += `<tr>
      <td>${name}</td>
      <td>${code}</td>
      <td><span class="${badge}">${type}</span></td>
      <td>${time}</td>
      <td>${att.ip||''}</td>
    </tr>`;
  }
  html += '</table>';
  document.getElementById('attTable').innerHTML = html;
}
window.loadAttendance = loadAttendance;

window.exportCsv = function() {
  let table = document.querySelector('#attTable table');
  if(!table) return;
  let csv = [];
  for(let row of table.rows){
    let cols = Array.from(row.cells).map(cell=>cell.textContent.replace(/,/g,";"));
    csv.push(cols.join(","));
  }
  let blob = new Blob([csv.join("\n")], { type: 'text/csv' });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url; a.download = "attendance.csv"; a.click();
  window.URL.revokeObjectURL(url);
};

// تحميل البيانات فور الدخول
window.addEventListener('DOMContentLoaded', ()=>{
  loadEmployees();
  loadAttendance();
});
