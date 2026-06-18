import './globals.css'

export const metadata = {
  title: 'Báo cáo ngày | Spa',
  description: 'Hệ thống báo cáo nhân viên',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
