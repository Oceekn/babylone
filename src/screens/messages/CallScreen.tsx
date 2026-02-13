import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react'
import { chatSocketService } from '../../services/chat-socket.service'
import './CallScreen.css'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'

const CallScreen = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const targetUserId = searchParams.get('userId') || ''
  const targetUserName = searchParams.get('name') || 'Utilisateur'
  const callType = (searchParams.get('type') || 'audio') as 'audio' | 'video'
  const isIncoming = searchParams.get('incoming') === 'true'

  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'idle')
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video')
  const [isSpeaker, setIsSpeaker] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const durationIntervalRef = useRef<any>(null)

  useEffect(() => {
    chatSocketService.connect()
    setupListeners()

    if (!isIncoming && targetUserId) {
      startCall()
    }

    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (callState === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }, [callState])

  const setupListeners = () => {
    const socket = chatSocketService.getSocket()
    if (!socket) return

    socket.on('call_offer', async (data: any) => {
      // Recevoir un appel entrant (gere en dehors de cette page normalement)
    })

    socket.on('call_answer', async (data: any) => {
      if (pcRef.current && data.answer) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
        setCallState('connected')
      }
    })

    socket.on('ice_candidate', async (data: any) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (err) {
          console.warn('ICE candidate error:', err)
        }
      }
    })

    socket.on('call_ended', () => {
      setCallState('ended')
      cleanup()
    })
  }

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        chatSocketService.getSocket()?.emit('ice_candidate', {
          targetUserId,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      const [stream] = event.streams
      remoteStreamRef.current = stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallState('ended')
        cleanup()
      }
    }

    pcRef.current = pc
    return pc
  }

  const startCall = async () => {
    try {
      setCallState('calling')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const pc = createPeerConnection()
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      chatSocketService.getSocket()?.emit('call_offer', {
        targetUserId,
        offer,
        callType,
      })
    } catch (err) {
      console.error('Erreur demarrage appel:', err)
      setCallState('ended')
    }
  }

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const pc = createPeerConnection()
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      // L'offer est dans les searchParams pour l'appel entrant
      const offerStr = searchParams.get('offer')
      if (offerStr) {
        const offer = JSON.parse(decodeURIComponent(offerStr))
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        chatSocketService.getSocket()?.emit('call_answer', {
          targetUserId,
          answer,
        })
        setCallState('connected')
      }
    } catch (err) {
      console.error('Erreur reponse appel:', err)
      setCallState('ended')
    }
  }

  const endCall = () => {
    chatSocketService.getSocket()?.emit('call_end', { targetUserId })
    setCallState('ended')
    cleanup()
    navigate(-1)
  }

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const callStateLabel = () => {
    switch (callState) {
      case 'calling': return 'Appel en cours...'
      case 'ringing': return 'Appel entrant'
      case 'connected': return formatDuration(duration)
      case 'ended': return 'Appel termine'
      default: return ''
    }
  }

  return (
    <ScreenLayout>
      <div className="call-screen">
        <div className="call-top-section">
          {callType === 'video' && (
            <div className="call-video-frame">
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            </div>
          )}
          {callType === 'audio' && (
            <div className="audio-call-visual">
              <div className="caller-avatar-large">
                {targetUserName.charAt(0)}
              </div>
            </div>
          )}
        </div>

        <div className="call-bottom-section">
          <div className="caller-info">
            <h2 className="caller-name">{targetUserName}</h2>
            <p className="call-duration">{callStateLabel()}</p>
          </div>

          <div className="call-controls-bottom">
            <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              <span>Micro</span>
            </button>
            {callType === 'video' && (
              <button className={`control-btn ${!isVideoEnabled ? 'active' : ''}`} onClick={toggleVideo}>
                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                <span>Video</span>
              </button>
            )}
            <button className={`control-btn ${isSpeaker ? 'active' : ''}`} onClick={() => setIsSpeaker(!isSpeaker)}>
              <Volume2 size={24} />
              <span>Haut-parleur</span>
            </button>
          </div>

          <div className="call-actions">
            {callState === 'ringing' && (
              <button className="call-btn answer" onClick={answerCall}>
                <Phone size={28} />
              </button>
            )}
            <button className="call-btn hangup" onClick={endCall}>
              <PhoneOff size={28} />
            </button>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default CallScreen
