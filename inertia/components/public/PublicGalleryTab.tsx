import type { FC } from 'react'
import { Camera, ExternalLink, Sparkles, Image, Download, Eye, Users } from 'lucide-react'

interface PublicGalleryTabProps {
  url?: string
}

export const PublicGalleryTab: FC<PublicGalleryTabProps> = ({
  url = 'https://photos.app.goo.gl/ukTxVDzu1WZ4fiPcA',
}) => {
  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto 30px', padding: '0 16px' }}>
      {/* Hero Invitation Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '24px',
          padding: 'clamp(20px, 4vw, 36px)',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {/* Background Watermark */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-40px',
            opacity: 0.05,
            pointerEvents: 'none',
            color: '#ffffff',
          }}
        >
          <Camera size={260} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}
          >
            <Camera size={13} />
            <span>ALBUM FOTO RASMI KEJOHANAN</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(20px, 4.5vw, 32px)',
              fontWeight: 900,
              lineHeight: 1.25,
              marginBottom: '12px',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            Galeri Gambar & Detik Manis Kejohanan Olahraga SK Beringis
          </h2>

          <p
            style={{
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              lineHeight: 1.6,
              color: '#cbd5e1',
              marginBottom: '24px',
            }}
          >
            Saksikan dan muat turun koleksi gambar aksi atlet, sukaneka, perbarisan rumah sukan, dan
            majlis penyampaian pingat dalam kualiti definisi tinggi (HD) secara terus melalui Google
            Photos.
          </p>

          {/* Primary CTA Button */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease',
                minHeight: '46px',
              }}
            >
              <Camera size={18} />
              <span>Buka Galeri Foto (Google Photos)</span>
              <ExternalLink size={16} />
            </a>

            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Percuma untuk semua warga sekolah & ibu bapa
            </span>
          </div>
        </div>
      </div>

      {/* Feature Information Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Download size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Muat Turun Resolusi Asal
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Simpan gambar kenangan anak-anak dan kontinjen rumah sukan dengan resolusi asal tanpa
              mampatan kualiti.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Kemas Kini Berterusan
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Jurufoto kejohanan akan menambah gambar-gambar menarik sepanjang acara berlangsung dari
              semasa ke semasa.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Akses Perkongsian Terbuka
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Boleh diakses dan dikongsi terus kepada keluarga dan rakan-rakan di WhatsApp, Telegram,
              atau media sosial.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Quick Banner Link */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          border: '2px dashed #cbd5e1',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image size={28} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
            Klik pautan di bawah untuk melihat album penuh di Google Photos
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {url}
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
            marginTop: '6px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
          }}
        >
          <Eye size={15} />
          <span>Lihat Album Sekarang</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}

export default PublicGalleryTab
