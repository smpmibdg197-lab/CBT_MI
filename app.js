'use strict';
/* ====== PENGATURAN ====== */
const CFG=window.CBT_CONFIG||{},GURU_PASS=CFG.GURU_PASS||'guru123';
const DB_URL=(()=>{try{const q=new URLSearchParams(location.search).get('db');if(q)return decodeURIComponent(q);return localStorage.getItem('cbt_db_url')||CFG.DB_URL||''}catch(e){return CFG.DB_URL||''}})(),REMOTE=!!DB_URL.trim();
const BOBOT_PG=70;           // bobot Pilihan Ganda (%), sisanya Uraian
const MAX_V=3;               // ujian otomatis selesai pada pelanggaran ke-3
const LS='cbt_smp_db',L='ABCD';

const SEED_PG=[
["Berpikir komputasional adalah cara berpikir untuk menyelesaikan masalah dengan ...","Memecah masalah, mengenali pola, dan menyusun langkah penyelesaian secara sistematis","Menghafal semua rumus matematika","Menyerahkan masalah sepenuhnya kepada komputer","Menggunakan komputer tanpa perencanaan"],
["Contoh penerapan dekomposisi dalam kehidupan sehari-hari adalah ...","Membagi acara ulang tahun menjadi tugas kecil: kue, undangan, dekorasi","Membeli barang termahal tanpa berpikir","Menghafal seluruh buku sekaligus","Mengerjakan semua PR tanpa dibagi"],
["Contoh pengenalan pola adalah ...","Menyimpulkan tiap Senin ada upacara bendera setelah mengamati beberapa minggu","Menyusun jadwal piket secara acak","Membeli alat tulis tanpa memeriksa kebutuhan","Menulis cerita tanpa tema"],
["Jejak digital adalah ...","Rekam jejak aktivitas di internet (unggahan, komentar, riwayat pencarian) yang dapat tertinggal lama","Sampah elektronik","Nama pengguna untuk masuk aplikasi","Jenis virus komputer"],
["Rani menyiapkan bazar amal sekolah. Langkah pertama berdasarkan konsep dekomposisi adalah ...","Memecah rencana menjadi perizinan, dana, stan, dan promosi","Langsung membuka bazar","Meminta orang lain mengerjakan semuanya","Menunggu hari acara"],
["Barisan 2, 4, 6, 8, ... Bilangan berikutnya adalah ...","10","9","12","16"],
["Dekomposisi yang tepat untuk proyek aplikasi absensi digital sekolah adalah ...","Desain tampilan, basis data siswa, fitur absensi, dan laporan","Warna aplikasi, jumlah siswa, nama guru","Membeli laptop baru","Menentukan jam istirahat"],
["Penjualan es krim Senin-Kamis: 20, 25, 30, 35 cup. Prediksi hari Jumat berdasarkan pola adalah ...","40 cup (naik 5 tiap hari)","30 cup","20 cup","Tidak dapat diprediksi"],
["Doni menerima pesan hinaan dan ancaman dari akun tak dikenal. Tindakan paling tepat adalah ...","Menyimpan bukti, memblokir akun, dan melapor kepada orang tua/guru","Membalas dengan kata kasar","Menghapus akun tanpa melapor","Menyebarkan pesan agar viral"],
["Sebelum membagikan berita di media sosial, tindakan paling bertanggung jawab adalah ...","Memeriksa kebenaran sumbernya","Langsung membagikan agar tidak ketinggalan","Mengubah judul agar menarik","Membagikan tanpa membaca"]];
const SEED_BS=[
["Cyberbullying hanya dapat terjadi jika pelaku dan korban saling kenal secara langsung.",0],
["Urutan langkah dalam algoritma dapat ditukar bebas tanpa memengaruhi hasil akhir.",0],
["Sebelum mengunggah foto, kita perlu memeriksa apakah ada informasi pribadi seperti alamat rumah.",1],
["Saat melihat cyberbullying, sikap tepat adalah diam saja agar masalah tidak membesar.",0],
["Pada algoritma membuat teh manis, urutannya: seduh teh, tambah gula, lalu aduk.",1]];
const SEED_UR=[
["Seorang siswa mengunggah foto sedang merokok di area sekolah ke akun media sosial publik. Analisislah minimal dua kemungkinan dampak jejak digital dari unggahan tersebut!","Reputasi buruk, sanksi sekolah, sulit dihapus, dilihat banyak orang (calon sekolah/pekerjaan), dapat disalahgunakan."],
["Apakah membaca artikel berita di internet tanpa menyukai atau membagikannya tetap meninggalkan jejak digital? Jelaskan alasanmu!","Ya, jejak digital pasif: riwayat penelusuran, cookies, dan data akses tercatat oleh peramban/situs."],
["Kelompok lomba kebersihan kelas bingung membagi tugas. Strategi berpikir komputasional apa yang paling efektif? Jelaskan alasannya!","Dekomposisi: memecah pekerjaan menjadi bagian-bagian lalu dibagi per anggota; dapat ditambah algoritma (urutan kerja)."],
["Seorang siswa tanpa sengaja mengunggah data nilai temannya ke grup sehingga temannya dirundung. Evaluasilah tindakan tersebut dan tentukan solusi terbaik!","Melanggar privasi; solusi: hapus unggahan, minta maaf, lapor ke guru, dampingi korban, hentikan perundungan."],
["Evaluasilah dampak cyberbullying terhadap kondisi psikologis korban dan lingkungan sosial di sekitarnya!","Korban: stres, cemas, rendah diri, menarik diri, prestasi turun; lingkungan: tidak aman, kepercayaan menurun, budaya perundungan."]];

/* ====== UTIL & DATA ====== */
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function seed(){return{exams:[{id:uid(),nama:'Penilaian Informatika Kelas VIII',mapel:'Informatika',kelas:'VIII',jumPG:30,jumUR:5,durasi:60,aktif:true,
 soal:[...SEED_PG.map(r=>({q:r[0],o:r.slice(1),k:0})),...SEED_BS.map(r=>({q:r[0],o:['Benar','Salah'],k:r[1]?0:1,bs:1})),...SEED_UR.map(r=>({q:r[0],t:'u',o:[],k:null,r:r[1]}))]}],hasil:[]}}
