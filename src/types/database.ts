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
export type Announcement = Database['public']['Tables']['announcements']['Row']

export type UserRole = Profile['role']
export type RegistrationStatus = Registration['status']
export type InvoiceStatus = Invoice['status']
export type PaymentProofStatus = PaymentProof['status']
export type AttendanceStatus = Attendance['status']

