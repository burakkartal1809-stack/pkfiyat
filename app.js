const $ = (id) => document.getElementById(id);
let pesineProducts = [];
let temlikProducts = [];
let activeMode = "pesine";
let filtered = [];
const money = value => value === null || value === "" || value === undefined ? "Fiyat yok" :
  new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(Number(value));
function norm(s){return String(s ?? "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").trim()}
function escapeHtml(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function currentProducts(){return activeMode==="pesine" ? pesineProducts : temlikProducts}
function buildBrands(){
  const brands=[...new Set(currentProducts().map(p=>p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
  $("brandFilter").innerHTML='<option value="">Tüm markalar</option>'+brands.map(b=>`<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
}
function renderTemlikCard(p){
  const offers = (p.offers || []).map(o => `
    <div class="temlik-offer">
      <div class="offer-term">${escapeHtml(o.termMonths)} AY</div>
      <div class="offer-monthly">${money(o.monthlyInstallment)}<small>/ay</small></div>
      <div class="offer-total"><span>Toplam temlik faturası</span><strong>${money(o.totalInvoice)}</strong></div>
      <div class="offer-meta">${o.campaignCode ? `Kampanya: ${escapeHtml(o.campaignCode)}` : ""}</div>
    </div>`).join("");
  const colors = (p.colors || []).length ? `Renkler: ${(p.colors||[]).map(escapeHtml).join(", ")}` : "";
  const codes = (p.deviceCodes || []).length ? `Kodlar: ${(p.deviceCodes||[]).map(escapeHtml).join(", ")}` : "";
  const category = (p.categories || []).map(x => x==="Cihaz Kampanyaları" ? "Cihaz" : x==="Yenilenmiş 2.El Cihaz" ? "Yenilenmiş" : "Akıllı ürün").join(" · ");
  return `<article class="product temlik-product">
    <div class="product-top"><span class="brand-tag">${escapeHtml(p.brand||"Diğer")}</span><span class="mode-tag">FATURAYA EK</span></div>
    <h3>${escapeHtml(p.model||"Model belirtilmemiş")}</h3>
    <div class="variant">${escapeHtml(p.storage||"")} ${colors ? "· "+colors : ""}</div>
    <div class="temlik-offers">${offers}</div>
    <div class="temlik-foot">${escapeHtml(category)}${codes ? `<span>${codes}</span>` : ""}</div>
  </article>`;
}
function render(){
  const q=norm($("search").value), brand=$("brandFilter").value, sort=$("sort").value;
  const source=currentProducts();
  filtered=source.filter(p=>{
    const hay=norm([p.brand,p.model,p.deviceModel,p.deviceCode,p.storage,p.searchText,(p.colors||[]).join(" "),(p.deviceCodes||[]).join(" ")].join(" "));
    return (!q || hay.includes(q)) && (!brand || p.brand===brand);
  });
  if(sort==="low") filtered.sort((a,b)=>{
    const ap=activeMode==="pesine" ? Number(a.price)||Infinity : Math.min(...(a.offers||[]).map(o=>Number(o.monthlyInstallment)||Infinity));
    const bp=activeMode==="pesine" ? Number(b.price)||Infinity : Math.min(...(b.offers||[]).map(o=>Number(o.monthlyInstallment)||Infinity));
    return ap-bp;
  });
  if(sort==="high") filtered.sort((a,b)=>{
    const ap=activeMode==="pesine" ? Number(a.price)||-Infinity : Math.max(...(a.offers||[]).map(o=>Number(o.monthlyInstallment)||-Infinity));
    const bp=activeMode==="pesine" ? Number(b.price)||-Infinity : Math.max(...(b.offers||[]).map(o=>Number(o.monthlyInstallment)||-Infinity));
    return bp-ap;
  });
  if(sort==="az") filtered.sort((a,b)=>String(a.brand).localeCompare(String(b.brand),"tr"));
  $("count").textContent=`${filtered.length.toLocaleString("tr-TR")} ürün`;
  $("clear").hidden=!$("search").value;
  $("empty").hidden=filtered.length!==0;
  $("results").innerHTML=filtered.slice(0,180).map(p=> activeMode==="pesine" ? `
    <article class="product">
      <div class="product-top"><span class="brand-tag">${escapeHtml(p.brand||"Diğer")}</span><span class="code">${escapeHtml(p.deviceCode||"")}</span></div>
      <h3>${escapeHtml(p.model||"Model belirtilmemiş")}</h3>
      <div class="variant">${escapeHtml(p.deviceModel||"")}</div>
      <div class="price-row">
        <div><span class="price-label">ABONE CİHAZ BEDELİ</span><div class="price">${money(p.price)}</div></div>
        <div class="term">${p.termMonths ? `${escapeHtml(p.termMonths)} ay taahhüt` : ""}</div>
      </div>
    </article>` : renderTemlikCard(p)).join("");
  if(filtered.length>180) $("count").textContent+=` · İlk 180 sonuç gösteriliyor`;
}
function setMode(mode){
  activeMode=mode;
  $("modePesine").classList.toggle("active",mode==="pesine");
  $("modeTemlik").classList.toggle("active",mode==="temlik");
  $("modePesine").setAttribute("aria-pressed",String(mode==="pesine"));
  $("modeTemlik").setAttribute("aria-pressed",String(mode==="temlik"));
  $("modeDescription").textContent=mode==="pesine" ? "Peşine kontrat fiyatlarını görüntülüyorsun." : "Aylık taksit ve toplam temlik faturası birlikte gösterilir.";
  buildBrands(); render();
}
async function init(){
  try{
    const [pRes,tRes]=await Promise.all([fetch("./products.json"),fetch("./temlik.json")]);
    if(!pRes.ok) throw new Error("products.json yüklenemedi");
    if(!tRes.ok) throw new Error("temlik.json yüklenemedi");
    [pesineProducts,temlikProducts]=await Promise.all([pRes.json(),tRes.json()]);
    setMode("pesine");
  }catch(e){
    $("count").textContent="Ürün listesi yüklenemedi";
    $("results").innerHTML='<p style="color:#b42318;font-size:13px">Fiyat verisi yüklenemedi. products.json ve temlik.json dosyalarının siteyle aynı klasörde olduğundan emin olun.</p>';
  }
}
$("modePesine").addEventListener("click",()=>setMode("pesine"));
$("modeTemlik").addEventListener("click",()=>setMode("temlik"));
$("search").addEventListener("input",render);
$("brandFilter").addEventListener("change",render);
$("sort").addEventListener("change",render);
$("clear").addEventListener("click",()=>{$("search").value="";render();$("search").focus()});
$("year").textContent=new Date().getFullYear();
init();
