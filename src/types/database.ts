export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    phone: string | null
                    role: 'super_admin' | 'applicant' | 'student'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    phone?: string | null
                    role?: 'super_admin' | 'applicant' | 'student'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    phone?: string | null
                    role?: 'super_admin' | 'applicant' | 'student'
                    avatar_url?: string | null
                    updated_at?: string
                }
            }
            course_master: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    level: 'pemula' | 'menengah' | 'lanjut'
                    price_smp: number
                    price_sma: number
                    price_umum: number
                    estimated_meetings: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    level: 'pemula' | 'menengah' | 'lanjut'
                    price_smp?: number
                    price_sma?: number
                    price_umum?: number
                    estimated_meetings?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    name?: string
                    description?: string | null
                    level?: 'pemula' | 'menengah' | 'lanjut'
                    price_smp?: number
                    price_sma?: number
                    price_umum?: number
                    estimated_meetings?: string | null
                    is_active?: boolean
                }
            }
            sessions: {
                Row: {
                    id: string
                    course_id: string
                    name: string
                    instructor_name: string | null
                    room: string | null
                    day_of_week: string
                    start_time: string
                    end_time: string
                    max_capacity: number
                    current_count: number
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    course_id: string
                    name: string
                    instructor_name?: string | null
                    room?: string | null
                    day_of_week: string
                    start_time: string
                    end_time: string
                    max_capacity?: number
                    current_count?: number
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    name?: string
                    instructor_name?: string | null
                    room?: string | null
                    day_of_week?: string
                    start_time?: string
                    end_time?: string
                    max_capacity?: number
                    current_count?: number
                    is_active?: boolean
                }
            }
            registrations: {
                Row: {
                    id: string
                    profile_id: string
                    reg_number: string
                    full_name: string
                    gender: 'L' | 'P'
                    birth_date: string
                    phone: string
                    email: string | null
                    address: string
                    school_name: string
                    participant_category: 'SMP' | 'SMA' | 'Umum'
                    class_name: string | null
                    parent_name: string | null
                    parent_phone: string | null
                    course_id: string
                    preferred_session_id: string | null
                    experience: string | null
                    goals: string | null
                    document_url: string | null
                    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
                    rejection_reason: string | null
                    reviewed_by: string | null
                    reviewed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    reg_number?: string
                    full_name: string
                    gender: 'L' | 'P'
                    birth_date: string
                    phone: string
                    email?: string | null
                    address: string
                    school_name: string
                    participant_category: 'SMP' | 'SMA' | 'Umum'
                    class_name?: string | null
                    parent_name?: string | null
                    parent_phone?: string | null
                    course_id: string
                    preferred_session_id?: string | null
                    experience?: string | null
                    goals?: string | null
                    document_url?: string | null
                    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
                    rejection_reason?: string | null
                }
                Update: {
                    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
                    rejection_reason?: string | null
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    updated_at?: string
                }
            }
            student_enrollments: {
                Row: {
                    id: string
                    profile_id: string
                    session_id: string
                    registration_id: string
                    participant_category: 'SMP' | 'SMA' | 'Umum'
                    status: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
                    enrolled_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    session_id: string
                    registration_id: string
                    participant_category: 'SMP' | 'SMA' | 'Umum'
                    status?: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
                    enrolled_at?: string
                }
                Update: {
                    session_id?: string
                    status?: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
                }
            }
            invoices: {
                Row: {
                    id: string
                    profile_id: string
                    enrollment_id: string
                    invoice_number: string
                    amount: number
                    period_month: number
                    period_year: number
                    due_date: string
                    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
                    paid_at: string | null
                    verified_by: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    enrollment_id: string
                    invoice_number?: string
                    amount: number
                    period_month: number
                    period_year: number
                    due_date: string
                    status?: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
                    notes?: string | null
                }
                Update: {
                    status?: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
                    paid_at?: string | null
                    verified_by?: string | null
                    notes?: string | null
                    updated_at?: string
                }
            }
            payment_proofs: {
                Row: {
                    id: string
                    invoice_id: string
                    uploaded_by: string
                    file_url: string
                    period_month: number
                    period_year: number
                    amount: number
                    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    admin_note: string | null
                    officer_name: string | null
                    verified_by: string | null
                    verified_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    uploaded_by: string
                    file_url: string
                    period_month: number
                    period_year: number
                    amount: number
                    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    admin_note?: string | null
                    officer_name?: string | null
                }
                Update: {
                    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    admin_note?: string | null
                    officer_name?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                }
            }
            attendances: {
                Row: {
                    id: string
                    enrollment_id: string
                    session_id: string
                    date: string
                    meeting_number: number
                    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'
                    notes: string | null
                    recorded_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    enrollment_id: string
                    session_id: string
                    date: string
                    meeting_number: number
                    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'
                    notes?: string | null
                    recorded_by: string
                    created_at?: string
                }
                Update: {
                    status?: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'
                    notes?: string | null
                }
            }
            course_materials: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    description: string | null
                    file_url: string | null
                    external_url: string | null
                    material_type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
                    order_index: number
                    is_published: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    course_id: string
                    title: string
                    description?: string | null
                    file_url?: string | null
                    external_url?: string | null
                    material_type?: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
                    order_index?: number
                    is_published?: boolean
                }
                Update: {
                    title?: string
                    description?: string | null
                    file_url?: string | null
                    external_url?: string | null
                    material_type?: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
                    order_index?: number
                    is_published?: boolean
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    actor_id: string
                    action: string
                    target_type: string | null
                    target_id: string | null
                    details: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    actor_id: string
                    action: string
                    target_type?: string | null
                    target_id?: string | null
                    details?: Json | null
                }
                Update: never
            }
            media_assets: {
                Row: {
                    id: string
                    file_name: string
                    file_path: string
                    public_url: string
                    alt_text: string | null
                    mime_type: string | null
                    size_bytes: number | null
                    category: string | null
                    uploaded_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    file_name: string
                    file_path: string
                    public_url: string
                    alt_text?: string | null
                    mime_type?: string | null
                    size_bytes?: number | null
                    category?: string | null
                    uploaded_by?: string | null
                    created_at?: string
                }
                Update: {
                    file_name?: string
                    file_path?: string
                    public_url?: string
                    alt_text?: string | null
                    mime_type?: string | null
                    size_bytes?: number | null
                    category?: string | null
                    uploaded_by?: string | null
                }
            }
            announcements: {
                Row: {
                    id: string
                    title: string
                    content: string
                    target_session_id: string | null
                    is_active: boolean
                    created_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    target_session_id?: string | null
                    is_active?: boolean
                    created_by: string
                    created_at?: string
                }
                Update: {
                    title?: string
                    content?: string
                    target_session_id?: string | null
                    is_active?: boolean
                }
            }
            landing_page_content: {
                Row: {
                    id: string
                    site_name: string
                    navbar_logo_text: string
                    navbar_logo_image_url: string | null
                    navbar_logo_image_alt: string | null
                    navigation_items: Json
                    hero_badge: string
                    hero_badge_icon: string | null
                    hero_title_prefix: string
                    hero_title_accent: string
                    hero_title_suffix: string
                    hero_description: string
                    hero_primary_cta_text: string | null
                    hero_primary_cta_url: string | null
                    hero_secondary_cta_text: string | null
                    hero_secondary_cta_url: string | null
                    hero_image_url: string | null
                    hero_image_alt: string | null
                    hero_floating_cards: Json
                    stats_items: Json
                    why_badge: string | null
                    why_title: string | null
                    why_description: string | null
                    why_items: Json
                    programs_badge: string | null
                    programs_title: string | null
                    programs_description: string | null
                    program_items: Json
                    showcase_badge: string | null
                    showcase_title: string | null
                    showcase_description: string | null
                    showcase_cta_text: string | null
                    showcase_cta_url: string | null
                    showcase_features: Json
                    showcase_images: Json
                    pricing_badge: string | null
                    pricing_title: string | null
                    pricing_description: string | null
                    pricing_note: string | null
                    pricing_plans: Json
                    flow_badge: string | null
                    flow_title: string | null
                    flow_description: string | null
                    flow_steps: Json
                    testimonials_badge: string | null
                    testimonials_title: string | null
                    testimonials_description: string | null
                    testimonials_items: Json
                    faq_badge: string | null
                    faq_title: string
                    faq_description: string
                    faq_items: Json
                    cta_title: string | null
                    cta_description: string | null
                    cta_primary_text: string | null
                    cta_primary_url: string | null
                    cta_secondary_text: string | null
                    cta_secondary_url: string | null
                    footer_description: string | null
                    footer_program_title: string | null
                    contact_phone: string | null
                    contact_email: string | null
                    contact_address: string | null
                    contact_hours: string | null
                    social_links: Json
                    footer_quick_links: Json
                    footer_program_links: Json
                    footer_copyright: string | null
                    footer_policy_text: string | null
                    footer_policy_url: string | null
                    footer_terms_text: string | null
                    footer_terms_url: string | null
                    seo_meta_title: string | null
                    seo_meta_description: string | null
                    seo_meta_keywords: string | null
                    seo_og_title: string | null
                    seo_og_description: string | null
                    seo_og_image_url: string | null
                    seo_favicon_url: string | null
                    updated_by: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    site_name: string
                    navbar_logo_text: string
                    navbar_logo_image_url?: string | null
                    navbar_logo_image_alt?: string | null
                    navigation_items?: Json
                    hero_badge: string
                    hero_badge_icon?: string | null
                    hero_title_prefix: string
                    hero_title_accent: string
                    hero_title_suffix: string
                    hero_description: string
                    hero_primary_cta_text?: string | null
                    hero_primary_cta_url?: string | null
                    hero_secondary_cta_text?: string | null
                    hero_secondary_cta_url?: string | null
                    hero_image_url?: string | null
                    hero_image_alt?: string | null
                    hero_floating_cards?: Json
                    stats_items?: Json
                    why_badge?: string | null
                    why_title?: string | null
                    why_description?: string | null
                    why_items?: Json
                    programs_badge?: string | null
                    programs_title?: string | null
                    programs_description?: string | null
                    program_items?: Json
                    showcase_badge?: string | null
                    showcase_title?: string | null
                    showcase_description?: string | null
                    showcase_cta_text?: string | null
                    showcase_cta_url?: string | null
                    showcase_features?: Json
                    showcase_images?: Json
                    pricing_badge?: string | null
                    pricing_title?: string | null
                    pricing_description?: string | null
                    pricing_note?: string | null
                    pricing_plans?: Json
                    flow_badge?: string | null
                    flow_title?: string | null
                    flow_description?: string | null
                    flow_steps?: Json
                    testimonials_badge?: string | null
                    testimonials_title?: string | null
                    testimonials_description?: string | null
                    testimonials_items?: Json
                    faq_badge?: string | null
                    faq_title: string
                    faq_description: string
                    faq_items?: Json
                    cta_title?: string | null
                    cta_description?: string | null
                    cta_primary_text?: string | null
                    cta_primary_url?: string | null
                    cta_secondary_text?: string | null
                    cta_secondary_url?: string | null
                    footer_description?: string | null
                    footer_program_title?: string | null
                    contact_phone?: string | null
                    contact_email?: string | null
                    contact_address?: string | null
                    contact_hours?: string | null
                    social_links?: Json
                    footer_quick_links?: Json
                    footer_program_links?: Json
                    footer_copyright?: string | null
                    footer_policy_text?: string | null
                    footer_policy_url?: string | null
                    footer_terms_text?: string | null
                    footer_terms_url?: string | null
                    seo_meta_title?: string | null
                    seo_meta_description?: string | null
                    seo_meta_keywords?: string | null
                    seo_og_title?: string | null
                    seo_og_description?: string | null
                    seo_og_image_url?: string | null
                    seo_favicon_url?: string | null
                    updated_by?: string | null
                    updated_at?: string
                }
                Update: {
                    site_name?: string
                    navbar_logo_text?: string
                    navbar_logo_image_url?: string | null
                    navbar_logo_image_alt?: string | null
                    navigation_items?: Json
                    hero_badge?: string
                    hero_badge_icon?: string | null
                    hero_title_prefix?: string
                    hero_title_accent?: string
                    hero_title_suffix?: string
                    hero_description?: string
                    hero_primary_cta_text?: string | null
                    hero_primary_cta_url?: string | null
                    hero_secondary_cta_text?: string | null
                    hero_secondary_cta_url?: string | null
                    hero_image_url?: string | null
                    hero_image_alt?: string | null
                    hero_floating_cards?: Json
                    stats_items?: Json
                    why_badge?: string | null
                    why_title?: string | null
                    why_description?: string | null
                    why_items?: Json
                    programs_badge?: string | null
                    programs_title?: string | null
                    programs_description?: string | null
                    program_items?: Json
                    showcase_badge?: string | null
                    showcase_title?: string | null
                    showcase_description?: string | null
                    showcase_cta_text?: string | null
                    showcase_cta_url?: string | null
                    showcase_features?: Json
                    showcase_images?: Json
                    pricing_badge?: string | null
                    pricing_title?: string | null
                    pricing_description?: string | null
                    pricing_note?: string | null
                    pricing_plans?: Json
                    flow_badge?: string | null
                    flow_title?: string | null
                    flow_description?: string | null
                    flow_steps?: Json
                    testimonials_badge?: string | null
                    testimonials_title?: string | null
                    testimonials_description?: string | null
                    testimonials_items?: Json
                    faq_badge?: string | null
                    faq_title?: string
                    faq_description?: string
                    faq_items?: Json
                    cta_title?: string | null
                    cta_description?: string | null
                    cta_primary_text?: string | null
                    cta_primary_url?: string | null
                    cta_secondary_text?: string | null
                    cta_secondary_url?: string | null
                    footer_description?: string | null
                    footer_program_title?: string | null
                    contact_phone?: string | null
                    contact_email?: string | null
                    contact_address?: string | null
                    contact_hours?: string | null
                    social_links?: Json
                    footer_quick_links?: Json
                    footer_program_links?: Json
                    footer_copyright?: string | null
                    footer_policy_text?: string | null
                    footer_policy_url?: string | null
                    footer_terms_text?: string | null
                    footer_terms_url?: string | null
                    seo_meta_title?: string | null
                    seo_meta_description?: string | null
                    seo_meta_keywords?: string | null
                    seo_og_title?: string | null
                    seo_og_description?: string | null
                    seo_og_image_url?: string | null
                    seo_favicon_url?: string | null
                    updated_by?: string | null
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'super_admin' | 'applicant' | 'student'
            registration_status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
            invoice_status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
            payment_proof_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
            attendance_status: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'
            enrollment_status: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
        }
    }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type CourseMaster = Database['public']['Tables']['course_master']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type StudentEnrollment = Database['public']['Tables']['student_enrollments']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type PaymentProof = Database['public']['Tables']['payment_proofs']['Row']
export type Attendance = Database['public']['Tables']['attendances']['Row']
export type CourseMaterial = Database['public']['Tables']['course_materials']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type LandingPageContent = Database['public']['Tables']['landing_page_content']['Row']

export type UserRole = Profile['role']
export type RegistrationStatus = Registration['status']
export type InvoiceStatus = Invoice['status']
export type PaymentProofStatus = PaymentProof['status']
export type AttendanceStatus = Attendance['status']

