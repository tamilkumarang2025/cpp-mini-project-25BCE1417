'use strict';

/* ============================================================
   Student class — mirrors C++ Student
   ============================================================ */
class Student {
  constructor(regNo, name, cat1, cat2, fat) {
    this.regNo = String(regNo).trim();
    this.name  = String(name).trim();
    this.cat1  = parseFloat(cat1);
    this.cat2  = parseFloat(cat2);
    this.fat   = parseFloat(fat);
    this.computeGrade();
  }
  computeGrade() {
    this.total   = this.cat1 + this.cat2 + this.fat;
    this.average = this.total / 3;
    if      (this.average >= 80) this.grade = 'A';
    else if (this.average >= 60) this.grade = 'B';
    else if (this.average >= 40) this.grade = 'C';
    else                         this.grade = 'Fail';
  }
  initials() {
    return this.name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0,2) || '??';
  }
}

/* ============================================================
   StudentManager — mirrors C++ StudentManager
   ============================================================ */
class StudentManager {
  constructor() {
    this.students = [];
    this.load();
  }
  save() {
    localStorage.setItem('md_v2', JSON.stringify(this.students));
  }
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('md_v2') || '[]');
      this.students = d.map(s => new Student(s.regNo, s.name, s.cat1, s.cat2, s.fat));
    } catch { this.students = []; }
  }
  hasDuplicate(r) { return this.students.some(s => s.regNo.toLowerCase() === r.toLowerCase()); }
  validMark(v)    { return !isNaN(v) && v >= 0 && v <= 100; }

  add(regNo, name, cat1, cat2, fat) {
    if (!regNo || !name) return { ok:false, msg:'RegNo and Name are required.' };
    if (this.hasDuplicate(regNo)) return { ok:false, msg:`RegNo ${regNo} already exists.` };
    if (!this.validMark(cat1)||!this.validMark(cat2)||!this.validMark(fat))
      return { ok:false, msg:'Marks must be 0–100.' };
    this.students.push(new Student(regNo, name, cat1, cat2, fat));
    this.save();
    return { ok:true, msg:`${name} added successfully.` };
  }
  del(regNo) {
    const i = this.students.findIndex(s => s.regNo === regNo);
    if (i === -1) return { ok:false, msg:'Student not found.' };
    const name = this.students[i].name;
    this.students.splice(i, 1);
    this.save();
    return { ok:true, msg:`${name} deleted.` };
  }
  update(regNo, cat1, cat2, fat) {
    const s = this.students.find(s => s.regNo === regNo);
    if (!s) return { ok:false, msg:'RegNo not found.' };
    if (!this.validMark(cat1)||!this.validMark(cat2)||!this.validMark(fat))
      return { ok:false, msg:'Marks must be 0–100.' };
    s.cat1 = +cat1; s.cat2 = +cat2; s.fat = +fat;
    s.computeGrade();
    this.save();
    return { ok:true, msg:`Marks updated for ${regNo}.` };
  }
  filter(q, grade) {
    const ql = (q||'').toLowerCase();
    return this.students.filter(s =>
      (!ql || s.regNo.toLowerCase().includes(ql) || s.name.toLowerCase().includes(ql)) &&
      (!grade || s.grade === grade)
    );
  }
  stats() {
    const n = this.students.length;
    if (!n) return null;
    const totals = this.students.map(s => s.total);
    return {
      count:   n,
      highest: Math.max(...totals),
      lowest:  Math.min(...totals),
      average: totals.reduce((a,b)=>a+b,0) / n
    };
  }
  gradeDist() {
    const d = {A:0,B:0,C:0,Fail:0};
    this.students.forEach(s => d[s.grade]++);
    return d;
  }
  toppers() {
    if (!this.students.length) return [];
    const max = Math.max(...this.students.map(s => s.total));
    return this.students.filter(s => s.total === max);
  }
}

/* ============================================================
   GLOBALS
   ============================================================ */
const mgr = new StudentManager();

const GRADE_COLORS = { A:'#10b981', B:'#0ea5e9', C:'#f59e0b', Fail:'#f43f5e' };

/* ============================================================
   TAB SWITCHING
   ============================================================ */
function switchTab(btn, id) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
  if (id === 'overview')  renderOverview();
  if (id === 'students')  renderCards();
  if (id === 'reports')   renderReports();
}

/* ============================================================
   LIVE PREVIEW
   ============================================================ */
