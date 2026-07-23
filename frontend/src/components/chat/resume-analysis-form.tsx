import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import * as mammoth from 'mammoth'
import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const acceptedExtensions = new Set(['pdf', 'docx', 'doc', 'txt'])

interface ResumeAnalysisFormProps {
  isAnalyzing: boolean
  onAnalyze: (resumeText: string) => void
}

export function ResumeAnalysisForm({ isAnalyzing, onAnalyze }: ResumeAnalysisFormProps) {
  const [resumeText, setResumeText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !acceptedExtensions.has(extension)) {
      setError('Please upload a PDF, DOCX or TXT file.')
      return
    }

    setError('')
    setIsExtracting(true)

    try {
      const extractedText = await extractResumeText(file, extension)
      if (!extractedText.trim()) {
        throw new Error('No text found')
      }

      setSelectedFile(file)
      setResumeText(extractedText.trim())
    } catch {
      setSelectedFile(null)
      setError('Unable to read this resume.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    fileInputRef.current && (fileInputRef.current.value = '')
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      <div className="glass-card rounded-2xl p-5 md:p-6 border border-border/50">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Resume Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">Paste your resume or upload a file for AI-powered feedback.</p>
        </div>

        <label htmlFor="resume-text" className="block text-sm font-medium mb-2">Paste Resume</label>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          placeholder="Paste your resume text here..."
          disabled={isExtracting || isAnalyzing}
          className="min-h-56 w-full resize-y rounded-xl border border-input bg-background/50 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span>OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
          }}
          className="sr-only"
          aria-label="Browse resume files"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setIsDragging(false)
          }}
          onDrop={handleDrop}
          className={cn(
            'flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-all duration-200',
            isDragging ? 'border-primary bg-primary/10' : 'border-border/70 bg-secondary/20 hover:border-primary/60 hover:bg-primary/5',
            (isExtracting || isAnalyzing) && 'pointer-events-none opacity-60'
          )}
        >
          {isExtracting ? (
            <Loader2 className="w-9 h-9 text-primary animate-spin mb-3" aria-hidden="true" />
          ) : (
            <Upload className="w-9 h-9 text-primary mb-3" aria-hidden="true" />
          )}
          <p className="font-medium">{isExtracting ? 'Reading resume...' : 'Drag & Drop Resume Here'}</p>
          <p className="text-sm text-muted-foreground my-2">OR</p>
          <p className="text-sm text-primary font-medium">Click to Browse Files</p>
          <p className="text-xs text-muted-foreground mt-4">PDF • DOCX • DOC • TXT</p>
        </div>

        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

        {selectedFile && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2.5">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={removeFile} disabled={isAnalyzing}>
              <X className="w-4 h-4 mr-1" /> Remove File
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="gradient"
          size="lg"
          onClick={() => onAnalyze(resumeText.trim())}
          disabled={!resumeText.trim() || isExtracting || isAnalyzing}
          className="w-full mt-5"
        >
          {isAnalyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Analyze Resume
        </Button>
      </div>
    </div>
  )
}

async function extractResumeText(file: File, extension: string): Promise<string> {
  if (extension === 'txt') return file.text()

  if (extension === 'docx') {
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return value
  }

  if (extension === 'pdf') {
    const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    const pages = await Promise.all(
      Array.from({ length: document.numPages }, async (_, index) => {
        const page = await document.getPage(index + 1)
        const content = await page.getTextContent()
        return content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      })
    )
    return pages.join('\n\n')
  }

  return extractLegacyDocText(await file.arrayBuffer())
}

function extractLegacyDocText(buffer: ArrayBuffer): string {
  const candidates = ['utf-16le', 'windows-1252'].map((encoding) =>
    new TextDecoder(encoding).decode(buffer).match(/[\p{L}\p{N}][\p{L}\p{N}\p{P}\p{Z}\r\n]{20,}/gu)?.join('\n') ?? ''
  )
  return candidates.sort((first, second) => second.length - first.length)[0]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
