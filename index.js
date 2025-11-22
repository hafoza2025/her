const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGc...';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let employeeData = null, ipAddress = "";

window.onload = async function() {
  document.getElementById("loading").textContent = "جارٍ جلب عنوان IP...";
  ipAddress = await getIP();
  document.getElementById("currentIP").textContent = ipAddress;

  let { data: emp } = await supabase.from('employees').select('*').eq('mobile_ip', ipAddress).maybeSingle();
  if (emp) {
    employeeData = emp;
    document.getElementById("loading").style.display = "none";
    document.getElementById("idCard").style.display = "";
    document.getElementById("empName").textContent = emp.name;
    document.getElementById("empDept").textContent = emp.department || '';
    document.getElementById("empCode").textContent = emp.employee_code || '';
    document.getElementById("empIP").textContent = ipAddress;
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), { text: emp.employee_code, width: 90, height: 90 });
    loadAttendanceHistory();

    document.getElementById("attendanceBtn").onclick = async ()=>{
      let { data: last } = await supabase.from('attendance').select('action').eq('employee_id', emp.id).order('time',{ascending:false}).limit(1).maybeSingle();
      let action = (!last || last.action==="checkout") ? "checkin" : "checkout";
      let { error } = await supabase.from('attendance').insert({employee_id: emp.id, company_id: emp.company_id, action, ip: ipAddress});
      document.getElementById("attMsg").textContent = error ? '❌ خطأ في التسجيل' : `✅ تم تسجيل ${action==='checkin'?'الحضور':'الانصراف'}!`;
      loadAttendanceHistory();
    }
  } else {
    document.getElementById("loading").style.display="none";
    document.getElementById("notFound").style.display="";
  }
};

async function getIP() {
  try {
    let res = await fetch("https://api.ipify.org/?format=json");
    let json = await res.json();
    return json.ip || "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

// ربط الجهاز بالكود
window.bindDevice = async function(){
  const code = document.getElementById("bindEmpCode").value.trim();
  if(!code) return showBindResult("ادخل كود الموظف");
  // تحقق
  let { data: exist } = await supabase.from('employees').select('id').eq('mobile_ip', ipAddress).maybeSingle();
  if(exist) return showBindResult("هذا الIP مرتبط بموظف آخر!");

  let { data: emp } = await supabase.from('employees').select('*').eq('employee_code', code).maybeSingle();
  if(!emp) return showBindResult("الكود خطأ!");

  let { error } = await supabase.from('employees').update({ mobile_ip: ipAddress }).eq('id', emp.id);
  if(error) return showBindResult("❌ فشل الربط!");
  showBindResult("✅ تم ربط الجهاز! أعد تحميل الصفحة");
  setTimeout(()=>location.reload(),1300);
};

function showBindResult(msg){ document.getElementById("bindResult").textContent=msg; }

async function loadAttendanceHistory(){
  let { data: records } = await supabase.from('attendance').select('*').eq('employee_id',employeeData.id).order('time',{ascending:false}).limit(8);
  let html = `<h4>آخر السجلات</h4>`;
  for(const rec of records){
    let t = new Date(rec.time);
    html += `<div><span class="badge ${rec.action==='checkin'?'in':'out'}">${rec.action==='checkin'?'حضور':'انصراف'}</span> (${t.toLocaleDateString('ar-EG')} - ${t.toLocaleTimeString('ar-EG')})</div>`;
  }
  document.getElementById('attendanceHistory').innerHTML = html;
}
