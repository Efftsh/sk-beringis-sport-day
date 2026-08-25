import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

export default function Login() {
  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: 'clamp(24px, 5vw, 36px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/images/logo_sk_beringis.png"
            alt="Logo SK Beringis Papar"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              marginBottom: '12px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            }}
          />
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
            Log Masuk Pegawai
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
            Akses khas untuk Guru, Hakim Acara & Urusetia SK Beringis sahaja.
          </p>
        </div>

        <Form route="session.store">
          {({ errors }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Alamat Emel Rasmi
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="nama@skberingis.edu.my"
                    autoComplete="username"
                    data-invalid={errors.email ? 'true' : undefined}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: errors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.email && (
                  <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Kata Laluan
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: errors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.password && (
                  <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'var(--forest-green)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(45, 122, 95, 0.25)',
                  marginTop: '4px',
                }}
              >
                Log Masuk Sistem
              </button>
            </div>
          )}
        </Form>

        {/* Public Visitor Notice & Return Button */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            Ibu bapa dan penonton tidak perlu log masuk untuk melihat keputusan sukan.
          </p>
          <Link
            route="home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--forest-green)',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Portal Keputusan Langsung</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

