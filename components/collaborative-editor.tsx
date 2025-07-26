"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Save, 
  Download, 
  Users, 
  Eye,
  Edit3,
  History,
  Plus,
  Trash2
} from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface CollaborativeEditorProps {
  roomId: string
}

interface Document {
  id: string
  title: string
  content: string
  lastModified: Date
  lastModifiedBy: string
}

interface User {
  id: string
  name: string
  cursor: number
  selection: { start: number, end: number }
  color: string
}

interface DocumentChange {
  type: 'insert' | 'delete' | 'replace'
  position: number
  content: string
  length?: number
  userId: string
  timestamp: Date
}

export function CollaborativeEditor({ roomId }: CollaborativeEditorProps) {
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState("")
  const [isCreatingDoc, setIsCreatingDoc] = useState(false)
  const [changes, setChanges] = useState<DocumentChange[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { socket, isConnected } = useSocket()
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  const userColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]

  useEffect(() => {
    if (socket && isConnected) {
      // Join document collaboration room
      socket.emit('join-doc-room', roomId)

      // Listen for document events
      socket.on('document-updated', handleDocumentUpdate)
      socket.on('document-change', handleDocumentChange)
      socket.on('cursor-update', handleCursorUpdate)
      socket.on('collaborator-joined', handleCollaboratorJoined)
      socket.on('collaborator-left', handleCollaboratorLeft)
      socket.on('documents-list', handleDocumentsList)

      // Request documents list
      socket.emit('get-documents', roomId)

      return () => {
        socket.off('document-updated')
        socket.off('document-change')
        socket.off('cursor-update')
        socket.off('collaborator-joined')
        socket.off('collaborator-left')
        socket.off('documents-list')
      }
    }
  }, [socket, isConnected, roomId])

  const handleDocumentUpdate = (doc: Document) => {
    setCurrentDoc(doc)
  }

  const handleDocumentChange = (change: DocumentChange) => {
    if (!currentDoc || change.userId === user?.id) return

    // Apply change to current document
    let newContent = currentDoc.content
    
    switch (change.type) {
      case 'insert':
        newContent = 
          newContent.slice(0, change.position) + 
          change.content + 
          newContent.slice(change.position)
        break
      case 'delete':
        newContent = 
          newContent.slice(0, change.position) + 
          newContent.slice(change.position + (change.length || 0))
        break
      case 'replace':
        newContent = 
          newContent.slice(0, change.position) + 
          change.content + 
          newContent.slice(change.position + (change.length || 0))
        break
    }

    setCurrentDoc(prev => prev ? { ...prev, content: newContent } : null)
    setChanges(prev => [...prev, change])
  }

  const handleCursorUpdate = (data: { userId: string, cursor: number, selection: { start: number, end: number } }) => {
    setCollaborators(prev => 
      prev.map(user => 
        user.id === data.userId 
          ? { ...user, cursor: data.cursor, selection: data.selection }
          : user
      )
    )
  }

  const handleCollaboratorJoined = (userData: { userId: string, userName: string }) => {
    if (userData.userId === user?.id) return
    
    const color = userColors[collaborators.length % userColors.length]
    setCollaborators(prev => [...prev, {
      id: userData.userId,
      name: userData.userName,
      cursor: 0,
      selection: { start: 0, end: 0 },
      color
    }])
  }

  const handleCollaboratorLeft = (data: { userId: string }) => {
    setCollaborators(prev => prev.filter(user => user.id !== data.userId))
  }

  const handleDocumentsList = (docs: Document[]) => {
    setDocuments(docs)
    if (docs.length > 0 && !currentDoc) {
      setCurrentDoc(docs[0])
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentDoc || !socket) return

    const newContent = e.target.value
    const change: DocumentChange = {
      type: 'replace',
      position: 0,
      content: newContent,
      length: currentDoc.content.length,
      userId: user?.id || '',
      timestamp: new Date()
    }

    // Update local state immediately
    setCurrentDoc(prev => prev ? { ...prev, content: newContent } : null)

    // Send change to other collaborators
    socket.emit('document-change', {
      roomId,
      documentId: currentDoc.id,
      change
    })
  }

  const handleCursorChange = () => {
    if (!socket || !textareaRef.current) return

    const cursor = textareaRef.current.selectionStart
    const selection = {
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd
    }

    socket.emit('cursor-update', {
      roomId,
      cursor,
      selection
    })
  }

  const createNewDocument = async () => {
    if (!newDocTitle.trim() || !socket) return

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      content: '',
      lastModified: new Date(),
      lastModifiedBy: userProfile?.name || 'Anonymous'
    }

    socket.emit('create-document', {
      roomId,
      document: newDoc
    })

    setDocuments(prev => [...prev, newDoc])
    setCurrentDoc(newDoc)
    setNewDocTitle('')
    setIsCreatingDoc(false)

    toast({
      title: "Document Created",
      description: `"${newDoc.title}" is ready for collaboration!`,
    })
  }

  const saveDocument = () => {
    if (!currentDoc || !socket) return

    socket.emit('save-document', {
      roomId,
      document: {
        ...currentDoc,
        lastModified: new Date(),
        lastModifiedBy: userProfile?.name || 'Anonymous'
      }
    })

    toast({
      title: "Document Saved",
      description: "Your changes have been saved successfully.",
    })
  }

  const downloadDocument = () => {
    if (!currentDoc) return

    const element = document.createElement('a')
    const file = new Blob([currentDoc.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${currentDoc.title}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const deleteDocument = (docId: string) => {
    if (!socket) return

    socket.emit('delete-document', { roomId, documentId: docId })
    
    setDocuments(prev => prev.filter(doc => doc.id !== docId))
    
    if (currentDoc?.id === docId) {
      const remainingDocs = documents.filter(doc => doc.id !== docId)
      setCurrentDoc(remainingDocs.length > 0 ? remainingDocs[0] : null)
    }

    toast({
      title: "Document Deleted",
      description: "The document has been removed from the collaboration space.",
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select 
            value={currentDoc?.id || ""} 
            onValueChange={(docId) => {
              const doc = documents.find(d => d.id === docId)
              if (doc) setCurrentDoc(doc)
            }}
          >
            <SelectTrigger className="w-64">
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCreatingDoc ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document title..."
                className="w-48"
                onKeyPress={(e) => e.key === 'Enter' && createNewDocument()}
              />
              <Button size="sm" onClick={createNewDocument}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCreatingDoc(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsCreatingDoc(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Doc
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Collaborators */}
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{collaborators.length + 1}</span>
            <div className="flex space-x-1 ml-2">
              {collaborators.slice(0, 3).map((collaborator, index) => (
                <Avatar key={collaborator.id} className="h-6 w-6">
                  <AvatarFallback className={`text-xs text-white ${collaborator.color}`}>
                    {collaborator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <Badge variant="secondary" className="h-6 text-xs">
                  +{collaborators.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <Button size="sm" variant="outline" onClick={saveDocument} disabled={!currentDoc}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={downloadDocument} disabled={!currentDoc}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {currentDoc && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => deleteDocument(currentDoc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">
                {currentDoc?.title || "Select or create a document"}
              </CardTitle>
              {currentDoc && (
                <CardDescription>
                  Last modified by {currentDoc.lastModifiedBy} • {currentDoc.lastModified.toLocaleString()}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "🟢 Connected" : "🔴 Offline"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentDoc ? (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={currentDoc.content}
                onChange={handleContentChange}
                onSelect={handleCursorChange}
                placeholder="Start typing to collaborate with others in real-time..."
                className="min-h-[400px] font-mono text-sm resize-none"
                disabled={!isConnected}
              />
              
              {/* Cursor indicators for other users */}
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs text-white ${collaborator.color}`}
                  style={{ 
                    transform: `translateY(${collaborators.indexOf(collaborator) * 25}px)` 
                  }}
                >
                  {collaborator.name} is editing
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Document Selected</h3>
                <p className="text-sm">Select an existing document or create a new one to start collaborating.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Changes */}
      {changes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <History className="h-5 w-5 mr-2" />
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {changes.slice(-5).reverse().map((change, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>
                    {change.type} at position {change.position}
                  </span>
                  <span>{change.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 