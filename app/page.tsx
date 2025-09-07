import { Suspense } from "react"
import { AdDashboard } from "@/components/ad-dashboard"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
          <AdDashboard />
        </Suspense>
      </main>
    </div>
  )
}
