import Nav from "@/components/Nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <main>{children}</main>
    </div>
  )
}
