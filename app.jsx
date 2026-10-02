
const {useState,useEffect,useRef}=React;
const API="/.netlify/functions/ai";
const call=async(prompt,image,tier,json)=>{const r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,image,tier,json})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"api");return d.text};
const ai=async(p)=>{const t=await call(p+"\nReturn ONLY valid JSON, no markdown.",null,/^Evaluate/.test(p)?"smart":"fast",true);const i=t.search(/[\[{]/),j=Math.max(t.lastIndexOf("]"),t.lastIndexOf("}"));return JSON.parse(t.slice(i,j+1))};
const aiText=(p,image)=>call(p,image,"smart");
const shrink=f=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res({type:"image/jpeg",data:c.toDataURL("image/jpeg",.85).split(",")[1]});URL.revokeObjectURL(u)};im.onerror=rej;im.src=u});
const useLS=(k,d)=>{const [v,setV]=useState(()=>{try{const x=JSON.parse(localStorage.getItem(k));return x??d}catch(e){return d}});useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},[v]);return [v,setV]};
const LV=["A1","A2","B1","B2","C1","C2"];
const COL=["#2f4b7c","#2f6f68","#5a4f7c","#8a5a44","#4a6670","#6b5b3e","#3d5a80","#51606e"];
const norm=s=>(s||"").toLocaleLowerCase("tr").trim().replace(/[.!?]/g,"");
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const speak=t=>{try{const u=new SpeechSynthesisUtterance(t),vs=speechSynthesis.getVoices();u.lang="en-US";u.rate=.9;const v=vs.find(x=>/^en[-_]US/.test(x.lang))||vs.find(x=>x.lang.startsWith("en"));if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}};
const TTS=React.createContext(false);
const Spk=({t})=><button className="chip" title="Dinle" onClick={()=>speak(t)} style={{padding:"3px 10px",fontSize:14,verticalAlign:"middle"}}>🔊 Dinle</button>;
const Load=({t})=><div className="load"><div className="dots"><i/><i/><i/></div><p className="mut">{t||"Hazırlanıyor…"}</p></div>;
const LevelPick=({onPick,title})=><div className="card"><h2>{title||"Seviyeni seç"}</h2><p className="mut">Sana uygun içeriği hazırlayalım.</p><div className="grid">{LV.map((l,i)=><button key={l} className="box" style={{background:COL[i]}} onClick={()=>onPick(l)}>{l}</button>)}</div></div>;

const FB=[{w:"apple",en:"A round fruit, usually red or green, that grows on trees.",tr:["elma"],meanings:["Bilgisayar markası (Apple)"],syn:[],ant:[],idioms:[{p:"An apple a day keeps the doctor away",m:"Elma yemek sağlıklıdır"}],col:["a ripe apple","apple juice","apple pie"],ex:["I eat an apple every morning.","She gave her teacher a red apple."]},{w:"house",en:"A building where people live.",tr:["ev"],meanings:["Meclis (House of Commons)","Barındırmak (fiil)"],syn:["home"],ant:[],idioms:[{p:"On the house",m:"Işletmeden ikram"}],col:["buy a house","house price","a big house"],ex:["They bought a big house.","Our house has three rooms."]}];
const TOPICS=["Jobs","Family Members","Food & Drink","Travel","Health","Education","Technology","Weather","Shopping","Feelings","Sports","Home & Furniture","Nature & Animals","Money & Banking","Clothes","Transport","Business","Law & Crime","Science","Art & Culture","Relationships","Hobbies","City Life","Environment"];

