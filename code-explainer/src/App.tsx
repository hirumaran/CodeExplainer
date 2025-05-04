import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import mermaid from 'mermaid'
import './index.css'

// Initialize mermaid
mermaid.initialize({ 
  startOnLoad: true,
  theme: 'neutral'
})

function App() {
  const [code, setCode] = useState('')
  const [explanation, setExplanation] = useState('')
  const [diagram, setDiagram] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => {
    // Check for system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [language, setLanguage] = useState('javascript')

  // Set theme class on body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // When diagram changes, re-render mermaid
    if (diagram) {
      setTimeout(() => {
        mermaid.init(undefined, document.querySelectorAll('.mermaid'))
      }, 200)
    }
  }, [theme, diagram])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  
  // Handle language change
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
  }

  // Explain the code using Backend API
  const explainCode = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Call backend API instead of Gemini directly
      const response = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get explanation');
      }
      
      const data = await response.json();
      
      // Set explanation and diagram from backend response
      setExplanation(data.explanation);
      setDiagram(data.diagram || '');
      
    } catch (err) {
      console.error('Error explaining code:', err)
      setError(err instanceof Error ? err.message : 'Failed to explain code. Please try again.')
      setExplanation('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-gray-900 text-gray-200'}`}>
      {/* Header */}
      <header className={`py-4 px-6 flex items-center justify-between ${theme === 'light' ? 'bg-white shadow-sm text-gray-800' : 'bg-gray-800 shadow-md shadow-gray-950/20 text-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <svg className={`h-8 w-8 ${theme === 'light' ? 'text-primary' : 'text-primary-hover'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 6L8 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 6L14 12L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl font-bold">Code Explainer</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full ${theme === 'light' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-gray-700 text-gray-200'} transition-colors`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
          )}
        </button>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <div className={`rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} flex justify-between items-center`}>
              <h2 className="text-xl font-semibold">Code Editor</h2>
              <select 
                value={language}
                onChange={handleLanguageChange}
                className={`px-3 py-1 rounded-md text-sm ${
                  theme === 'light' 
                    ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                    : 'bg-gray-700 text-gray-200 border border-gray-600'
                }`}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            <div className="editor-container">
              <Editor
                height="400px"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={theme === 'light' ? 'vs' : 'vs-dark'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'all',
                  lineNumbers: 'on',
                  automaticLayout: true,
                }}
              />
              <div className="p-4 flex justify-end">
                <button
                  onClick={explainCode}
                  disabled={loading || !code.trim()}
                  className={`px-6 py-2 rounded-md flex items-center space-x-2 font-medium transition-colors ${
                    loading || !code.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : theme === 'light'
                        ? 'bg-primary text-white hover:bg-primary-hover'
                        : 'bg-primary-hover text-white hover:bg-primary'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Explain Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Explanation Panel */}
          <div className={`rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-white border-gray-200 text-gray-800' : 'bg-gray-800 border-gray-700 text-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
              <h2 className="text-xl font-semibold">Explanation</h2>
            </div>
            <div className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {error && (
                <div className={`mb-6 p-4 border-l-4 rounded ${theme === 'light' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-red-900/20 border-red-500 text-red-400'}`}>
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {!error && !explanation && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-center">Enter your code and click &quot;Explain Code&quot; to generate an explanation.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-16 h-16 border-t-4 border-b-4 border-primary-hover rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-500">Generating explanation...</p>
                </div>
              )}

              {explanation && !loading && (
                <div className={`prose max-w-none ${theme === 'light' ? 'prose-gray' : 'prose-invert'}`}>
                  <h3 className="font-bold text-lg mb-3">Code Explanation:</h3>
                  <div className="whitespace-pre-wrap text-sm">
                    {explanation}
                  </div>
                  
                  {diagram && (
                    <div className="mt-8">
                      <h3 className="font-bold text-lg mb-3">Code Structure:</h3>
                      <div className={`p-4 rounded-lg overflow-hidden ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
                        <div className="mermaid text-center">
                          {diagram}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            Powered by Google Gemini 2.5 Pro • {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App