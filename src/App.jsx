import React, { useRef, useEffect, useState, useId, Children, cloneElement, useMemo, useCallback, Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import gsap from 'gsap';
import * as THREE from 'three';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import './projects.js';


const lerp = (a, b, n) => (1 - n) * a + n * b;
const getMousePos = (e, container) => {
    if (container) {
        const bounds = container.getBoundingClientRect();
        return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    }
    return { x: e.clientX, y: e.clientY };
};

const Crosshair = ({ color = '#ff69b4', containerRef = null }) => {
    const cursorRef = useRef(null);
    const lineHorizontalRef = useRef(null);
    const lineVerticalRef = useRef(null);
    const filterXRef = useRef(null);
    const filterYRef = useRef(null);

    let mouse = { x: 0, y: 0 };

    useEffect(() => {
        const handleMouseMove = ev => {
            mouse = getMousePos(ev, containerRef?.current);
            if (containerRef?.current) {
                const bounds = containerRef.current.getBoundingClientRect();
                if (
                    ev.clientX < bounds.left ||
                    ev.clientX > bounds.right ||
                    ev.clientY < bounds.top ||
                    ev.clientY > bounds.bottom
                ) {
                    gsap.to([lineHorizontalRef.current, lineVerticalRef.current], { opacity: 0 });
                } else {
                    gsap.to([lineHorizontalRef.current, lineVerticalRef.current], { opacity: 0.4 });
                }
            }
        };

        const target = containerRef?.current || window;
        target.addEventListener('mousemove', handleMouseMove);

        const renderedStyles = {
            tx: { previous: 0, current: 0, amt: 0.15 },
            ty: { previous: 0, current: 0, amt: 0.15 }
        };

        gsap.set([lineHorizontalRef.current, lineVerticalRef.current], { opacity: 0 });

        const onMouseMove = () => {
            renderedStyles.tx.previous = renderedStyles.tx.current = mouse.x;
            renderedStyles.ty.previous = renderedStyles.ty.current = mouse.y;
            gsap.to([lineHorizontalRef.current, lineVerticalRef.current], {
                duration: 0.9,
                ease: 'Power3.easeOut',
                opacity: 0.4
            });
            requestAnimationFrame(render);
            target.removeEventListener('mousemove', onMouseMove);
        };

        target.addEventListener('mousemove', onMouseMove);

        const primitiveValues = { turbulence: 0 };
        const tl = gsap.timeline({
            paused: true,
            onStart: () => {
                lineHorizontalRef.current.style.filter = `url(#filter-noise-x)`;
                lineVerticalRef.current.style.filter = `url(#filter-noise-y)`;
            },
            onUpdate: () => {
                if (filterXRef.current && filterYRef.current) {
                    filterXRef.current.setAttribute('baseFrequency', primitiveValues.turbulence);
                    filterYRef.current.setAttribute('baseFrequency', primitiveValues.turbulence);
                }
            },
            onComplete: () => {
                if (lineHorizontalRef.current && lineVerticalRef.current) {
                    lineHorizontalRef.current.style.filter = lineVerticalRef.current.style.filter = 'none';
                }
            }
        })
            .to(primitiveValues, {
                duration: 0.5,
                ease: 'power1',
                startAt: { turbulence: 1 },
                turbulence: 0
            });

        const enter = () => tl.restart();
        const leave = () => tl.progress(1).kill();

        const render = () => {
            renderedStyles.tx.current = mouse.x;
            renderedStyles.ty.current = mouse.y;
            for (const key in renderedStyles) {
                renderedStyles[key].previous = lerp(
                    renderedStyles[key].previous,
                    renderedStyles[key].current,
                    renderedStyles[key].amt
                );
            }
            if (lineHorizontalRef.current && lineVerticalRef.current) {
                gsap.set(lineVerticalRef.current, { x: renderedStyles.tx.previous });
                gsap.set(lineHorizontalRef.current, { y: renderedStyles.ty.previous });
            }
            requestAnimationFrame(render);
        };

        // Function to attach listeners to elements
        const attachListeners = (elements) => {
            elements.forEach(element => {
                // Avoid double binding
                if (element.dataset.crosshairBound) return;

                element.addEventListener('mouseenter', enter);
                element.addEventListener('mouseleave', leave);
                element.dataset.crosshairBound = "true";
            });
        };

        // Remove listeners helper
        const removeListeners = (elements) => {
            elements.forEach(element => {
                element.removeEventListener('mouseenter', enter);
                element.removeEventListener('mouseleave', leave);
                delete element.dataset.crosshairBound;
            });
        };

        // Initial bind
        const selector = 'a, button, .dock-item, [onclick], [role="button"], input[type="button"], input[type="submit"], .filter-btn, .project-card, .contact-link';
        const initialElements = containerRef?.current ? containerRef.current.querySelectorAll(selector) : document.querySelectorAll(selector);
        attachListeners(initialElements);

        // Mutation Observer to watch for new elements (like Modals)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    // Check added nodes and their children
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.matches && node.matches(selector)) {
                                attachListeners([node]);
                            }
                            // Find descendants
                            const descendants = node.querySelectorAll(selector);
                            attachListeners(descendants);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            target.removeEventListener('mousemove', handleMouseMove);
            target.removeEventListener('mousemove', onMouseMove);
            observer.disconnect();

            // Cleanup interactions
            const allBound = document.querySelectorAll('[data-crosshair-bound="true"]');
            removeListeners(allBound);
        };
    }, [containerRef]);

    // Render to Portal to ensure it sits on top of everything (even modals)
    return ReactDOM.createPortal(
        <div
            ref={cursorRef}
            className="cursor"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999999, // Max z-index to be above Modal (Overlay)
                mixBlendMode: 'difference' // Make it visible on dark/light
            }}
        >
            <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
                <defs>
                    <filter id="filter-noise-x">
                        <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterXRef} />
                        <feDisplacementMap in="SourceGraphic" scale="40" />
                    </filter>
                    <filter id="filter-noise-y">
                        <feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1" ref={filterYRef} />
                        <feDisplacementMap in="SourceGraphic" scale="40" />
                    </filter>
                </defs>
            </svg>
            <div
                ref={lineHorizontalRef}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '3px',
                    background: `linear-gradient(to right, transparent, ${color} 15%, ${color} 85%, transparent)`,
                    pointerEvents: 'none',
                    transform: 'translateY(50%)',
                    opacity: 0
                }}
            ></div>
            <div
                ref={lineVerticalRef}
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '3px',
                    background: `linear-gradient(to bottom, transparent, ${color} 15%, ${color} 85%, transparent)`,
                    pointerEvents: 'none',
                    transform: 'translateX(50%)',
                    opacity: 0
                }}
            ></div>
        </div>,
        document.body
    );
};