/* ---------- VOCABULARY ---------- */
function Detail({w}){return <div>
 <h3>Anlamı</h3><div>{w.tr.map(t=><span className="pill" key={t}>{t}</span>)}</div>
 {w.meanings?.length>0&&<><h3>Diğer anlamları</h3>{w.meanings.map(m=><span className="pill" key={m}>{m}</span>)}</>}
 {(w.syn?.length>0||w.ant?.length>0)&&<><h3>Eş / Zıt anlamlı</h3>{w.syn?.map(s=><span className="pill" style={{background:"#e4f1ea",color:"#1f4d36"}} key={s}>= {s}</span>)}{w.ant?.map(s=><span className="pill" style={{background:"#f6e3e0",color:"#7a2a20"}} key={s}>≠ {s}</span>)}</>}
 {w.col?.length>0&&<><h3>Sık kullanılan birleşimler (collocations)</h3>{w.col.map(c=><span className="pill" key={c}>{c}</span>)}</>}
 {w.idioms?.length>0&&<><h3>Günlük kalıplar</h3>{w.idioms.slice(0,3).map(x=><p key={x.p}><b>“{x.p}”</b> <span className="mut">— {x.m}</span></p>)}</>}
 <h3>Cümle içinde</h3>{w.ex?.map(e=><div className="ex" key={e}>{e} <Spk t={e}/></div>)}
</div>}
function Card({w,learn,wrong,fixed,onNext,last}){
 const [ph,setPh]=useState("ask"),[v,setV]=useState(""),[st,setSt]=useState(""),[wr,setWr]=useState(false);const auto=React.useContext(TTS);useEffect(()=>{if(auto)speak(w.w)},[]);
 const hit=()=>{const b=norm(v);return b&&w.tr.some(t=>{const a=norm(t);return a===b||(b.length>2&&a.includes(b))})};
 const check=()=>{if(hit()){learn(w);if(ph==="type")fixed(w);setSt("good");setPh("done")}else if(ph==="type"){setWr(true);setPh("hint");setV("")}else{learn(w);wrong(w);setSt("miss");setPh("done")}};
 const giveUp=()=>{learn(w);wrong(w);setSt("skip");setPh("done")};
 return <div className="card"><div className="word">{w.w}</div><div style={{textAlign:"center"}}><Spk t={w.w}/></div>
 {ph==="ask"&&<div className="row" style={{justifyContent:"center"}}><p style={{width:"100%",textAlign:"center"}}>Bu kelimeyi biliyor musun?</p><button className="btn g" onClick={()=>setPh("type")}>Biliyorum</button><button className="btn o" onClick={()=>setPh("hint")}>Bilmiyorum</button></div>}
 {ph==="hint"&&<div className="hint"><b>{wr?"Tam değil. Son bir tahmin hakkın var.":"İpucu: bir tahmin hakkın var."}</b><p>💡 {w.en}</p></div>}
 {(ph==="type"||ph==="hint")&&<div className="bar"><p className="mut" style={{margin:"0 0 8px"}}>Türkçe anlamını yaz:</p><div className="row" style={{flexWrap:"nowrap"}}><input autoFocus value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="cevabın…"/><button className="btn" onClick={check}>Kontrol</button></div><button className="btn o" style={{marginTop:8}} onClick={giveUp}>Bilmiyorum, göster</button></div>}
 {ph==="done"&&<>{st==="good"&&<div className="good">Doğru!</div>}{st==="miss"&&<div className="hint">Bu sefer olmadı, sorun değil. İşte kelimenin tamamı:</div>}{st==="skip"&&<div className="hint">İşte kelimenin tamamı:</div>}
  {st!=="good"&&<div className="hint" style={{marginTop:8}}>💡 {w.en}</div>}<Detail w={w}/><button className="btn" style={{marginTop:14}} onClick={onNext}>{last?"Bitir":"Sonraki kelime →"}</button></>}
 </div>}
