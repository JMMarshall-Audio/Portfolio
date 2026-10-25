/** Tailwind build config — mirrors the old inline tailwind.config exactly
 *  (same colors, fonts, animations) so the prebuilt stylesheet renders
 *  pixel-identically to the Play CDN version it replaced.
 *
 *  Regenerate tailwind.css after any class changes:
 *    ./tailwindcss-cli -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
 *  The CLI is the standalone binary (no Node.js required) from
 *  https://github.com/tailwindlabs/tailwindcss/releases — keep it at
 *  v3.4.17 to match the version the site was designed against. */
module.exports = {
    // Scans the homepage, the published showcase page, the local drafts and
    // work.js (the Work grid is rendered live from the manifest, so its
    // classes can never appear in a static file). Rebuilding is additive:
    // every utility index.html used before stays in the output verbatim.
    content: ["./index.html", "./work-affection.html", "./drafts/*.html", "./work.js"],
    theme: {
        extend: {
            colors: {
                'stage-black': '#0c0c0b',
                'reel-card': '#161513',
                'reel-border': '#2b2925',
                'tape-cream': '#ede6d6',
                'tape-cream-dim': '#a8a294',
                'vu-amber': '#e8a33d',
                'vu-amber-dim': '#8a6a34',
                'rec-red': '#c1272d'
            },
            fontFamily: {
                'display': ['"Bebas Neue"', 'sans-serif'],
                'body': ['Inter', 'sans-serif'],
                'mono': ['"IBM Plex Mono"', 'monospace']
            },
            animation: {
                'blink': 'blink 1s steps(1) infinite',
                'reveal': 'reveal 0.7s ease-out forwards',
                'flicker': 'flicker 4s ease-in-out infinite'
            },
            keyframes: {
                blink: {
                    '0%, 49%': { opacity: '1' },
                    '50%, 100%': { opacity: '0.15' }
                },
                reveal: {
                    '0%': { transform: 'translateY(24px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                flicker: {
                    '0%, 100%': { opacity: '0.9' },
                    '92%': { opacity: '0.9' },
                    '93%': { opacity: '0.55' },
                    '94%': { opacity: '0.9' }
                }
            }
        }
    }
};
