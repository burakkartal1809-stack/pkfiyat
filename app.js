const $ = (id) => document.getElementById(id);
let allProducts = [];
let filtered = [];
const money = value => value === null || value === "" ? "Fiyat yok" :
  new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(Number(value));

function norm(s){return String(s ?? "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").trim()}
function escapeHtml(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function buildBrands(){
  const brands=[...new Set(allProducts.map(p=>p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
  $("brandFilter").innerHTML='<option value="">Tüm markalar</option>'+brands.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
}
function render(){
  const q=norm($("search").value), brand=$("brandFilter").value, sort=$("sort").value;
  filtered=allProducts.filter(p=>{
    const hay=norm([p.brand,p.model,p.deviceModel,p.deviceCode].join(" "));
    return (!q || hay.includes(q)) && (!brand || p.brand===brand);
  });
  if(sort==="low") filtered.sort((a,b)=>(Number(a.price)||Infinity)-(Number(b.price)||Infinity));
  if(sort==="high") filtered.sort((a,b)=>(Number(b.price)||-Infinity)-(Number(a.price)||-Infinity));
  if(sort==="az") filtered.sort((a,b)=>String(a.brand).localeCompare(String(b.brand),"tr"));
  $("count").textContent=`${filtered.length.toLocaleString("tr-TR")} ürün`;
  $("clear").hidden=!$("search").value;
  $("empty").hidden=filtered.length!==0;
  $("results").innerHTML=filtered.slice(0,180).map(p=>`
    <article class="product">
      <div class="product-top"><span class="brand-tag">${escapeHtml(p.brand||"Diğer")}</span><span class="code">${escapeHtml(p.deviceCode||"")}</span></div>
      <h3>${escapeHtml(p.model||"Model belirtilmemiş")}</h3>
      <div class="variant">${escapeHtml(p.deviceModel||"")}</div>
      <div class="price-row">
        <div><span class="price-label">ABONE CİHAZ BEDELİ</span><div class="price">${money(p.price)}</div></div>
        <div class="term">${p.termMonths ? `${escapeHtml(p.termMonths)} ay taahhüt` : ""}</div>
      </div>
    </article>`).join("");
  if(filtered.length>180) $("count").textContent+=` · İlk 180 sonuç gösteriliyor`;
}
async function init(){
  try{
    const res=await fetch("./products.json");
    if(!res.ok) throw new Error("products.json yüklenemedi");
    allProducts=await res.json();
    buildBrands(); render();
  }catch(e){
    $("count").textContent="Ürün listesi yüklenemedi";
    $("results").innerHTML='<p style="color:#b42318;font-size:13px">Ürün verisi bulunamadı. products.json dosyasının siteyle aynı klasörde olduğundan emin olun.</p>';
  }
}
$("search").addEventListener("input",render);
$("brandFilter").addEventListener("change",render);
$("sort").addEventListener("change",render);
$("clear").addEventListener("click",()=>{$("search").value="";render();$("search").focus()});
$("year").textContent=new Date().getFullYear();
init();
