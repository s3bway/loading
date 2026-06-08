import { useState, useEffect, useRef } from 'react';

const piosenki = [
    'nutki/Majki x Kumi ft. Major SPZ - Uno Momento.mp4',
    'nutki/Sentino x Diho - WAWA022.mp4',
    'nutki/Sentino x Koneser x BNP - PENTHOUSE 2.mp4',
].sort(() => Math.random() - 0.5);

const ekipa = [
    { nazwa: 'nazwa', rola: 'ranga', avatar: 'link' },
    { nazwa: 'nazwa', rola: 'ranga', avatar: 'link' }
];

export default function App() {
    const [kawalek, setKawalek] = useState(0);
    const [vol, setVol] = useState(0.5);
    const [postep, setPostep] = useState(0);
    
    const [widocznosc, setWidocznosc] = useState({
        center: false,
        wrap: false,
        music: false,
        staff: Array(ekipa.length).fill(false)
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => setWidocznosc(p => ({ ...p, center: true })), 50);
        setTimeout(() => setWidocznosc(p => ({ ...p, wrap: true })), 200);
        setTimeout(() => setWidocznosc(p => ({ ...p, music: true })), 300);

        ekipa.forEach((_, i) => {
            setTimeout(() => {
                setWidocznosc(p => {
                    const st = [...p.staff];
                    st[i] = true;
                    return { ...p, staff: st };
                });
            }, 200 + i * 100);
        });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setPostep(p => (p >= 100 ? 100 : Math.min(p + (Math.random() * 2), 100)));
        }, 150);

        const msgHandler = (e: MessageEvent) => {
            if (e.data.eventName === 'loadProgress') {
                setPostep(Math.floor(e.data.loadFraction * 100));
            }
        };

        window.addEventListener('message', msgHandler);
        return () => {
            clearInterval(timer);
            window.removeEventListener('message', msgHandler);
        };
    }, []);

    useEffect(() => {
        if (!videoRef.current) return;
        const v = videoRef.current;
        v.volume = vol;
        v.play().catch(() => {
            v.muted = true;
            v.play().catch(() => {});
        });
    }, [kawalek]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = vol;
    }, [vol]);

    const nastepnaNuta = () => setKawalek(p => (p + 1) % piosenki.length);

    useEffect(() => {
        const odblokuj = () => {
            if (videoRef.current && videoRef.current.muted) {
                videoRef.current.muted = false;
                videoRef.current.volume = vol;
            }
        };
        window.addEventListener('click', odblokuj);
        window.addEventListener('keydown', odblokuj);
        return () => {
            window.removeEventListener('click', odblokuj);
            window.removeEventListener('keydown', odblokuj);
        };
    }, [vol]);

    useEffect(() => {
        const zmianaGlosnosci = (x: number) => {
            if (!sliderRef.current) return;
            const r = sliderRef.current.getBoundingClientRect();
            let n = (x - r.left) / r.width;
            setVol(Math.max(0, Math.min(n, 1)));
        };

        const onMove = (e: MouseEvent) => zmianaGlosnosci(e.clientX);
        const onTouchMove = (e: TouchEvent) => zmianaGlosnosci(e.touches[0].clientX);

        const posprzataj = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', posprzataj);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', posprzataj);
        };

        const onDown = (e: MouseEvent) => {
            zmianaGlosnosci(e.clientX);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', posprzataj);
        };
        const onTouch = (e: TouchEvent) => {
            zmianaGlosnosci(e.touches[0].clientX);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', posprzataj);
        };

        const el = sliderRef.current;
        if (el) {
            el.addEventListener('mousedown', onDown);
            el.addEventListener('touchstart', onTouch);
        }

        return () => {
            if (el) {
                el.removeEventListener('mousedown', onDown);
                el.removeEventListener('touchstart', onTouch);
            }
            posprzataj();
        };
    }, []);

    const graAktualnie = piosenki[kawalek];
    const nazwa = graAktualnie.replace('nutki/', '').replace('.mp4', '');

    return (
        <>
            <video 
                ref={videoRef}
                id="bg-video" 
                playsInline 
                src={graAktualnie}
                onEnded={nastepnaNuta}
                onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
            />
            <div id="bg-overlay"></div>

            <div id="main">
                <div id="staff-col">
                    <h3>Staff</h3>
                    <div id="staff-list">
                        {ekipa.map((c, i) => (
                            <div key={i} className={`staff-member ${widocznosc.staff[i] ? 'visible' : ''}`}>
                                <div className="staff-avatar">
                                    <img src={c.avatar} alt={c.nazwa} />
                                </div>
                                <div>
                                    <div className="staff-name">{c.nazwa}</div>
                                    <div className="staff-role">{c.rola}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div id="center-col" className={widocznosc.center ? 'visible' : ''}>
                    <p id="welcome">Witaj, na serwerze</p>
                    <div id="server-name">TWOJSERWER</div>
                    <div id="loadbar-wrap" className={widocznosc.wrap ? 'visible' : ''}>
                        <div id="loadbar-track">
                            <div id="loadbar-fill" style={{ width: `${postep}%` }}></div>
                        </div>
                    </div>
                </div>

                <div id="right-spacer"></div>
            </div>

            <div id="music-panel" className={widocznosc.music ? 'visible' : ''}>
                <div id="music-inner">
                    <div id="music-top">
                        <span id="song-name">{nazwa}</span>
                        <button id="skip-btn" onClick={nastepnaNuta}>
                            <svg viewBox="0 0 24 24">
                                <polygon points="5 4 15 12 5 20 5 4" />
                                <line x1="19" y1="5" x2="19" y2="19" />
                            </svg>
                        </button>
                    </div>
                    <div id="vol-row">
                        <svg viewBox="0 0 24 24">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                        <div id="vol-slider" ref={sliderRef}>
                            <div id="vol-fill" style={{ width: `${vol * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
