const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGc...'; // غيّرها لمشروعك
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let employeeData = null, ipAddress = "";

window.onload = async function() {
  document.getElementById("status").textContent = "جاري التعرف على الموظف عبر الـ IP...";
  ipAddress = await getIP();
  document.getElementById("currentIP").textContent = "IP الحالي: " + ipAddress;

  let { data: emp } = await supabase.from('employees').select('*').eq('mobile_ip', ipAddress).maybeSingle();
  if (emp) {
    employeeData = emp;
    document.getElementById("empName").textContent = emp.name;
    document.getElementById("empDept").textContent = emp.department || '-';
    document.getElementById("empCode").textContent = emp.employee_code || '-';
    document.getElementById("empCard").style.display = "";
    document.getElementById("status").style.display="none";

    loadAttendanceHistory();

    document.getElementById("attendanceBtn").onclick = async ()=>{
      let { data: last } = await supabase.from('attendance').select('action').eq('employee_id', emp.id).order('time',{ascending:false}).limit(1).maybeSingle();
      let action = (!last || last.action==="checkout") ? "checkin" : "checkout";
      let { error } = await supabase.from('attendance').insert({employee_id: emp.id, company_id: emp.company_id, action, ip: ipAddress});
      document.getElementById("attResult").textContent = error ? '❌ خطأ في التسجيل' : `✅ تم تسجيل ${action==='checkin'?'الحضور':'الانصراف'}!`;
      loadAttendanceHistory();
    }
  } else {
    document.getElementById("notFound").style.display="";
    document.getElementById("status").style.display="none";
  }
};

// جلب IP المستخدم (استخدم خدمة ipinfo.io أو أي خدمة مجانية)
// ملحوظة: لكل شبكة أو VPN إختلاف في نتائج الـ IP
async function getIP() {
  try {
    let res = await fetch("https://api.ipify.org/?format=json");
    let json = await res.json();
    return json.ip || "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

async function loadAttendanceHistory(){
  let { data: records } = await supabase.from('attendance').select('*').eq('employee_id',employeeData.id).order('time',{ascending:false}).limit(8);
  let html = `<h4>آخر السجلات</h4>`;
  for(const rec of records){
    let t = new Date(rec.time);
    html += `<div><span class="badge ${rec.action==='checkin'?'in':'out'}">${rec.action==='checkin'?'حضور':'انصراف'}</span>
     (${t.toLocaleDateString('ar-EG')} - ${t.toLocaleTimeString('ar-EG')})</div>`;
  }
  document.getElementById('attendanceHistory').innerHTML = html;
}
