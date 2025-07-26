"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PitchAnalysis {
  clarity_score: number
  suggestions: string[]
  local_tips: string[]
}

export function PitchPolisher() {
  const [pitch, setPitch] = useState("")
  const [analysis, setAnalysis] = useState<PitchAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const analyzePitch = async () => {
    if (!pitch.trim()) {
      toast({
        title: "Error",
        description: "Please enter your pitch first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/analyze-pitch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pitch }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze pitch")
      }

      const data = await response.json()
      setAnalysis(data)

      toast({
        title: "Analysis Complete!",
        description: "Your pitch has been analyzed with AI-powered insights",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze pitch. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI-Powered Pitch Polisher</h2>
        <p className="text-gray-600">
          Get instant feedback on your startup pitch with AI analysis tailored for the Ethiopian market
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Your Startup Pitch</span>
          </CardTitle>
          <CardDescription>Enter your 200-300 word startup pitch for AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Describe your startup, the problem you're solving, your solution, target market, and what makes you unique. Focus on the Ethiopian market context..."
            rows={8}
            className="resize-none"
          />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{pitch.length} characters</span>
            <Button onClick={analyzePitch} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Pitch
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Clarity Score</span>
                <Badge className={getScoreColor(analysis.clarity_score)}>{analysis.clarity_score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.clarity_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analysis.clarity_score >= 80 &&
                  "Excellent clarity! Your pitch is well-structured and easy to understand."}
                {analysis.clarity_score >= 60 &&
                  analysis.clarity_score < 80 &&
                  "Good clarity with room for improvement."}
                {analysis.clarity_score < 60 && "Consider simplifying your message for better clarity."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Ethiopian Market Context Tips</CardTitle>
              <CardDescription>Localized insights to help your startup succeed in Ethiopia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.local_tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 mt-1">💡</span>
                    <span className="text-sm text-green-800">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
