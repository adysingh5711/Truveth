import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 48, fontWeight: 700, color: '#00c853', marginBottom: 16 }}>
                    Truveth
                </div>
                <div style={{ fontSize: 28, color: '#ffffff', marginBottom: 8 }}>
                    Certificate #{params.id}
                </div>
                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>
                    Blockchain-verified credential
                </div>
            </div>
        ),
        { ...size }
    )
}