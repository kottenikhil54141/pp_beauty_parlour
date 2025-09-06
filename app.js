// --------- Data & State ----------
const AppState = {
  currentTheme: 'rose',               // 'rose' or 'blue'
  selectedService: null,
  currentUser: null,                  // {id,name,email,isAdmin}
};

const ServicesData = {
  female: [
    {id:'f1',name:'Hair Cutting',price:300,duration:'45 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/3166cd80a9569c051faddc231301642c390e46c5.png',desc:'Professional cut and styling.'},
    {id:'f2',name:'Hair Styling',price:500,duration:'60 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/0d6573465021652c7319d7096878ee6582ce16f5.png',desc:'Event-ready styling.'},
    {id:'f3',name:'Facial Treatment',price:600,duration:'90 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/288b5e4592cd80b91b3e1c5a67c592575816cc4e.png',desc:'Deep cleansing glow.'},
    {id:'f4',name:'Manicure',price:400,duration:'45 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/cb65a73769585da822d96ce4cd559c5a21f478ff.png',desc:'Nail care + finish.'},
    {id:'f5',name:'Pedicure',price:450,duration:'60 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/cb65a73769585da822d96ce4cd559c5a21f478ff.png',desc:'Relaxing foot care.'},
    {id:'f6',name:'Hair Coloring',price:800,duration:'120 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/eae3dc7c0da46d83ec92b3b8b2a3d1e76b60c9f1.png',desc:'Professional color.'},
    {id:'f7',name:'Bridal Makeup',price:2000,duration:'150 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/2def99e8f77c18e85edce89b25b5b7e8a5d28b28.png',desc:'Complete bridal look.'},
    {id:'f8',name:'Waxing',price:350,duration:'30 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/288b5e4592cd80b91b3e1c5a67c592575816cc4e.png',desc:'Smooth finish.'},
  ],
  male: [
    {id:'m1',name:'Hair Cut',price:200,duration:'30 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/3166cd80a9569c051faddc231301642c390e46c5.png',desc:'Classic/modern cut.'},
    {id:'m2',name:'Beard Trimming',price:150,duration:'20 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/8b86a8e4f2d1ac5bbcbce48a08ab59e8d8e56b19.png',desc:'Shape and trim.'},
    {id:'m3',name:'Facial',price:400,duration:'60 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/288b5e4592cd80b91b3e1c5a67c592575816cc4e.png',desc:'Cleanse + hydrate.'},
    {id:'m4',name:'Hair Styling',price:300,duration:'30 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/0d6573465021652c7319d7096878ee6582ce16f5.png',desc:'Set & finish.'},
    {id:'m5',name:'Head Massage',price:250,duration:'30 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/288b5e4592cd80b91b3e1c5a67c592575816cc4e.png',desc:'Relaxing therapy.'},
    {id:'m6',name:'Shaving',price:100,duration:'20 min',image:'https://pplx-res.cloudinary.com/image/upload/v1757095662/pplx_project_search_images/8b86a8e4f2d1ac5bbcbce48a08ab59e8d8e56b19.png',desc:'Clean shave.'},
  ],
};
const TIME_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

// ---------- Storage Helpers ----------
const LS = {
  get(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
};
function getUsers(){ return LS.get('users', []); }
function setUsers(u){ LS.set('users', u); }
function getBookings(){ return LS.get('bookings', []); }
function setBookings(b){
  LS.set('bookings', b);
  // live refresh for Admin view without reload
  if(AppState.currentUser?.isAdmin) renderAdmin();
} // localStorage not reactive; call re-render after change [20][21]

// Listen for storage changes from other tabs
window.addEventListener('storage',(e)=>{
  if(e.key==='bookings'){
    if(AppState.currentUser?.isAdmin) renderAdmin();
  }
}); // [22][20]

// ---------- Routing ----------
const PAGES = {
  home: document.getElementById('homePage'),
  services: document.getElementById('servicesPage'),
  detail: document.getElementById('detailPage'),
  booking: document.getElementById('bookingPage'),
  userDash: document.getElementById('userDashboard'),
  adminLogin: document.getElementById('adminLoginPage'),
  adminDash: document.getElementById('adminDashboard'),
};
function show(id){
  Object.values(PAGES).forEach(p=>p.classList.remove('active'));
  PAGES[id].classList.add('active');
}

// ---------- Theme ----------
function applyTheme(theme){
  AppState.currentTheme = theme;
  document.body.classList.toggle('blue-theme', theme==='blue');
  document.body.classList.toggle('rose-theme', theme==='rose');
  // Adjust primary buttons by theme
  const solidBtns = document.querySelectorAll('.btn.btn-solid');
  solidBtns.forEach(b=>{
    if(theme==='blue'){ b.classList.add('blue'); b.classList.remove('rose'); }
    else{ b.classList.add('rose'); b.classList.remove('blue'); }
  });
}

// ---------- Services UI ----------
const servicesGrid = document.getElementById('servicesGrid');
const servicesTitle = document.getElementById('servicesTitle');

function renderServices(category='female'){
  servicesTitle.textContent = category==='female' ? 'Female Services' : 'Male Services';
  applyTheme(category==='female'?'rose':'blue');

  const data = category==='female' ? ServicesData.female : ServicesData.male;
  servicesGrid.innerHTML = data.map(s => `
    <article class="card ${category==='male'?'blue':''}">
      <img src="${s.image}" alt="${s.name}">
      <div class="title">${s.name}</div>
      <div class="meta">${s.duration}</div>
      <div class="price">₹${s.price}</div>
      <div class="row">
        <button class="btn small btn-solid" data-action="detail" data-id="${s.id}" data-cat="${category}">View</button>
        <button class="btn small btn-outline" data-action="book" data-id="${s.id}" data-cat="${category}">Book</button>
      </div>
    </article>
  `).join('');
  show('services');
}

servicesGrid.addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const id = btn.dataset.id;
  const cat = btn.dataset.cat;
  const item = (cat==='female'?ServicesData.female:ServicesData.male).find(x=>x.id===id);
  if(!item) return;
  if(btn.dataset.action==='detail'){ renderDetail(item, cat); }
  if(btn.dataset.action==='book'){ goBook(item); }
});

