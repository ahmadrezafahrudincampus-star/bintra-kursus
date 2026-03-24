import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePostLoginRedirect, sanitizeRedirectPath } from '@/lib/auth/redirect'

function buildLoginRedirect(request: NextRequest, error?: string) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'

    if (error) {
        url.searchParams.set('authError', error)
    }

    return url
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const errorDescription =
        requestUrl.searchParams.get('error_description') ?? requestUrl.searchParams.get('error')
    const redirectTo = sanitizeRedirectPath(requestUrl.searchParams.get('next'))

    if (errorDescription) {
        const url = buildLoginRedirect(request, errorDescription)

        if (redirectTo) {
            url.searchParams.set('redirectTo', redirectTo)
        }

        return NextResponse.redirect(url)
    }

    if (!code) {
        const url = buildLoginRedirect(request, 'Login sosial gagal diproses.')

        if (redirectTo) {
            url.searchParams.set('redirectTo', redirectTo)
        }

        return NextResponse.redirect(url)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        const url = buildLoginRedirect(request, 'Login sosial gagal. Silakan coba lagi.')

        if (redirectTo) {
            url.searchParams.set('redirectTo', redirectTo)
        }

        return NextResponse.redirect(url)
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        const url = buildLoginRedirect(request, 'Session login tidak ditemukan.')

        if (redirectTo) {
            url.searchParams.set('redirectTo', redirectTo)
        }

        return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()

    return NextResponse.redirect(
        new URL(
            resolvePostLoginRedirect({
                role: profile?.role,
                redirectTo,
            }),
            request.url
        )
    )
}
