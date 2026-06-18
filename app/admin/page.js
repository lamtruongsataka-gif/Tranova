'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'
const fmtDate = (d) => { if (!d) return ''; const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}` }
const fmt = (n) => n ? Number(n).toLocaleString('vi-VN') : '0'
// Trả về khoảng [đầu tháng, đầu tháng kế tiếp) để lọc an toàn cho mọi tháng
const monthBounds = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const start = `${ym}-01`
  const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
  return { start, end }
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [tab, setTab] = useState('records') // records | staff | stats

  function login() {
    if (pin === ADMIN_PIN) { setAuth(true); setPinErr(false) }
    else { setPinErr(true); setPin('') }
  }

  if (!auth) return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="card" style={{width:'100%',maxWidth:340,padding:28,textAlign:'center'}}>
        <div style={{fontSize:28,marginBottom:8}}>⚙️</div>
        <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>Trang Admin</div>
        <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Nhập mã PIN để đăng nhập</div>
        <input type="password" placeholder="Mã PIN" value={pin}
          onChange={e=>setPin(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&login()}
          style={{textAlign:'center',fontSize:20,letterSpacing:8,marginBottom:10}}/>
        {pinErr && <div style={{color:'var(--red)',fontSize:13,marginBottom:10}}>PIN không đúng</div>}
        <button className="btn btn-primary btn-full" onClick={login}>Đăng nhập</button>
        <div style={{marginTop:16}}><a href="/" style={{fontSize:13,color:'var(--muted)'}}>← Về trang nhân viên</a></div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div className="nav">
        <a href="/" style={{fontSize:13,color:'var(--muted)'}}>← Thoát</a>
        <div className="nav-brand">⚙ Admin</div>
        <button onClick={()=>setAuth(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:'var(--muted)'}}>Đăng xuất</button>
      </div>

      <div className="tabbar">
        <button className={tab==='records'?'active':''} onClick={()=>setTab('records')}>📋 Báo cáo</button>
        <button className={tab==='stats'?'active':''} onClick={()=>setTab('stats')}>📊 Thống kê</button>
        <button className={tab==='staff'?'active':''} onClick={()=>setTab('staff')}>👥 Nhân viên</button>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'16px 16px 60px'}}>
        {tab==='records' && <Records />}
        {tab==='stats' && <Stats />}
        {tab==='staff' && <StaffManager />}
      </div>
    </div>
  )
}

/* ── RECORDS ── */
function Records() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0,7))
  const [filterName, setFilterName] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => { fetchRecords() }, [filterType, filterMonth, filterName])

  async function fetchRecords() {
    setLoading(true)
    let q = supabase.from('records').select('*').order('ngay', {ascending:false}).order('created_at',{ascending:false})
    if (filterType) q = q.eq('type', filterType)
    if (filterMonth) { const mb = monthBounds(filterMonth); q = q.gte('ngay', mb.start).lt('ngay', mb.end) }
    if (filterName) q = q.ilike('staff_name', `%${filterName}%`)
    const { data } = await q.limit(200)
    setRecords(data||[])
    setLoading(false)
  }

  function exportCSV() {
    const h = ['Ngày','Loại','Tên','Ca','Doanh thu','YC','KM','KC','Tổng tour','Khách TV','Chốt','Tăng ca','V.Nhanh','V.Dài','Upsell','G/FB','V.FB','Complain','Ghi chú']
    const rows = records.map(r => [
      r.ngay, r.type, r.staff_name, r.ca, r.dt,
      r.type==='KTV'?r.tyc:'', r.tkm, r.type==='KTV'?r.tkc:'', r.type==='KTV'?r.ttour:'',
      r.type==='TVV'?r.ttour:'', r.type==='TVV'?r.chot:'',
      r.tc, r.type==='KTV'?r.vn:'', r.type==='KTV'?r.vd:'',
      r.type==='KTV'?r.up:'', r.type==='KTV'?r.fg:'', r.type==='KTV'?r.fv:'',
      r.type==='KTV'?(r.complains||[]).map(c=>`${c.loai}x${c.soKH}:${c.lydo}`).join('|'):'',
      (r.note||r.lydo||'').replace(/,/g,' ')
    ])
    const csv = [h,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv)
    a.download = `bao-cao-${filterMonth||'all'}.csv`
    a.click()
  }

  async function deleteRecord(id) {
    if (!confirm('Xoá báo cáo này?')) return
    await supabase.from('records').delete().eq('id', id)
    setRecords(prev => prev.filter(r=>r.id!==id))
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14,alignItems:'center'}}>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{width:'auto'}}>
          <option value="">Tất cả</option>
          <option value="KTV">KTV</option>
          <option value="TVV">TVV</option>
        </select>
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{width:'auto'}}/>
        <input placeholder="Tên nhân viên..." value={filterName} onChange={e=>setFilterName(e.target.value)} style={{width:160}}/>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV}>⬇ Xuất CSV</button>
      </div>

      <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>👆 Bấm vào một dòng để xem chi tiết đầy đủ (lý do complain, ghi chú…)</div>

      {loading ? <div className="text-center text-muted mt16">Đang tải...</div> : (
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Ngày</th><th>Loại</th><th>Tên</th><th>Ca</th><th>Doanh thu</th>
              <th>YC</th><th>KM</th><th>KC</th><th>Tổng</th>
              <th>TV</th><th>Chốt</th><th>TC</th>
              <th>V.Nhanh</th><th>V.Dài</th><th>Upsell</th><th>G/FB</th><th>Complain</th><th>Ghi chú</th><th></th>
            </tr></thead>
            <tbody>
              {records.length===0 && <tr><td colSpan={19} style={{textAlign:'center',color:'var(--muted)',padding:24}}>Chưa có dữ liệu</td></tr>}
              {records.map(r=>{
                const cp = (r.complains||[]).map(c=>`${c.loai}×${c.soKH}`).join(', ')
                return <tr key={r.id} onClick={()=>setDetail(r)} style={{cursor:'pointer'}}>
                  <td style={{whiteSpace:'nowrap'}}>{fmtDate(r.ngay)}</td>
                  <td><span className={`pill pill-${r.type.toLowerCase()}`}>{r.type}</span></td>
                  <td style={{fontWeight:600,whiteSpace:'nowrap'}}>{r.staff_name}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:12}}>{r.ca}</td>
                  <td style={{fontWeight:700,whiteSpace:'nowrap'}}>{fmt(r.dt)}</td>
                  <td>{r.type==='KTV'?r.tyc:'-'}</td>
                  <td>{r.type==='KTV'?r.tkm:r.tkm}</td>
                  <td>{r.type==='KTV'?r.tkc:r.tkc}</td>
                  <td style={{fontWeight:700}}>{r.type==='KTV'?r.ttour:'-'}</td>
                  <td>{r.type==='TVV'?r.ttour:'-'}</td>
                  <td>{r.type==='TVV'?(r.chot||0):'-'}</td>
                  <td>{r.tc||0}</td>
                  <td>{r.type==='KTV'?r.vn:'-'}</td>
                  <td>{r.type==='KTV'?r.vd:'-'}</td>
                  <td>{r.type==='KTV'?r.up:'-'}</td>
                  <td>{r.type==='KTV'?r.fg:'-'}</td>
                  <td style={{fontSize:12,color:'var(--red)'}}>{r.type==='KTV'?cp:'-'}</td>
                  <td style={{fontSize:12,color:'var(--muted)',maxWidth:120}}>{r.note||r.lydo||''}</td>
                  <td><button onClick={(e)=>{e.stopPropagation(); deleteRecord(r.id)}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--red)',fontSize:16}}>×</button></td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (() => {
        const dRow = (label, value) => (
          <div style={{display:'flex',justifyContent:'space-between',gap:12,padding:'9px 0',borderBottom:'1px solid #f0f0f0'}}>
            <span style={{color:'#777',fontSize:14}}>{label}</span>
            <span style={{fontWeight:600,fontSize:14,textAlign:'right'}}>{value}</span>
          </div>
        )
        return (
          <div onClick={()=>setDetail(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:1000}}>
            <div onClick={e=>e.stopPropagation()} style={{background:'#fff',width:'100%',maxWidth:480,maxHeight:'88vh',overflowY:'auto',borderRadius:'16px 16px 0 0',padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:18}}>Chi tiết báo cáo</div>
                <button onClick={()=>setDetail(null)} style={{background:'none',border:'none',fontSize:26,cursor:'pointer',color:'#999',lineHeight:1}}>×</button>
              </div>

              {dRow('Ngày', fmtDate(detail.ngay))}
              {dRow('Nhân viên', `${detail.staff_name} (${detail.type})`)}
              {dRow('Ca', detail.ca)}
              {dRow('Doanh thu', fmt(detail.dt)+' đ')}

              {detail.type==='KTV' && <>
                {dRow('Tổng tour', `${detail.ttour}  (YC ${detail.tyc} · KM ${detail.tkm} · KC ${detail.tkc})`)}
                {dRow('Tăng ca', (detail.tc||0)+' phút')}
                {dRow('Video MKT', `Nhanh ${detail.vn} · Dài ${detail.vd}`)}
                {dRow('Upsell', detail.up)}
                {dRow('Feedback', `Google/FB ${detail.fg} · Video FB ${detail.fv}`)}
              </>}

              {detail.type==='TVV' && <>
                {dRow('Tổng khách', `${detail.ttour}  (Mới ${detail.tkm} · Cũ ${detail.tkc})`)}
                {dRow('Đã chốt', detail.chot||0)}
                {dRow('Tăng ca', (detail.tc||0)+' phút')}
                {detail.lydo && dRow('Lý do chưa chốt', detail.lydo)}
              </>}

              {detail.type==='KTV' && detail.complains?.length>0 && (
                <div style={{marginTop:14}}>
                  <div style={{color:'var(--red)',fontWeight:700,marginBottom:6}}>⚠ Complain ({detail.complains.length})</div>
                  {detail.complains.map((c,i)=>(
                    <div key={i} style={{background:'#fff5f5',border:'1px solid #ffd6d6',borderRadius:8,padding:'8px 10px',marginBottom:6}}>
                      <div style={{fontWeight:600,fontSize:14}}>{c.loai} · {c.soKH} khách</div>
                      {c.lydo && <div style={{fontSize:13,color:'#555',marginTop:2}}>Lý do: {c.lydo}</div>}
                    </div>
                  ))}
                </div>
              )}

              {detail.note && (
                <div style={{marginTop:14}}>
                  <div style={{color:'#777',fontSize:13,marginBottom:4}}>Ghi chú</div>
                  <div style={{fontSize:14,background:'#f7f7f7',borderRadius:8,padding:'8px 10px',whiteSpace:'pre-wrap'}}>{detail.note}</div>
                </div>
              )}

              <button onClick={()=>setDetail(null)} className="btn btn-secondary" style={{width:'100%',marginTop:16}}>Đóng</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ── STATS ── */
function Stats() {
  const [records, setRecords] = useState([])
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0,7))
  const [filterType, setFilterType] = useState('')

  useEffect(() => { fetchAll() }, [filterMonth, filterType])

  async function fetchAll() {
    let q = supabase.from('records').select('*')
    if (filterMonth) { const mb = monthBounds(filterMonth); q = q.gte('ngay', mb.start).lt('ngay', mb.end) }
    if (filterType) q = q.eq('type', filterType)
    const { data } = await q
    setRecords(data||[])
  }

  const ktv = records.filter(r=>r.type==='KTV')
  const tvv = records.filter(r=>r.type==='TVV')
  const totalDT = records.reduce((s,r)=>s+r.dt,0)
  const totalTour = ktv.reduce((s,r)=>s+r.ttour,0)
  const totalYC = ktv.reduce((s,r)=>s+(r.tyc||0),0)
  const totalKM = ktv.reduce((s,r)=>s+(r.tkm||0),0)
  const totalKC = ktv.reduce((s,r)=>s+(r.tkc||0),0)
  const totalTC = records.reduce((s,r)=>s+(r.tc||0),0)
  const totalVN = ktv.reduce((s,r)=>s+(r.vn||0),0)
  const totalVD = ktv.reduce((s,r)=>s+(r.vd||0),0)
  const totalFG = ktv.reduce((s,r)=>s+(r.fg||0),0)
  const totalCP = ktv.reduce((s,r)=>s+(r.complains||[]).reduce((a,c)=>a+(c.soKH||1),0),0)
  const totalChot = tvv.reduce((s,r)=>s+(r.chot||0),0)
  const totalTVV_k = tvv.reduce((s,r)=>s+r.ttour,0)
  const tyLe = totalTVV_k>0 ? Math.round(totalChot/totalTVV_k*100) : 0

  // by person
  const byP = {}
  records.forEach(r=>{
    const k = r.staff_name+'|'+r.type
    if(!byP[k]) byP[k]={name:r.staff_name,type:r.type,dt:0,tour:0,yc:0,km:0,kc:0,tc:0,vn:0,vd:0,fg:0,up:0,cp:0,chot:0,days:new Set()}
    const p=byP[k]
    p.dt+=r.dt; p.tour+=r.ttour; p.yc+=(r.tyc||0); p.km+=(r.tkm||0); p.kc+=(r.tkc||0)
    p.tc+=(r.tc||0); p.vn+=(r.vn||0); p.vd+=(r.vd||0); p.fg+=(r.fg||0); p.up+=(r.up||0)
    p.cp+=(r.complains||[]).reduce((a,c)=>a+(c.soKH||1),0)
    p.chot+=(r.chot||0); p.days.add(r.ngay)
  })
  const persons = Object.values(byP).sort((a,b)=>b.dt-a.dt)

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{width:'auto'}}/>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{width:'auto'}}>
          <option value="">Tất cả</option><option value="KTV">KTV</option><option value="TVV">TVV</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="s-label">Tổng doanh thu</div><div className="s-val" style={{fontSize:18}}>{fmt(totalDT)}</div><div className="s-sub">VNĐ</div></div>
        <div className="stat-card"><div className="s-label">Tour KTV</div><div className="s-val">{totalTour}</div><div className="s-sub">YC {totalYC} · KM {totalKM} · KC {totalKC}</div></div>
        <div className="stat-card"><div className="s-label">Chốt TVV</div><div className="s-val">{tyLe}%</div><div className="s-sub">{totalChot}/{totalTVV_k} khách</div></div>
        <div className="stat-card"><div className="s-label">Tăng ca</div><div className="s-val">{totalTC}</div><div className="s-sub">phút</div></div>
        <div className="stat-card"><div className="s-label">Video MKT</div><div className="s-val">{totalVN+totalVD}</div><div className="s-sub">Nhanh {totalVN} · Dài {totalVD}</div></div>
        <div className="stat-card"><div className="s-label">Google/FB</div><div className="s-val">{totalFG}</div><div className="s-sub">lượt</div></div>
        <div className="stat-card"><div className="s-label">Complain</div><div className="s-val" style={{color:'var(--red)'}}>{totalCP}</div><div className="s-sub">lượt</div></div>
      </div>

      <div style={{fontWeight:700,marginBottom:10}}>Chi tiết theo nhân viên</div>
      <div className="tbl-wrap">
        <table>
          <thead><tr>
            <th>Tên</th><th>Loại</th><th>Ngày làm</th><th>Doanh thu</th>
            <th>YC</th><th>KM</th><th>KC</th><th>Tour/KH</th>
            <th>Chốt</th><th>TC(ph)</th><th>V.Nhanh</th><th>V.Dài</th><th>Upsell</th><th>G/FB</th><th>Complain</th>
          </tr></thead>
          <tbody>
            {persons.map((p,i)=>(
              <tr key={i}>
                <td style={{fontWeight:700}}>{p.name}</td>
                <td><span className={`pill pill-${p.type.toLowerCase()}`}>{p.type}</span></td>
                <td>{p.days.size} ngày</td>
                <td style={{fontWeight:700}}>{fmt(p.dt)}</td>
                <td>{p.type==='KTV'?p.yc:'-'}</td>
                <td>{p.km}</td>
                <td>{p.type==='KTV'?p.kc:'-'}</td>
                <td style={{fontWeight:700}}>{p.tour}</td>
                <td>{p.type==='TVV'?p.chot:'-'}</td>
                <td>{p.tc}</td>
                <td>{p.type==='KTV'?p.vn:'-'}</td>
                <td>{p.type==='KTV'?p.vd:'-'}</td>
                <td>{p.type==='KTV'?p.up:'-'}</td>
                <td>{p.type==='KTV'?p.fg:'-'}</td>
                <td style={{color:p.cp>0?'var(--red)':'inherit'}}>{p.type==='KTV'?p.cp:'-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── STAFF MANAGER ── */
function StaffManager() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('KTV')
  const [newNote, setNewNote] = useState('')
  const [newPin, setNewPin] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchStaff() }, [])

  async function fetchStaff() {
    const { data } = await supabase.from('staff').select('*').order('role').order('name')
    setStaff(data||[])
    setLoading(false)
  }

  async function addStaff() {
    if (!newName.trim()) return
    setAdding(true)
    const { data } = await supabase.from('staff').insert({name:newName.trim(),role:newRole,note:newNote.trim(),pin:newPin.trim(),active:true}).select().single()
    if (data) setStaff(prev=>[...prev,data])
    setNewName(''); setNewNote(''); setNewPin(''); setAdding(false)
  }

  async function setPin(s) {
    const v = prompt(`Đặt/đổi mã PIN cho ${s.name} (để trống = bỏ khoá, ai cũng vào được):`, s.pin||'')
    if (v===null) return
    const pin = v.trim()
    await supabase.from('staff').update({pin}).eq('id',s.id)
    setStaff(prev=>prev.map(x=>x.id===s.id?{...x,pin}:x))
  }

  async function toggleActive(s) {
    await supabase.from('staff').update({active:!s.active}).eq('id',s.id)
    setStaff(prev=>prev.map(x=>x.id===s.id?{...x,active:!s.active}:x))
  }

  async function deleteStaff(id) {
    if (!confirm('Xoá nhân viên này? Dữ liệu báo cáo vẫn được giữ lại.')) return
    await supabase.from('staff').delete().eq('id',id)
    setStaff(prev=>prev.filter(s=>s.id!==id))
  }

  return (
    <div>
      <div className="card mb16" style={{padding:'16px'}}>
        <div style={{fontWeight:700,marginBottom:12}}>➕ Thêm nhân viên</div>
        <div className="grid2 mb8">
          <div><label className="label">Họ tên</label><input placeholder="Nguyễn Văn A" value={newName} onChange={e=>setNewName(e.target.value)}/></div>
          <div><label className="label">Vai trò</label>
            <select value={newRole} onChange={e=>setNewRole(e.target.value)}>
              <option value="KTV">KTV – Kỹ thuật viên</option>
              <option value="TVV">TVV – Tư vấn viên</option>
            </select>
          </div>
        </div>
        <div className="grid2 mb12">
          <div><label className="label">Ghi chú (tuỳ chọn)</label><input placeholder="vd: chuyên triệt, ca sáng..." value={newNote} onChange={e=>setNewNote(e.target.value)}/></div>
          <div><label className="label">Mã PIN (tuỳ chọn)</label><input inputMode="numeric" placeholder="vd: 2468" value={newPin} onChange={e=>setNewPin(e.target.value)}/></div>
        </div>
        <button className="btn btn-primary" onClick={addStaff} disabled={adding||!newName.trim()}>
          {adding?'Đang thêm...':'+ Thêm'}
        </button>
      </div>

      {loading ? <div className="text-center text-muted">Đang tải...</div> : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {staff.map(s=>(
            <div key={s.id} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',opacity:s.active?1:.5}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className={`pill pill-${s.role.toLowerCase()}`}>{s.role}</span>
                <div>
                  <div style={{fontWeight:700}}>{s.name}</div>
                  {s.note&&<div style={{fontSize:12,color:'var(--muted)'}}>{s.note}</div>}
                  <div style={{fontSize:12,color:s.pin?'var(--green,#1a8a4a)':'var(--muted)',marginTop:2}}>
                    {s.pin ? `🔒 PIN: ${s.pin}` : '🔓 Chưa đặt PIN (ai cũng vào được)'}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
                <button className="btn btn-secondary btn-sm" onClick={()=>setPin(s)}>PIN</button>
                <button className={`btn btn-sm ${s.active?'btn-secondary':'btn-green'}`} onClick={()=>toggleActive(s)}>
                  {s.active?'Ẩn':'Hiện'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteStaff(s.id)}>Xoá</button>
              </div>
            </div>
          ))}
          {staff.length===0&&<div className="text-center text-muted">Chưa có nhân viên</div>}
        </div>
      )}
    </div>
  )
}
