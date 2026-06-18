'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const SHIFTS = ['Ca 9h – 18h', 'Ca 10h – 19h', 'Ca 11h – 20h']
const today = () => new Date().toISOString().split('T')[0]
const fmtDate = (d) => { if (!d) return ''; const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}` }
const fmtVND = (n) => n ? Number(n).toLocaleString('vi-VN') + ' ₫' : '0 ₫'
const nowTime = () => { const n = new Date(); return n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0') }

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('form') // form | history
  const [saved, setSaved] = useState(null) // record vừa lưu → hiện receipt
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Form KTV
  const [kNgay, setKNgay] = useState(today())
  const [kCa, setKCa] = useState(SHIFTS[0])
  const [kDt, setKDt] = useState('')
  const [kTyc, setKTyc] = useState('')
  const [kTkm, setKTkm] = useState('')
  const [kTkc, setKTkc] = useState('')
  const [kTc, setKTc] = useState('')
  const [kVn, setKVn] = useState('')
  const [kVd, setKVd] = useState('')
  const [kFg, setKFg] = useState('')
  const [kFv, setKFv] = useState('')
  const [kUp, setKUp] = useState('')
  const [kComplains, setKComplains] = useState([])
  const [kNote, setKNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Form TVV
  const [tNgay, setTNgay] = useState(today())
  const [tCa, setTCa] = useState(SHIFTS[0])
  const [tDt, setTDt] = useState('')
  const [tKm, setTKm] = useState('')
  const [tKc, setTKc] = useState('')
  const [tChot, setTChot] = useState('')
  const [tChua, setTChua] = useState('')
  const [tTc, setTTc] = useState('')
  const [tLydo, setTLydo] = useState('')
  const [tNote, setTNote] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('spa_user')
    if (!u) { router.push('/'); return }
    setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    if (user && tab === 'history') fetchHistory()
  }, [user, tab])

  async function fetchHistory() {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('records')
      .select('*')
      .eq('staff_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setHistory(data || [])
    setLoadingHistory(false)
  }

  const kTtour = (parseInt(kTyc)||0) + (parseInt(kTkm)||0) + (parseInt(kTkc)||0)
  const tTong = (parseInt(tKm)||0) + (parseInt(tKc)||0)

  function addComplain() {
    setKComplains(prev => [...prev, { loai: 'Triệt', soKH: 1, lydo: '' }])
  }
  function updateComplain(i, field, val) {
    setKComplains(prev => prev.map((c,idx) => idx===i ? {...c,[field]:val} : c))
  }
  function removeComplain(i) {
    setKComplains(prev => prev.filter((_,idx) => idx!==i))
  }

  async function saveKTV() {
    if (!user) return
    setSaving(true)
    const record = {
      staff_id: user.id,
      staff_name: user.name,
      type: 'KTV',
      ngay: kNgay,
      ca: kCa,
      dt: parseInt(kDt)||0,
      tyc: parseInt(kTyc)||0,
      tkm: parseInt(kTkm)||0,
      tkc: parseInt(kTkc)||0,
      ttour: kTtour,
      tc: parseInt(kTc)||0,
      vn: parseInt(kVn)||0,
      vd: parseInt(kVd)||0,
      fg: parseInt(kFg)||0,
      fv: parseInt(kFv)||0,
      up: parseInt(kUp)||0,
      complains: kComplains,
      note: kNote,
    }
    const { data, error } = await supabase.from('records').insert(record).select().single()
    setSaving(false)
    if (error) { alert('Lỗi lưu: ' + error.message); return }
    // reset
    setKDt(''); setKTyc(''); setKTkm(''); setKTkc(''); setKTc('')
    setKVn(''); setKVd(''); setKFg(''); setKFv(''); setKUp('')
    setKComplains([]); setKNote('')
    setSaved(data)
  }

  async function saveTVV() {
    if (!user) return
    setSaving(true)
    const record = {
      staff_id: user.id,
      staff_name: user.name,
      type: 'TVV',
      ngay: tNgay,
      ca: tCa,
      dt: parseInt(tDt)||0,
      tkm: parseInt(tKm)||0,
      tkc: parseInt(tKc)||0,
      ttour: tTong,
      chot: parseInt(tChot)||0,
      tc: parseInt(tTc)||0,
      lydo: tLydo,
      note: tNote,
      tyc:0, vn:0, vd:0, fg:0, fv:0, up:0, complains:[],
    }
    const { data, error } = await supabase.from('records').insert(record).select().single()
    setSaving(false)
    if (error) { alert('Lỗi lưu: ' + error.message); return }
    setTDt(''); setTKm(''); setTKc(''); setTChot(''); setTChua('')
    setTTc(''); setTLydo(''); setTNote('')
    setSaved(data)
  }

  if (!user) return <div className="text-center text-muted" style={{padding:40}}>Đang tải...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <div className="nav">
        <button onClick={() => { localStorage.removeItem('spa_user'); router.push('/') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>← Đổi</button>
        <div className="nav-brand">✦ Báo cáo ngày</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`pill pill-${user.role.toLowerCase()}`}>{user.role}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tabbar">
        <button className={tab==='form'?'active':''} onClick={() => setTab('form')}>📝 Nhập báo cáo</button>
        <button className={tab==='history'?'active':''} onClick={() => setTab('history')}>📋 Lịch sử</button>
      </div>

      <div className="page-wrap">
        {tab === 'form' && (
          <>
            {user.role === 'KTV' ? (
              <FormKTV
                ngay={kNgay} setNgay={setKNgay}
                ca={kCa} setCa={setKCa}
                dt={kDt} setDt={setKDt}
                tyc={kTyc} setTyc={setKTyc}
                tkm={kTkm} setTkm={setKTkm}
                tkc={kTkc} setTkc={setKTkc}
                ttour={kTtour}
                tc={kTc} setTc={setKTc}
                vn={kVn} setVn={setKVn}
                vd={kVd} setVd={setKVd}
                fg={kFg} setFg={setKFg}
                fv={kFv} setFv={setKFv}
                up={kUp} setUp={setKUp}
                complains={kComplains}
                addComplain={addComplain}
                updateComplain={updateComplain}
                removeComplain={removeComplain}
                note={kNote} setNote={setKNote}
                onSave={saveKTV} saving={saving}
              />
            ) : (
              <FormTVV
                ngay={tNgay} setNgay={setTNgay}
                ca={tCa} setCa={setTCa}
                dt={tDt} setDt={setTDt}
                km={tKm} setKm={setTKm}
                kc={tKc} setKc={setTKc}
                tong={tTong}
                chot={tChot} setChot={setTChot}
                chua={tChua} setChua={setTChua}
                tc={tTc} setTc={setTTc}
                lydo={tLydo} setLydo={setTLydo}
                note={tNote} setNote={setTNote}
                onSave={saveTVV} saving={saving}
              />
            )}
          </>
        )}

        {tab === 'history' && (
          <History records={history} loading={loadingHistory} type={user.role} />
        )}
      </div>

      {/* Receipt overlay */}
      {saved && (
        <Receipt record={saved} onClose={() => setSaved(null)} />
      )}
    </div>
  )
}

/* ───── FORM KTV ───── */
function FormKTV({ ngay,setNgay,ca,setCa,dt,setDt,tyc,setTyc,tkm,setTkm,tkc,setTkc,ttour,tc,setTc,vn,setVn,vd,setVd,fg,setFg,fv,setFv,up,setUp,complains,addComplain,updateComplain,removeComplain,note,setNote,onSave,saving }) {
  return (
    <div>
      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="grid2 mb12">
          <div><label className="label">Ngày báo cáo</label><input type="date" value={ngay} onChange={e=>setNgay(e.target.value)}/></div>
          <div><label className="label">Ca làm việc</label>
            <select value={ca} onChange={e=>setCa(e.target.value)}>
              {SHIFTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Doanh thu thực thu (VNĐ)</label><input type="number" placeholder="0" value={dt} onChange={e=>setDt(e.target.value)}/></div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Số tour trong ngày</div>
        <div className="tour-row mb8">
          <span className="pill pill-yc">Yêu cầu</span>
          <input type="number" placeholder="0" min="0" value={tyc} onChange={e=>setTyc(e.target.value)}/>
        </div>
        <div className="tour-row mb8">
          <span className="pill pill-km">Khách mới</span>
          <input type="number" placeholder="0" min="0" value={tkm} onChange={e=>setTkm(e.target.value)}/>
        </div>
        <div className="tour-row" style={{background:'var(--bg)'}}>
          <span className="pill pill-kc">Khách cũ</span>
          <input type="number" placeholder="0" min="0" value={tkc} onChange={e=>setTkc(e.target.value)}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,padding:'8px 12px',background:'var(--accent-light)',borderRadius:'var(--radius-sm)'}}>
          <span style={{fontSize:13,fontWeight:600,color:'var(--accent)'}}>Tổng tour</span>
          <span style={{fontSize:20,fontWeight:800,color:'var(--accent)'}}>{ttour}</span>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Tăng ca & Upsell</div>
        <div className="grid2">
          <div><label className="label">Tăng ca (phút)</label><input type="number" placeholder="0" min="0" value={tc} onChange={e=>setTc(e.target.value)}/></div>
          <div><label className="label">Upsell (dịch vụ)</label><input type="number" placeholder="0" min="0" value={up} onChange={e=>setUp(e.target.value)}/></div>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Video MKT hỗ trợ</div>
        <div className="grid2">
          <div>
            <label className="label">🎬 Video nhanh</label>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>1–2 bước chính (đắp nạ, lấy mụn...)</div>
            <input type="number" placeholder="0" min="0" value={vn} onChange={e=>setVn(e.target.value)}/>
          </div>
          <div>
            <label className="label">🎥 Video dài</label>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6}}>Toàn quy trình (mụn, triệt...)</div>
            <input type="number" placeholder="0" min="0" value={vd} onChange={e=>setVd(e.target.value)}/>
          </div>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Feedback khách hàng</div>
        <div className="grid2">
          <div><label className="label">⭐ Google / Facebook</label><input type="number" placeholder="0" min="0" value={fg} onChange={e=>setFg(e.target.value)}/></div>
          <div><label className="label">📹 Video feedback</label><input type="number" placeholder="0" min="0" value={fv} onChange={e=>setFv(e.target.value)}/></div>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head" style={{color:'var(--red)'}}>⚠ Complain phát sinh</div>
        {complains.map((c,i) => (
          <div key={i} className="complain-row">
            <div>
              <label className="label">Dịch vụ</label>
              <select value={c.loai} onChange={e=>updateComplain(i,'loai',e.target.value)}>
                <option>Triệt</option><option>Da / Mụn</option><option>Khác</option>
              </select>
            </div>
            <div>
              <label className="label">Số KH</label>
              <input type="number" min="1" value={c.soKH} onChange={e=>updateComplain(i,'soKH',e.target.value)}/>
            </div>
            <div>
              <label className="label">Lý do</label>
              <input type="text" placeholder="Mô tả..." value={c.lydo} onChange={e=>updateComplain(i,'lydo',e.target.value)}/>
            </div>
            <button onClick={()=>removeComplain(i)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--red)',fontSize:18,paddingBottom:2}}>×</button>
          </div>
        ))}
        <button className="btn btn-secondary btn-sm" onClick={addComplain} style={{marginTop:complains.length?8:0}}>+ Thêm complain</button>
      </div>

      <div className="card mb16" style={{padding:'14px 16px'}}>
        <label className="label">Ghi chú khác</label>
        <textarea placeholder="Bất thường trong ngày..." value={note} onChange={e=>setNote(e.target.value)}/>
      </div>

      <button className="btn btn-primary btn-full" onClick={onSave} disabled={saving}>
        {saving ? 'Đang lưu...' : '💾 Lưu báo cáo'}
      </button>
    </div>
  )
}

/* ───── FORM TVV ───── */
function FormTVV({ ngay,setNgay,ca,setCa,dt,setDt,km,setKm,kc,setKc,tong,chot,setChot,chua,setChua,tc,setTc,lydo,setLydo,note,setNote,onSave,saving }) {
  return (
    <div>
      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="grid2 mb12">
          <div><label className="label">Ngày báo cáo</label><input type="date" value={ngay} onChange={e=>setNgay(e.target.value)}/></div>
          <div><label className="label">Ca làm việc</label>
            <select value={ca} onChange={e=>setCa(e.target.value)}>
              {SHIFTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div><label className="label">Doanh thu thực thu (VNĐ)</label><input type="number" placeholder="0" value={dt} onChange={e=>setDt(e.target.value)}/></div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Số khách tư vấn</div>
        <div className="grid2 mb8">
          <div>
            <label className="label"><span className="pill pill-km" style={{marginRight:4}}>KM</span> Khách mới</label>
            <input type="number" placeholder="0" min="0" value={km} onChange={e=>setKm(e.target.value)}/>
          </div>
          <div>
            <label className="label"><span className="pill pill-kc" style={{marginRight:4}}>KC</span> Khách cũ</label>
            <input type="number" placeholder="0" min="0" value={kc} onChange={e=>setKc(e.target.value)}/>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--green-light)',borderRadius:'var(--radius-sm)'}}>
          <span style={{fontSize:13,fontWeight:600,color:'var(--green)'}}>Tổng khách tư vấn</span>
          <span style={{fontSize:20,fontWeight:800,color:'var(--green)'}}>{tong}</span>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Hiệu quả chốt</div>
        <div className="grid2">
          <div><label className="label">✅ Đã chốt</label><input type="number" placeholder="0" min="0" value={chot} onChange={e=>setChot(e.target.value)}/></div>
          <div><label className="label">⏳ Chưa chốt</label><input type="number" placeholder="0" min="0" value={chua} onChange={e=>setChua(e.target.value)}/></div>
        </div>
        <div style={{marginTop:10}}>
          <label className="label">Lý do chưa chốt</label>
          <textarea placeholder="Giá cao, cần suy nghĩ thêm..." value={lydo} onChange={e=>setLydo(e.target.value)} style={{minHeight:48}}/>
        </div>
      </div>

      <div className="card mb12" style={{padding:'14px 16px'}}>
        <div className="section-head">Tăng ca</div>
        <div><label className="label">Thời gian tăng ca (phút)</label><input type="number" placeholder="0" min="0" value={tc} onChange={e=>setTc(e.target.value)}/></div>
      </div>

      <div className="card mb16" style={{padding:'14px 16px'}}>
        <label className="label">Ghi chú</label>
        <textarea placeholder="Bất thường trong ngày..." value={note} onChange={e=>setNote(e.target.value)}/>
      </div>

      <button className="btn btn-green btn-full" onClick={onSave} disabled={saving}>
        {saving ? 'Đang lưu...' : '💾 Lưu báo cáo'}
      </button>
    </div>
  )
}

/* ───── LỊCH SỬ ───── */
function History({ records, loading, type }) {
  if (loading) return <div className="text-center text-muted mt16">Đang tải...</div>
  if (!records.length) return <div className="card text-center" style={{padding:32,color:'var(--muted)'}}>Chưa có báo cáo nào</div>
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {records.map(r => <HistoryCard key={r.id} r={r} />)}
    </div>
  )
}

function HistoryCard({ r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{padding:'12px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setOpen(!open)}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>{fmtDate(r.ngay)} · {r.ca}</div>
          <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{r.type==='KTV'?`${r.ttour} tour`:`${r.ttour} khách • chốt ${r.chot||0}`}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:800,color:'var(--accent)',fontSize:15}}>{Number(r.dt).toLocaleString('vi-VN')}đ</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>{open?'▲':'▼'}</div>
        </div>
      </div>
      {open && (
        <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)',fontSize:13,display:'flex',flexDirection:'column',gap:4}}>
          {r.type==='KTV' && <>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">YC / KM / KC</span><span style={{fontWeight:600}}>{r.tyc} / {r.tkm} / {r.tkc}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">Video MKT</span><span style={{fontWeight:600}}>Nhanh {r.vn} · Dài {r.vd}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">G/FB · Video FB</span><span style={{fontWeight:600}}>{r.fg} · {r.fv}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">Upsell</span><span style={{fontWeight:600}}>{r.up}</span></div>
            {r.complains?.length>0 && <div style={{color:'var(--red)',fontSize:12}}>⚠ {r.complains.map(c=>`${c.loai}×${c.soKH}`).join(', ')}</div>}
          </>}
          {r.type==='TVV' && <>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">KM / KC</span><span style={{fontWeight:600}}>{r.tkm} / {r.tkc}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">Tỷ lệ chốt</span><span style={{fontWeight:600}}>{r.ttour>0?Math.round((r.chot||0)/r.ttour*100):0}%</span></div>
            {r.lydo && <div style={{color:'var(--muted)',fontSize:12}}>Lý do: {r.lydo}</div>}
          </>}
          {r.tc>0 && <div style={{display:'flex',justifyContent:'space-between'}}><span className="text-muted">Tăng ca</span><span style={{fontWeight:600}}>{r.tc} phút</span></div>}
          {r.note && <div style={{color:'var(--muted)',fontSize:12}}>📝 {r.note}</div>}
        </div>
      )}
    </div>
  )
}

/* ───── RECEIPT ───── */
function Receipt({ record: r, onClose }) {
  const isKTV = r.type === 'KTV'
  return (
    <div className="overlay">
      <div className="receipt">
        <div className={`receipt-header ${isKTV?'ktv':'tvv'}`}>
          <div className="receipt-logo">✦ BÁO CÁO NGÀY</div>
          <div style={{fontSize:11,opacity:.7,marginBottom:8}}>{isKTV?'KỸ THUẬT VIÊN':'TƯ VẤN VIÊN'}</div>
          <div className="receipt-name">{r.staff_name}</div>
          <div className="receipt-meta">{fmtDate(r.ngay)} · {r.ca}</div>
        </div>

        <div className="receipt-body">
          <div className="receipt-dt">
            <div><div className="lbl">Doanh thu thực thu</div></div>
            <div className={`val ${isKTV?'':'green'}`}>{fmtVND(r.dt)}</div>
          </div>

          {isKTV && <>
            <div className="r-section">
              <div className="r-section-title">Số tour</div>
              <div className="r-row"><span className="k">Yêu cầu</span><span className="v"><span className="pill pill-yc">{r.tyc} tour</span></span></div>
              <div className="r-row"><span className="k">Khách mới</span><span className="v"><span className="pill pill-km">{r.tkm} tour</span></span></div>
              <div className="r-row"><span className="k">Khách cũ</span><span className="v"><span className="pill pill-kc">{r.tkc} tour</span></span></div>
              <div className="r-row" style={{borderTop:'1px solid var(--border)',marginTop:4,paddingTop:6}}>
                <span className="k" style={{fontWeight:700}}>Tổng tour</span>
                <span className="v" style={{fontSize:18}}>{r.ttour}</span>
              </div>
            </div>
            {(r.vn>0||r.vd>0) && <div className="r-section">
              <div className="r-section-title">Video MKT</div>
              {r.vn>0&&<div className="r-row"><span className="k">🎬 Nhanh</span><span className="v">{r.vn} video</span></div>}
              {r.vd>0&&<div className="r-row"><span className="k">🎥 Dài</span><span className="v">{r.vd} video</span></div>}
            </div>}
            {(r.fg>0||r.fv>0) && <div className="r-section">
              <div className="r-section-title">Feedback</div>
              {r.fg>0&&<div className="r-row"><span className="k">⭐ Google/FB</span><span className="v">{r.fg} lượt</span></div>}
              {r.fv>0&&<div className="r-row"><span className="k">📹 Video FB</span><span className="v">{r.fv} video</span></div>}
            </div>}
            {r.up>0&&<div className="r-section">
              <div className="r-section-title">Upsell</div>
              <div className="r-row"><span className="k">Dịch vụ thêm</span><span className="v">{r.up}</span></div>
            </div>}
            {r.complains?.length>0&&<div className="r-section">
              <div className="r-section-title" style={{color:'var(--red)'}}>⚠ Complain</div>
              {r.complains.map((c,i)=><div key={i} className="r-row"><span className="k">{c.loai} ×{c.soKH} KH</span><span className="v" style={{fontSize:12,color:'var(--muted)'}}>{c.lydo}</span></div>)}
            </div>}
          </>}

          {!isKTV && <>
            <div className="r-section">
              <div className="r-section-title">Khách tư vấn</div>
              <div className="r-row"><span className="k">Khách mới</span><span className="v"><span className="pill pill-km">{r.tkm}</span></span></div>
              <div className="r-row"><span className="k">Khách cũ</span><span className="v"><span className="pill pill-kc">{r.tkc}</span></span></div>
              <div className="r-row" style={{borderTop:'1px solid var(--border)',marginTop:4,paddingTop:6}}>
                <span className="k" style={{fontWeight:700}}>Tổng</span>
                <span className="v" style={{fontSize:18}}>{r.ttour} khách</span>
              </div>
            </div>
            <div className="r-section">
              <div className="r-section-title">Hiệu quả</div>
              <div className="r-row"><span className="k">Đã chốt</span><span className="v">{r.chot||0} khách</span></div>
              <div className="r-row"><span className="k">Tỷ lệ chốt</span><span className="v">{r.ttour>0?Math.round((r.chot||0)/r.ttour*100):0}%</span></div>
              {r.lydo&&<div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Lý do: {r.lydo}</div>}
            </div>
          </>}

          {r.tc>0&&<div className="r-section">
            <div className="r-section-title">Tăng ca</div>
            <div className="r-row"><span className="k">Thời gian</span><span className="v">{r.tc} phút</span></div>
          </div>}
          {r.note&&<div className="r-section">
            <div className="r-section-title">Ghi chú</div>
            <div style={{fontSize:13,color:'var(--muted)'}}>{r.note}</div>
          </div>}
        </div>

        <div className="receipt-hint">
          📸 Chụp màn hình phiếu này<br/>gửi vào <strong>group Zalo</strong> để xác nhận báo cáo<br/>
          <span style={{fontSize:11,opacity:.7}}>Báo cáo lúc {nowTime()}</span>
        </div>
        <button className={`receipt-close ${isKTV?'':'green'}`} onClick={onClose}>✓ Đã chụp – Đóng</button>
      </div>
    </div>
  )
}
