import './globals.css'

export const metadata = {
  title: 'Walter Farm - 支付系统',
  description: '马来西亚支付闭环系统 - FPX | TNG | DuitNow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <header style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ margin: 0 }}>Walter Farm 支付系统</h1>
            <nav style={{ marginTop: '0.5rem' }}>
              <a href="/" style={{ color: 'white', marginRight: '1rem' }}>首页</a>
              <a href="/booking" style={{ color: 'white', marginRight: '1rem' }}>预订</a>
              <a href="/login" style={{ color: 'white', marginRight: '1rem' }}>登录</a>
              <a href="/admin" style={{ color: 'white' }}>管理</a>
            </nav>
          </div>
        </header>
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
        <footer style={{ padding: '1rem', background: '#f5f5f5', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p>© 2024 Walter Farm - FPX | TNG | DuitNow 支付集成</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              当前环境: {process.env.NODE_ENV} | 版本: 1.0.0
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
