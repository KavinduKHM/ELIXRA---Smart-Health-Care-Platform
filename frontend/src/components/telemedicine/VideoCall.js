// src/components/telemedicine/VideoCall.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers } from 'agora-rtc-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client as StompClient } from '@stomp/stompjs';

const tokenUrl = 'http://localhost:8085/api/video/token/generate';
const wsUrl = 'http://localhost:8085/ws';

const VideoCallComponent = () => {
    const { channelName, userAccount } = useParams();

    const uid = useMemo(() => {
        const n = Number(userAccount);
        return Number.isFinite(n) ? Math.trunc(n) : null;
    }, [userAccount]);

    const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);

    const [token, setToken] = useState(null);
    const [appId, setAppId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!channelName) {
            setError('Missing channel name');
            setIsLoading(false);
            return;
        }
        if (uid === null) {
            setError('Invalid user account');
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        const fetchToken = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axios.post(tokenUrl, { channelName, userAccount: uid });
                if (!isMounted) return;
                setToken(res.data?.token ?? null);
                setAppId(res.data?.appId ?? null);
            } catch (err) {
                console.error('Failed to fetch Agora token:', err);
                if (!isMounted) return;
                setError('Failed to fetch Agora token from backend');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchToken();
        return () => {
            isMounted = false;
        };
    }, [channelName, uid]);

    if (isLoading) return <div>Connecting to video service...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!token || !appId) return <div style={{ color: 'red' }}>Missing Agora token/appId</div>;

    return (
        <AgoraRTCProvider client={client}>
            <VideoCall channelName={channelName} token={token} appId={appId} uid={uid} />
        </AgoraRTCProvider>
    );
};

