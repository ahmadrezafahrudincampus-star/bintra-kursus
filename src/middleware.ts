import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session (JANGAN tambahkan kode lain di antara ini)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Route yanng memerlukan autentikasi
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isAdminRoute = pathname.startsWith('/admin')
    const isAuthRoute =
        pathname.startsWith('/login') || pathname.startsWith('/register')

    // Jika belum login dan mengakses dashboard/admin -> redirect ke login
    if (!user && (isDashboardRoute || isAdminRoute)) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // Jika sudah login dan mengakses halaman auth -> redirect sesuai role
    if (user && isAuthRoute) {
        // Ambil role dari tabel profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role ?? 'applicant'
        const url = request.nextUrl.clone()

        if (role === 'super_admin') {
            url.pathname = '/admin'
        } else {
            url.pathname = '/dashboard'
        }
        return NextResponse.redirect(url)
    }

    // Jika mengakses /admin dan bukan super_admin -> redirect ke dashboard
    if (user && isAdminRoute) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'super_admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