let db={exams:[],hasil:[],imgs:{}},BUSY=false,LERR='';
const IMGC={},fail=e=>alert('Gagal menyimpan ke server ('+e.message+'). Periksa koneksi internet dan alamat server (tab Server).');
async function api(path,method,body){const r=await fetch(DB_URL.trim().replace(/\/+$/,'')+'/'+path+'.json',{method:method||'GET',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function norm(){db.exams.forEach(e=>{if(e.jumPG==null){e.jumPG=e.jumlah||30;e.jumUR=0}e.soal=(e.soal||[]).map(s=>({...s,o:s.o||[]}))});db.hasil.forEach(h=>{h.ur=h.ur||[]});db.imgs=db.imgs||{}}
const lget=()=>{try{const d=JSON.parse(localStorage.getItem(LS)||'null');return d&&d.exams?d:null}catch(e){return null}};
function lsave(){try{localStorage.setItem(LS,JSON.stringify(db))}catch(e){alert('Penyimpanan lokal penuh. Kurangi gambar/hasil, atau gunakan server (DB_URL di config.js).')}}
async function loadExams(){LERR='';try{if(REMOTE){const x=await api('exams');db.exams=Object.values(x||{})}else{const d=lget();if(d)db=d;else{db=seed();lsave()}}norm()}catch(e){LERR='Gagal memuat data dari server: '+e.message}}
async function loadHasil(){try{if(REMOTE){const x=await api('hasil');db.hasil=Object.values(x||{})}else{const d=lget();if(d)db=d}norm()}catch(e){alert('Gagal memuat hasil: '+e.message)}}
function save(){if(!REMOTE)return lsave();return api('exams','PUT',Object.fromEntries(db.exams.map(e=>[e.id,e]))).catch(fail)}
const saveH=h=>REMOTE?api('hasil/'+h.id,'PUT',h).catch(fail):lsave();
async function putHasil(h){if(REMOTE)await api('hasil/'+h.id,'PUT',h);else{const d=lget();if(d)db=d;norm();db.hasil.push(h);lsave()}}
async function getImg(id){if(IMGC[id])return IMGC[id];const d=REMOTE?await api('img/'+id):db.imgs[id];if(d)IMGC[id]=d;return d||''}
async function putImg(id,d){IMGC[id]=d;if(REMOTE)await api('img/'+id,'PUT',d);else{db.imgs[id]=d;lsave()}}
function delImg(id){delete IMGC[id];if(REMOTE)api('img/'+id,'DELETE').catch(()=>{});else{delete db.imgs[id];lsave()}}
function hydrate(){document.querySelectorAll('img[data-i]').forEach(async el=>{const id=el.dataset.i;el.removeAttribute('data-i');try{el.src=await getImg(id)}catch(e){}})}
async function withBusy(f){BUSY=true;render();try{await f()}catch(e){alert(e.message)}finally{BUSY=false;render()}}
const XLSX_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',MAMMOTH_URL='https://cdn.jsdelivr.net/npm/mammoth@1.11.0/mammoth.browser.min.js';
const loadLib=u=>new Promise((res,rej)=>{const e=document.createElement('script');e.src=u;e.onload=res;e.onerror=rej;document.head.appendChild(e)});
const boot=()=>withBusy(loadExams);
const enterGuru=()=>withBusy(async()=>{loadLib(XLSX_URL).catch(()=>{});loadLib(MAMMOTH_URL).catch(()=>{});page='guru';await loadExams();if(REMOTE&&!db.exams.length&&!LERR){db.exams=seed().exams;await save()}await loadHasil()});
function readImg(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.75))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}

let page='home',G={tab:'ujian',ex:null,eEx:null,eQ:null,qt:'',dq:''},S=null,R=null,tick=null,lastF=0;
const go=p=>{if(p==='home'){S=null;page='home';return boot()}page=p;render()};

function render(){
  document.body.classList.toggle('noselect',page==='exam');
  if(page==='exam'){$('#app').innerHTML=examView();updateTm();return}
  const h=BUSY?'<div class="text-center text-muted py-5"><div class="spinner-border mb-2"></div><div>Memuat data...</div></div>':{home,login,guru,done}[page]();
  $('#app').innerHTML=`<div class="container py-3" style="max-width:${page==='guru'?'1000':'520'}px">${h}</div>`;
  hydrate();
  if(page==='guru'&&G.tab==='pantau'&&!BUSY){if(!liveT)startLive();else refreshLive()}else stopLive();
}

/* ====== HALAMAN UMUM ====== */
function home(){const act=db.exams.filter(e=>e.aktif);
return `<div class="text-center my-3"><h1 class="h3 fw-bold text-primary">CBT Sekolah</h1><div class="text-muted">Ujian Berbasis Komputer SMP</div></div>
${LERR?`<div class="alert alert-danger small">${esc(LERR)} <button class="btn btn-sm btn-outline-danger ms-1" onclick="boot()">Coba lagi</button></div>`:''}
<div class="card shadow-sm"><div class="card-body">
<h2 class="h5">Masuk Siswa</h2>
<label class="form-label">Nama Lengkap</label><input id="sn" class="form-control mb-2" placeholder="Tulis nama lengkap" autocomplete="off">
<label class="form-label">Kelas</label><input id="sk" class="form-control mb-2" placeholder="Contoh: VIII A" autocomplete="off">
<label class="form-label">No. Peserta</label><input id="sp" class="form-control mb-2" placeholder="Contoh: 2025001" autocomplete="off">
<label class="form-label">Ujian</label><select id="se" class="form-select mb-3">${act.length?act.map(e=>`<option value="${e.id}">${esc(e.mapel)} - ${esc(e.nama)} (${esc(e.kelas)})</option>`).join(''):'<option value="">Belum ada ujian aktif</option>'}</select>
<button class="btn btn-primary btn-lg w-100" onclick="startExam()">Mulai Ujian</button>
<ul class="small text-muted mt-3 mb-0 ps-3"><li>Waktu berjalan setelah tombol Mulai ditekan.</li><li>Ujian berjalan layar penuh. Jangan berpindah tab/aplikasi atau keluar layar penuh.</li><li>Aktivitas ujian dipantau oleh guru secara langsung.</li><li>Di HP/tablet: jangan mengusap layar dari atas untuk membuka notifikasi. Itu dicatat sebagai pelanggaran.</li></ul></div></div>
<div class="text-center mt-3"><button class="btn btn-link" onclick="go('login')">Masuk sebagai Guru</button></div>
<div class="text-center small text-muted">${REMOTE?'🟢 Online':'⚪ Mode lokal (data hanya di perangkat ini)'}</div>`}
function login(){return `<div class="card shadow-sm mt-4"><div class="card-body"><h2 class="h5">Login Guru</h2>
<input id="gp" type="password" class="form-control mb-3" placeholder="Password" onkeydown="if(event.key==='Enter')doLogin()">
<button class="btn btn-primary w-100" onclick="doLogin()">Masuk</button><button class="btn btn-link w-100" onclick="go('home')">Kembali</button></div></div>`}
function doLogin(){$('#gp').value===GURU_PASS?enterGuru():alert('Password salah.')}
function done(){return `<div class="card shadow-sm mt-4 text-center"><div class="card-body py-4"><div class="display-5">✅</div><h2 class="h4">Ujian Selesai</h2>
<p class="mb-1">${esc(S.nama)} - ${esc(S.kelas)} (No. Peserta ${esc(S.no)})</p><div class="text-muted small">Skor Pilihan Ganda</div><div class="display-4 fw-bold text-primary">${R.skor}</div><div class="text-muted mb-2">Benar ${R.benar} dari ${R.total} soal PG</div>${R.nUr?`<div class="alert alert-info small">${R.nUr} soal uraian akan dinilai oleh guru.</div>`:''}
${R.cat?`<div class="alert alert-warning small">${esc(R.cat)}</div>`:''}${R.st==='ok'?`<div class="text-success mb-2">✔ Hasil sudah terkirim ke guru</div><button class="btn btn-primary" onclick="go('home')">Kembali ke Awal</button>`:R.st==='fail'?`<div class="text-danger mb-2">Hasil belum terkirim. Periksa koneksi internet, lalu kirim ulang.</div><button class="btn btn-warning" onclick="sendR()">Kirim Ulang</button>`:'<div class="text-muted"><span class="spinner-border spinner-border-sm"></span> Mengirim hasil ke guru...</div>'}</div></div>`}

/* ====== PANEL GURU ====== */
const tabTo=k=>{G.tab=k;G.eQ=null;G.im=undefined;k==='hasil'?withBusy(loadHasil):render()};
const curEx=()=>db.exams.find(x=>x.id===G.ex)||db.exams[0];
function guru(){const t=G.tab;
return `<div class="d-flex justify-content-between align-items-center mb-3"><h1 class="h4 mb-0">Panel Guru</h1><button class="btn btn-outline-secondary btn-sm" onclick="go('home')">Keluar</button></div>
${REMOTE?'':'<div class="alert alert-warning small">⚠️ Mode lokal: data hanya tersimpan di browser perangkat ini. Buka tab <b>Server</b> dan isi alamat Firebase agar data tersimpan di server dan bisa dibuka dari perangkat lain.</div>'}${LERR?`<div class="alert alert-danger small">${esc(LERR)}</div>`:''}
<ul class="nav nav-pills mb-3">${[['ujian','Ujian'],['soal','Soal'],['hasil','Hasil'],['pantau','Pantau'],['server','Server']].map(([k,n])=>`<li class="nav-item"><button class="nav-link ${t===k?'active':''}" onclick="tabTo('${k}')">${n}</button></li>`).join('')}</ul>`+(t==='ujian'?tabUjian():t==='soal'?tabSoal():t==='server'?tabServer():t==='pantau'?tabPantau():tabHasil())}
function exSel(){return `<select class="form-select mb-3" onchange="G.ex=this.value;G.eQ=null;G.im=undefined;G.pv=null;render()">${db.exams.map(x=>`<option value="${x.id}" ${x.id===curEx().id?'selected':''}>${esc(x.mapel)} - ${esc(x.nama)} (${esc(x.kelas)})</option>`).join('')}</select>`}

function tabUjian(){const e=db.exams.find(x=>x.id===G.eEx)||{nama:'',mapel:'',kelas:'',jumPG:30,jumUR:5,durasi:60};
return `<div class="card mb-3"><div class="card-body"><h2 class="h6">${G.eEx?'Edit':'Buat'} Ujian</h2><div class="row g-2">
<div class="col-md-6"><input id="en" class="form-control" placeholder="Nama ujian" value="${esc(e.nama)}"></div>
<div class="col-md-6"><input id="em" list="mp" class="form-control" placeholder="Mata pelajaran" value="${esc(e.mapel)}"><datalist id="mp">${['Informatika','Matematika','IPA','IPS','Bahasa Indonesia','Bahasa Inggris','PPKn','Seni Budaya','PJOK'].map(m=>`<option>${m}</option>`).join('')}</datalist></div>
<div class="col-6 col-md-3"><label class="small text-muted">Kelas</label><input id="ek" class="form-control" placeholder="Kelas" value="${esc(e.kelas)}"></div>
<div class="col-6 col-md-3"><label class="small text-muted">Jumlah Soal PG</label><input id="ej" type="number" min="0" class="form-control" value="${e.jumPG}"></div>
<div class="col-6 col-md-3"><label class="small text-muted">Jumlah Soal Uraian</label><input id="eu" type="number" min="0" class="form-control" value="${e.jumUR}"></div>
<div class="col-6 col-md-3"><label class="small text-muted">Durasi (menit)</label><input id="ed" type="number" min="1" class="form-control" value="${e.durasi}"></div></div>

<button class="btn btn-primary mt-2" onclick="saveExam()">Simpan</button> ${G.eEx?'<button class="btn btn-light mt-2" onclick="G.eEx=null;render()">Batal</button>':''}</div></div>
<div class="table-responsive"><table class="table table-sm align-middle bg-white"><thead><tr><th>Ujian</th><th>Mapel</th><th>Kelas</th><th>Soal</th><th>Menit</th><th></th></tr></thead><tbody>${db.exams.map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.mapel)}</td><td>${esc(x.kelas)}</td><td>PG ${x.soal.filter(s=>s.t!=='u').length}/${x.jumPG} · Uraian ${x.soal.filter(s=>s.t==='u').length}/${x.jumUR}</td><td>${x.durasi}</td><td class="text-nowrap">
<button class="btn btn-sm btn-outline-primary" onclick="G.ex='${x.id}';G.tab='soal';G.eQ=null;render()">Soal</button>
<button class="btn btn-sm btn-outline-info" onclick="G.ex='${x.id}';tabTo('hasil')">Hasil</button>
<button class="btn btn-sm ${x.aktif?'btn-success':'btn-secondary'}" onclick="togExam('${x.id}')">${x.aktif?'Aktif':'Nonaktif'}</button>
<button class="btn btn-sm btn-outline-secondary" onclick="G.eEx='${x.id}';render()">Edit</button>
<button class="btn btn-sm btn-outline-danger" onclick="delExam('${x.id}')">Hapus</button></td></tr>`).join('')}</tbody></table></div>
${REMOTE?'':`<div class="d-flex gap-2 flex-wrap"><button class="btn btn-sm btn-outline-dark" onclick="backup()">Cadangkan Data (.json)</button><label class="btn btn-sm btn-outline-dark mb-0">Impor Data<input type="file" accept=".json" hidden onchange="restore(this.files[0])"></label></div>`}`}
function saveExam(){const v=id=>$(id).value.trim(),o={nama:v('#en'),mapel:v('#em'),kelas:v('#ek'),jumPG:+v('#ej')||0,jumUR:+v('#eu')||0,durasi:+v('#ed')||60};
if(!o.nama||!o.mapel||!o.kelas)return alert('Nama ujian, mapel, dan kelas wajib diisi.');
const e=db.exams.find(x=>x.id===G.eEx);if(e)Object.assign(e,o);else db.exams.push({id:uid(),aktif:true,soal:[],...o});
G.eEx=null;save();render()}
function togExam(id){const e=db.exams.find(x=>x.id===id);e.aktif=!e.aktif;save();render()}
function delExam(id){if(!confirm('Hapus ujian beserta soal dan hasilnya?'))return;const ex=db.exams.find(x=>x.id===id),del=db.hasil.filter(h=>h.ex===id);(ex.soal||[]).forEach(q=>q.img&&delImg(q.img));db.exams=db.exams.filter(x=>x.id!==id);db.hasil=db.hasil.filter(h=>h.ex!==id);if(REMOTE)del.forEach(h=>api('hasil/'+h.id,'DELETE').catch(fail));G.ex=null;save();render()}
function backup(){dl(new Blob([JSON.stringify(db)],{type:'application/json'}),'cadangan_cbt.json')}
function restore(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.exams)throw 0;db=d;norm();lsave();render();alert('Data berhasil diimpor.')}catch(e){alert('File tidak valid.')}};r.readAsText(f)}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function prevHtml(ed){const has=G.im||(G.im===undefined&&ed&&ed.img);return has?`<div class="mb-2"><img ${G.im?`src="${G.im.data}"`:`data-i="${ed.img}"`} class="img-thumbnail" style="max-height:160px"> <button class="btn btn-sm btn-outline-danger" onclick="rmImg()">Hapus gambar</button></div>`:''}
function setPrev(){const ex=curEx();$('#imgp').innerHTML=prevHtml(G.eQ!=null&&ex.soal[G.eQ]);hydrate()}
async function pickImg(f){if(!f)return;try{G.im={data:await readImg(f)};setPrev()}catch(e){alert('Gambar tidak dapat dibaca. Gunakan file JPG atau PNG.')}}
function rmImg(){G.im=null;setPrev()}
function setT(t){G.dq=$('#qq').value;G.qt=t;render()}
function cancelQ(){G.eQ=null;G.dq='';G.im=undefined;render()}
function tabSoal(){const ex=curEx();if(!ex)return '<div class="alert alert-info">Buat ujian terlebih dahulu.</div>';G.ex=ex.id;
const ed=G.eQ!=null&&ex.soal[G.eQ],q=ed||{q:G.dq||'',o:['','','',''],k:0,r:''},u=ed?ed.t==='u':G.qt==='u';
const nP=ex.soal.filter(s=>s.t!=='u').length,nU=ex.soal.length-nP;
return exSel()+`<div class="card mb-3"><div class="card-body"><h2 class="h6">Impor Soal dari Word (.docx)</h2><div class="d-flex gap-2 flex-wrap align-items-center"><label class="btn btn-sm btn-success mb-0">📄 Pilih File Word<input type="file" accept=".docx" hidden onchange="pickDocx(this.files[0]);this.value=''"></label><a class="btn btn-sm btn-outline-secondary" href="template_soal.docx" download>⬇ Unduh Template Word</a></div><div class="small text-muted mt-1">Soal ditambahkan ke ujian yang dipilih di atas. Format: nomor soal, pilihan A-D, lalu baris "Kunci: B". Soal uraian diawali [URAIAN]. Gambar yang disisipkan di Word ikut terbaca.</div></div></div>
<div class="d-flex gap-2 flex-wrap mb-2"><span class="badge text-bg-${nP>=ex.jumPG?'success':'secondary'} fs-6">Pilihan Ganda ${nP}/${ex.jumPG}</span><span class="badge text-bg-${nU>=ex.jumUR?'success':'secondary'} fs-6">Uraian ${nU}/${ex.jumUR}</span></div>
<div class="card mb-3"><div class="card-body"><h2 class="h6">${ed?'Edit':'Tambah'} Soal</h2>
<div class="btn-group mb-2"><button class="btn btn-sm ${u?'btn-outline-primary':'btn-primary'}" ${ed?'disabled':''} onclick="setT('')">Pilihan Ganda</button><button class="btn btn-sm ${u?'btn-primary':'btn-outline-primary'}" ${ed?'disabled':''} onclick="setT('u')">Uraian</button></div>
<textarea id="qq" class="form-control mb-2" rows="2" placeholder="Pertanyaan">${esc(q.q)}</textarea>
<div class="mb-2"><label class="btn btn-sm btn-outline-secondary mb-1">🖼️ Tambah / Ganti Gambar<input type="file" accept="image/*" hidden onchange="pickImg(this.files[0]);this.value=''"></label><div id="imgp">${prevHtml(ed)}</div></div>
${u?`<textarea id="qr" class="form-control mb-2" rows="2" placeholder="Kunci / pedoman penilaian (hanya dilihat guru)">${esc(q.r||'')}</textarea>`:[0,1,2,3].map(i=>`<div class="input-group mb-1"><div class="input-group-text"><input type="radio" name="kk" value="${i}" ${q.k===i?'checked':''}>&nbsp;${L[i]}</div><input class="form-control qo" value="${esc(q.o[i]||'')}" placeholder="Opsi ${L[i]}"></div>`).join('')+'<div class="small text-muted mb-2">Pilih bulatan pada opsi yang benar. Opsi kosong diabaikan (minimal 2 opsi).</div>'}
<button class="btn btn-primary" onclick="saveSoal()">Simpan Soal</button> ${ed?'<button class="btn btn-light" onclick="cancelQ()">Batal</button>':''}</div></div>
<div class="small text-muted mb-2">Bank soal boleh lebih banyak dari target. Setiap siswa mendapat soal acak sesuai jumlah target (PG ${ex.jumPG}, uraian ${ex.jumUR}).</div>
${ex.soal.map((s,i)=>`<div class="card mb-2"><div class="card-body py-2"><div class="d-flex justify-content-between gap-2"><div><b>${i+1}.</b> ${s.t==='u'?'<span class="badge text-bg-warning">Uraian</span> ':''}${esc(s.q)}${s.img?`<div><img data-i="${s.img}" class="img-thumbnail mt-1" style="max-height:80px"></div>`:''}<div class="small text-muted">${s.t==='u'?(s.r?'Pedoman: '+esc(s.r):'Tanpa pedoman penilaian'):s.o.map((o,j)=>j===s.k?`<b class="text-success">${L[j]}. ${esc(o)} ✓</b>`:`${L[j]}. ${esc(o)}`).join(' &nbsp;|&nbsp; ')}</div></div>
<div class="text-nowrap"><button class="btn btn-sm btn-outline-secondary" onclick="G.eQ=${i};G.dq='';G.im=undefined;render();scrollTo(0,0)">Edit</button> <button class="btn btn-sm btn-outline-danger" onclick="delSoal(${i})">Hapus</button></div></div></div></div>`).join('')}`}
async function saveSoal(){const ex=curEx(),q=$('#qq').value.trim(),ed=G.eQ!=null&&ex.soal[G.eQ],u=ed?ed.t==='u':G.qt==='u';let s;
if(!q)return alert('Isi pertanyaan terlebih dahulu.');
if(u)s={q,t:'u',o:[],k:null,r:$('#qr').value.trim()};
else{const ins=[...document.querySelectorAll('.qo')],ch=document.querySelector('input[name=kk]:checked'),pairs=ins.map((x,i)=>[x.value.trim(),i]).filter(p=>p[0]);
if(pairs.length<2)return alert('Isi minimal 2 opsi.');
if(!ch||!pairs.some(p=>p[1]===+ch.value))return alert('Pilih kunci jawaban pada opsi yang terisi.');
const o=pairs.map(p=>p[0]),k=pairs.findIndex(p=>p[1]===+ch.value);s={q,o,k};
if(o.length===2&&o[0]==='Benar'&&o[1]==='Salah')s.bs=1}
if(G.im){const id=uid();try{await putImg(id,G.im.data)}catch(e){return alert('Gagal mengunggah gambar ('+e.message+').')}if(ed&&ed.img)delImg(ed.img);s.img=id}
else if(G.im===null){if(ed&&ed.img)delImg(ed.img)}
else if(ed&&ed.img)s.img=ed.img;
if(ed)ex.soal[G.eQ]=s;else ex.soal.push(s);
G.eQ=null;G.dq='';G.im=undefined;save();render()}
function tabServer(){const link=location.href.split(/[?#]/)[0]+(REMOTE?'?db='+encodeURIComponent(DB_URL):'');
return `<div class="card"><div class="card-body"><h2 class="h6">Server Online (Firebase Realtime Database)</h2>
<div class="mb-2">${REMOTE?'<span class="badge text-bg-success">🟢 Online</span> Data tersimpan di server dan bisa dibuka dari perangkat lain.':'<span class="badge text-bg-secondary">Mode lokal</span> Data hanya tersimpan di perangkat ini.'}</div>
<input id="su" class="form-control mb-2" placeholder="https://nama-proyek-default-rtdb.asia-southeast1.firebasedatabase.app" value="${esc(DB_URL)}">
<button class="btn btn-primary" onclick="setServer()">Uji &amp; Simpan</button> ${REMOTE?'<button class="btn btn-outline-secondary" onclick="localMode()">Gunakan Mode Lokal</button>':''}
${REMOTE?`<hr><div class="small fw-semibold">Link untuk siswa dan guru (sudah terhubung ke server):</div><input id="lk" class="form-control form-control-sm my-1" readonly value="${esc(link)}" onfocus="this.select()"><button class="btn btn-sm btn-outline-primary" onclick="copyLink()">Salin Link</button><div class="small text-muted mt-1">Link hanya berfungsi bila aplikasi dibuka dari alamat web (hosting), bukan dari file di komputer.</div>`:''}
<hr><ol class="small mb-0 ps-3"><li>Buka console.firebase.google.com, buat proyek, lalu pilih <b>Build &rarr; Realtime Database &rarr; Create Database</b> (mode test).</li><li>Di tab <b>Rules</b>, ubah <code>.read</code> dan <code>.write</code> menjadi <code>true</code>, lalu Publish.</li><li>Tempel alamat database di kolom atas, lalu klik <b>Uji &amp; Simpan</b>.</li><li>Unggah semua file aplikasi ke hosting (GitHub Pages, Netlify, atau Firebase Hosting) lalu bagikan link di atas.</li></ol></div></div>`}
async function setServer(){const u=$('#su').value.trim().replace(/\/+$/,'');
if(!u){localStorage.removeItem('cbt_db_url');location.href=location.href.split(/[?#]/)[0];return}
if(!/^https:\/\//.test(u))return alert('Alamat harus diawali https://');
try{const r=await fetch(u+'/exams.json');if(!r.ok)throw new Error('HTTP '+r.status);const ex=await r.json(),d=lget();
if(!ex&&d&&d.exams.length&&confirm('Server masih kosong. Salin ujian dan soal dari perangkat ini ke server?')){
await fetch(u+'/exams.json',{method:'PUT',body:JSON.stringify(Object.fromEntries(d.exams.map(e=>[e.id,e])))});
for(const [id,im] of Object.entries(d.imgs||{}))await fetch(u+'/img/'+id+'.json',{method:'PUT',body:JSON.stringify(im)})}
localStorage.setItem('cbt_db_url',u);location.href=location.href.split(/[?#]/)[0]}
catch(e){alert('Tidak dapat terhubung ('+e.message+'). Periksa alamat database dan Rules Firebase.')}}
function localMode(){if(confirm('Kembali ke mode lokal? Data di server tidak dihapus.')){$('#su').value='';setServer()}}
function copyLink(){const i=$('#lk');i.select();try{navigator.clipboard.writeText(i.value)}catch(e){document.execCommand('copy')}alert('Link disalin.')}
function delSoal(i){if(confirm('Hapus soal ini?')){const q=curEx().soal.splice(i,1)[0];if(q&&q.img)delImg(q.img);G.eQ=null;save();render()}}

const pgS=h=>h.skorPG!=null?h.skorPG:h.skor;
const uAvg=h=>h.ur&&h.ur.length&&h.ur.every(u=>u.n!=null)?Math.round(h.ur.reduce((a,u)=>a+u.n,0)/h.ur.length):null;
function finalScore(h){if(!h.ur||!h.ur.length)return pgS(h);const u=uAvg(h);return u==null?null:Math.round(pgS(h)*BOBOT_PG/100+u*(100-BOBOT_PG)/100)}
function rowHasil(h,i){const f=finalScore(h),u=uAvg(h),hasU=h.ur&&h.ur.length;
return `<tr><td>${i+1}</td><td>${esc(h.no||'-')}</td><td>${esc(h.nama)}</td><td>${esc(h.kelas)}</td><td>${h.pgBenar!=null?h.pgBenar:h.benar}/${h.pgTotal!=null?h.pgTotal:h.total} (${pgS(h)})</td>
<td>${hasU?`<button class="btn btn-sm ${u==null?'btn-warning':'btn-outline-primary'}" onclick="gradeOpen('${h.id}')">${u==null?'Nilai':u}</button>`:'-'}</td>
<td>${f==null?'<span class="text-muted">belum</span>':`<b>${f}</b>`}</td><td>${h.viol}</td><td class="small">${esc(h.waktu)}</td><td class="small">${esc(h.cat)}</td><td><button class="btn btn-sm btn-outline-danger" onclick="delHasil('${h.id}')">×</button></td></tr>`}
function tabHasil(){const ex=curEx();if(!ex)return '<div class="alert alert-info">Belum ada ujian.</div>';G.ex=ex.id;
const hs=db.hasil.filter(h=>h.ex===ex.id),fs=hs.map(finalScore).filter(x=>x!=null),avg=fs.length?Math.round(fs.reduce((a,b)=>a+b,0)/fs.length):0;
return exSel()+`<div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2"><div>${hs.length} siswa · rata-rata nilai akhir <b>${avg}</b><div class="small text-muted">Nilai akhir = PG ${BOBOT_PG}% + Uraian ${100-BOBOT_PG}% (uraian dinilai guru 0-100)</div></div>
<div><button class="btn btn-outline-primary btn-sm" onclick="withBusy(loadHasil)">⟳ Muat Ulang</button> <button class="btn btn-success btn-sm" onclick="xl()" ${hs.length?'':'disabled'}>Unduh Excel</button> <button class="btn btn-outline-danger btn-sm" onclick="clrHasil()" ${hs.length?'':'disabled'}>Hapus Semua</button></div></div>
<div class="table-responsive"><table class="table table-sm bg-white align-middle"><thead><tr><th>#</th><th>No. Peserta</th><th>Nama</th><th>Kelas</th><th>PG (skor)</th><th>Uraian</th><th>Nilai Akhir</th><th>Pelanggaran</th><th>Waktu</th><th>Catatan</th><th></th></tr></thead><tbody>${hs.map(rowHasil).join('')||'<tr><td colspan="11" class="text-center text-muted">Belum ada hasil.</td></tr>'}</tbody></table></div>`}
function gradeOpen(id){const h=db.hasil.find(x=>x.id===id);
ov(`<div class="h5">Penilaian Uraian - ${esc(h.nama)} (No. ${esc(h.no||'-')})</div>${h.ur.map((u,i)=>`<div class="border rounded p-2 mb-2"><div class="fw-semibold">${i+1}. ${esc(u.q)}</div><div class="small bg-light rounded p-2 my-1" style="white-space:pre-wrap">${esc(u.a)||'<i>(tidak dijawab)</i>'}</div>${u.r?`<div class="small text-success">Pedoman: ${esc(u.r)}</div>`:''}<div class="input-group input-group-sm mt-1"><span class="input-group-text">Nilai (0-100)</span><input type="number" min="0" max="100" class="form-control gn" value="${u.n==null?'':u.n}"></div></div>`).join('')}<div class="text-end"><button class="btn btn-light" onclick="hideOv()">Batal</button> <button class="btn btn-primary" onclick="saveGrade('${id}')">Simpan</button></div>`,1)}
function saveGrade(id){const h=db.hasil.find(x=>x.id===id),v=[...document.querySelectorAll('.gn')].map(x=>x.value.trim());
if(v.some(x=>x!==''&&(isNaN(x)||+x<0||+x>100)))return alert('Nilai harus angka 0-100.');
h.ur.forEach((u,i)=>u.n=v[i]===''?null:+v[i]);saveH(h);hideOv();render()}
function delHasil(id){db.hasil=db.hasil.filter(h=>h.id!==id);if(REMOTE)api('hasil/'+id,'DELETE').catch(fail);else lsave();render()}
function clrHasil(){if(confirm('Hapus semua hasil ujian ini?')){const id=curEx().id,del=db.hasil.filter(h=>h.ex===id);db.hasil=db.hasil.filter(h=>h.ex!==id);if(REMOTE)del.forEach(h=>api('hasil/'+h.id,'DELETE').catch(fail));else lsave();render()}}
async function xl(){if(!window.XLSX){try{await loadLib(XLSX_URL)}catch(e){}}const ex=curEx(),rows=db.hasil.filter(h=>h.ex===ex.id).map((h,i)=>({No:i+1,'No. Peserta':h.no||'',Nama:h.nama,Kelas:h.kelas,'PG Benar':h.pgBenar!=null?h.pgBenar:h.benar,'Jumlah PG':h.pgTotal!=null?h.pgTotal:h.total,'Skor PG':pgS(h),'Nilai Uraian':uAvg(h)==null?'':uAvg(h),'Nilai Akhir':finalScore(h)==null?'':finalScore(h),Pelanggaran:h.viol,Waktu:h.waktu,Catatan:h.cat}));
const nm='Hasil_'+ex.mapel+'_'+ex.kelas;
if(window.XLSX){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Hasil');XLSX.writeFile(wb,nm+'.xlsx')}
else{const k=Object.keys(rows[0]);dl(new Blob(['\ufeff'+[k.join(','),...rows.map(r=>k.map(c=>'"'+String(r[c]).replace(/"/g,'""')+'"').join(','))].join('\n')],{type:'text/csv'}),nm+'.csv')}}

/* ====== IMPOR SOAL DARI WORD ====== */
function htmlToLines(html){const d=new DOMParser().parseFromString(html,'text/html'),lines=[];
d.body.querySelectorAll('p,li,td,th').forEach(el=>{const c=el.cloneNode(true);c.querySelectorAll('p,li,ol,ul,table').forEach(x=>x.remove());
const imgs=[...c.querySelectorAll('img')].map(i=>i.getAttribute('src')).filter(Boolean);c.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));
const lo=el.closest('li'),parts=c.textContent.split('\n'),li=!!lo&&!!lo.closest('ol');
parts.forEach((t,i)=>{if(t.trim()||(i===0&&imgs.length))lines.push({t,imgs:i===0?imgs:[],li})})});return lines}
function parseSoal(lines){const ok=[],err=[],warn=[];let c=null,auto=0,ignored=0;
const done=()=>{if(!c)return;const n='Soal '+c.no+': ',q=c.q.trim(),img=c.imgs[0]||'';if(c.imgs.length>1)warn.push(n+'ada '+c.imgs.length+' gambar, hanya gambar pertama dipakai');
if(!q&&!img){err.push(n+'pertanyaan kosong');c=null;return}
if(c.u||!c.o.length){ok.push({q:q||'(lihat gambar)',t:'u',o:[],k:null,r:c.r.trim(),_img:img,_no:c.no});c=null;return}
if(c.o.length<2){err.push(n+'pilihan jawaban kurang dari 2');c=null;return}
if(c.o.length>4){err.push(n+'lebih dari 4 pilihan (maksimal A-D)');c=null;return}
const ki=c.o.findIndex(x=>x.l===c.key);if(!c.key||ki<0){err.push(n+'kunci jawaban tidak ditemukan/tidak cocok (tulis di baris sendiri: Kunci: B)');c=null;return}
const o=c.o.map(x=>x.t.trim()),r={q:q||'(lihat gambar)',o,k:ki,_img:img,_no:c.no};
if(o.length===2&&o[0].toLowerCase()==='benar'&&o[1].toLowerCase()==='salah')r.bs=1;ok.push(r);c=null};
const start=(no,rest,imgs)=>{done();let u=false;const mu=rest.match(/^[\[(]?\s*uraian\s*[\])]?\s*[:\-]?\s*/i);if(mu){u=true;rest=rest.slice(mu[0].length)}
c={no:String(no),q:rest,o:[],u,key:'',r:'',imgs:[...imgs],st:'q'};auto=Math.max(auto,+no||0)};
const addOpt=(l,t)=>{c.o.push({l:(l||'ABCDE'[c.o.length]||'E').toUpperCase(),t});c.st='o'};
for(const L of lines){const t=L.t.replace(/\u00a0/g,' ').trim();let m;
if(!t&&!L.imgs.length)continue;
if(t&&(m=t.match(/^(\d{1,3})\s*[.)]\s*([\s\S]*)$/))){start(m[1],m[2],L.imgs);continue}
if(!c){if(L.li&&t){start(++auto,t,L.imgs)}else if(t)ignored++;continue}
c.imgs.push(...L.imgs);if(!t)continue;
if(m=t.match(/^(?:kunci(?:\s*jawaban)?|jawaban)\s*[:=\-]\s*([\s\S]*)$/i)){const v=m[1].trim();if(c.u||!c.o.length){c.r=v;c.st='r'}else{const km=v.match(/^([A-Ea-e])\b/);c.key=km?km[1].toUpperCase():'';c.st='k'}continue}
if(m=t.match(/^(?:pedoman|rubrik)(?:\s*penilaian)?\s*[:=\-]\s*([\s\S]*)$/i)){c.r=m[1];c.st='r';continue}
if(c.st!=='r'&&c.st!=='k'&&(m=t.match(/^\(?([A-Ea-e])\s*[.)]\s*([\s\S]+)$/))){addOpt(m[1],m[2]);continue}
if(L.li){if(c.st==='k'||c.st==='r'||(c.u&&c.st==='q')||(c.st==='o'&&c.o.length>=4)){start(++auto,t,L.imgs)}else addOpt('',t);continue}
if(c.st==='q')c.q+='\n'+t;else if(c.st==='o'&&c.o.length)c.o[c.o.length-1].t+=' '+t;else if(c.st==='r')c.r+=' '+t}
done();if(ignored)warn.push(ignored+' baris sebelum soal pertama diabaikan (petunjuk/judul).');return{ok,err,warn}}
function shrink(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.75))};im.onerror=rej;im.src=src})}
let IMP=null;
async function pickDocx(f){if(!f)return;if(!window.mammoth){try{await loadLib(MAMMOTH_URL)}catch(e){}}if(!window.mammoth)return alert('Pembaca file Word belum termuat. Periksa koneksi internet lalu muat ulang halaman.');
try{const r=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()});IMP=parseSoal(htmlToLines(r.value));showImp(f.name)}catch(e){alert('File Word tidak dapat dibaca. Gunakan format .docx (bukan .doc).')}}
function showImp(name){const {ok,err,warn}=IMP,nu=ok.filter(x=>x.t==='u').length,ni=ok.filter(x=>x._img).length;
ov(`<div class="h5">Hasil Baca: ${esc(name)}</div><div class="mb-2">Ditemukan <b>${ok.length}</b> soal valid (PG ${ok.length-nu}, Uraian ${nu}, bergambar ${ni}).</div>
${err.length?`<div class="alert alert-danger small py-2"><b>${err.length} soal dilewati:</b><ul class="mb-0 ps-3">${err.slice(0,15).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
${warn.length?`<div class="alert alert-warning small py-2"><ul class="mb-0 ps-3">${warn.slice(0,10).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
<div class="border rounded p-2 mb-2" style="max-height:220px;overflow:auto">${ok.map(x=>`<div class="small border-bottom py-1"><b>${esc(x._no)}.</b> ${x.t==='u'?'<span class="badge text-bg-warning">Uraian</span> ':`<span class="badge text-bg-secondary">Kunci ${'ABCD'[x.k]}</span> `}${x._img?'🖼️ ':''}${esc(x.q.slice(0,90))}</div>`).join('')||'<i>Tidak ada soal terbaca. Periksa format dengan template.</i>'}</div>
<label class="small d-block mb-2"><input type="checkbox" id="impClr"> Hapus semua soal lama pada ujian ini terlebih dahulu</label>
<div class="text-end"><button class="btn btn-light" onclick="hideOv()">Batal</button> <button class="btn btn-primary" ${ok.length?'':'disabled'} onclick="doImport()">Impor ${ok.length} Soal</button></div>`,1)}
async function doImport(){const clr=$('#impClr').checked,ex=curEx(),items=IMP.ok;hideOv();
await withBusy(async()=>{let skip=0;const add=[];
for(const it of items){const q={q:it.q,o:it.o,k:it.k};if(it.t==='u'){q.t='u';q.r=it.r}if(it.bs)q.bs=1;
if(it._img){try{const id=uid();await putImg(id,await shrink(it._img));q.img=id}catch(e){skip++}}add.push(q)}
if(clr){(ex.soal||[]).forEach(x=>x.img&&delImg(x.img));ex.soal=[]}
ex.soal.push(...add);await save();
alert(add.length+' soal berhasil diimpor.'+(skip?' '+skip+' gambar tidak dapat dibaca (format tidak didukung, mis. EMF/WMF) dan dilewati.':''))})}

/* ====== UJIAN SISWA ====== */
async function startExam(){if(S&&!S.done)return;const nama=$('#sn').value.trim(),kelas=$('#sk').value.trim(),no=$('#sp').value.trim(),ex=db.exams.find(e=>e.id===$('#se').value);
if(!nama||!kelas||!no)return alert('Isi nama lengkap, kelas, dan nomor peserta terlebih dahulu.');
if(!ex)return alert('Belum ada ujian aktif.');if(!ex.soal.length)return alert('Ujian ini belum memiliki soal.');
const mk=s=>{const idx=s.o.map((_,i)=>i);return{q:s.q,o:s.o,k:s.k,t:s.t,img:s.img,r:s.r||'',ord:s.bs?idx:shuf(idx)}};
const qs=[...shuf(ex.soal.filter(s=>s.t!=='u')).slice(0,ex.jumPG),...shuf(ex.soal.filter(s=>s.t==='u')).slice(0,ex.jumUR)].map(mk);
if(!qs.length)return alert('Jumlah soal ujian ini belum diatur.');
S={ex,nama,kelas,no,qs,ans:{},i:0,end:0,viol:0,log:[],done:false,fs:false};
enterFS();
try{await Promise.all(qs.filter(q=>q.img).map(q=>getImg(q.img)))}catch(e){S=null;if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});return alert('Gagal memuat gambar soal. Periksa koneksi internet lalu coba lagi.')}
S.end=Date.now()+ex.durasi*60000;page='exam';render();clearInterval(tick);
S.sid=uid();lvPut('info',{ex:ex.id,nama,kelas,no,total:qs.length,dur:ex.durasi});lvPut('mulai',SV);beat();S.hb=setInterval(beat,15000);
tick=setInterval(()=>{if(updateTm()<=0)finish('Waktu habis')},500)}
function updateTm(){if(!S)return 0;const r=Math.max(0,S.end-Date.now()),el=$('#tm');
if(el){el.textContent=String(Math.floor(r/60000)).padStart(2,'0')+':'+String(Math.floor(r/1000)%60).padStart(2,'0');el.classList.toggle('low',r<300000)}return r}
function examView(){const q=S.qs[S.i],n=S.qs.length;
return `<div class="bar mb-3 py-2"><div class="container d-flex justify-content-between align-items-center"><div class="small"><b>${esc(S.nama)}</b> · ${esc(S.kelas)} · No. ${esc(S.no)}<div class="text-muted">${esc(S.ex.mapel)}</div></div><div class="fs-4 fw-bold font-monospace" id="tm">--:--</div></div></div>
<div class="container pb-4" style="max-width:820px"><div class="card shadow-sm mb-3"><div class="card-body">
<div class="text-muted small mb-2">Soal ${S.i+1} dari ${n} · ${q.t==='u'?'Uraian':'Pilihan Ganda'}</div><p class="fs-5">${esc(q.q)}</p>${q.img?`<img src="${esc(IMGC[q.img]||'')}" draggable="false" class="img-fluid rounded border mb-3 qimg" alt="Gambar soal">`:''}
${q.t==='u'?`<textarea class="form-control" rows="8" placeholder="Tulis jawabanmu di sini..." oninput="S.ans[S.i]=this.value">${esc(S.ans[S.i]||'')}</textarea>`:q.ord.map((oi,p)=>`<button class="opt ${S.ans[S.i]===oi?'sel':''}" onclick="ans(${oi})"><b>${L[p]}</b><span>${esc(q.o[oi])}</span></button>`).join('')}
<div class="d-flex justify-content-between mt-3"><button class="btn btn-outline-primary" ${S.i?'':'disabled'} onclick="nav(${S.i-1})">← Sebelumnya</button>${S.i<n-1?`<button class="btn btn-primary" onclick="nav(${S.i+1})">Selanjutnya →</button>`:`<button class="btn btn-success" onclick="askFinish()">Selesai</button>`}</div></div></div>
<div class="card shadow-sm"><div class="card-body"><div class="grid">${S.qs.map((_,i)=>`<button class="btn btn-sm ${i===S.i?'btn-primary':isAns(i)?'btn-success':'btn-outline-secondary'}" onclick="nav(${i})">${i+1}</button>`).join('')}</div>
<button class="btn btn-sm btn-outline-success mt-3" onclick="askFinish()">Selesai Ujian</button></div></div></div>`}
const isAns=i=>{const a=S.ans[i];return S.qs[i].t==='u'?!!(a&&a.trim()):a!=null};
const ans=oi=>{S.ans[S.i]=oi;render()}, nav=i=>{S.i=i;render()};
function askFinish(){const u=S.qs.filter((_,i)=>!isAns(i)).length;
ov(`<div class="h5">Selesaikan ujian?</div><p>${u?`Masih ada <b>${u}</b> soal belum dijawab.`:'Semua soal sudah dijawab.'}</p><button class="btn btn-light" onclick="hideOv()">Lanjut Mengerjakan</button> <button class="btn btn-success" onclick="finish('')">Ya, Selesai</button>`)}
function finish(cat){if(!S||S.done)return;S.done=true;clearInterval(tick);clearInterval(S.hb);lvPut('st','selesai');beat();
const pg=S.qs.map((q,i)=>[q,i]).filter(p=>p[0].t!=='u'),benar=pg.filter(p=>S.ans[p[1]]===p[0].k).length,total=pg.length,skor=total?Math.round(benar/total*100):0;
const ur=S.qs.map((q,i)=>[q,i]).filter(p=>p[0].t==='u').map(p=>({q:p[0].q,r:p[0].r,a:S.ans[p[1]]||'',n:null}));
const hs={id:uid(),ex:S.ex.id,nama:S.nama,kelas:S.kelas,no:S.no,skorPG:skor,pgBenar:benar,pgTotal:total,ur,viol:S.viol,waktu:new Date().toLocaleString('id-ID'),cat:[cat,...S.log].filter(Boolean).join('; ')};
if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
hideOv();R={skor,benar,total,nUr:ur.length,cat,h:hs,st:'sending'};page='done';render();sendR()}
async function sendR(){R.st='sending';render();for(let i=0;i<3;i++){try{await putHasil(R.h);R.st='ok';return render()}catch(e){await new Promise(r=>setTimeout(r,1500))}}R.st='fail';render()}