function livePreview() {
  const name  = document.getElementById('inp-name').value.trim();
  const regNo = document.getElementById('inp-reg').value.trim();
  const c1 = parseFloat(document.getElementById('inp-cat1').value);
  const c2 = parseFloat(document.getElementById('inp-cat2').value);
  const f  = parseFloat(document.getElementById('inp-fat').value);

  // bar widths
  document.getElementById('bar-cat1').style.width = (!isNaN(c1) ? c1 : 0) + '%';
  document.getElementById('bar-cat2').style.width = (!isNaN(c2) ? c2 : 0) + '%';
  document.getElementById('bar-fat').style.width  = (!isNaN(f)  ? f  : 0) + '%';

  document.getElementById('prev-name').textContent  = name  || 'Student Name';
  document.getElementById('prev-regno').textContent = regNo || 'REG NO';
  document.getElementById('prev-av').textContent    = name ? name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2) : '?';

  if (!isNaN(c1) && !isNaN(c2) && !isNaN(f)) {
    const total = c1 + c2 + f;
    const avg   = total / 3;
    let grade;
    if (avg >= 80) grade = 'A'; else if (avg >= 60) grade = 'B'; else if (avg >= 40) grade = 'C'; else grade = 'Fail';
    const gc = GRADE_COLORS[grade];
    document.getElementById('ps-c1').textContent    = c1;
    document.getElementById('ps-c2').textContent    = c2;
    document.getElementById('ps-fat').textContent   = f;
    document.getElementById('ps-total').textContent = total.toFixed(1) + ' / 300';
    document.getElementById('ps-avg').textContent   = avg.toFixed(2);
    const chip = document.getElementById('prev-chip');
    chip.textContent = grade;
    chip.style.background = gc + '20';
    chip.style.color = gc;
  } else {
    ['ps-c1','ps-c2','ps-fat','ps-total','ps-avg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const chip = document.getElementById('prev-chip');
    chip.textContent = '—';
    chip.style.background = '#f1f5f9';
    chip.style.color = '#6b7280';
  }
}

// Attach live preview to text inputs too
['inp-reg','inp-name'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', livePreview);
});

/* ============================================================
   ADD STUDENT
   ============================================================ */
function addStudent() {
  const r  = document.getElementById('inp-reg').value.trim();
  const n  = document.getElementById('inp-name').value.trim();
  const c1 = document.getElementById('inp-cat1').value;
  const c2 = document.getElementById('inp-cat2').value;
  const f  = document.getElementById('inp-fat').value;

  const res = mgr.add(r, n, c1, c2, f);
  toast(res.msg, res.ok ? 'success' : 'error');

  if (res.ok) {
    ['inp-reg','inp-name','inp-cat1','inp-cat2','inp-fat'].forEach(id => {
      document.getElementById(id).value = '';
    });
    livePreview();
    renderAll();
  }
}

/* ============================================================
   UPDATE STUDENT
   ============================================================ */
function updateStudent() {
  const r  = document.getElementById('upd-reg').value.trim();
  const c1 = document.getElementById('upd-cat1').value;
  const c2 = document.getElementById('upd-cat2').value;
  const f  = document.getElementById('upd-fat').value;

  const res = mgr.update(r, c1, c2, f);
  toast(res.msg, res.ok ? 'success' : 'error');
  if (res.ok) {
    ['upd-reg','upd-cat1','upd-cat2','upd-fat'].forEach(id => {
      document.getElementById(id).value = '';
    });
    renderAll();
  }
}

/* ============================================================
   DELETE
   ============================================================ */
function deleteStudent(regNo) {
  if (!confirm(`Delete ${regNo}? This cannot be undone.`)) return;
  const res = mgr.del(regNo);
  toast(res.msg, res.ok ? 'success' : 'error');
  if (res.ok) renderAll();
}

/* ============================================================
   RENDER OVERVIEW
   ============================================================ */
