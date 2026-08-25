import { type Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { LogOut, LayoutDashboard } from 'lucide-react'

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, flash } = usePage()
  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) {
      toast.error(flash.error)
    }
    if (flash.success) {
      toast.success(flash.success)
    }
  })

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div>
            <Link route="home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="school-crest-badge" style={{ background: '#ffffff', border: '1px solid rgba(255,255,255,0.8)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
                <img
                  src="/images/logo_sk_beringis.png"
                  alt="Logo SK Beringis Papar"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <span className="brand-title" style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                SK BERINGIS PORTAL
              </span>
            </Link>
          </div>
          <div>
            <nav style={{ gap: '8px' }}>
              {children.props.user ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <LayoutDashboard size={13} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#e2f0eb',
                      color: '#2d7a5f',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      flexShrink: 0
                    }}>
                      {children.props.user.initials}
                    </div>
                  </div>

                  <Form route="session.destroy">
                    <button type="submit" style={{
                      background: 'transparent',
                      border: '1px solid rgba(226, 240, 235, 0.4)',
                      borderRadius: '8px',
                      padding: '5px 8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: '#e2f0eb'
                    }}>
                      <LogOut size={12} />
                      <span className="hidden sm:inline">Keluar</span>
                    </button>
                  </Form>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      </header>
      <main style={{ padding: '0' }}>{children}</main>
      <Toaster position="top-center" richColors />
    </>
  )
}