// ClickSpark Component
const ClickSpark = ({
    sparkColor = '#ff69b4',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1.0
}) => {
    const canvasRef = useRef(null);
    const sparksRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const easeFunc = (t) => {
        switch (easing) {
            case 'linear': return t;
            case 'ease-in': return t * t;
            case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default: return t * (2 - t);
        }
    };

    const [resolvedColor, setResolvedColor] = useState(sparkColor);

    useEffect(() => {
        const updateColor = () => {
            if (sparkColor.startsWith('var(')) {
                const varName = sparkColor.match(/var\(([^)]+)\)/)[1];
                setResolvedColor(getComputedStyle(document.documentElement).getPropertyValue(varName).trim());
            } else {
                setResolvedColor(sparkColor);
            }
        };
        updateColor();
        window.addEventListener('theme-change', updateColor);
        return () => window.removeEventListener('theme-change', updateColor);
    }, [sparkColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationId;

        const draw = (timestamp) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparksRef.current = sparksRef.current.filter(spark => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) return false;

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = resolvedColor;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);

        return () => cancelAnimationFrame(animationId);
    }, [resolvedColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale]);

    useEffect(() => {
        const handleClick = (e) => {
            const now = performance.now();
            const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
                x: e.clientX,
                y: e.clientY,
                angle: (2 * Math.PI * i) / sparkCount,
                startTime: now
            }));
            sparksRef.current.push(...newSparks);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [sparkCount]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10001
            }}
        />
    );
};

