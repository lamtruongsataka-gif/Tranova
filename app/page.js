'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [pinFor, setPinFor] = useState(null)
  const [pinInput, setPinInput] = useState('')
  const [pinErr, setPinErr] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('active', true)
      .order('name')
    setStaff(data || [])
    setLoading(false)
  }

  function selectStaff(s) {
    if (s.pin && String(s.pin).trim() !== '') {
      setPinFor(s); setPinInput(''); setPinErr('')
    } else {
      enter(s)
    }
  }

  function enter(s) {
    localStorage.setItem('spa_user', JSON.stringify(s))
    router.push('/report')
  }

  function submitPin() {
    if (pinInput.trim() === String(pinFor.pin).trim()) {
      enter(pinFor)
    } else {
      setPinErr('Mã PIN không đúng, thử lại')
    }
  }

  const ktvList = staff.filter(s => s.role === 'KTV')
  const tvvList = staff.filter(s => s.role === 'TVV')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(135deg,#1877F2,#0A52C2)', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)', letterSpacing: '.1em', marginBottom: 8 }}>✦ HỆ THỐNG BÁO CÁO</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Chọn tên của bạn</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>để bắt đầu nhập báo cáo ngày</div>
      </div>

      <div className="page-wrap">
        {loading ? (
          <div className="text-center text-muted mt16">Đang tải danh sách...</div>
        ) : (
          <>
            {ktvList.length > 0 && (
              <div className="mb16">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="pill pill-ktv">KTV</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Kỹ thuật viên</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ktvList.map(s => (
                    <button key={s.id} className="card" onClick={() => selectStaff(s)}
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', textAlign: 'left' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                        {s.note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.note}</div>}
                      </div>
                      <div style={{ fontSize: 18, color: 'var(--muted)' }}>›</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tvvList.length > 0 && (
              <div className="mb16">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span className="pill pill-tvv">TVV</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Tư vấn viên</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tvvList.map(s => (
                    <button key={s.id} className="card" onClick={() => selectStaff(s)}
                      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', textAlign: 'left' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                        {s.note && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.note}</div>}
                      </div>
                      <div style={{ fontSize: 18, color: 'var(--muted)' }}>›</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {staff.length === 0 && (
              <div className="card text-center" style={{ padding: 32, color: 'var(--muted)' }}>
                Chưa có nhân viên nào.<br />
                <a href="/admin" style={{ color: 'var(--accent)', fontWeight: 600 }}>Vào trang Admin để thêm →</a>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <a href="/admin" style={{ fontSize: 12, color: 'var(--muted)' }}>⚙ Trang quản lý (Admin)</a>
            </div>
          </>
        )}
      </div>

      {pinFor && (
        <div onClick={()=>setPinFor(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',width:'100%',maxWidth:340,borderRadius:16,padding:24,textAlign:'center'}}>
            <div style={{fontSize:14,color:'var(--muted)'}}>Nhập mã PIN của</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:16}}>{pinFor.name}</div>
            <input autoFocus type="password" inputMode="numeric" value={pinInput}
              onChange={e=>{setPinInput(e.target.value); setPinErr('')}}
              onKeyDown={e=>{ if(e.key==='Enter') submitPin() }}
              placeholder="••••"
              style={{width:'100%',textAlign:'center',fontSize:24,letterSpacing:'0.3em',padding:'12px',border:'1.5px solid var(--border)',borderRadius:10,boxSizing:'border-box'}}/>
            {pinErr && <div style={{color:'var(--red)',fontSize:13,marginTop:8}}>{pinErr}</div>}
            <button onClick={submitPin} className="btn btn-primary" style={{width:'100%',marginTop:16}}>Vào</button>
            <button onClick={()=>setPinFor(null)} className="btn btn-secondary" style={{width:'100%',marginTop:8}}>Huỷ</button>
          </div>
        </div>
      )}
    </div>
  )
}
