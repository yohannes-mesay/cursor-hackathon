"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Settings, 
  Users,
  Monitor,
  PhoneOff
} from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { useToast } from "@/hooks/use-toast"

interface VideoCallProps {
  isInCall: boolean
  onEndCall: () => void
  roomId: string
}

interface PeerConnection {
  userId: string
  userName: string
  peerConnection: RTCPeerConnection
  stream?: MediaStream
}

export function VideoCall({ isInCall, onEndCall, roomId }: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<PeerConnection[]>([])
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<{ [userId: string]: HTMLVideoElement }>({})
  
  const { socket, isConnected, currentUser } = useSocket()
  const { toast } = useToast()

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  useEffect(() => {
    if (isInCall && socket && isConnected && currentUser) {
      initializeCall()
    } else {
      cleanup()
    }

    return () => cleanup()
  }, [isInCall, socket, isConnected, currentUser])

  useEffect(() => {
    if (socket && isConnected) {
      // WebRTC signaling listeners
      socket.on('call-offer', handleOffer)
      socket.on('call-answer', handleAnswer)
      socket.on('ice-candidate', handleIceCandidate)
      socket.on('user-joined-call', handleUserJoinedCall)
      socket.on('user-left-call', handleUserLeftCall)

      return () => {
        socket.off('call-offer')
        socket.off('call-answer')
        socket.off('ice-candidate')
        socket.off('user-joined-call')
        socket.off('user-left-call')
      }
    }
  }, [socket, isConnected])

  const initializeCall = async () => {
    if (!currentUser) return;
    
    try {
      setCallStatus('connecting')
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Join the call room
      if (socket) {
        socket.emit('join-call', { 
          roomId, 
          userId: currentUser.id, 
          userName: currentUser.name 
        })
      }
      
      setCallStatus('connected')
      
      toast({
        title: "Video Call Connected",
        description: "You're now in the video call!",
      })
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera and microphone access to join the call.",
        variant: "destructive",
      })
      setCallStatus('disconnected')
    }
  }

  const createPeerConnection = (userId: string, userName: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(rtcConfig)

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      const videoElement = remoteVideosRef.current[userId]
      if (videoElement) {
        videoElement.srcObject = remoteStream
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId,
          targetUserId: userId
        })
      }
    }

    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state: ${peerConnection.connectionState}`)
    }

    return peerConnection
  }

  const handleUserJoinedCall = async (data: { userId: string, userName: string }) => {
    if (data.userId === currentUser?.id) return

    const peerConnection = createPeerConnection(data.userId, data.userName)
    
    // Create offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    if (socket) {
      socket.emit('call-offer', {
        offer,
        roomId,
        targetUserId: data.userId
      })
    }

    setPeers(prev => [...prev, {
      userId: data.userId,
      userName: data.userName,
      peerConnection
    }])
  }

  const handleOffer = async (data: { offer: RTCSessionDescriptionInit, fromUserId: string, fromUserName: string }) => {
    const peerConnection = createPeerConnection(data.fromUserId, data.fromUserName)
    
    await peerConnection.setRemoteDescription(data.offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    
    if (socket) {
      socket.emit('call-answer', {
        answer,
        roomId,
        targetUserId: data.fromUserId
      })
    }

    setPeers(prev => [...prev, {
      userId: data.fromUserId,
      userName: data.fromUserName,
      peerConnection
    }])
  }

  const handleAnswer = async (data: { answer: RTCSessionDescriptionInit, fromUserId: string }) => {
    const peer = peers.find(p => p.userId === data.fromUserId)
    if (peer) {
      await peer.peerConnection.setRemoteDescription(data.answer)
    }
  }

  const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit, fromUserId: string }) => {
    const peer = peers.find(p => p.userId === data.fromUserId)
    if (peer) {
      await peer.peerConnection.addIceCandidate(data.candidate)
    }
  }

  const handleUserLeftCall = (data: { userId: string }) => {
    setPeers(prev => {
      const peer = prev.find(p => p.userId === data.userId)
      if (peer) {
        peer.peerConnection.close()
      }
      return prev.filter(p => p.userId !== data.userId)
    })
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        // Replace video track for all peer connections
        const videoTrack = screenStream.getVideoTracks()[0]
        peers.forEach(peer => {
          const sender = peer.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          if (sender) {
            sender.replaceTrack(videoTrack)
          }
        })
        
        setIsScreenSharing(true)
        
        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false)
          // Switch back to camera
          if (localStream) {
            const cameraTrack = localStream.getVideoTracks()[0]
            peers.forEach(peer => {
              const sender = peer.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              )
              if (sender) {
                sender.replaceTrack(cameraTrack)
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error)
      toast({
        title: "Screen Share Failed",
        description: "Unable to share screen. Please try again.",
        variant: "destructive",
      })
    }
  }

  const endCall = () => {
    cleanup()
    onEndCall()
    
    if (socket && currentUser) {
      socket.emit('leave-call', { roomId, userId: currentUser.id })
    }
  }

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }

    // Close all peer connections
    peers.forEach(peer => {
      peer.peerConnection.close()
    })
    setPeers([])
    
    setCallStatus('disconnected')
    setIsVideoEnabled(true)
    setIsAudioEnabled(true)
    setIsScreenSharing(false)
  }

  if (!isInCall) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Video Call</h3>
          <p className="text-gray-600">Click "Start Video" to begin a video call with other users</p>
          {currentUser && (
            <p className="text-sm text-gray-500 mt-2">You will join as: {currentUser.name}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Call Status */}
      <div className="flex justify-between items-center">
        <Badge variant={callStatus === 'connected' ? 'default' : 'secondary'}>
          {callStatus === 'connecting' && '🔄 Connecting...'}
          {callStatus === 'connected' && '✅ Connected'}
          {callStatus === 'disconnected' && '❌ Disconnected'}
        </Badge>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {peers.length + 1} participants
          </Badge>
          {currentUser && (
            <Badge variant="secondary">{currentUser.name}</Badge>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
        {/* Local Video */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0 h-full">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover bg-gray-900"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">You ({currentUser?.name})</Badge>
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remote Videos */}
        {peers.map((peer) => (
          <Card key={peer.userId} className="relative overflow-hidden">
            <CardContent className="p-0 h-full">
              <video
                ref={(el) => {
                  if (el) remoteVideosRef.current[peer.userId] = el
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover bg-gray-900"
              />
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary">{peer.userName}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty slots */}
        {peers.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Waiting for others to join...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="sm"
          onClick={toggleAudio}
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="sm"
          onClick={toggleVideo}
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isScreenSharing ? "secondary" : "outline"}
          size="sm"
          onClick={shareScreen}
        >
          <Monitor className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="destructive" size="sm" onClick={endCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 