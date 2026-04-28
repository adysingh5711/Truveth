/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true,  // enables SWC transform for styled-components
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ipfs.io",  // for future certificate assets
            }
        ]
    },
    // if deploying to gh-pages as static export:
    output: 'export',
    trailingSlash: true,
}