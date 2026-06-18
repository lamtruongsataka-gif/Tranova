'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
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
    localStorage.setItem('spa_user', JSON.stringify(s))
    router.push('/report')
  }

  const ktvList = staff.filter(s => s.role === 'KTV')
  const tvvList = staff.filter(s => s.role === 'TVV')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'linear-gradient(135deg,#C96A3A,#8B3A1A)', padding: '32px 20px 28px', textAlign: 'center' }}>
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
    </div>
  )
}