function renderOverview() {
  const st = mgr.stats();
  const d  = mgr.gradeDist();
  const n  = mgr.students.length;

  document.getElementById('kpi-total').textContent = n;
  document.getElementById('kpi-avg').textContent   = st ? st.average.toFixed(1) : '—';
  document.getElementById('kpi-top').textContent   = st ? st.highest.toFixed(1) : '—';
  document.getElementById('kpi-fail').textContent  = d.Fail;

  // Donut
  document.getElementById('d-mid-n').textContent = n;
  const circ = 2 * Math.PI * 60; // r=60
  const grades = ['A','B','C','Fail'];
  const ids    = ['ds-a','ds-b','ds-c','ds-fail'];
  let offset = 0;
  grades.forEach((g, i) => {
    const el  = document.getElementById(ids[i]);
    const pct = n ? d[g] / n : 0;
    const len = pct * circ;
    el.style.strokeDasharray  = `${len} ${circ - len}`;
    el.style.strokeDashoffset = -offset;
    offset += len;
  });

  // Grade bars
  const gradeBars = document.getElementById('grade-bars');
  gradeBars.innerHTML = grades.map(g => {
    const pct = n ? Math.round((d[g]/n)*100) : 0;
    return `<div class="gb-row">
      <div class="gb-top"><span>${g === 'Fail' ? 'Fail' : 'Grade ' + g}</span><span>${d[g]} (${pct}%)</span></div>
      <div class="gb-track"><div class="gb-fill" style="width:${pct}%;background:${GRADE_COLORS[g]}"></div></div>
    </div>`;
  }).join('');

  // Recent
  const recent = document.getElementById('recent-list');
  if (!mgr.students.length) {
    recent.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:20px 0;text-align:center">No students yet</div>';
  } else {
    recent.innerHTML = mgr.students.slice(-5).reverse().map(s => {
      const gc = GRADE_COLORS[s.grade];
      return `<div class="recent-item">
        <div class="ri-av" style="background:${gc}">${s.initials()}</div>
        <div><div class="ri-name">${s.name}</div><div class="ri-reg">${s.regNo}</div></div>
        <div class="ri-grade"><span class="chip chip-${s.grade}">${s.grade}</span></div>
      </div>`;
    }).join('');
  }

  // Sidebar footer
  document.getElementById('sf-count').textContent = n;
  document.getElementById('sf-avg').textContent   = st ? st.average.toFixed(1) : '—';
  const passRate = n ? Math.round(((d.A + d.B + d.C) / n) * 100) : 0;
  document.getElementById('sf-pass').textContent  = n ? passRate + '%' : '—';
}

/* ============================================================
   RENDER STUDENT CARDS
   ============================================================ */