function renderDetail(s, cat){
  applyTheme(cat==='female'?'rose':'blue');
  const card = document.getElementById('detailCard');
  card.innerHTML = `
    <img src="${s.image}" alt="${s.name}">
    <div>
      <h3>${s.name}</h3>
      <div class="desc">${s.desc}</div>
      <div class="price">Price: ₹${s.price} • ${s.duration}</div>
      <div class="actions">
        <button class="btn btn-solid" id="detailBook">Book Now</button>
      </div>
    </div>`;
  document.getElementById('detailBook').onclick = ()=> goBook(s);
  AppState.selectedService = s;
  show('detail');
}

// ---------- Booking ----------
const timeSel = document.getElementById('bookingTime');
TIME_SLOTS.forEach(t=>{
  const o=document.createElement('option');o.value=t;o.textContent=t;timeSel.appendChild(o);
});

function goBook(svc){
  AppState.selectedService = svc;
  document.getElementById('bookingService').value = svc.name;
  document.getElementById('bookingPrice').value = svc.price;
  // prefill user if logged
  const u = AppState.currentUser;
  if(u && !u.isAdmin){
    document.getElementById('custName').value = u.name || '';
    document.getElementById('custEmail').value = u.email || '';
  }
  applyTheme(svc.id.startsWith('f')?'rose':'blue');
  show('booking');
}

// Payment: build UPI URI and QR (uses public QR API that renders the string as QR image)
function buildUpiUri(amount){
  const pa = 'beautyparlour@upi';
  const pn = encodeURIComponent('Beauty Parlour');
  const am = encodeURIComponent(String(amount));
  const tn = encodeURIComponent('Appointment Payment');
  // Format per UPI deep link convention [16][6]
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}`;
}
function showQR(amount){
  const uri = buildUpiUri(amount);
  const qrImg = document.getElementById('upiQR');
  // Any public QR server that encodes a text value will work; here using Google Chart API alternative via quickchart
  qrImg.src = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(uri)}`;
  const link = document.getElementById('upiLink');
  link.href = uri;
  document.getElementById('qrWrap').classList.remove('hidden');
} // Generating a QR encoding UPI URI is supported by PSP apps [14][16]

document.querySelectorAll('input[name="pay"]').forEach(r=>{
  r.addEventListener('change',()=>{
    const method = document.querySelector('input[name="pay"]:checked')?.value;
    const amount = Number(document.getElementById('bookingPrice').value||0);
    if(method && method!=='Cash'){ showQR(amount); } else {
      document.getElementById('qrWrap').classList.add('hidden');
    }
  });
});

document.getElementById('bookingForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const svc = document.getElementById('bookingService').value;
  const price = Number(document.getElementById('bookingPrice').value);
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;
  const method = document.querySelector('input[name="pay"]:checked')?.value;
  if(!svc || !price || !name || !phone || !email || !date || !time || !method) return;

  const currentUser = AppState.currentUser;
  const userId = currentUser ? currentUser.id : `guest-${Date.now()}`;

  const bookings = getBookings();
  const newBooking = {
    id: Date.now(),
    userId,
    service: svc,
    date, time,
    price,
    status:'Pending',
    paymentMethod: method,
    customerInfo:{ name, phone, email }
  };
  bookings.push(newBooking);
  setBookings(bookings); // triggers admin re-render immediately [20][21]

  if(currentUser && !currentUser.isAdmin) renderMyBookings();

  alert('Booking saved! If UPI selected, complete payment using QR/Open UPI App.');
  show('userDash');
});

// ---------- Auth (Users) ----------
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
document.getElementById('loginBtn').onclick = ()=> loginModal.showModal();
document.getElementById('signupBtn').onclick = ()=> signupModal.showModal();

