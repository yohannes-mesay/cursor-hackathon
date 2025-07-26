"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Smile, Paperclip } from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type: 'text' | 'system' | 'file'
}

interface LiveChatProps {
  roomId: string
}

export function LiveChat({ roomId }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  const { socket, isConnected, currentUser, joinRoom } = useSocket()
  const { toast } = useToast()

  useEffect(() => {
    if (socket && isConnected && currentUser) {
      console.log('LiveChat: Setting up socket listeners for room:', roomId);
      
      // Join the room
      joinRoom(roomId)

      // Listen for new messages
      socket.on('room-message', (data: {
        id: string
        userId: string
        userName: string
        message: string
        timestamp: string
        roomId: string
      }) => {
        console.log('LiveChat: Received message:', data);
        if (data.roomId === roomId) {
          const newMsg: Message = {
            id: data.id,
            userId: data.userId,
            userName: data.userName,
            message: data.message,
            timestamp: new Date(data.timestamp),
            type: 'text'
          }
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(msg => msg.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      })

      // Listen for typing indicators
      socket.on('user-typing', (data: { userId: string, userName: string, isTyping: boolean, roomId: string }) => {
        if (data.roomId === roomId && data.userId !== currentUser.id) {
          setIsTyping(prev => {
            if (data.isTyping) {
              return prev.includes(data.userName) ? prev : [...prev, data.userName]
            } else {
              return prev.filter(name => name !== data.userName)
            }
          })
        }
      })

      // Listen for user join/leave
      socket.on('user-joined-room', (data: { userId: string, userName: string, roomId: string }) => {
        if (data.roomId === roomId && data.userId !== currentUser.id) {
          const systemMsg: Message = {
            id: `system-${Date.now()}`,
            userId: 'system',
            userName: 'System',
            message: `${data.userName} joined the conversation`,
            timestamp: new Date(),
            type: 'system'
          }
          setMessages(prev => [...prev, systemMsg])
        }
      })

      socket.on('user-left-room', (data: { userId: string, userName: string, roomId: string }) => {
        if (data.roomId === roomId) {
          const systemMsg: Message = {
            id: `system-${Date.now()}`,
            userId: 'system',
            userName: 'System',
            message: `${data.userName} left the conversation`,
            timestamp: new Date(),
            type: 'system'
          }
          setMessages(prev => [...prev, systemMsg])
        }
      })

      return () => {
        console.log('LiveChat: Cleaning up socket listeners');
        socket.off('room-message')
        socket.off('user-typing')
        socket.off('user-joined-room')
        socket.off('user-left-room')
      }
    }
  }, [socket, isConnected, roomId, currentUser, joinRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !currentUser) {
      console.log('LiveChat: Cannot send message - missing requirements');
      return;
    }

    setIsLoading(true)
    
    const messageData = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      roomId
    }

    console.log('LiveChat: Sending message:', messageData);

    try {
      // Add message locally first for immediate feedback
      const localMsg: Message = {
        ...messageData,
        timestamp: new Date(messageData.timestamp),
        type: 'text' as const
      }
      setMessages(prev => [...prev, localMsg]);

      socket.emit('room-message', messageData)
      setNewMessage("")
      
      // Stop typing indicator
      socket.emit('typing', { 
        roomId, 
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false 
      })

      console.log('LiveChat: Message sent successfully');
    } catch (error) {
      console.error('LiveChat: Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  const handleTyping = () => {
    if (socket && currentUser) {
      socket.emit('typing', { 
        roomId, 
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: true 
      })

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { 
          roomId, 
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false 
        })
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white">
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p>No messages yet. Start the conversation!</p>
                {currentUser && (
                  <p className="text-sm mt-2">You are: {currentUser.name}</p>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                {message.type === 'system' ? (
                  <div className="w-full text-center">
                    <Badge variant="secondary" className="text-xs">
                      {message.message}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {message.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.userId === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg max-w-xs ${
                        message.userId === currentUser?.id 
                          ? 'bg-blue-500 text-white ml-auto' 
                          : 'bg-gray-100'
                      }`}>
                        <p className="text-sm break-words">{message.message}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping.length > 0 && (
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">...</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected || isLoading}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || !isConnected || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {currentUser && `Chatting as: ${currentUser.name}`}
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500">
                Disconnected from chat. Trying to reconnect...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 