import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Users, Database, LayoutDashboard, Disc3 } from 'lucide-react'

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkClearance = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return navigate('/login', { replace: true })

      // Pambabara ng mga hindi admin
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        alert("ACCESS DENIED: Required Admin Clearance.")
        return navigate('/dashboard', { replace: true })
      }
      
      setLoading(false)
    }
    checkClearance()
  }, [navigate])

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Disc3 className="animate-spin text-orange-500" size={40}/></div>

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44">
      <div className="max-w-4xl mx-auto pt-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-[1.5rem]"><ShieldAlert size={32} className="text-black" /></div>
            <div>
              <h1 className="text-4xl font-black tracking-tightest uppercase italic">Admin <span className="text-orange-500">HQ</span></h1>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Network Telemetry</p>
            </div>
          </div>
          <Link to="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
        </header>

        <section className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 text-center shadow-2xl">
           <Database size={60} className="mx-auto text-orange-500/50 mb-6 animate-pulse" />
           <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">System Online</h2>
           <p className="text-xs text-gray-500 uppercase tracking-widest">You have full access to the database.</p>
        </section>
      </div>
    </div>
  )
}