function renderCards() {
  const q     = document.getElementById('search-inp')?.value || '';
  const grade = document.getElementById('filter-grade')?.value || '';
  const list  = mgr.filter(q, grade);
  const grid  = document.getElementById('cards-grid');

  const label = document.getElementById('stud-count-label');
  if (label) label.textContent = `${list.length} student${list.length !== 1 ? 's' : ''} found`;

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">No students found.</div>';
    return;
  }

  grid.innerHTML = list.map((s, i) => {
    const gc = GRADE_COLORS[s.grade];
    return `<div class="student-card grade-${s.grade}" style="animation-delay:${i*0.04}s">
      <div class="sc-top">
        <div class="sc-av" style="background:${gc}">${s.initials()}</div>
        <span class="chip chip-${s.grade}">${s.grade}</span>
      </div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-reg">${s.regNo}</div>
      <div class="sc-marks">
        <div class="sc-m"><div class="sc-m-val">${s.cat1}</div><div class="sc-m-lbl">CAT1</div></div>
        <div class="sc-m"><div class="sc-m-val">${s.cat2}</div><div class="sc-m-lbl">CAT2</div></div>
        <div class="sc-m"><div class="sc-m-val">${s.fat}</div><div class="sc-m-lbl">FAT</div></div>
      </div>
      <div class="sc-total"><span>Total</span><b>${s.total.toFixed(1)} / 300</b></div>
      <div class="sc-total"><span>Average</span><b>${s.average.toFixed(2)}</b></div>
      <div class="sc-actions">
        <button class="sc-btn sc-btn-view" onclick="showPayslip('${s.regNo}')">Payslip</button>
        <button class="sc-btn sc-btn-del"  onclick="deleteStudent('${s.regNo}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

// Alias for search input
function renderTable() { renderCards(); }

/* ============================================================
   RENDER REPORTS
   ============================================================ */
function renderReports() {
  const st = mgr.stats();
  const d  = mgr.gradeDist();
  const n  = mgr.students.length;
  const tp = mgr.toppers();

  // Toppers
  const rTop = document.getElementById('rpt-toppers');
  rTop.innerHTML = `<div class="rpt-heading">🏆 Class Toppers</div>`;
  if (!tp.length) {
    rTop.innerHTML += `<div style="color:#9ca3af;font-size:13px">No students yet.</div>`;
  } else {
    rTop.innerHTML += tp.map((s, i) => `
      <div class="topper-row">
        <div class="tr-rank">${i+1}</div>
        <div><div class="tr-name">${s.name}</div><div class="tr-reg">${s.regNo}</div></div>
        <div class="tr-score">${s.total.toFixed(1)}</div>
      </div>
    `).join('');
  }

  // Stats
  const rSt = document.getElementById('rpt-stats');
  if (!st) {
    rSt.innerHTML = `<div class="rpt-heading">📊 Class Statistics</div><div style="color:#9ca3af;font-size:13px">No students yet.</div>`;
  } else {
    rSt.innerHTML = `<div class="rpt-heading">📊 Class Statistics</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-box-label">Total Students</div><div class="stat-box-val">${st.count}</div></div>
        <div class="stat-box"><div class="stat-box-label">Class Average</div><div class="stat-box-val">${st.average.toFixed(2)}</div></div>
        <div class="stat-box"><div class="stat-box-label">Highest Total</div><div class="stat-box-val" style="color:#10b981">${st.highest.toFixed(1)}</div></div>
        <div class="stat-box"><div class="stat-box-label">Lowest Total</div><div class="stat-box-val" style="color:#f43f5e">${st.lowest.toFixed(1)}</div></div>
      </div>`;
  }

  // Distribution
  const grades = ['A','B','C','Fail'];
  const labels = {'A':'Grade A','B':'Grade B','C':'Grade C','Fail':'Fail'};
  const rDist = document.getElementById('rpt-dist');
  rDist.innerHTML = `<div class="rpt-heading">📋 Grade Distribution</div>
    ${grades.map(g => {
      const pct = n ? Math.round((d[g]/n)*100) : 0;
      return `<div class="dist-row">
        <div class="dist-top">
          <span>${labels[g]}</span>
          <span>${d[g]} student${d[g]!==1?'s':''} · ${pct}%</span>
        </div>
        <div class="dist-track">
          <div class="dist-fill" style="width:${pct}%;background:${GRADE_COLORS[g]}"></div>
        </div>
      </div>`;
    }).join('')}`;
}

/* ============================================================
   PAYSLIP MODAL
   ============================================================ */
function showPayslip(regNo) {
  const s = mgr.students.find(s => s.regNo === regNo);
  if (!s) return;
  const gc = GRADE_COLORS[s.grade];

  document.getElementById('modal-body').innerHTML = `
    <div style="text-align:center;margin-bottom:24px">
      <div class="ps-modal-av" style="background:${gc}">${s.initials()}</div>
      <div class="ps-modal-name">${s.name}</div>
      <div class="ps-modal-reg">${s.regNo}</div>
    </div>
    <div class="ps-modal-marks">
      <div class="psmm"><div class="psmm-val">${s.cat1}</div><div class="psmm-lbl">CAT 1</div></div>
      <div class="psmm"><div class="psmm-val">${s.cat2}</div><div class="psmm-lbl">CAT 2</div></div>
      <div class="psmm"><div class="psmm-val">${s.fat}</div><div class="psmm-lbl">FAT</div></div>
    </div>
    <div class="ps-modal-table">
      <div class="psmt-row"><span>Total Marks</span><b>${s.total.toFixed(1)} / 300</b></div>
      <div class="psmt-row"><span>Average</span><b>${s.average.toFixed(2)} / 100</b></div>
      <div class="psmt-row psmt-grade"><span>Grade</span><b style="color:${gc}">${s.grade}</b></div>
    </div>
    <div class="ps-modal-hero" style="background:${gc}18;border:1px solid ${gc}40">
      <div class="ps-hero-label" style="color:${gc}">Performance Result</div>
      <div class="ps-hero-grade" style="color:${gc}">${s.grade}</div>
      <div class="ps-hero-avg" style="color:${gc}99">${s.average.toFixed(2)} average · ${s.total.toFixed(1)} total</div>
    </div>`;

  document.getElementById('modal').classList.add('open');
}

function maybeCloseModal(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') {
    if (document.activeElement.closest('#tab-add')) addStudent();
  }
});

/* ============================================================
   TOAST
   ============================================================ */
let _tt;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(_tt);
  _tt = setTimeout(() => { el.className = ''; }, 3000);
}

/* ============================================================
   RENDER ALL + INIT
   ============================================================ */
function renderAll() {
  renderOverview();
  renderCards();
  renderReports();
}

// Init
document.getElementById('hdr-date').textContent =
  new Date().toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'});

renderAll();
