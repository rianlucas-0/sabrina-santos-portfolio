(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const burger=$('.burger'),menu=$('nav ul'),header=$('header');
const setMenu=o=>{menu.classList.toggle('open',o);burger.classList.toggle('open',o);burger.setAttribute('aria-expanded',o)};
burger.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
$$('nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>10),{passive:true});
const y=$('#year');if(y)y.textContent=new Date().getFullYear();
// reveal
const els=$$('.reveal');
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))}else els.forEach(e=>e.classList.add('in'));
// contact
const tabs=$$('.choice button');
tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(b=>b.setAttribute('aria-selected',b===t));$$('.panel').forEach(p=>p.hidden=p.id!==t.dataset.panel)}));
if(location.hash==='#whatsapp'&&tabs[1])tabs[1].click();
const form=$('#contactForm');
if(form){
const st=$('#status'),btn=$('button[type=submit]',form);
form.addEventListener('submit',async e=>{
e.preventDefault();
if(form._honey.value)return;
st.className='status';st.textContent='';
btn.disabled=true;const old=btn.textContent;btn.textContent='Enviando...';
const d=Object.fromEntries(new FormData(form));delete d._honey;
try{
const r=await fetch(form.dataset.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(d)});
const j=await r.json().catch(()=>({}));
if(!r.ok||j.success==='false'||j.success===false)throw new Error(j.message||r.status);
st.className='status ok';st.textContent='Mensagem enviada com sucesso! Retornarei o contato em breve.';form.reset();
}catch(err){
console.error(err);
st.className='status err';st.innerHTML='Não foi possível enviar agora. Tente novamente ou fale comigo pelo <a href="'+form.dataset.wa+'" target="_blank" rel="noopener">WhatsApp</a>.';
}finally{btn.disabled=false;btn.textContent=old}
});}
})();