document.getElementById('signupForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const pass = document.getElementById('signupPassword').value;
  const users = getUsers();
  if(users.find(u=>u.email===email)){ alert('Email already registered'); return; }
  const hashed = btoa(pass.split('').reverse().join('')); // simple demo hash
  const user = { id:'u'+Date.now(), name, phone, email, password:hashed, isAdmin:false };
  users.push(user); setUsers(users);
  AppState.currentUser = {id:user.id,name,email:user.email,isAdmin:false};
  loginModal.close(); signupModal.close();
  document.getElementById('userName').textContent = name;
  document.getElementById('userMenu').classList.remove('hidden');
});

document.getElementById('loginForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  if(email==='nik@gmail.com' && pass==='nik123'){ // route to admin login section
    loginModal.close();
    show('adminLogin');
    return;
  }
  const users = getUsers();
  const u = users.find(u=>u.email===email && u.password===btoa(pass.split('').reverse().join('')));
  if(!u) return alert('Invalid credentials');
  AppState.currentUser = {id:u.id,name:u.name,email:u.email,isAdmin:false};
  document.getElementById('userName').textContent = u.name;
  document.getElementById('userMenu').classList.remove('hidden');
  loginModal.close();
  renderMyBookings();
  show('userDash');
});

document.getElementById('logoutBtn').onclick = ()=>{
  AppState.currentUser = null;
  document.getElementById('userMenu').classList.add('hidden');
  show('home');
};

// ---------- User Dashboard ----------
function renderMyBookings(){
  const tbody = document.getElementById('myBookingsBody');
  const uid = AppState.currentUser?.id;
  const mine = getBookings().filter(b=>b.userId===uid);
  tbody.innerHTML = mine.map(b=>`
    <tr>
      <td>${b.id}</td>
      <td>${b.service}</td>
      <td>${b.date}</td>
      <td>${b.time}</td>
      <td>₹${b.price}</td>
      <td>${b.status}</td>
    </tr>
  `).join('');
}

// ---------- Admin ----------
document.getElementById('goAdmin').onclick = ()=> show('adminLogin');
document.getElementById('adminLogout').onclick = ()=>{
  AppState.currentUser = null; show('home');
};

document.getElementById('adminLoginForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const pass = document.getElementById('adminPass').value;
  if(email==='nik@gmail.com' && pass==='nik123'){
    AppState.currentUser = {id:'admin',name:'Admin',email,isAdmin:true};
    renderAdmin();
    show('adminDash');
  }else{
    alert('Invalid admin credentials');
  }
});

document.getElementById('adminSearch').addEventListener('input', renderAdmin);

function renderAdmin(){
  const q = document.getElementById('adminSearch').value?.toLowerCase() || '';
  const rows = getBookings()
    .filter(b => {
      const t = `${b.customerInfo?.name||''} ${b.customerInfo?.email||''} ${b.service}`.toLowerCase();
      return t.includes(q);
    })
    .map(b=>`
      <tr>
        <td>${b.id}</td>
        <td>${b.customerInfo?.name||''}</td>
        <td>${b.customerInfo?.phone||''}</td>
        <td>${b.customerInfo?.email||''}</td>
        <td>${b.service}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>₹${b.price}</td>
        <td>
          <select class="statusSelect" data-id="${b.id}">
            ${['Pending','Confirmed','Completed','Cancelled'].map(s=>`<option ${s===b.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
  document.getElementById('adminBookingsBody').innerHTML = rows;

  // revenue
  const total = getBookings().filter(x=>x.status!=='Cancelled').reduce((sum,x)=>sum + (Number(x.price)||0), 0);
  document.getElementById('adminRevenue').textContent = `₹${total}`;

  // bind change handlers
  document.querySelectorAll('.statusSelect').forEach(sel=>{
    sel.onchange = (e)=>{
      const id = Number(e.target.dataset.id);
      const all = getBookings().map(b => b.id===id ? {...b, status:e.target.value} : b);
      setBookings(all); // re-render via setBookings
    };
  });
}

// ---------- Nav & Buttons ----------
document.querySelectorAll('[data-route]').forEach(a=>{
  a.addEventListener('click',(e)=>{
    e.preventDefault();
    const to = a.getAttribute('data-route');
    if(to==='services'){ renderServices('female'); }
    else if(to==='home'){ show('home'); applyTheme('rose'); }
    else if(to==='about'){ alert('Beauty Parlour Booking — demo site.'); }
  });
});
document.getElementById('femaleServicesBtn').onclick = ()=> renderServices('female');
document.getElementById('maleServicesBtn').onclick = ()=> renderServices('male');
document.getElementById('switchFemale').onclick = ()=> renderServices('female');
document.getElementById('switchMale').onclick = ()=> renderServices('male');

// ---------- Init ----------
show('home');
applyTheme('rose');

