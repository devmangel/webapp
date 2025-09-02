'use client' // Error boundaries must be Client Components
import NotFound from './not-found'

export default function GlobalError({
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        // global-error must include html and body tags
        <html>
            <body>
                <NotFound />
            </body>
        </html>
    )
}