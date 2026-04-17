// src/components/telemedicine/VideoCall.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AgoraRTCProvider, useJoin, useLocalCameraTrack, useLocalMicrophoneTrack, usePublish, useRemoteUsers } from 'agora-rtc-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client as StompClient } from '@stomp/stompjs';
import './VideoCall.css';

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

    if (isLoading) {
        return (
            <div className="vcStatusPage">
                <h2 className="vcStatusTitle">Connecting…</h2>
                <div className="vcStatusText">Setting up the video consultation room.</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="vcStatusPage" role="alert">
                <h2 className="vcStatusTitle">Unable to connect</h2>
                <div className="vcStatusText">{error}</div>
            </div>
        );
    }
    if (!token || !appId) {
        return (
            <div className="vcStatusPage" role="alert">
                <h2 className="vcStatusTitle">Missing credentials</h2>
                <div className="vcStatusText">Backend didn’t return an Agora token/appId.</div>
            </div>
        );
    }

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
        <div className="vcTile">
            <div className="vcVideoFrame">
                <div ref={containerRef} className="vcVideoSurface" />
                {!user?.videoTrack ? <div className="vcOverlay">Waiting for remote camera…</div> : null}
            </div>
            <div className="vcTileFooter">
                <div className="vcTileTitle">Remote user {user?.uid}</div>
                <div className="vcTileMeta">{remoteStatusText}</div>
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
        <div className="vcSidebar" aria-label="Chat">
            <div className="vcSidebarHeader">
                <div className="vcSidebarTitle">Chat</div>
                <span className={`vcPill ${status === 'connected' ? 'vcPillStrong' : ''}`}>{status}</span>
            </div>

            <div className="vcMessages">
                {messages.length === 0 ? <div className="vcEmpty">No messages yet.</div> : null}
                {messages.map((m, idx) => {
                    const mine = Number(m?.senderId) === Number(senderId);
                    return (
                        <div key={idx} className={`vcMessage ${mine ? 'vcMessageMine' : 'vcMessageOther'}`}>
                            <div className="vcMessageLabel" style={{ textAlign: mine ? 'right' : 'left' }}>
                                {mine ? 'You' : `User ${m?.senderId ?? ''}`}
                            </div>
                            <div className={`vcMessageBubble ${mine ? 'vcMessageBubbleMine' : ''}`}>{m?.message}</div>
                        </div>
                    );
                })}
            </div>

            <div className="vcComposer">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') send();
                    }}
                    placeholder="Type a message…"
                    className="vcComposerInput"
                    aria-label="Message"
                />
                <button onClick={send} disabled={status !== 'connected' || !text.trim()}>
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
        <div className="vcPage">
            <div className="vcHeader">
                <div>
                    <h1 className="vcTitle">Video Consultation</h1>
                    <div className="vcSubtitle">Channel: {channelName} • Your ID: {uid}</div>
                </div>
            </div>

            <div className="vcMainGrid">
                <section className="vcStage" aria-label="Video stage">
                    <div className="vcStageHeader">
                        <div className="vcStageHeaderTitle">Participants</div>
                        <span className={`vcPill ${remoteUsers.length > 0 ? 'vcPillStrong' : ''}`}>
                            {remoteUsers.length > 0 ? `${remoteUsers.length} remote` : 'Waiting for others'}
                        </span>
                    </div>

                    <div className="vcTileGrid">
                        <div className="vcTile">
                            <div className="vcVideoFrame">
                                {localCameraTrack ? (
                                    <div ref={localVideoContainerRef} className="vcVideoSurface" />
                                ) : (
                                    <div className="vcPlaceholder">
                                        <div className="vcPlaceholderTitle">Your camera</div>
                                        <div className="vcPlaceholderText">
                                            {cameraStatusText || 'Camera is currently unavailable.'}
                                        </div>
                                        <button onClick={requestPermissions} className="vcButtonSecondary">
                                            Grant camera access
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="vcTileFooter">
                                <div className="vcTileTitle">You (ID: {uid})</div>
                                {micStatusText ? <div className="vcTileMeta">{micStatusText}</div> : null}
                                {cameraDebugText ? <div className="vcTileMeta">{cameraDebugText}</div> : null}
                            </div>
                        </div>

                        {remoteUsers.map((user) => (
                            <RemoteVideoTile key={user.uid} user={user} />
                        ))}

                        {remoteUsers.length === 0 ? (
                            <div className="vcTile">
                                <div className="vcVideoFrame">
                                    <div className="vcOverlay">Waiting for the other person to join…</div>
                                </div>
                                <div className="vcTileFooter">
                                    <div className="vcTileTitle">Remote participant</div>
                                    <div className="vcTileMeta">They’ll appear here once connected.</div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                <aside aria-label="Chat">
                    <ChatBox channelName={channelName} senderId={uid} />
                </aside>
            </div>

            <div className="vcControls" aria-label="Call controls">
                <button
                    onClick={toggleCamera}
                    className={cameraOn ? 'vcButtonSecondary' : ''}
                    aria-pressed={!cameraOn}
                >
                    {cameraOn ? 'Turn off camera' : 'Turn on camera'}
                </button>
                <button
                    onClick={toggleMic}
                    className={micOn ? 'vcButtonSecondary' : ''}
                    aria-pressed={!micOn}
                >
                    {micOn ? 'Mute mic' : 'Unmute mic'}
                </button>
                <button onClick={endCall} className="vcButtonOutline">
                    Leave call
                </button>
            </div>
        </div>
    );
};

export default VideoCallComponent;