/* ====== PEMANTAUAN (guru memantau siswa saat ujian) ====== */
const SV={'.sv':'timestamp'},LKEY='cbt_smp_live';
const lvGet=()=>{try{return JSON.parse(localStorage.getItem(LKEY)||'{}')}catch(e){return{}}};
const rsv=v=>v&&typeof v==='object'?(v['.sv']?Date.now():Object.fromEntries(Object.entries(v).map(([k,x])=>[k,rsv(x)]))):v;
function lvPut(path,val){if(!S||!S.sid)return;if(REMOTE){api('live/'+S.sid+'/'+path,'PUT',val).catch(()=>{});return}
try{const m=lvGet(),parts=(S.sid+'/'+path).split('/');let o=m;parts.slice(0,-1).forEach(k=>{o=o[k]=o[k]||{}});o[parts[parts.length-1]]=rsv(val);localStorage.setItem(LKEY,JSON.stringify(m))}catch(e){}}
function beat(){if(S)lvPut('beat',{t:SV,j:S.qs.filter((_,i)=>isAns(i)).length})}
let LIVE=[],SNOW=Date.now(),liveT=null;
async function loadLive(){try{let x;if(REMOTE){const r=await Promise.all([api('live'),api('srvtime','PUT',SV)]);x=r[0];SNOW=typeof r[1]==='number'?r[1]:Date.now()}else{x=lvGet();SNOW=Date.now()}
LIVE=Object.entries(x||{}).map(([id,v])=>({id,...(v.info||{}),mulai:v.mulai,ts:(v.beat||{}).t,j:(v.beat||{}).j||0,st:v.st||'mengerjakan',vs:Object.values(v.v||{}).sort((a,b)=>a.t-b.t)}))}catch(e){}}
const stopLive=()=>{clearInterval(liveT);liveT=null};
function startLive(){stopLive();const f=async()=>{await loadLive();const ex=curEx();if(ex){const t=LIVE.filter(x=>x.ex===ex.id).reduce((a,x)=>a+x.vs.length,0);if(G.pv!=null&&t>G.pv&&G.snd!==false)beep();G.pv=t}refreshLive()};f();liveT=setInterval(f,5000)}
function refreshLive(){const el=$('#lv');if(el)el.innerHTML=liveRows()}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.15;o.start();setTimeout(()=>{o.stop();a.close()},350)}catch(e){}}
const fmt=ms=>{const t=Math.max(0,Math.floor(ms/1000));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
const ago=ms=>{const t=Math.max(0,Math.round(ms/1000));return t<60?t+' dtk':Math.floor(t/60)+' mnt'};
function liveRows(){const ex=curEx();if(!ex)return '';let r=LIVE.filter(x=>x.ex===ex.id);const n=SNOW,stale=x=>x.st!=='selesai'&&(!x.ts||n-x.ts>50000);
const c={all:r.length,run:r.filter(x=>x.st!=='selesai'&&!stale(x)).length,fin:r.filter(x=>x.st==='selesai').length,vio:r.filter(x=>x.vs.length).length};
if(G.lvV)r=r.filter(x=>x.vs.length);
const lt=x=>(x.vs.slice(-1)[0]||{}).t||0;r.sort((a,b)=>(b.vs.length>0)-(a.vs.length>0)||lt(b)-lt(a)||String(a.nama).localeCompare(String(b.nama)));
return `<div class="d-flex flex-wrap gap-2 mb-2"><span class="badge text-bg-primary fs-6">Terdaftar ${c.all}</span><span class="badge text-bg-success fs-6">Mengerjakan ${c.run}</span><span class="badge text-bg-secondary fs-6">Selesai ${c.fin}</span><span class="badge ${c.vio?'text-bg-danger':'text-bg-light border'} fs-6">⚠️ Ada pelanggaran: ${c.vio} siswa</span></div>
<div class="table-responsive"><table class="table table-sm align-middle bg-white"><thead><tr><th>No. Peserta</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Terjawab</th><th>Sisa Waktu</th><th>Pelanggaran</th><th>Sinyal Terakhir</th></tr></thead><tbody>${r.map(x=>{const lv=x.vs.slice(-1)[0],sis=x.mulai&&x.dur?x.mulai+x.dur*60000-n:null;
return `<tr class="${x.vs.length?'table-danger':''}"><td>${esc(x.no||'-')}</td><td>${esc(x.nama)}</td><td>${esc(x.kelas)}</td><td>${x.st==='selesai'?'<span class="badge text-bg-secondary">Selesai</span>':stale(x)?'<span class="badge text-bg-warning">Terputus?</span>':'<span class="badge text-bg-success">Mengerjakan</span>'}</td><td>${x.j||0}/${x.total||0}</td><td class="font-monospace">${x.st==='selesai'||sis==null?'-':fmt(sis)}</td><td title="${esc(x.vs.map(v=>v.m).join(' | '))}">${lv?`<b class="text-danger">${x.vs.length}×</b> <span class="small">${esc(lv.m)}</span><div class="small text-muted">${ago(n-lv.t)} lalu${n-lv.t<60000?' <span class="badge text-bg-danger">BARU</span>':''}</div>`:'-'}</td><td class="small">${x.ts?ago(n-x.ts)+' lalu':'-'}</td></tr>`}).join('')||'<tr><td colspan="8" class="text-center text-muted">Belum ada siswa yang memulai ujian.</td></tr>'}</tbody></table></div>`}
function tabPantau(){const ex=curEx();if(!ex)return '<div class="alert alert-info">Belum ada ujian.</div>';G.ex=ex.id;
return exSel()+`<div class="d-flex flex-wrap gap-3 align-items-center mb-2"><label class="small mb-0"><input type="checkbox" ${G.lvV?'checked':''} onchange="G.lvV=this.checked;refreshLive()"> Hanya yang melanggar</label><label class="small mb-0"><input type="checkbox" ${G.snd===false?'':'checked'} onchange="G.snd=this.checked"> 🔔 Bunyi saat ada pelanggaran baru</label><button class="btn btn-sm btn-outline-danger ms-auto" onclick="clearLive()">Bersihkan Data Pantauan</button></div>
<div class="small text-muted mb-2">Diperbarui otomatis tiap 5 detik. Siswa yang tidak mengirim sinyal lebih dari 50 detik ditandai "Terputus?" (HP mati, internet putus, atau halaman ditutup).</div><div id="lv"><div class="text-center text-muted py-4">Memuat...</div></div>`}
async function clearLive(){if(!confirm('Hapus data pantauan untuk ujian ini? Hasil ujian siswa tidak terhapus.'))return;const ex=curEx(),ids=LIVE.filter(x=>x.ex===ex.id).map(x=>x.id);
if(REMOTE)await Promise.all(ids.map(id=>api('live/'+id,'DELETE').catch(()=>{})));else{const m=lvGet();ids.forEach(id=>delete m[id]);try{localStorage.setItem(LKEY,JSON.stringify(m))}catch(e){}}
G.pv=null;await loadLive();refreshLive()}

/* ====== ANTI-CHEATING ====== */
const ov=(h,w)=>{$('#ov').innerHTML=`<div class="ovb${w?' wide':''}">${h}</div>`;$('#ov').classList.remove('d-none')};
const hideOv=()=>$('#ov').classList.add('d-none');
function enterFS(){const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;if(!f)return;S.fs=true;try{const r=f.call(d);if(r&&r.catch)r.catch(()=>{S.fs=false})}catch(e){S.fs=false}}
function resume(){hideOv();enterFS()}
function flag(msg){if(!S||S.done)return;const n=Date.now();if(n-lastF<1500)return;lastF=n;S.viol++;S.log.push(msg);lvPut('v/n'+S.viol,{m:msg,t:SV});beat();
if(S.viol>=MAX_V)return finish('Ujian diakhiri otomatis: pelanggaran mencapai batas ('+msg+')');
ov(`<div class="display-5">⚠️</div><h2 class="h5">Peringatan ${S.viol} dari ${MAX_V}</h2><p>${esc(msg)}.<br>Pelanggaran dicatat dan dilihat guru. Ujian diakhiri otomatis pada pelanggaran ke-${MAX_V}.</p><button class="btn btn-primary" onclick="resume()">Kembali ke Ujian</button>`)}
const live=()=>S&&!S.done&&page==='exam';
['copy','cut','paste','contextmenu','dragstart'].forEach(t=>document.addEventListener(t,e=>{if(live())e.preventDefault()}));
/* kehilangan fokus (pindah tab/aplikasi, membuka bilah notifikasi): dihitung 1 pelanggaran per kejadian */
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0,EDGE=24,MSG_TOP='Terdeteksi usapan layar dari atas (membuka notifikasi/bilah sistem)';
let away=false;
const lost=m=>{if(away||!live())return;away=true;flag(m)};
document.addEventListener('visibilitychange',()=>{if(document.hidden)lost('Terdeteksi berpindah tab/aplikasi');else away=false});
window.addEventListener('blur',()=>lost(TOUCH?'Terdeteksi membuka notifikasi/berpindah aplikasi':'Jendela ujian kehilangan fokus'));
window.addEventListener('focus',()=>{away=false});
setInterval(()=>{if(TOUCH&&live()&&!document.hasFocus())lost('Terdeteksi membuka notifikasi/berpindah aplikasi')},400);
/* usapan dari tepi atas layar (HP/tablet) */
let tp=null;
document.addEventListener('touchstart',e=>{if(!live())return;const t=e.touches[0];tp=t&&(t.clientY<=EDGE||t.screenY<=EDGE)?{y:t.clientY,fl:false}:null},{passive:true});
document.addEventListener('touchmove',e=>{if(!live()||!tp||tp.fl)return;const t=e.touches[0];if(t&&t.clientY-tp.y>40){tp.fl=true;flag(MSG_TOP)}},{passive:true});
document.addEventListener('touchcancel',()=>{if(live()&&tp&&!tp.fl){tp.fl=true;flag(MSG_TOP)}},{passive:true});
document.addEventListener('fullscreenchange',()=>{if(live()&&S.fs&&!document.fullscreenElement)flag('Keluar dari mode layar penuh')});
document.addEventListener('webkitfullscreenchange',()=>{if(live()&&S.fs&&!document.webkitFullscreenElement)flag('Keluar dari mode layar penuh')});
document.addEventListener('keydown',e=>{if(!live())return;const k=(e.key||'').toLowerCase(),c=e.ctrlKey||e.metaKey;
if(k==='printscreen'){try{navigator.clipboard.writeText(' ')}catch(x){}e.preventDefault();return flag('Terdeteksi tombol Print Screen')}
if(k==='meta'||k==='os')return flag('Terdeteksi tombol Windows/Command');
if(k==='f12'||k==='f11'||k==='f5'||(c&&['c','v','x','a','u','s','p','f','r','w','t','n'].includes(k))||(c&&e.shiftKey&&['i','j','c','s'].includes(k))||(e.altKey&&['tab','f4'].includes(k))){e.preventDefault();flag('Terdeteksi penggunaan shortcut ('+(c?'Ctrl+':'')+(e.altKey?'Alt+':'')+k.toUpperCase()+')')}});
window.addEventListener('beforeunload',e=>{if(live()){e.preventDefault();e.returnValue=''}});
boot();
