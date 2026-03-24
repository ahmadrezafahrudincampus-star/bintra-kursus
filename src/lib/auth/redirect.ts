const DEFAULT_REDIRECT = '/dashboard'

export function sanitizeRedirectPath(path?: string | null) {
    if (!path) return null
    if (!path.startsWith('/')) return null
    if (path.startsWith('//')) return null
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/auth')) {
        return null
    }

    return path
}

export function resolvePostLoginRedirect({
    role,
    redirectTo,
}: {
    role?: string | null
    redirectTo?: string | null
}) {
    const safeRedirect = sanitizeRedirectPath(redirectTo)

    if (role === 'super_admin') {
        if (safeRedirect?.startsWith('/admin')) {
            return safeRedirect
        }

        return '/admin'
    }

    return safeRedirect ?? DEFAULT_REDIRECT
}
