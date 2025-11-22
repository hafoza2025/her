const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGc...'; // غيّرها لمشروعك الفعلي
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let employeeData = null, ipAddress = "";

window.onload = async function() {
  document.getElementById("loading").textContent = "جاري أخذ IP جهازك...";
  ipAddress = await getIP();
  document.getElementById("currentIP").textContent = ipAddress;

  // ابحث هل يوجد موظف مربوط بنفس الـ IP
  let { data: emp } = await supabase.from('employees').select('*').eq('mobile_ip', ipAddress).maybeSingle();
  if (emp) {
    // لو وجد، أظهر كارت الموظف وزر الحضور
    employeeData = emp;
    document.getElementById("loading").style.display = "none";
    document.getElementById("idCard").style.display = "";
    document.getElementById("empName").textContent = emp.name;
    document.getElementById("empDept").textContent = emp.department || '';
    document.getElementById("empCode").textContent = emp.employee_code || '';
    document.getElementById("empIP").textContent = ipAddress;
    // QR كود
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), { text: emp.employee_code, width: 85, height: 85 });
    loadAttendanceHistory();

    document.getElementById("attendanceBtn").onclick = async ()=>{
      let { data: last } = await supabase.from('attendance').select('action').eq('employee_id', emp.id).order('time',{ascending:false}).limit(1).maybeSingle();
      let action = (!last || last.action==="checkout") ? "checkin" : "checkout";
      let { error } = await supabase.from('attendance').insert({employee_id: emp.id, company_id: emp.company_id, action, ip: ipAddress});
      document.getElementById("attMsg").textContent = error ? '❌ خطأ في التسجيل' : `✅ تم تسجيل ${action==='checkin'?'الحضور':'الانصراف'}!`;
      loadAttendanceHistory();
    }
  } else {
    // غير مسجل، أعطه IP واربط لو أحب
    document.getElementById("loading").style.display="none";
    document.getElementById("notFound").style.display="";
  }
};

// جلب الـ Public IP الحقيقي الظاهر
async function getIP() {
  try {
    let res = await fetch("https://api.ipify.org/?format=json");
    let json = await res.json();
    return json.ip || "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

// ربط الجهاز الحالي بكود الموظف
window.bindDevice = async function(){
  const code = document.getElementById("bindEmpCode").value.trim();
  if(!code) return showBindResult("ادخل كود الموظف");

  // تحقق أن الـ IP غير مرتبط بالفعل
  let { data: exist } = await supabase.from('employees').select('id').eq('mobile_ip', ipAddress).maybeSingle();
  if(exist) return showBindResult("❗ هذا الـIP موجود لحساب آخر!");

  // ابحث عن الموظف
  let { data: emp } = await supabase.from('employees').select('*').eq('employee_code', code).maybeSingle();
  if(!emp) return showBindResult("كود خاطئ!");

  // اربط الـ IP بالحساب
  let { error } = await supabase.from('employees').update({ mobile_ip: ipAddress }).eq('id', emp.id);
  if(error) return showBindResult("❌ فشل الربط!");
  showBindResult("✅ تم الربط، أعد فتح الصفحة");
  setTimeout(()=>location.reload(),1300);
};

function showBindResult(msg){ document.getElementById("bindResult").textContent=msg; }

// تاريخ الحضور/الانصراف
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
