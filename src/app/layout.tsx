import './globals.css'
import StyledComponentsRegistry from '../lib/registry'
import Background3DWrapper from "../components/Background3DWrapper"

export const metadata = {
    title: 'Truveth',
    description: 'Blockchain-based certificate verification',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body>
                <StyledComponentsRegistry>
                    <Background3DWrapper />
                    {children}
                </StyledComponentsRegistry>
            </body>
        </html>
    )
}