const RemoteVideoTile = ({ user }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = '';

        if (!user?.videoTrack) return;

        try {
            user.videoTrack.play(container, { fit: 'cover' });

            requestAnimationFrame(() => {
                const videoEl = container.querySelector('video');
                if (videoEl) {
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.style.objectFit = 'cover';
                }
            });
        } catch (e) {
            // ignore render failures; UI shows publishing status below
        }

        return () => {
            try {
                user.videoTrack.stop();
            } catch (e) {
                // ignore
            }
        };
    }, [user?.uid, user?.videoTrack]);

    const remoteStatusText = user?.videoTrack
        ? 'remote video: on'
        : 'remote video: off (camera not shared / blocked / in use)';

    return (
        <div style={{ width: '340px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '100%', height: '260px', backgroundColor: '#2d2d2d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div ref={containerRef} style={{ width: '100%', height: '260px', backgroundColor: '#2d2d2d' }} />
                {!user?.videoTrack ? (
                    <div style={{ position: 'absolute', color: '#fff', opacity: 0.85, padding: '10px', textAlign: 'center' }}>
                        Waiting for remote camera…
                    </div>
                ) : null}
            </div>
            <div style={{ padding: '8px', textAlign: 'center', backgroundColor: '#333', color: '#fff' }}>
                Remote user {user?.uid}
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{remoteStatusText}</div>
            </div>
        </div>
    );
};

const ChatBox = ({ channelName, senderId }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [status, setStatus] = useState('connecting');
    const stompRef = useRef(null);

    useEffect(() => {
        if (!channelName || senderId == null) return;

        setStatus('connecting');

        const client = new StompClient({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 1500,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                setStatus('connected');
                client.subscribe(`/topic/chat.${channelName}`, (frame) => {
                    try {
                        const payload = JSON.parse(frame.body);
                        setMessages((prev) => {
                            const next = [...prev, payload];
                            return next.length > 200 ? next.slice(next.length - 200) : next;
                        });
                    } catch {
                        // ignore bad frames
                    }
                });
            },
            onDisconnect: () => setStatus('disconnected'),
            onStompError: () => setStatus('error'),
            onWebSocketClose: () => setStatus('disconnected'),
            onWebSocketError: () => setStatus('error'),
        });

        stompRef.current = client;
        client.activate();

        return () => {
            try {
                client.deactivate();
            } catch {
                // ignore
            }
            stompRef.current = null;
        };
    }, [channelName, senderId]);

    const send = () => {
        const client = stompRef.current;
        const msg = text.trim();
        if (!client || !client.connected || !msg) return;

        client.publish({
            destination: `/app/chat.send/${channelName}`,
            body: JSON.stringify({ senderId, message: msg }),
        });
        setText('');
    };

    return (
        <div style={{ width: '340px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: '#1f1f1f', display: 'flex', flexDirection: 'column', height: '340px' }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Chat</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{status}</div>
            </div>

            <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {messages.length === 0 ? (
                    <div style={{ color: '#bbb', fontSize: '13px' }}>No messages yet.</div>
                ) : null}
                {messages.map((m, idx) => {
                    const mine = Number(m?.senderId) === Number(senderId);
                    return (
                        <div key={idx} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px', textAlign: mine ? 'right' : 'left' }}>
                                {mine ? 'You' : `User ${m?.senderId ?? ''}`}
                            </div>
                            <div style={{ backgroundColor: mine ? '#2ecc71' : '#444', color: mine ? '#0b1a10' : '#fff', padding: '8px 10px', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
                                {m?.message}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #2a2a2a' }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') send();
                    }}
                    placeholder="Type a message…"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#111', color: '#fff' }}
                />
                <button
                    onClick={send}
                    disabled={status !== 'connected' || !text.trim()}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: status === 'connected' ? 'pointer' : 'not-allowed', backgroundColor: '#3498db', color: '#fff', opacity: status === 'connected' ? 1 : 0.6 }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

const VideoCall = ({ channelName, token, appId, uid }) => {
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [permissionError, setPermissionError] = useState(null);
    const localVideoContainerRef = useRef(null);

    // Join the channel
    useJoin({ appid: appId, channel: channelName, token, uid });

    // Get local tracks
    const {
        localCameraTrack,
        isLoading: isCameraLoading,
        error: cameraError,
    } = useLocalCameraTrack(cameraOn);

    const {
        localMicrophoneTrack,
        isLoading: isMicLoading,
        error: micError,
    } = useLocalMicrophoneTrack(micOn);

    const tracksToPublish = useMemo(
        () => [localCameraTrack, localMicrophoneTrack].filter(Boolean),
        [localCameraTrack, localMicrophoneTrack]
    );

    // Publish local tracks (only when created)
    usePublish(tracksToPublish);

    // Force local preview render (more reliable than LocalVideoTrack in some setups)
    useEffect(() => {
        if (!localCameraTrack || !localVideoContainerRef.current) return;

        const container = localVideoContainerRef.current;
        container.innerHTML = '';

        try {
            localCameraTrack.play(container, { fit: 'cover' });

            requestAnimationFrame(() => {
                const videoEl = container.querySelector('video');
                if (videoEl) {
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.style.objectFit = 'cover';
                }
            });
        } catch (e) {
            setPermissionError(e?.message || 'Failed to start local camera preview');
        }

        return () => {
            try {
                localCameraTrack.stop();
            } catch (e) {
                // ignore
            }
        };
    }, [localCameraTrack]);

    // Get remote users
    const remoteUsers = useRemoteUsers();

    const toggleCamera = () => setCameraOn(prev => !prev);
    const toggleMic = () => setMicOn(prev => !prev);
    const endCall = () => window.close(); // Or redirect to another page

    const requestPermissions = async () => {
        setPermissionError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(t => t.stop());
        } catch (e) {
            setPermissionError(e?.message || 'Camera/microphone permission denied');
        }
    };

    const cameraStatusText =
        permissionError ||
        (cameraError ? (cameraError?.message || String(cameraError)) : null) ||
        (isCameraLoading ? 'Starting camera…' : null) ||
        (!localCameraTrack ? 'Camera is not available (check browser permissions / camera in use).' : null);

    const micStatusText =
        micError ? (micError?.message || String(micError)) : isMicLoading ? 'Starting microphone…' : null;

    const mst = localCameraTrack?.getMediaStreamTrack?.();
    const cameraDebugText = mst
        ? `camera: readyState=${mst.readyState}, enabled=${mst.enabled}, muted=${mst.muted}`
        : null;

    return (
        <div className="video-call-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', flex: 1, gap: '20px', padding: '20px', backgroundColor: '#1a1a1a' }}>
                {/* Local Video */}
                <div style={{ width: '340px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <div style={{ width: '100%', height: '260px', backgroundColor: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {localCameraTrack ? (
                            <div
                                ref={localVideoContainerRef}
                                style={{ width: '100%', height: '260px', backgroundColor: '#2d2d2d' }}
                            />
                        ) : (
                            <div style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Local video</div>
                                {cameraStatusText && <div style={{ opacity: 0.85 }}>{cameraStatusText}</div>}
                                <button
                                    onClick={requestPermissions}
                                    style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                >
                                    Grant camera access
                                </button>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '8px', textAlign: 'center', backgroundColor: '#333', color: '#fff' }}>
                        You (ID: {uid})
                        {micStatusText ? <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{micStatusText}</div> : null}
                        {cameraDebugText ? <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{cameraDebugText}</div> : null}
                    </div>
                </div>

                {/* Remote Video */}
                {remoteUsers.length === 0 ? (
                    <div style={{ color: '#fff', opacity: 0.85, paddingTop: '20px' }}>Waiting for the other person to join…</div>
                ) : null}
                {remoteUsers.map(user => (
                    <RemoteVideoTile key={user.uid} user={user} />
                ))}

                {/* Chat */}
                <ChatBox channelName={channelName} senderId={uid} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '16px', backgroundColor: '#2c3e50' }}>
                <button onClick={toggleCamera} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: cameraOn ? '#e74c3c' : '#2ecc71', color: 'white' }}>
                    {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </button>
                <button onClick={toggleMic} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: micOn ? '#e74c3c' : '#2ecc71', color: 'white' }}>
                    {micOn ? 'Mute Mic' : 'Unmute Mic'}
                </button>
                <button onClick={endCall} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white' }}>
                    End Call
                </button>
            </div>
        </div>
    );
};

export default VideoCallComponent;