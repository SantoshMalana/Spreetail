'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [fileContent, setFileContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        if (data.groups) {
          setGroups(data.groups)
          if (data.groups.length > 0) setSelectedGroupId(data.groups[0].id)
        }
      })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setFileContent(e.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!fileContent || !selectedGroupId) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: fileContent,
          groupId: selectedGroupId
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import')

      setResult(data)
      if (data.success) {
        setTimeout(() => {
          router.push(`/dashboard/groups/${selectedGroupId}`)
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CSV Importer</h1>
        <p className="text-gray-400">Upload your messy spreadsheet and let our engine clean and import it automatically.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Group</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          >
            {groups.length === 0 && <option value="">Loading groups...</option>}
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">Users from the CSV will be automatically created and added to this group.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Upload CSV File</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-700/50 hover:border-emerald-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">.csv files only</p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {fileContent && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm font-medium text-emerald-400">File loaded successfully.</p>
            <p className="text-xs text-emerald-500/70 mt-1">Ready to run anomaly detection and data migration.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm font-medium text-red-400">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">Import Results</h3>
            <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
              <span className="text-gray-400">Expenses Imported</span>
              <span className="font-bold text-emerald-400">{result.importedExpensesCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
              <span className="text-gray-400">Settlements Detected & Logged</span>
              <span className="font-bold text-emerald-400">{result.importedSettlementsCount}</span>
            </div>
            
            {result.errors?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-orange-400 font-bold">Warnings ({result.errors.length}):</span>
                <ul className="text-xs text-gray-500 mt-2 list-disc pl-4 space-y-1">
                  {result.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.success && (
              <p className="text-xs text-center text-gray-500 mt-4">Redirecting to group dashboard...</p>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!fileContent || !selectedGroupId || loading || result?.success}
          className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          {loading ? 'Processing Anomaly Engine...' : 'Import Data'}
        </button>
      </div>
    </div>
  )
}
