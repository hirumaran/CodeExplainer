import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_API_KEY, GEMINI_MODEL } from './config'
import mermaid from 'mermaid'
import './App.css'

mermaid.initialize({ startOnLoad: true })

function App() {
  const [code, setCode] = useState<string>('')
  const [explanation, setExplanation] = useState<string>('')
  const [diagram, setDiagram] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Debug API key loading
  useEffect(() => {
    console.log('API Key length:', GEMINI_API_KEY?.length || 0)
    console.log('API Key first 4 chars:', GEMINI_API_KEY?.substring(0, 4) || 'none')
  }, [])

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

  const explainCode = async () => {
    if (!code.trim()) return

    setLoading(true)
    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.')
      }

      console.log('Attempting to explain code with API key length:', GEMINI_API_KEY.length)
      
      const prompt = `Explain the following code in plain English and generate a Mermaid diagram showing the code structure:\n\n${code}`
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Split the response into explanation and diagram
      const parts = text.split('```mermaid')
      setExplanation(parts[0].trim())
      
      if (parts.length > 1) {
        const diagramCode = parts[1].split('```')[0].trim()
        setDiagram(diagramCode)
      }
    } catch (error) {
      console.error('Error explaining code:', error)
      setExplanation(`Error: ${error instanceof Error ? error.message : 'Failed to explain code. Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Code Explainer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Code Editor</h2>
            <Editor
              height="400px"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
            />
            <button
              onClick={explainCode}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Explaining...' : 'Explain Code'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Explanation</h2>
            <div className="min-h-[400px]">
              {explanation && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-gray-700">Code Explanation:</h3>
                  <p className="whitespace-pre-wrap text-gray-600">{explanation}</p>
                </div>
              )}
              
              {diagram && (
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">Code Structure:</h3>
                  <div className="mermaid">
                    {diagram}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