function Quiz({items,title,onExit,wrong,fixed}){
 const [pool]=useState(()=>shuf(items).map(w=>({w,d:Math.random()<.5}))),[i,setI]=useState(0),[v,setV]=useState(""),[fb,setFb]=useState(null),[sc,setSc]=useState(0);
 const auto=React.useContext(TTS);useEffect(()=>{if(auto&&pool[i]&&!pool[i].d)speak(pool[i].w.w)},[i]);
 if(!pool.length)return <div className="card"><p>Burada henüz kelime yok.</p><button className="btn" onClick={onExit}>← Geri</button></div>;
 if(i>=pool.length)return <div className="card" style={{textAlign:"center"}}><h2>{title} bitti</h2><div className="word">{sc}/{pool.length}</div><button className="btn" onClick={onExit}>← Kelimelere dön</button></div>;
 const {w,d}=pool[i];
 const go=()=>{if(fb){setFb(null);setV("");setI(i+1);return}const b=norm(v);const ok=b&&(d?norm(w.w)===b:w.tr.some(t=>norm(t)===b||(b.length>2&&norm(t).includes(b))));if(ok){setSc(sc+1);fixed(w)}else wrong(w);setFb(ok?"ok":"bad")};
 return <div className="card"><button className="chip" onClick={onExit}>← Geri</button><p className="mut" style={{marginTop:10}}>{title} · {i+1}/{pool.length}</p><div className="prog"><b style={{width:(i/pool.length*100)+"%"}}/></div>
 <p className="mut" style={{marginTop:14,textAlign:"center"}}>{d?"Türkçesi verilen İngilizce kelimeyi yaz":"Bu kelimenin Türkçe anlamını yaz"}</p>
 <div className="word" style={{fontSize:32,margin:"4px 0 12px"}}>{d?w.tr[0]:<>{w.w} <Spk t={w.w}/></>}</div>
 <div className="hint">💡 {w.en}</div>
 <div className="bar"><div className="row" style={{flexWrap:"nowrap"}}><input autoFocus value={v} disabled={!!fb} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder={d?"English word…":"Türkçe anlamı…"}/><button className="btn" onClick={go}>{fb?"Sonraki":"Kontrol"}</button></div>
 {fb&&<p className={fb==="ok"?"good":"hint"} style={{marginTop:10}}>{fb==="ok"?"Doğru! ":"Cevap: "}<b>{d?w.w:w.tr.join(", ")}</b></p>}</div></div>}
