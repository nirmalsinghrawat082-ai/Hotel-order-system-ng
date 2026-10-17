const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOTEL = process.env.HOTEL_NAME || 'Hotel Order System';
const PASSWORD = process.env.APP_PASSWORD || 'ChangeThisPassword123!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret-before-use';
const DATA_FILE = path.join(__dirname, 'data.json');

app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));
app.use(session({
  name: 'hotel.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly:true, sameSite:'lax', secure:false, maxAge: 8*60*60*1000 }
}));
function defaultData() {
  return {
    tables: Array.from({length:60}, (_,i)=>({id:i+1, name:`Table ${i+1}`, active:true})),
    menu: [
      {id:1,name:'Tea',price:20,category:'Drinks',active:true},
      {id:2,name:'Coffee',price:40,category:'Drinks',active:true},
      {id:3,name:'Water Bottle',price:20,category:'Drinks',active:true},
      {id:4,name:'Veg Sandwich',price:80,category:'Snacks',active:true},
      {id:5,name:'French Fries',price:100,category:'Snacks',active:true},
      {id:6,name:'Paneer Butter Masala',price:220,category:'Main Course',active:true},
      {id:7,name:'Dal Tadka',price:160,category:'Main Course',active:true},
      {id:8,name:'Butter Roti',price:20,category:'Bread',active:true},
      {id:9,name:'Jeera Rice',price:130,category:'Rice',active:true}
    ],
    orders: [], nextOrderId: 1
  };
}
function loadData() {
  try { if(fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); }
  catch(e) { console.error('Could not read data.json:', e.message); }
  const d=defaultData(); saveData(d); return d;
}
let db=loadData();
function saveData(d=db) { fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2)); }
function auth(req,res,next) {
  if(req.session && req.session.ok) return next();
  return res.status(401).json({error:'Please log in again.'});
}
app.get('/api/config',(req,res)=>res.json({hotelName:HOTEL,loggedIn:!!(req.session&&req.session.ok)}));
app.post('/api/login',(req,res)=>{
  const password=String(req.body.password||'');
  if(password !== PASSWORD) return res.status(401).json({error:'Wrong password'});
  req.session.ok=true; res.json({ok:true});
});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/data',auth,(req,res)=>res.json({tables:db.tables,menu:db.menu,orders:db.orders}));
app.post('/api/orders',auth,(req,res)=>{
  const {tableId, items, note='', customerName=''}=req.body||{};
  const table=db.tables.find(t=>t.id===Number(tableId)&&t.active);
  if(!table) return res.status(400).json({error:'Choose a valid active table'});
  if(!Array.isArray(items)||!items.length) return res.status(400).json({error:'Add at least one item'});
  const clean=[];
  for(const row of items) {
    const m=db.menu.find(x=>x.id===Number(row.menuId)&&x.active);
    const qty=Math.max(1,Math.min(999,Math.floor(Number(row.qty)||1)));
    if(m) clean.push({menuId:m.id,name:m.name,price:Number(m.price),qty});
  }
  if(!clean.length) return res.status(400).json({error:'No valid menu items'});
  const total=clean.reduce((s,x)=>s+x.price*x.qty,0);
  const order={id:db.nextOrderId++,tableId:table.id,tableName:table.name,items:clean,note:String(note).slice(0,500),customerName:String(customerName).slice(0,100),total,status:'New',createdAt:new Date().toISOString(),paid:false};
  db.orders.unshift(order); saveData(); res.json({order});
});
app.patch('/api/orders/:id',(req,res)=>{
  if(!(req.session&&req.session.ok)) return res.status(401).json({error:'Please log in again.'});
  const order=db.orders.find(o=>o.id===Number(req.params.id));
  if(!order) return res.status(404).json({error:'Order not found'});
  if(typeof req.body.paid==='boolean') order.paid=req.body.paid;
  if(['New','Preparing','Ready','Served','Cancelled'].includes(req.body.status)) order.status=req.body.status;
  saveData(); res.json({order});
});
app.post('/api/menu',auth,(req,res)=>{
  const {name,price,category='Other'}=req.body||{};
  if(!String(name||'').trim()||!Number.isFinite(Number(price))||Number(price)<0) return res.status(400).json({error:'Enter item name and valid price'});
  const item={id:Math.max(0,...db.menu.map(x=>x.id))+1,name:String(name).trim().slice(0,100),price:Number(price),category:String(category).slice(0,60),active:true};
  db.menu.push(item); saveData(); res.json({item});
});
app.patch('/api/menu/:id',auth,(req,res)=>{
  const item=db.menu.find(x=>x.id===Number(req.params.id));
  if(!item) return res.status(404).json({error:'Item not found'});
  if(typeof req.body.active==='boolean') item.active=req.body.active;
  if(req.body.name!==undefined) item.name=String(req.body.name).trim().slice(0,100);
  if(req.body.price!==undefined && Number.isFinite(Number(req.body.price)) && Number(req.body.price)>=0) item.price=Number(req.body.price);
  saveData(); res.json({item});
});
app.patch('/api/tables/:id',auth,(req,res)=>{
  const t=db.tables.find(x=>x.id===Number(req.params.id));
  if(!t) return res.status(404).json({error:'Table not found'});
  if(req.body.name!==undefined) t.name=String(req.body.name).trim().slice(0,60)||t.name;
  if(typeof req.body.active==='boolean') t.active=req.body.active;
  saveData(); res.json({table:t});
});
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.use(express.static(path.join(__dirname,'public')));
app.listen(PORT,'0.0.0.0',()=>console.log(`${HOTEL} running on http://localhost:${PORT}`));
