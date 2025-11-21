"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don&apos;t have permission to access this resource.</p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-primary hover:bg-primary/50 text-primary-foreground"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