function Vocab(){
 const [st,setSt]=useLS("v_store",{learned:{},wrong:{}});
 const [td,setTd]=useLS("v_today",{d:"",w:[]});
 const day=new Date().toDateString(),tw=td.d===day?td.w:[];
 const [view,setView]=useState("pick"),[lv,setLv]=useState(null),[topic,setTopic]=useState(""),[q,setQ]=useState("");
 const [err,setErr]=useState(false),[words,setWords]=useState([]),[i,setI]=useState(0),[busy,setBusy]=useState(false),[quiz,setQuiz]=useState(null);
 const learn=w=>{setSt(s=>({...s,learned:{...s.learned,[w.w]:w}}));setTd(t=>({d:day,w:[...(t.d===day?t.w:[]).filter(x=>x.w!==w.w),w]}))};
 const wrong=w=>setSt(s=>({...s,wrong:{...s.wrong,[w.w]:w}}));
 const fixed=w=>setSt(s=>{const n={...s.wrong};delete n[w.w];return{...s,wrong:n}});
 const load=async(l,t)=>{setBusy(true);try{const known=Object.keys(st.learned).slice(-60).join(", ");
  const r=await ai(`Generate 8 English vocabulary words at CEFR ${l} level${t?` on the topic "${t}"`:""}. Do not use these: ${known}. JSON array of objects: {"w":"word","en":"clear simple English explanation that does NOT contain the word and has no Turkish","tr":["1-4 accepted Turkish translations, lowercase"],"meanings":["other senses, short, in Turkish"],"syn":["synonyms if any"],"ant":["antonyms if any"],"idioms":[{"p":"everyday phrase using it","m":"Turkish meaning"}] (max 3),"col":["3-4 common collocations with the word, e.g. make a decision"],"ex":["2 natural example sentences"]}`);
  if(!Array.isArray(r)||!r.length)throw 0;setWords(r);setI(0);setView("study");setErr("")}catch(e){setErr(String(e&&e.message||"boş yanıt"))}setBusy(false)};
 const start=l=>{setLv(l);setTopic("");setQ("")};
 if(quiz)return <Quiz {...quiz} wrong={wrong} fixed={fixed} onExit={()=>{setQuiz(null)}}/>;
 if(busy)return <div className="card"><Load t="Kelimeler seçiliyor…"/></div>;
 if(view==="study"){const w=words[i];
  return <div><div className="row" style={{justifyContent:"space-between"}}><span className="pill">{lv}{topic&&" · "+topic}</span><span className="mut">{Math.min(i+1,words.length)}/{words.length}</span></div>
  <div className="prog"><b style={{width:(i/words.length*100)+"%"}}/></div>
  {w?<Card key={w.w} w={w} learn={learn} wrong={wrong} fixed={fixed} last={i===words.length-1} onNext={()=>setI(i+1)}/>:<div className="card" style={{textAlign:"center"}}><h2>Tur tamam!</h2><p className="mut">Bugün {tw.length} kelime çalıştın.</p><div className="row" style={{justifyContent:"center"}}><button className="btn" onClick={()=>load(lv,topic)}>Yeni kelimeler</button><button className="btn g" onClick={()=>setQuiz({items:tw,title:"Bugünkü test"})}>Karışık sor</button></div></div>}
  <div className="bar row"><button className="btn o" onClick={()=>setView("pick")}>← Ana sayfa</button>{i>0&&i<=words.length&&<button className="btn o" onClick={()=>setI(i-1)}>← Önceki</button>}<button className="btn" onClick={()=>{setView("pick");setLv(null)}}>Bitir</button><button className="btn g" onClick={()=>setQuiz({items:tw,title:"Bugünkü karışık test"})} disabled={!tw.length}>Öğrendiklerimi karışık sor ({tw.length})</button></div></div>}
 const all=Object.values(st.learned),wr=Object.values(st.wrong);
 return <div>
 <div className="card"><h2>Kelime Hazinesi</h2><p className="mut">Önce seviyeni seç, istersen bir konu ara.</p>{err&&<p className="hint">Kelimeler getirilemedi ({err}). Biraz sonra tekrar dene; sürerse README'deki "Sorun giderme" bölümüne bak.</p>}
  <div className="row"><button className="btn g" disabled={!tw.length} onClick={()=>setQuiz({items:tw,title:"Bugünkü test"})}>Bugünküleri sor ({tw.length})</button><button className="btn r" disabled={!wr.length} onClick={()=>setQuiz({items:wr,title:"Yanlışlarım"})}>Yanlışlarım ({wr.length})</button><button className="btn o" disabled={!all.length} onClick={()=>setQuiz({items:all,title:"Tüm zamanlar"})}>Tüm kelimelerim ({all.length})</button></div></div>
 {!lv?<LevelPick onPick={start}/>:<div className="card"><h2>Seviye {lv} <button className="chip" onClick={()=>setLv(null)}>değiştir</button></h2>
  <button className="btn" onClick={()=>load(lv,"")}>Sıradaki kelimelerle başla →</button>
  <h3>…ya da bir konu seç</h3><input placeholder="🔍 Konu ara (jobs, family…)" value={q} onChange={e=>setQ(e.target.value)}/>
  <div className="row" style={{marginTop:10}}>{TOPICS.filter(t=>t.toLowerCase().includes(q.toLowerCase())).map((t,k)=><button key={t} className="chip" style={{borderColor:COL[k%8]}} onClick={()=>{setTopic(t);load(lv,t)}}>{t}</button>)}
  {q&&!TOPICS.some(t=>t.toLowerCase()===q.toLowerCase())&&<button className="chip on" onClick={()=>{setTopic(q);load(lv,q)}}>“{q}” konusunu çalış</button>}</div></div>}
 </div>}

/* ---------- GRAMMAR ---------- */
const TEN=["Present Simple","Present Continuous","Present Perfect","Present Perfect Continuous","Past Simple","Past Continuous","Past Perfect","Past Perfect Continuous","Future Simple","Future Continuous","Future Perfect","Future Perfect Continuous"];
const GM={"Parts of Speech":["Nouns","Pronouns","Adjectives","Adverbs","Prepositions","Conjunctions","Interjections"],"Tenses":TEN,"Modals":["Can / Could","May / Might","Must / Have to","Should / Ought to","Will / Would / Shall","Modals in the Past"],"Sentence Structure & Clauses":["Word Order","Questions & Negatives","Relative Clauses","Noun Clauses","Adverbial Clauses","Compound & Complex Sentences"],"Conditionals & Wish Clauses":["Zero & First Conditional","Second Conditional","Third Conditional","Mixed Conditionals","Wish / If only"],"Active & Passive Voice - Causatives":["Passive in Tenses","Passive with Modals","Have / Get something done","Make / Let / Have someone do"],"Reported Speech":["Statements","Questions","Commands & Requests","Reporting Verbs"],"Verbals: Gerunds & Infinitives":["Gerunds","Infinitives","Verb + Gerund / Infinitive","Participles"],"Determiners & Quantifiers":["Articles","Some / Any","Much / Many / A lot of","Few / Little","Each / Every / All / Both"]};
function Practice({main,init}){
 const [sel,setSel]=useState(init?[init]:[]),[items,setItems]=useState(null),[busy,setBusy]=useState(false),[ans,setAns]=useState({}),[chk,setChk]=useState(false);
 const gen=async()=>{setBusy(true);setChk(false);setAns({});try{setItems(await ai(`Create 8 fill-in-the-blank English grammar exercises mixing these topics: ${sel.join("; ")}. JSON array: {"q":"sentence with ___ for the blank (and the base verb/word in parentheses if needed)","a":["accepted answers"],"h":"short Turkish hint"}`))}catch(e){setItems([])}setBusy(false)};
 return <div className="card"><h2>Pekiştir</h2><p className="mut">Çalışmak istediğin konuları seç (birden fazla olabilir):</p>
 <div className="row">{GM[main].map(s=><button key={s} className={"chip"+(sel.includes(s)?" on":"")} onClick={()=>setSel(sel.includes(s)?sel.filter(x=>x!==s):[...sel,s])}>{s}</button>)}</div>
 <button className="btn" style={{marginTop:12}} disabled={!sel.length||busy} onClick={gen}>Alıştırmayı hazırla</button>
 {busy&&<Load/>}{items&&!busy&&(items.length?<div>{items.map((it,k)=>{const ok=chk&&it.a.some(a=>norm(a)===norm(ans[k]));return <div key={k} style={{margin:"14px 0"}}><p><b>{k+1}.</b> {it.q}</p><input value={ans[k]||""} onChange={e=>setAns({...ans,[k]:e.target.value})} style={chk?{borderColor:ok?"var(--ok)":"var(--bad)"}:{}} placeholder={it.h}/>{chk&&!ok&&<p className="hint" style={{marginTop:6}}>Doğru cevap: <b>{it.a[0]}</b></p>}</div>})}
 <button className="btn g" onClick={()=>setChk(true)}>Kontrol et</button> <button className="btn o" onClick={gen}>Yeni sorular</button></div>:<p className="hint">Sorular hazırlanamadı, tekrar dene.</p>)}</div>}
function Grammar(){
 const [main,setMain]=useState(null),[sub,setSub]=useState(null),[les,setLes]=useState(null),[n,setN]=useState(1),[busy,setBusy]=useState(false),[pr,setPr]=useState(false);
 const open=async s=>{setSub(s);setLes(null);setN(1);setPr(false);setBusy(true);try{setLes(await ai(`Teach the English grammar topic "${s}" (category: ${main}) to Turkish learners. JSON array of 5 steps: {"title":"short Turkish title","text":"clear Turkish explanation, 2-4 sentences","table":{"head":["col"],"rows":[["cell"]]} or null,"ex":[{"en":"English example","tr":"Turkish translation"}]}. Step 1 = main idea and when to use it, step 2 = form table, then usage patterns, common mistakes, quick summary.`))}catch(e){setLes([])}setBusy(false)};
 if(!main)return <div className="card"><h2>Gramer Konuları</h2><p className="mut">Bir ana konu seç.</p><div className="grid">{Object.keys(GM).map((m,k)=><button key={m} className="box" style={{background:COL[k%8]}} onClick={()=>setMain(m)}>{m}</button>)}</div></div>;
 if(!sub)return <div className="card"><button className="chip" onClick={()=>setMain(null)}>← Ana konular</button><h2 style={{marginTop:10}}>{main}</h2><div className="grid">{GM[main].map((s,k)=><button key={s} className="box" style={{background:COL[(k+2)%8]}} onClick={()=>open(s)}>{s}</button>)}</div><button className="btn o" style={{marginTop:14}} onClick={()=>{setSub("");setPr(true)}}>Doğrudan alıştırma yap</button></div>;
 if(pr)return <div><button className="chip" onClick={()=>{setSub(null);setPr(false)}}>← {main}</button><Practice main={main} init={sub||null}/></div>;
 if(busy)return <div className="card"><Load t="Konu hazırlanıyor…"/></div>;
 const L=les||[],cur=L.slice(0,n);
 return <div><button className="chip" onClick={()=>setSub(null)}>← {main}</button><h2 style={{margin:"10px 4px"}}>{sub}</h2>
 {!L.length&&<div className="card"><p>İçerik hazırlanamadı.</p><button className="btn" onClick={()=>open(sub)}>Tekrar dene</button></div>}
 {cur.map((s,k)=><div className="card" key={k} style={{borderTop:`5px solid ${COL[k%8]}`}}><h3 style={{marginTop:0,color:COL[k%8]}}>{k+1}. {s.title}</h3><p>{s.text}</p>
  {s.table?.head&&<table><thead><tr>{s.table.head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{s.table.rows.map((r,x)=><tr key={x}>{r.map((c,y)=><td key={y}>{c}</td>)}</tr>)}</tbody></table>}
  {s.ex?.map(e=><div className="ex" key={e.en}><b>{e.en}</b><div className="mut">{e.tr}</div></div>)}</div>)}
 {L.length>0&&<div className="bar row">{n<L.length?<button className="btn" onClick={()=>setN(n+1)}>Devam →</button>:<button className="btn g" onClick={()=>setPr(true)}>Pekiştirmek için alıştırma yap</button>}<span className="mut">{Math.min(n,L.length)}/{L.length}</span></div>}</div>}

/* ---------- SPEAKING & WRITING ---------- */
function Skill({kind,go}){
 const sp=kind==="speaking";
 const [lv,setLv]=useState(null),[task,setTask]=useState(null),[text,setText]=useState(""),[att,setAtt]=useState(0),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[force,setForce]=useState(false),[live,setLive]=useState(false),[noSR,setNoSR]=useState(false),rec=useRef(null),want=useRef(false),[mode,setMode]=useState(sp?"task":null),[img,setImg]=useState(null),[ocr,setOcr]=useState(false),[uerr,setUerr]=useState(false);
 useEffect(()=>{setImg({mediaTypes:["image/jpeg","image/png","image/webp"]})},[]);
 const up=async f=>{if(!f)return;setUerr(false);if(f.type.startsWith("image/")){setOcr(true);try{const r=await aiText("Transcribe exactly the English handwritten or printed text in this image, keeping the original wording and any mistakes. Output only the transcription.",await shrink(f));setText(r.trim())}catch(e){setUerr(true)}setOcr(false)}else{try{setText(await f.text())}catch(e){setUerr(true)}}};
 const own=()=>{setMode("own");setLv("own");setText("");setAtt(0);setRes(null);setForce(false);setTask({own:true,title:"Kendi metnini değerlendir",prompt:"Yazdığın herhangi bir metni yükle (fotoğraf veya .txt) ya da yapıştır.",points:[]})};
 const pick=async l=>{setLv(l);setBusy(true);setText("");setAtt(0);setRes(null);setForce(false);try{setTask(await ai(`Give a ${kind} task for a Turkish learner at CEFR ${l}. JSON: {"title":"topic title","prompt":"the task in simple English suited to ${l}","points":["3-5 things the learner should cover, in Turkish"]}`))}catch(e){setTask({title:"Describe your day",prompt:"Tell us about a normal day in your life.",points:["Sabah rutinin","Işin veya okulun","Akşam yaptıkların"]})}setBusy(false)};
 const mic=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setNoSR(true);return}if(live){want.current=false;rec.current?.stop();return}const r=new SR();r.lang="en-US";r.continuous=true;r.interimResults=true;let base=text,last=text;r.onresult=e=>{let t="";for(let k=0;k<e.results.length;k++)t+=e.results[k][0].transcript;last=(base?base+" ":"")+t;setText(last)};r.onend=()=>{if(want.current){base=last;try{r.start()}catch(e){setLive(false)}}else setLive(false)};r.onerror=e=>{if(e.error==="no-speech"||e.error==="aborted")return;want.current=false;setLive(false);setNoSR(e.error||"x")};rec.current=r;want.current=true;r.start();setLive(true)};
 const submit=async()=>{want.current=false;if(live)rec.current?.stop();setBusy(true);setForce(false);try{setRes(await ai(`Evaluate this ${kind} answer by a Turkish learner (CEFR ${task.own?"unknown":lv}) ${task.own?"(free text on a topic the learner chose; there is no set task, so return missing as an empty array and estimate the CEFR level)":`for the task "${task.prompt}". Points to cover: ${task.points.join("; ")}.`}\nText:\n"""${text}"""\nJSON: {"score":0-100,"areas":["3-5 TOPIC-LEVEL weaknesses in Turkish (e.g. 'Geçmiş zaman kullanımı', 'Edat seçimi') WITHOUT quoting the exact mistakes"],"covered":["points covered, Turkish"],"missing":["points not covered, Turkish"],"segments":[{"t":"text chunk","wrong":false,"note":"Turkish explanation if wrong, else empty"}] (segments MUST concatenate to exactly reproduce the original text, mark only wrong chunks),"suggest":[{"tab":"grammar or vocab","label":"Turkish suggestion e.g. 'Past Simple konusunu tekrar et'"}]}`));setAtt(att+1)}catch(e){setRes({err:1})}setBusy(false)};
 if(!lv){if(!sp&&!mode)return <div className="card"><h2>Yazma pratiği</h2><p className="mut">Nasıl çalışmak istersin?</p><div className="grid"><button className="box" style={{background:COL[3]}} onClick={()=>setMode("task")}>Verilen konuda yaz</button><button className="box" style={{background:COL[1]}} onClick={own}>Kendi metnimi yükle</button></div></div>;return <LevelPick title={sp?"Konuşma pratiği":"Yazma pratiği"} onPick={pick}/>}
 if(busy&&!task)return <div className="card"><Load t="Konu hazırlanıyor…"/></div>;
 if(!task)return null;
 const detailed=res&&!res.err&&(att>=3||force);
 return <div><div className="card" style={{borderTop:"5px solid var(--p2)"}}><div className="row" style={{justifyContent:"space-between"}}><span className="pill">{task.own?"Kendi metnim":lv}</span><button className="chip" onClick={()=>{setLv(null);setTask(null);setRes(null);setText("");setAtt(0);setMode(sp?"task":null)}}>← Geri</button></div>
 <h2>{task.title}</h2><p>{task.prompt}</p>{!task.own&&<><h3>Anlatman gerekenler</h3>{task.points.map(p=><span className="pill" key={p}>✔ {p}</span>)}</>}</div>
 <div className="card">{sp&&<div style={{textAlign:"center",marginBottom:12}}><button className={"mic"+(live?" on":"")} onClick={mic}>{live?"■":"🎙"}</button><p className="mut">{live?"Dinleniyor… konuş!":"Konuşmak için mikrofona dokun"}</p>{noSR&&<p className="hint">{noSR===true?"Bu tarayıcı canlı konuşma tanımayı desteklemiyor (Chrome veya Edge öneririz).":"Mikrofon kullanılamadı ("+noSR+"). Tarayıcıda mikrofon iznini aç; sayfa gömülü açıldıysa yeni sekmede açmayı dene. Şimdilik metni yazarak girebilirsin."}</p>}</div>}
 <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={sp?"Konuşman burada metne dönüşür (düzenleyebilirsin)…":"Metnini buraya yaz ya da yapıştır…"}/>
 <div className="row" style={{marginTop:10}}>{!sp&&<label className="btn o">📎 Dosya / fotoğraf yükle<input type="file" accept={".txt,.md,text/plain"+(img?","+img.mediaTypes.join(","):"")} hidden onChange={e=>{up(e.target.files[0]);e.target.value=""}}/></label>}{ocr&&<span className="mut">Fotoğraftaki metin okunuyor…</span>}{uerr&&<span className="hint">Dosya okunamadı. .txt veya fotoğraf dene ya da metni yapıştır.</span>}<button className="btn" disabled={busy||text.trim().length<10} onClick={submit}>{att?"Tekrar gönder":"Gönder"}</button></div></div>
 {busy&&<div className="card"><Load t="Değerlendiriliyor…"/></div>}
 {res?.err&&<div className="card hint">Değerlendirme şu an yapılamadı, tekrar dene.</div>}
 {res&&!res.err&&!busy&&<div className="card"><h2>Deneme {att} · {res.score}/100</h2><div className="prog"><b style={{width:res.score+"%"}}/></div>
  {!detailed?<><h3>Üzerinde çalışılacak konular</h3>{res.areas?.map(a=><span className="pill" key={a}>🎯 {a}</span>)}
   {res.missing?.length>0&&<><h3>Henüz anlatmadığın noktalar</h3>{res.missing.map(a=><span className="pill" style={{background:"#fff0b3",color:"#7a5a00"}} key={a}>{a}</span>)}</>}
   <p className="mut">Bu başlıklara bakıp metnini düzeltip tekrar gönder. Hataları kendin bulmaya çalış!</p><button className="btn o" onClick={()=>setForce(true)}>Hataları şimdi göster</button></>
  :<><h3>Metnin ve hatalar</h3><p style={{lineHeight:2}}>{res.segments?.map((s,k)=>s.wrong?<span key={k} className="err" title={s.note}>{s.t}</span>:<span key={k}>{s.t}</span>)}</p>
   {res.segments?.filter(s=>s.wrong).map((s,k)=><p key={k} className="mut">🔴 <b>{s.t}</b> → {s.note}</p>)}
   {res.missing?.length>0&&<><h3>Eksik kalan noktalar</h3>{res.missing.map(a=><p key={a}><span className="miss">{a}</span></p>)}</>}</>}
  {detailed&&res.suggest?.length>0&&<><h3>Sana önerilerimiz</h3>{res.suggest.map(s=><div key={s.label} className="row" style={{margin:"6px 0"}}><span>👉 {s.label}</span><button className="btn o" onClick={()=>go(s.tab==="vocab"?0:1)}>{s.tab==="vocab"?"Kelimeye git":"Gramere git"}</button></div>)}</>}
 </div>}</div>}

/* ---------- APP ---------- */
function App(){
 const [tab,setTab]=useState(0),[tts,setTts]=useLS("tts",false);
 const T=[["📚","Vocabulary"],["🧩","Grammar"],["🎤","Speaking"],["✍️","Writing"]];
 return <TTS.Provider value={tts}><div className="wrap"><div className="row" style={{justifyContent:"space-between"}}><div className="brand">Lingua Ladder · A1 → C2</div><button className={"chip"+(tts?" on":"")} onClick={()=>setTts(!tts)}>🔊 Otomatik sesli okuma: {tts?"Açık":"Kapalı"}</button></div>
 <div className="tabs">{T.map((t,k)=><button key={k} className={`tab t${k}${tab===k?" on":""}`} onClick={()=>setTab(k)}>{t[1]}</button>)}</div>
 {tab===0&&<Vocab/>}{tab===1&&<Grammar/>}{tab===2&&<Skill key="s" kind="speaking" go={setTab}/>}{tab===3&&<Skill key="w" kind="writing" go={setTab}/>}</div></TTS.Provider>}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