// CurvedLoop Component
const CurvedLoop = ({
    marqueeText = '',
    speed = 2,
    className,
    curveAmount = 400,
    direction = 'left',
    interactive = true
}) => {
    const text = (() => {
        const hasTrailing = /\s|\u00A0$/.test(marqueeText);
        return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0';
    })();

    const measureRef = useRef(null);
    const textPathRef = useRef(null);
    const pathRef = useRef(null);
    const [spacing, setSpacing] = useState(0);
    const [offset, setOffset] = useState(0);
    const uid = useId();
    const pathId = `curve-${uid}`;
    const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

    const dragRef = useRef(false);
    const lastXRef = useRef(0);
    const dirRef = useRef(direction);
    const velRef = useRef(0);

    const textLength = spacing;
    const totalText = textLength
        ? Array(Math.ceil(1800 / textLength) + 2).fill(text).join('')
        : text;
    const ready = spacing > 0;

    useEffect(() => {
        if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
    }, [text, className]);

    useEffect(() => {
        if (!spacing) return;
        if (textPathRef.current) {
            const initial = -spacing;
            textPathRef.current.setAttribute('startOffset', initial + 'px');
            setOffset(initial);
        }
    }, [spacing]);

    useEffect(() => {
        if (!spacing || !ready) return;
        let frame = 0;
        const step = () => {
            if (!dragRef.current && textPathRef.current) {
                const delta = dirRef.current === 'right' ? speed : -speed;
                const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
                let newOffset = currentOffset + delta;

                const wrapPoint = spacing;
                if (newOffset <= -wrapPoint) newOffset += wrapPoint;
                if (newOffset > 0) newOffset -= wrapPoint;

                textPathRef.current.setAttribute('startOffset', newOffset + 'px');
                setOffset(newOffset);
            }
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [spacing, speed, ready]);

    const onPointerDown = e => {
        if (!interactive) return;
        dragRef.current = true;
        lastXRef.current = e.clientX;
        velRef.current = 0;
        e.target.setPointerCapture(e.pointerId);
    };

    const onPointerMove = e => {
        if (!interactive || !dragRef.current || !textPathRef.current) return;
        const dx = e.clientX - lastXRef.current;
        lastXRef.current = e.clientX;
        velRef.current = dx;

        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + dx;

        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
    };

    const endDrag = () => {
        if (!interactive) return;
        dragRef.current = false;
        dirRef.current = velRef.current > 0 ? 'right' : 'left';
    };

    const cursorStyle = interactive ? 'grab' : 'auto';

    return (
        <div
            className="curved-loop-jacket"
            style={{ visibility: ready ? 'visible' : 'hidden', cursor: cursorStyle }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
        >
            <svg className="curved-loop-svg" viewBox="0 0 1440 120">
                <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                    {text}
                </text>
                <defs>
                    <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
                </defs>
                {ready && (
                    <text fontWeight="bold" xmlSpace="preserve" className={className}>
                        <textPath ref={textPathRef} href={`#${pathId}`} startOffset={offset + 'px'} xmlSpace="preserve">
                            {totalText}
                        </textPath>
                    </text>
                )}
            </svg>
        </div>
    );
};

// Render both effects
const App = () => (
    <>
        <Crosshair color="var(--accent-color)" />
        <ClickSpark sparkColor="var(--accent-secondary)" sparkSize={25} sparkRadius={40} sparkCount={12} duration={500} />
    </>
);

const crosshairRootEl = document.getElementById('crosshair-root');
if (crosshairRootEl) {
    ReactDOM.createRoot(crosshairRootEl).render(<App />);
}
// Render CurvedLoop title
ReactDOM.createRoot(document.getElementById('curved-title-root')).render(
    <CurvedLoop
        marqueeText="✦ Projetos ✦ Projetos ✦ Projetos "
        speed={1.5}
        curveAmount={150}
        direction="left"
        interactive
    />
);

// Render CurvedLoop About title
ReactDOM.createRoot(document.getElementById('curved-about-title-root')).render(
    <CurvedLoop
        marqueeText="✦ Sobre mim ✦ Sobre mim ✦ Sobre mim "
        speed={1.5}
        curveAmount={150}
        direction="left"
        interactive
    />
);

// GridDistortion Component with Three.js
const GridDistortion = ({ grid = 15, mouse = 0.1, strength = 0.15, relaxation = 0.9, imageSrc }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
        camera.position.z = 2;

        const vertexShader = `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;

        const fragmentShader = `
                    uniform sampler2D uDataTexture;
                    uniform sampler2D uTexture;
                    varying vec2 vUv;
                    void main() {
                        vec2 uv = vUv;
                        vec4 offset = texture2D(uDataTexture, vUv);
                        vec4 color = texture2D(uTexture, uv - 0.02 * offset.rg);
                        // Convert to grayscale
                        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        gl_FragColor = vec4(vec3(gray), color.a);
                    }
                `;

        const uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector4() },
            uTexture: { value: null },
            uDataTexture: { value: null }
        };

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imageSrc, texture => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            uniforms.uTexture.value = texture;
            handleResize();
        });

        const size = grid;
        const data = new Float32Array(4 * size * size);
        for (let i = 0; i < size * size; i++) {
            data[i * 4] = Math.random() * 255 - 125;
            data[i * 4 + 1] = Math.random() * 255 - 125;
        }

        const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
        dataTexture.needsUpdate = true;
        uniforms.uDataTexture.value = dataTexture;

        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        const handleResize = () => {
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (width === 0 || height === 0) return;

            renderer.setSize(width, height);
            const containerAspect = width / height;
            plane.scale.set(containerAspect, 1, 1);

            const frustumHeight = 1;
            const frustumWidth = frustumHeight * containerAspect;
            camera.left = -frustumWidth / 2;
            camera.right = frustumWidth / 2;
            camera.top = frustumHeight / 2;
            camera.bottom = -frustumHeight / 2;
            camera.updateProjectionMatrix();
            uniforms.resolution.value.set(width, height, 1, 1);
        };

        // Debounced resize to avoid layout thrashing on every pixel
        let resizeTimer;
        const debouncedResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 150);
        };
        window.addEventListener('resize', debouncedResize);

        const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };

        const handleMouseMove = e => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1 - (e.clientY - rect.top) / rect.height;
            mouseState.vX = x - mouseState.prevX;
            mouseState.vY = y - mouseState.prevY;
            Object.assign(mouseState, { x, y, prevX: x, prevY: y });
        };

        container.addEventListener('mousemove', handleMouseMove);
        handleResize();

        let animationId = null;
        let isVisible = true;

        // Pause WebGL loop when header is off-screen (saves GPU when scrolled away)
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                animate();
            }
        }, { threshold: 0 });
        visibilityObserver.observe(container);

        const animate = () => {
            if (!isVisible) {
                animationId = null;
                return;
            }
            animationId = requestAnimationFrame(animate);
            uniforms.time.value += 0.05;

            const data = dataTexture.image.data;
            for (let i = 0; i < size * size; i++) {
                data[i * 4] *= relaxation;
                data[i * 4 + 1] *= relaxation;
            }

            const gridMouseX = size * mouseState.x;
            const gridMouseY = size * mouseState.y;
            const maxDist = size * mouse;
            const maxDistSq = maxDist * maxDist;

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    // Use direct multiplication instead of Math.pow (much faster in hot loops)
                    const dx = gridMouseX - i;
                    const dy = gridMouseY - j;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < maxDistSq) {
                        const index = 4 * (i + size * j);
                        const power = Math.min(maxDist / Math.sqrt(distSq || 0.0001), 10);
                        data[index] += strength * 100 * mouseState.vX * power;
                        data[index + 1] -= strength * 100 * mouseState.vY * power;
                    }
                }
            }

            dataTexture.needsUpdate = true;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(resizeTimer);
            visibilityObserver.disconnect();
            window.removeEventListener('resize', debouncedResize);
            container.removeEventListener('mousemove', handleMouseMove);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            dataTexture.dispose();
        };

    }, [grid, mouse, strength, relaxation, imageSrc]);

    return (
        <div
            ref={containerRef}
            className="distortion-container"
        />
    );
};

// GridDistortion Slideshow for header
const GridDistortionSlideshow = () => {
    // Use dynamic projects data
    const images = (window.projectsData || []).map(p => p.image).filter(Boolean);
    // Fallback if no images found
    if (images.length === 0) images.push('project_1.webp', 'project_2.webp', 'project_3.webp');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(() => (Math.random() * 16) - 8);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            // 1. Start Glitch on old image
            setIsGlitching(true);

            // 2. Change image and rotation after 300ms (effect bridges the swap)
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % images.length);
                setRotation((Math.random() * 16) - 8);
            }, 300);

            // 3. Stop glitch after total 800ms
            setTimeout(() => setIsGlitching(false), 800);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={isGlitching ? 'glitch-container glitch-active' : 'glitch-container'}
            style={{
                height: '70%',
                aspectRatio: '1 / 1',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.1s ease-out'
            }}
        >
            <img
                src={images[currentIndex]}
                alt="Project"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(100%)'
                }}
            />
        </div>
    );
};

// Render GridDistortion slideshow in header
// Preloader Logic using Framer Motion


function DockItem({ children, onClick, mouseX, spring, distance, magnification, baseItemSize }) {
    const ref = useRef(null);

    const mouseDistance = useTransform(mouseX, val => {
        // Get the current center of this word
        const rect = ref.current?.getBoundingClientRect() ?? { left: 0, width: 0 };
        return val - (rect.left + rect.width / 2);
    });

    // scale factor (from 1 to approx 1.6)
    const scale = useTransform(mouseDistance, [-distance, 0, distance], [1, 1.6, 1]);
    const springScale = useSpring(scale, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                scale: springScale,
                // This dynamic padding pushes neighbors as the word expands
                paddingLeft: useTransform(springScale, s => `${(s - 1) * 40}px`),
                paddingRight: useTransform(springScale, s => `${(s - 1) * 40}px`),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
            }}
            onClick={onClick}
            className="dock-item"
        >
            {children}
        </motion.div>
    );
}

function Dock({
    items,
    className = '',
    spring = { mass: 0.1, stiffness: 150, damping: 12 },
    magnification = 60,
    distance = 150,
    panelHeight = 64,
    baseItemSize = 48
}) {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="dock-outer">
            <motion.div
                onMouseMove={({ pageX }) => mouseX.set(pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className={`dock-panel ${className}`}
            >
                {items.map((item, index) => (
                    <DockItem
                        key={index}
                        onClick={item.onClick}
                        mouseX={mouseX}
                        spring={spring}
                        distance={distance}
                        magnification={magnification}
                        baseItemSize={baseItemSize}
                    >
                        <span className="dock-icon">{item.label}</span>
                    </DockItem>
                ))}
            </motion.div>
        </div>
    );
}

const NavigationDock = () => {
    const items = [
        { label: 'Início', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        { label: 'Projetos', onClick: () => document.getElementById('work').scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Contato', onClick: () => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) },
    ];

    return (
        <Dock items={items} magnification={80} distance={200} />
    );
};



const STRIP_CHARS = "abcdefghijklmnopqrstuvwxyz.@#$%&*!?†§◆★●"; // Comic book swear symbols  
const REPEATED_STRIP = STRIP_CHARS.repeat(4);

function CharacterStrip({ targetChar, height, duration, delay }) {
    const baseIndex = STRIP_CHARS.indexOf(targetChar.toLowerCase());
    // Target is in the last set (3rd index 2) to ensure long scroll
    const targetIndex = baseIndex + (STRIP_CHARS.length * 3);

    // Start at a random position in the first set
    const startIndex = Math.floor(Math.random() * STRIP_CHARS.length);

    // Faster spring physics for ~1s settling time
    const springValue = useSpring(startIndex, { stiffness: 120, damping: 20 });

    useEffect(() => {
        const timeout = setTimeout(() => {
            springValue.set(targetIndex);
        }, delay);
        return () => clearTimeout(timeout);
    }, [targetIndex, delay]);

    const y = useTransform(springValue, (latest) => -latest * height);

    return (
        <div style={{ height: height, overflow: 'hidden', position: 'relative', marginLeft: '-0.05em' }}>
            <motion.div style={{ y, display: 'flex', flexDirection: 'column' }}>
                {REPEATED_STRIP.split('').map((char, i) => (
                    <div key={i} className="counter-number" style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {char}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

const Preloader = () => {
    const [visible, setVisible] = useState(true);
    const targetText = "madebygabs.";

    const fontSize = window.innerWidth < 600 ? window.innerWidth * 0.12 : window.innerWidth * 0.08;
    const height = fontSize * 1.1;

    // Cleanup parent style (anti-flash) once React takes over
    useEffect(() => {
        const root = document.getElementById('preloader-root');
        if (root) {
            root.style.background = 'transparent';
            root.style.zIndex = 'auto';
            root.removeAttribute('style');
        }
    }, []);

    useEffect(() => {
        document.body.classList.add('preloading');

        // State to track conditions
        let isMounted = true;
        let minTimeElapsed = false;
        let windowLoaded = document.readyState === 'complete';

        const checkDone = () => {
            if (minTimeElapsed && windowLoaded && isMounted) {
                setVisible(false);
                document.body.classList.remove('preloading');
            }
        };

        // 1. Minimum branding time (2.5s)
        const minTimer = setTimeout(() => {
            minTimeElapsed = true;
            checkDone();
        }, 2500);

        // 2. Listen for window load (if not already loaded)
        const handleLoad = () => {
            windowLoaded = true;
            checkDone();
        };

        if (!windowLoaded) {
            window.addEventListener('load', handleLoad);
        } else {
            // Already loaded
            checkDone();
        }

        const maxTimer = setTimeout(() => {
            if (isMounted) {
                setVisible(false);
                document.body.classList.remove('preloading');
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearTimeout(minTimer);
            clearTimeout(maxTimer);
            window.removeEventListener('load', handleLoad);
            document.body.classList.remove('preloading');
        };
    }, []);

    // Generate random delays for columns once on mount
    const columnDelays = useMemo(() => {
        const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
        // Shuffle array
        for (let i = delays.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [delays[i], delays[j]] = [delays[j], delays[i]];
        }
        return delays;
    }, []);

    // Staggered Slide Up animation - 6 columns + Text independent
    return (
        <>
            {/* Background Columns */}
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <motion.div
                    key={`col-${index}`}
                    className="preloader-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: `${index * (100 / 6)}%`,
                        width: `calc(${100 / 6}% + 2px)`,
                        height: '100%',
                        background: 'var(--accent-color)',
                        zIndex: 99999,
                    }}
                    initial={{ y: 0 }}
                    animate={{
                        y: visible ? 0 : '-100%',
                        pointerEvents: visible ? 'auto' : 'none'
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                        delay: visible ? 0 : columnDelays[index] // Random delays
                    }}
                />
            ))}

            {/* Text Container - Absolute on top */}
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000,
                    pointerEvents: 'none'
                }}
                initial={{ y: 0 }}
                animate={{
                    y: visible ? 0 : '-100%',
                }}
                transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: visible ? 0 : 0.15 // Sync with middle columns
                }}
            >
                <div style={{
                    display: 'flex',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: fontSize,
                    color: 'var(--bg-color)',
                    height: height,
                    overflow: 'hidden',
                    lineHeight: 1,
                    marginLeft: '0.05em'
                }}>
                    {targetText.split('').map((char, i) => (
                        <CharacterStrip
                            key={i}
                            targetChar={char}
                            height={height}
                            delay={100 + i * 80}
                            duration={1000}
                        />
                    ))}
                </div>
            </motion.div>
        </>
    );
};

// Projects Data (Loaded from script.js window.projectsData)
// Edite os projetos no arquivo script.js!
const projectsData = window.projectsData || [];

// Helper to format category display
const getCategoryLabel = (cat) => Array.isArray(cat) ? cat.join(" • ") : cat;



// Content Block Renderer Component
const ContentBlock = ({ block, onImageClick }) => {
    switch (block.type) {
        case 'text':
            return (
                <p style={{
                    fontSize: '1.2rem',
                    lineHeight: 1.6,
                    opacity: 0.9,
                    maxWidth: '700px',
                    marginBottom: '1.5rem',
                    whiteSpace: 'pre-line' // Respect line breaks
                }}>
                    {block.content}
                </p>
            );
        case 'image':
            return (
                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    <img
                        src={block.url}
                        alt={block.caption || ''}
                        loading="lazy"
                        onClick={() => onImageClick && onImageClick(block.url)}
                        style={{
                            width: block.width === 'half' ? '50%' : '100%',
                            borderRadius: '8px',
                            display: 'block',
                            cursor: 'zoom-in',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.01)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                    {block.caption && (
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                        }}>{block.caption}</p>
                    )}
                </div>
            );
        case 'video':
            // Simple Youtube embed detection or direct video
            const isYoutube = block.url.includes('youtube') || block.url.includes('youtu.be');
            return (
                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    {isYoutube ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src={block.url.replace('watch?v=', 'embed/')}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <video controls style={{ width: '100%', borderRadius: '8px' }}>
                            <source src={block.url} type="video/mp4" />
                            Seu navegador não suporta vídeos.
                        </video>
                    )}
                    {block.caption && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{block.caption}</p>
                    )}
                </div>
            );
        default:
            return null;
    }
};

// Lightbox Component
const Lightbox = ({ src, onClose }) => {
    if (!src) return null;

    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.95)',
                zIndex: 10000000, // Above everything
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
                left: 0
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <motion.img
                src={src}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{
                    maxWidth: '95%',
                    maxHeight: '95%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
            />
            <button
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000001
                }}
            >✕</button>
        </motion.div>,
        document.body
    );
};

// Project Detail Modal (Overlay)
const ProjectDetail = ({ project, onClose }) => {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);


    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copiado para a área de transferência!");
            setShowShareMenu(false);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: project.title,
            text: `Confira o projeto ${project.title} de Gabriel Santos!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop if native share not supported
                const text = encodeURIComponent(shareData.text + ' ' + shareData.url);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }
            setShowShareMenu(false);
        } catch (err) {
            console.log('Error sharing:', err);
        }
    };

    // Use Portal to render outside the main DOM hierarchy (avoids z-index/clipping issues)
    return ReactDOM.createPortal(
        <motion.div
            className="details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.95)', // Slightly darker for focus
                zIndex: 999999, // Max z-index
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0 // Remove padding for full screen
            }}
            onClick={onClose} // Close on backdrop click
        >
            <motion.div
                layoutId={`card-${project.id}`}
                className="details-card"
                style={{
                    background: 'var(--bg-color)',
                    width: '100%',
                    height: '100%', // Full height
                    maxWidth: 'none', // Remove limit
                    maxHeight: 'none', // Remove limit
                    borderRadius: 0, // No border radius
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none' // No shadow needed for fullscreen
                }}
                onClick={(e) => e.stopPropagation()} // Prevent close on card click
            >
                {/* Close Button kept absolute/fixed on card */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    ✕
                </button>

                <motion.div
                    className="details-content"
                    style={{
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        padding: '0', // Full width image needs 0 padding on container
                        scrollBehavior: 'smooth'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Image moved INSIDE scrollable area */}
                    <div style={{ position: 'relative', width: '100%', height: '60vh', minHeight: '300px' }}>
                        <motion.img
                            layoutId={`image-${project.id}`}
                            src={project.image}
                            alt={project.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                            onClick={() => setLightboxImage(project.image)}
                        />
                    </div>

                    <div style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: '2.5rem',
                        paddingBottom: '100px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <motion.h2 layoutId={`title-${project.id}`} style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                                        margin: 0,
                                        lineHeight: 1.1,
                                        maxWidth: '85%'
                                    }}>
                                        {project.title}
                                    </motion.h2>

                                    {/* Share Icon Button */}
                                    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setShowShareMenu(!showShareMenu)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '8px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.2s',
                                                color: 'var(--text-primary)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="18" cy="5" r="3"></circle>
                                                <circle cx="6" cy="12" r="3"></circle>
                                                <circle cx="18" cy="19" r="3"></circle>
                                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                            </svg>
                                        </button>

                                        {/* Share Menu Popup */}
                                        {showShareMenu && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '0',
                                                background: 'var(--bg-color)',
                                                border: '1px solid currentColor',
                                                borderRadius: '12px',
                                                padding: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                zIndex: 100,
                                                minWidth: '160px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                marginTop: '8px'
                                            }}>
                                                <button
                                                    onClick={handleCopyLink}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: '10px',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontFamily: 'var(--font-body)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <span>🔗</span> Copiar Link
                                                </button>
                                                <button
                                                    onClick={handleNativeShare}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: '10px',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontFamily: 'var(--font-body)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-primary)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <span>📤</span> Compartilhar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <motion.span layoutId={`cat-${project.id}`} style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '1.1rem',
                                    color: 'var(--accent-color)',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {getCategoryLabel(project.category)}
                                </motion.span>

                                {/* Technologies moved to header */}
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4 style={{
                                        fontFamily: 'var(--font-heading)',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        opacity: 0.7,
                                        letterSpacing: '0.05em'
                                    }}>Ferramentas usadas:</h4>
                                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                        {project.technologies.map(tech => (
                                            <span key={tech} style={{
                                                border: '1px solid var(--accent-color)',
                                                color: 'var(--accent-color)',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                background: 'transparent'
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Dynamic Content Rendering */}
                        <div className="project-body">
                            {project.content ? (
                                project.content.map((block, index) => (
                                    <ContentBlock
                                        key={index}
                                        block={block}
                                        onImageClick={(src) => setLightboxImage(src)}
                                    />
                                ))
                            ) : (
                                // Fallback for projects without modular content
                                <p style={{ fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.9, maxWidth: '700px', marginBottom: '2rem' }}>
                                    {project.longDescription}
                                </p>
                            )}
                        </div>






                    </div>

                    {/* Project Footer CTA Link - Full Width */}
                    {project.link && project.link !== "#" && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '200px', // Smaller height
                                position: 'relative',
                                textDecoration: 'none',
                                marginTop: 0, // No margin top needed
                                border: 'none',
                                borderRadius: 0 // Flush edges
                            }}
                        >
                            {/* Grayscale Background Image */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${project.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'grayscale(100%) brightness(0.4)', // Black & white and dark
                                zIndex: 1
                            }}></div>

                            {/* CTA Button */}
                            <div style={{
                                position: 'relative',
                                zIndex: 2,
                                background: 'var(--accent-color)',
                                color: 'var(--bg-color)',
                                padding: '1.2rem 3rem',
                                borderRadius: '50px',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 'bold',
                                fontSize: '1.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                transition: 'transform 0.2s ease'
                            }}>
                                Veja esse projeto aqui ↗
                            </div>
                        </a>
                    )}

                    {/* Credits Section (Moved) */}
                    {project.credits && project.credits.length > 0 && (
                        <div style={{
                            maxWidth: '900px',
                            margin: '0 auto',
                            padding: '2.5rem',
                            paddingTop: '2rem' // Spacing after banner
                        }}>
                            <div style={{
                                // Removed borderTop as banner acts as divider
                                // borderTop: '1px solid rgba(0,0,0,0.1)',
                                // paddingTop: '1.5rem',
                                marginTop: '0',
                                marginBottom: '3rem'
                            }}>
                                <h4 style={{
                                    fontFamily: 'var(--font-heading)',
                                    marginBottom: '1rem',
                                    fontSize: '1.1rem'
                                }}>Créditos</h4>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    display: 'grid',
                                    gap: '0.5rem'
                                }}>
                                    {project.credits.map((credit, idx) => (
                                        <li key={idx} style={{
                                            fontSize: '1rem',
                                            color: 'var(--text-primary)' // Ensure visibility on bg
                                        }}>
                                            • {credit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
            {/* Lightbox Rendering */}
            <AnimatePresence>
                {lightboxImage && (
                    <Lightbox
                        src={lightboxImage}
                        onClose={() => setLightboxImage(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div >,
        document.getElementById('modal-root')
    );
};

// MAGIC BENTO COMPONENTS
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: rgba(${color || DEFAULT_GLOW_COLOR}, 1);
                box-shadow: 0 0 6px rgba(${color || DEFAULT_GLOW_COLOR}, 0.6);
                pointer-events: none;
                z-index: 100;
                left: ${x}px;
                top: ${y}px;
            `;
    return el;
};

const calculateSpotlightValues = radius => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false,
    onClick
}) => {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const timeoutsRef = useRef([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimationRef = useRef(null);

    const initializeParticles = React.useCallback(() => {
        if (particlesInitialized.current || !cardRef.current) return;

        const { width, height } = cardRef.current.getBoundingClientRect();
        memoizedParticles.current = Array.from({ length: particleCount }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, glowColor)
        );
        particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = React.useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        magnetismAnimationRef.current?.kill();

        particlesRef.current.forEach(particle => {
            gsap.to(particle, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    particle.parentNode?.removeChild(particle);
                }
            });
        });
        particlesRef.current = [];
    }, []);

    const animateParticles = React.useCallback(() => {
        if (!cardRef.current || !isHoveredRef.current) return;

        if (!particlesInitialized.current) {
            initializeParticles();
        }

        memoizedParticles.current.forEach((particle, index) => {
            const timeoutId = setTimeout(() => {
                if (!isHoveredRef.current || !cardRef.current) return;

                const clone = particle.cloneNode(true);
                cardRef.current.appendChild(clone);
                particlesRef.current.push(clone);

                gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

                gsap.to(clone, {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotation: Math.random() * 360,
                    duration: 2 + Math.random() * 2,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true
                });

                gsap.to(clone, {
                    opacity: 0.3,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    repeat: -1,
                    yoyo: true
                });
            }, index * 100);

            timeoutsRef.current.push(timeoutId);
        });
    }, [initializeParticles]);

    useEffect(() => {
        if (disableAnimations || !cardRef.current) return;

        const element = cardRef.current;

        const handleMouseEnter = () => {
            isHoveredRef.current = true;
            animateParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 5,
                    rotateY: 5,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }
        };

        const handleMouseLeave = () => {
            isHoveredRef.current = false;
            clearAllParticles();

            if (enableTilt) {
                gsap.to(element, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }

            if (enableMagnetism) {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleMouseMove = e => {
            if (!enableTilt && !enableMagnetism) return;

            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                gsap.to(element, {
                    rotateX,
                    rotateY,
                    duration: 0.1,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }

            if (enableMagnetism) {
                const magnetX = (x - centerX) * 0.05;
                const magnetY = (y - centerY) * 0.05;

                magnetismAnimationRef.current = gsap.to(element, {
                    x: magnetX,
                    y: magnetY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleClick = e => {
            if (onClick) onClick(); // Custom handler

            if (!clickEffect) return;

            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const maxDistance = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
            );

            const ripple = document.createElement('div');
            ripple.style.cssText = `
                        position: absolute;
                        width: ${maxDistance * 2}px;
                        height: ${maxDistance * 2}px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                        left: ${x - maxDistance}px;
                        top: ${y - maxDistance}px;
                        pointer-events: none;
                        z-index: 1000;
                    `;

            element.appendChild(ripple);

            gsap.fromTo(
                ripple,
                {
                    scale: 0,
                    opacity: 1
                },
                {
                    scale: 1,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                }
            );
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('click', handleClick);

        return () => {
            isHoveredRef.current = false;
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('click', handleClick);
            clearAllParticles();
        };
    }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor, onClick]);

    return (
        <div
            ref={cardRef}
            className={`${className} particle-container`}
            style={{ ...style, position: 'relative', overflow: 'hidden' }}
        >
            {children}
        </div>
    );
};

const GlobalSpotlight = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
    const spotlightRef = useRef(null);
    const isInsideSection = useRef(false);

    useEffect(() => {
        if (disableAnimations || !gridRef?.current || !enabled) return;

        const spotlight = document.createElement('div');
        spotlight.className = 'global-spotlight';
        spotlight.style.cssText = `
              position: fixed;
              width: 800px;
              height: 800px;
              border-radius: 50%;
              pointer-events: none;
              background: radial-gradient(circle,
                rgba(${glowColor}, 0.15) 0%,
                rgba(${glowColor}, 0.08) 15%,
                rgba(${glowColor}, 0.04) 25%,
                rgba(${glowColor}, 0.02) 40%,
                rgba(${glowColor}, 0.01) 65%,
                transparent 70%
              );
              z-index: 200;
              opacity: 0;
              transform: translate(-50%, -50%);
              mix-blend-mode: screen;
            `;
        document.body.appendChild(spotlight);
        spotlightRef.current = spotlight;

        const handleMouseMove = e => {
            if (!spotlightRef.current || !gridRef.current) return;

            const section = gridRef.current.closest('.bento-section');
            const rect = section?.getBoundingClientRect();
            const mouseInside =
                rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

            isInsideSection.current = mouseInside || false;
            const cards = gridRef.current.querySelectorAll('.magic-bento-card');

            if (!mouseInside) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                cards.forEach(card => {
                    card.style.setProperty('--glow-intensity', '0');
                });
                return;
            }

            const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardElement = card;
                const cardRect = cardElement.getBoundingClientRect();
                const centerX = cardRect.left + cardRect.width / 2;
                const centerY = cardRect.top + cardRect.height / 2;
                const distance =
                    Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
                const effectiveDistance = Math.max(0, distance);

                minDistance = Math.min(minDistance, effectiveDistance);

                let glowIntensity = 0;
                if (effectiveDistance <= proximity) {
                    glowIntensity = 1;
                } else if (effectiveDistance <= fadeDistance) {
                    glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                }

                updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
            });

            gsap.to(spotlightRef.current, {
                left: e.clientX,
                top: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });

            const targetOpacity =
                minDistance <= proximity
                    ? 0.8
                    : minDistance <= fadeDistance
                        ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                        : 0;

            gsap.to(spotlightRef.current, {
                opacity: targetOpacity,
                duration: targetOpacity > 0 ? 0.2 : 0.5,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            isInsideSection.current = false;
            gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
                card.style.setProperty('--glow-intensity', '0');
            });
            if (spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
        };
    }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

    return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
    <div className="card-grid bento-section" ref={gridRef}>
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento = ({
    projects = [],
    onProjectClick,
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true
}) => {
    const gridRef = useRef(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;

    return (
        <React.Fragment>
            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}

            <BentoCardGrid gridRef={gridRef}>
                {projects.map((project, index) => {
                    const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;

                    // Determine style based on index like standard Bento
                    // const style = {
                    //     backgroundColor: 'var(--background-dark)', // Or dynamic colour
                    //     '--glow-color': glowColor
                    // };

                    return (
                        <ParticleCard
                            key={project.id}
                            className={baseClassName}
                            style={{
                                backgroundColor: '#060010',
                                '--glow-color': glowColor
                            }}
                            disableAnimations={shouldDisableAnimations}
                            particleCount={particleCount}
                            glowColor={glowColor}
                            enableTilt={enableTilt}
                            clickEffect={clickEffect}
                            enableMagnetism={enableMagnetism}
                            onClick={() => onProjectClick(project.id)}
                        >
                            <div className="magic-bento-card__header">
                                <div className="magic-bento-card__label">{getCategoryLabel(project.category)}</div>
                            </div>
                            <div className="magic-bento-card__content">
                                {/* Card Image handled as background or separate? Standard Bento usually text focus, let's keep text focus as per example but maybe show image on hover? Or just text? The example only had text. Let's stick to the example components but populate with project data. */}
                                <h2 className="magic-bento-card__title">{project.title}</h2>
                            </div>

                            {/* Optional: Background Image with low opacity? */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${project.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.2,
                                zIndex: 0,
                                filter: 'grayscale(100%)'
                            }}></div>
                        </ParticleCard>
                    );
                })}
            </BentoCardGrid>
        </React.Fragment>
    );
};

const ProjectsApp = () => {
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);

    // Extract unique categories dynamically from projects data
    const categories = useMemo(() => {
        const uniqueCats = new Set();
        projectsData.forEach(p => {
            if (Array.isArray(p.category)) {
                p.category.forEach(c => uniqueCats.add(c));
            } else {
                uniqueCats.add(p.category);
            }
        });
        return ['all', ...Array.from(uniqueCats)];
    }, []);

    const filteredProjects = filter === 'all'
        ? projectsData
        : projectsData.filter(p => {
            // Support array of categories or single string
            if (Array.isArray(p.category)) {
                return p.category.includes(filter);
            }
            return p.category === filter;
        });

    const selectedProject = projectsData.find(p => p.id === selectedId);

    // Lock body scroll and pause background animation when modal is open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
            window.dispatchEvent(new CustomEvent('modal-open'));
        } else {
            document.body.style.overflow = '';
            window.dispatchEvent(new CustomEvent('modal-closed'));
        }
    }, [selectedId]);

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>

            <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                marginBottom: '2rem',
                fontWeight: '500',
                opacity: 0.9
            }}>
                Conheça um pouco mais sobre os projetos em que eu trabalhei!
            </p>

            {/* Filters */}
            <div className="filter-buttons" style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat === 'all' ? 'Todos' : cat}
                    </button>
                ))}
            </div>

            {/* MagicBento Grid */}
            <MagicBento
                projects={filteredProjects}
                onProjectClick={setSelectedId}
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={true}
                spotlightRadius={400}
                particleCount={12}
                glowColor="var(--accent-color-rgb)"
                disableAnimations={false}
            />

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedId && selectedProject && (
                    <ProjectDetail
                        project={selectedProject}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('projects-root')).render(<ProjectsApp />);

ReactDOM.createRoot(document.getElementById('preloader-root')).render(<Preloader />);

// Render GridDistortion slideshow in header
ReactDOM.createRoot(document.getElementById('grid-distortion-root')).render(
    <GridDistortionSlideshow />
);

// Theme Management
const getThemeColors = (theme) => {
    if (theme === 'theme2') {
        return {
            bg: [0.004, 0.651, 0.424], // #01a66c Green
            wave: [0.0, 0.0, 0.0]      // Black Wave
        };
    }
    if (theme === 'theme3') {
        return {
            bg: [0.0, 0.0, 0.0],       // #000000 Black
            wave: [1.0, 1.0, 1.0]      // White Wave
        };
    }
    // Default Theme 1 (Risograph)
    return {
        bg: [0.957, 0.906, 0.831], // #F4E7D4 Cream
        wave: [0.0, 0.0, 0.0]      // Black Wave
    };
};

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Random theme on load
        const themes = ['theme1', 'theme2', 'theme3'];
        return themes[Math.floor(Math.random() * themes.length)];
    });

    // Apply theme on mount
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        // Dispatch event so other components (like GridDistortion) update
        window.dispatchEvent(new CustomEvent('theme-change', {
            detail: { theme: currentTheme }
        }));
    }, []);

    const setTheme = (theme) => {
        setCurrentTheme(theme);
        localStorage.setItem('site-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);

        window.dispatchEvent(new CustomEvent('theme-change', {
            detail: { theme }
        }));
    };

    return (
        <div className="theme-switcher" style={{
            position: 'fixed',
            bottom: '2rem',
            right: '1.5rem',
            zIndex: 10001,
            display: 'flex',
            gap: '12px',
            transition: 'all 0.4s ease'
        }}>
            {/* Theme 1: Cream */}
            <button
                onClick={() => setTheme('theme1')}
                aria-label="Theme 1"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#F4E7D4',
                    border: currentTheme === 'theme1' ? '3px solid #ed2d92' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s',
                    transform: currentTheme === 'theme1' ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                    color: '#000000',
                    fontSize: '14px'
                }}
            >1</button>
            {/* Theme 2: Green */}
            <button
                onClick={() => setTheme('theme2')}
                aria-label="Theme 2"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#01a66c',
                    border: currentTheme === 'theme2' ? '3px solid #ed2d92' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s',
                    transform: currentTheme === 'theme2' ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: '14px'
                }}
            >2</button>
            {/* Theme 3: Black/Pink */}
            <button
                onClick={() => setTheme('theme3')}
                aria-label="Theme 3"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#000000',
                    border: currentTheme === 'theme3' ? '3px solid #ed2d92' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                    transform: currentTheme === 'theme3' ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: '14px'
                }}
            >3</button>
        </div>
    );
};

// Dither Background Effect Component


const DitherBackground = ({
    waveSpeed = 0.05,
    waveFrequency = 3,
    waveAmplitude = 0.3,
    colorNum = 4,
    pixelSize = 2,
    enableMouseInteraction = true,
    mouseRadius = 0.3
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const vertexShader = `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;

        const fragmentShader = `
                    precision highp float;
                    uniform vec2 resolution;
                    uniform float time;
                    uniform float waveSpeed;
                    uniform float waveFrequency;
                    uniform float waveAmplitude;
                    uniform vec3 waveColor;
                    uniform vec3 backgroundColor;
                    uniform vec2 mousePos;
                    uniform int enableMouseInteraction;
                    uniform float mouseRadius;
                    uniform float colorNum;
                    uniform float pixelSize;

                    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
                    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
                    vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

                    float cnoise(vec2 P) {
                        vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
                        vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
                        Pi = mod289(Pi);
                        vec4 ix = Pi.xzxz, iy = Pi.yyww;
                        vec4 fx = Pf.xzxz, fy = Pf.yyww;
                        vec4 i = permute(permute(ix) + iy);
                        vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
                        vec4 gy = abs(gx) - 0.5;
                        vec4 tx = floor(gx + 0.5);
                        gx = gx - tx;
                        vec2 g00 = vec2(gx.x, gy.x), g10 = vec2(gx.y, gy.y);
                        vec2 g01 = vec2(gx.z, gy.z), g11 = vec2(gx.w, gy.w);
                        vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11));
                        g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
                        float n00 = dot(g00, vec2(fx.x, fy.x)), n10 = dot(g10, vec2(fx.y, fy.y));
                        float n01 = dot(g01, vec2(fx.z, fy.z)), n11 = dot(g11, vec2(fx.w, fy.w));
                        vec2 fade_xy = fade(Pf.xy);
                        vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
                        return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
                    }

                    float fbm(vec2 p) {
                        float value = 0.0, amp = 1.0, freq = waveFrequency;
                        for (int i = 0; i < 4; i++) {
                            value += amp * abs(cnoise(p));
                            p *= freq;
                            amp *= waveAmplitude;
                        }
                        return value;
                    }

                    float pattern(vec2 p) {
                        vec2 p2 = p - time * waveSpeed;
                        return fbm(p + fbm(p2));
                    }

                    // Bayer 8x8 dithering
                    float bayer8(vec2 pos) {
                        ivec2 p = ivec2(mod(pos, 8.0));
                        int index = p.x + p.y * 8;
                        float matrix[64];
                        matrix[0]=0.0; matrix[1]=48.0; matrix[2]=12.0; matrix[3]=60.0; matrix[4]=3.0; matrix[5]=51.0; matrix[6]=15.0; matrix[7]=63.0;
                        matrix[8]=32.0; matrix[9]=16.0; matrix[10]=44.0; matrix[11]=28.0; matrix[12]=35.0; matrix[13]=19.0; matrix[14]=47.0; matrix[15]=31.0;
                        matrix[16]=8.0; matrix[17]=56.0; matrix[18]=4.0; matrix[19]=52.0; matrix[20]=11.0; matrix[21]=59.0; matrix[22]=7.0; matrix[23]=55.0;
                        matrix[24]=40.0; matrix[25]=24.0; matrix[26]=36.0; matrix[27]=20.0; matrix[28]=43.0; matrix[29]=27.0; matrix[30]=39.0; matrix[31]=23.0;
                        matrix[32]=2.0; matrix[33]=50.0; matrix[34]=14.0; matrix[35]=62.0; matrix[36]=1.0; matrix[37]=49.0; matrix[38]=13.0; matrix[39]=61.0;
                        matrix[40]=34.0; matrix[41]=18.0; matrix[42]=46.0; matrix[43]=30.0; matrix[44]=33.0; matrix[45]=17.0; matrix[46]=45.0; matrix[47]=29.0;
                        matrix[48]=10.0; matrix[49]=58.0; matrix[50]=6.0; matrix[51]=54.0; matrix[52]=9.0; matrix[53]=57.0; matrix[54]=5.0; matrix[55]=53.0;
                        matrix[56]=42.0; matrix[57]=26.0; matrix[58]=38.0; matrix[59]=22.0; matrix[60]=41.0; matrix[61]=25.0; matrix[62]=37.0; matrix[63]=21.0;
                        return matrix[index] / 64.0;
                    }

                    vec3 dither(vec3 color, vec2 fragCoord, float pSize) {
                        vec2 scaledCoord = floor(fragCoord / pSize);
                        float threshold = bayer8(scaledCoord) - 0.25;
                        float step = 1.0 / (colorNum - 1.0);
                        color += threshold * step;
                        color = clamp(color - 0.2, 0.0, 1.0);
                        return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
                    }

                    void main() {
                        vec2 uv = gl_FragCoord.xy / resolution.xy;
                        vec2 uvOriginal = uv;
                        uv -= 0.5;
                        uv.x *= resolution.x / resolution.y;
                        float f = pattern(uv);
                        
                        if (enableMouseInteraction == 1) {
                            vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
                            mouseNDC.x *= resolution.x / resolution.y;
                            float dist = length(uv - mouseNDC);
                            float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
                            // Push effect away from mouse - reduce pattern intensity
                            f *= (1.0 - effect * 0.8);
                        }
                        
                        // Mix background color with wave color
                        vec3 col = mix(backgroundColor, waveColor, f);
                        col = dither(col, gl_FragCoord.xy, pixelSize);
                        
                        gl_FragColor = vec4(col, 1.0);
                    }
                `;

        const getThemeColors = (themeName) => {
            const themes = {
                theme1: { bg: [0.957, 0.906, 0.831], wave: [0, 0, 0] },
                theme2: { bg: [0.004, 0.651, 0.424], wave: [0, 0, 0] },
                theme3: { bg: [0, 0, 0], wave: [1, 1, 1] }
            };
            return themes[themeName] || themes.theme1;
        };

        const savedTheme = localStorage.getItem('site-theme') || 'theme1';
        const initialColors = getThemeColors(savedTheme);
        const uniforms = {
            resolution: { value: new THREE.Vector2() },
            time: { value: 0 },
            waveSpeed: { value: waveSpeed },
            waveFrequency: { value: waveFrequency },
            waveAmplitude: { value: waveAmplitude },
            waveColor: { value: new THREE.Vector3(...initialColors.wave) },
            backgroundColor: { value: new THREE.Vector3(...initialColors.bg) },
            mousePos: { value: new THREE.Vector2() },
            enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
            mouseRadius: { value: mouseRadius },
            colorNum: { value: colorNum },
            pixelSize: { value: pixelSize }
        };

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const handleResize = () => {
            const rect = container.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
            uniforms.resolution.value.set(rect.width * renderer.getPixelRatio(), rect.height * renderer.getPixelRatio());
        };

        let ditherResizeTimer;
        const debouncedDitherResize = () => {
            clearTimeout(ditherResizeTimer);
            ditherResizeTimer = setTimeout(handleResize, 150);
        };
        window.addEventListener('resize', debouncedDitherResize);
        handleResize();

        const handleMouseMove = e => {
            const rect = container.getBoundingClientRect();
            const dpr = renderer.getPixelRatio();
            uniforms.mousePos.value.set((e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Listen for theme changes to update uniforms
        const handleThemeChange = (e) => {
            const newColors = getThemeColors(e.detail.theme);
            uniforms.backgroundColor.value.set(...newColors.bg);
            uniforms.waveColor.value.set(...newColors.wave);
        };
        window.addEventListener('theme-change', handleThemeChange);

        // Optimization: Pause animation when modal is open
        let paused = false;
        const handlePause = () => { paused = true; };
        const handleResume = () => { paused = false; };
        window.addEventListener('modal-open', handlePause);
        window.addEventListener('modal-closed', handleResume);

        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (!paused) {
                uniforms.time.value += 0.016;
                renderer.render(scene, camera);
            }
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(ditherResizeTimer);
            window.removeEventListener('resize', debouncedDitherResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('theme-change', handleThemeChange);
            window.removeEventListener('modal-open', handlePause);
            window.removeEventListener('modal-closed', handleResume);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, [waveSpeed, waveFrequency, waveAmplitude, colorNum, pixelSize, enableMouseInteraction, mouseRadius]);

    return <div ref={containerRef} className="dither-container" />;
};

ReactDOM.createRoot(document.getElementById('dock-root')).render(<NavigationDock />);

// Render Theme Switcher
const themeRoot = document.createElement('div');
document.body.appendChild(themeRoot);
ReactDOM.createRoot(themeRoot).render(<ThemeSwitcher />);

// Render Dither background
ReactDOM.createRoot(document.getElementById('dither-bg-root')).render(
    <DitherBackground
        waveSpeed={0.05}
        waveFrequency={3}
        waveAmplitude={0.3}
        colorNum={4}
        pixelSize={4}
        enableMouseInteraction={true}
        mouseRadius={0.45}
    />
);

const crosshairRoot = document.getElementById('crosshair-root');
if (crosshairRoot) {
    ReactDOM.createRoot(crosshairRoot).render(<App />);
}
