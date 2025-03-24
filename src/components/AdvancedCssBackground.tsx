"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function AdvancedCssBackground() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // The order and names of the layers (from back to front)
  // Layer 7 is furthest back, Layer 1 is closest to viewer
  // Adjusted movement factors for larger images (2560x1440px)
  const layers = [
    { name: '14_IceMountain.png', moveFactorX: 4, moveFactorY: 1.2, scrollFactor: 0.010, zIndex: -9, springFactor: 0.05 },
    { name: '13_SmallHill.png', moveFactorX: 6, moveFactorY: 1.8, scrollFactor: 0.015, zIndex: -8, springFactor: 0.08 },
    { name: '12_RightHill.png', moveFactorX: 8, moveFactorY: 2.4, scrollFactor: 0.020, zIndex: -7, springFactor: 0.12 },
    { name: '5_CloseRightHill.png', moveFactorX: 12, moveFactorY: 3.6, scrollFactor: 0.025, zIndex: -6, springFactor: 0.16 },
    { name: '10_LeftHill.png', moveFactorX: 15, moveFactorY: 4.8, scrollFactor: 0.030, zIndex: -5, springFactor: 0.20 },
    { name: '9_CloseLeftHill.png', moveFactorX: 18, moveFactorY: 6, scrollFactor: 0.040, zIndex: -4, springFactor: 0.25 },
    { name: '1_House.png', moveFactorX: 22, moveFactorY: 7.2, scrollFactor: 0.050, zIndex: -3, springFactor: 0.30 },
  ];
  
  // Cloud layers configuration - enhanced for dynamic left-right scrolling movement
  const clouds = [
    { name: '11_cloud1.png', moveFactorX: 24, moveFactorY: 2.5, scrollFactor: 0.025, zIndex: -2.9, springFactor: 0.35, opacity: 0.95 },
    { name: '2_cloud2.png', moveFactorX: 18, moveFactorY: 3.2, scrollFactor: 0.035, zIndex: -2.8, springFactor: 0.30, opacity: 0.9 },
    { name: '3_cloud3.png', moveFactorX: 30, moveFactorY: 1.8, scrollFactor: 0.020, zIndex: -2.7, springFactor: 0.40, opacity: 0.85 },
    { name: '4_cloud4.png', moveFactorX: 16, moveFactorY: 3.8, scrollFactor: 0.030, zIndex: -2.6, springFactor: 0.25, opacity: 0.95 },
    { name: '6_cloud5.png', moveFactorX: 36, moveFactorY: 2.2, scrollFactor: 0.045, zIndex: -2.5, springFactor: 0.45, opacity: 0.9 },
    { name: '7_cloud6.png', moveFactorX: 12, moveFactorY: 4.5, scrollFactor: 0.040, zIndex: -2.4, springFactor: 0.20, opacity: 0.85 },
    { name: '8_cloud7.png', moveFactorX: 42, moveFactorY: 1.5, scrollFactor: 0.015, zIndex: -2.3, springFactor: 0.50, opacity: 0.8 },
  ];

  // State for controlling the passive cloud floating animation
  const [floatTime, setFloatTime] = useState(0);

  // Image loading check - only in dev mode for debugging
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  // Check if images are loading properly
  useEffect(() => {
    if (!mounted || process.env.NODE_ENV !== 'development') return;
    
    const folderPath = encodeURIComponent('World of Garu WebsiteImageLayers');
    
    // Check all layer images
    [...layers, ...clouds].forEach(item => {
      const imgPath = `/img/${folderPath}/${item.name}`;
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Image loaded: ${item.name}`);
        setLoadedImages(prev => ({ ...prev, [imgPath]: true }));
      };
      img.onerror = () => {
        console.error(`❌ Failed to load: ${item.name}`);
        setLoadedImages(prev => ({ ...prev, [imgPath]: false }));
      };
      img.src = imgPath;
    });
  }, [mounted]);

  // Effect for passive cloud floating animation
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now() / 1000;
    
    const animateFloating = () => {
      const currentTime = performance.now() / 1000;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update floating time (slower for more gentle movement)
      setFloatTime(prevTime => prevTime + deltaTime * 0.3);
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(animateFloating);
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animateFloating);
    
    // Clean up on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Handle mouse movement with damping for smoother transitions
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const { clientX, clientY } = e;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate position values from -1 to 1
    const x = (clientX / width) * 2 - 1;
    const y = (clientY / height) * 2 - 1;
    
    // Apply improved damping for smoother mouse movement
    // Increase responsiveness by using a higher damping factor
    setPosition(prev => ({
      x: prev.x + (x - prev.x) * 0.12, // Increased from 0.05 for more responsive movement
      y: prev.y + (y - prev.y) * 0.12
    }));
  };
  
  // Handle scroll with enhanced dynamics and slower effects
  const handleScroll = () => {
    if (!mounted) return;
    
    // Get current scroll position
    const newScrollY = window.scrollY;
    setScrollY(newScrollY);
    
    // Calculate scroll delta to determine direction and velocity
    const delta = newScrollY - lastScrollY.current;
    lastScrollY.current = newScrollY;
    
    // Determine scroll direction
    if (delta > 0) {
      setScrollDirection('down');
    } else if (delta < 0) {
      setScrollDirection('up');
    }
    
    // Calculate scroll velocity with more damping
    const newVelocity = Math.min(Math.max(delta * 0.03, -2), 2); // Dampen velocity further
    setScrollVelocity(prev => prev + (newVelocity - prev) * 0.1); // Apply spring-like damping
    
    // Clear any previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set a timeout to reset velocity when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollVelocity(0);
      setScrollDirection(null);
    }, 300); // Longer timeout for smoother stopping
  };

  // Calculate current zoom level based on scroll position
  const getZoomScale = () => {
    // Max zoom level (1.0 = 100%, 1.15 = 115%)
    const maxZoom = 1.15;
    
    // Scroll depth at which we want to reach max zoom (adjust as needed)
    const scrollDepthForMaxZoom = 2000;
    
    // Calculate zoom factor (0-1 progress toward max zoom)
    const zoomProgress = Math.min(1, scrollY / scrollDepthForMaxZoom);
    
    // Ease in the zoom effect with a subtle curve
    const easeInZoom = Math.pow(zoomProgress, 1.5);
    
    // Scale from 1.0 to maxZoom based on scroll depth
    return 1 + ((maxZoom - 1) * easeInZoom);
  };

  useEffect(() => {
    setMounted(true);
    
    // More efficient mouse tracking with requestAnimationFrame
    let animationFrameId: number;
    let lastMousePosition = { x: 0, y: 0 };
    let isMouseMoving = false;
    
    const trackMousePosition = (e: MouseEvent) => {
      lastMousePosition = { 
        x: e.clientX, 
        y: e.clientY 
      };
      isMouseMoving = true;
    };
    
    const updateMousePosition = () => {
      if (isMouseMoving && containerRef.current) {
        handleMouseMove({ 
          clientX: lastMousePosition.x,
          clientY: lastMousePosition.y
        } as MouseEvent);
        isMouseMoving = false;
      }
      
      // Use a mild drift toward center when mouse is inactive
      // This creates a subtle autonomous movement
      if (!isMouseMoving && containerRef.current) {
        setPosition(prev => ({
          x: prev.x * 0.99, // Gently drift back to center
          y: prev.y * 0.99
        }));
      }
      
      animationFrameId = requestAnimationFrame(updateMousePosition);
    };
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(updateMousePosition);
    
    // Use mouse move event only to track position, not to update state directly
    window.addEventListener('mousemove', trackMousePosition, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial scroll check
    handleScroll();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', trackMousePosition);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Generate CSS transform for each layer with dynamic spring effect
  const getTransform = (moveFactorX: number, moveFactorY: number, scrollFactor: number, springFactor: number, index: number) => {
    if (!mounted) return 'translateX(-50%)';
    
    // Get normalized layer index for depth calculations
    const layerDepth = index / layers.length; // 0-1 value where 1 is furthest back
    
    // Apply non-linear scaling for more dramatic depth perception
    // Closer layers move more than distant ones
    const depthScale = Math.pow(1 - layerDepth, 1.5); // Non-linear curve
    
    // Get current zoom level based on scroll depth
    const zoomScale = getZoomScale();
    
    // Format to fixed precision to avoid hydration mismatch
    // Use enhanced movement range for mouse position
    const x = (position.x * moveFactorX * depthScale).toFixed(2);
    
    // Add dynamic effect based on scroll direction and velocity
    const velocityEffect = scrollVelocity * springFactor;
    
    // Enhanced Y calculation with non-linear depth perception
    const y = (
      position.y * moveFactorY * depthScale + 
      (scrollY * scrollFactor) + 
      velocityEffect
    ).toFixed(2);
    
    // Add a subtle rotation effect based on both mouse position and velocity
    // This creates a more immersive 3D-like effect
    const mouseRotateY = (position.x * -0.2 * depthScale).toFixed(3); // Subtle tilt based on mouse X
    const mouseRotateX = (position.y * 0.2 * depthScale).toFixed(3);  // Subtle tilt based on mouse Y
    const velocityRotateZ = (scrollVelocity * springFactor * 0.05).toFixed(3);
    
    // Apply zoom scale based on scroll position - higher index (background) layers scale less
    // This creates a more dramatic parallax depth effect
    const layerZoomFactor = 1 + ((zoomScale - 1) * (1 - layerDepth * 0.5));
    
    return `translateX(calc(-50% + ${x}px)) translateY(${y}px) 
            rotateY(${mouseRotateY}deg) rotateX(${mouseRotateX}deg) rotateZ(${velocityRotateZ}deg)
            scale(${layerZoomFactor.toFixed(3)})`;
  };

  // Get transition duration based on scroll state - longer durations for smoother movement
  const getTransitionDuration = (index?: number) => {
    // Default transition times
    const baseDuration = scrollVelocity !== 0 ? 600 : 1200;
    
    // If no index provided, return base duration
    if (index === undefined) return baseDuration;
    
    // Scale transition duration based on layer depth
    // Background layers (higher index) have longer, slower transitions
    // Foreground layers have shorter, more responsive transitions
    const layerDepth = index / layers.length; // 0-1 value where 1 is furthest back
    
    // Non-linear scaling - much slower for far backgrounds, quicker for foreground
    const depthFactor = 0.7 + (layerDepth * 0.6); // 0.7x-1.3x multiplier
    
    return Math.round(baseDuration * depthFactor);
  };

  // Generate layer style based on layer index
  const generateLayerStyle = (index: number, pos: {x: number, y: number}, velocity: number, mousePos: {x: number, y: number}) => {
    const layer = layers[layers.length - index];
    if (!layer) return {};
    
    // Encode the folder name to handle spaces properly
    const folderPath = encodeURIComponent('World of Garu WebsiteImageLayers');
    const imgPath = `/img/${folderPath}/${layer.name}`;
    
    // Custom easing based on layer depth
    // Background elements have smoother, longer easing
    // Foreground elements have snappier easing
    const layerDepth = index / layers.length;
    const customEasing = layerDepth > 0.5 
      ? 'cubic-bezier(0.25, 0.8, 0.25, 1)' // Smoother for background
      : 'cubic-bezier(0.22, 1, 0.36, 1)';  // Snappier for foreground
    
    return {
      position: 'absolute' as const,
      bottom: '0', // Align to bottom of screen
      left: '50%',
      width: '110%', // Updated for new 2560x1440 image dimensions
      height: '110%', // Updated for new 2560x1440 image dimensions
      backgroundImage: `url('${imgPath}')`,
      backgroundPosition: 'bottom center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      zIndex: layer.zIndex,
      transform: getTransform(layer.moveFactorX, layer.moveFactorY, layer.scrollFactor, layer.springFactor, index),
      transition: `transform ${getTransitionDuration(index)}ms ${customEasing}`,
      willChange: 'transform',
      transformOrigin: scrollDirection === 'down' ? 'bottom center' : 'top center',
    };
  };
  
  // Generate cloud style based on cloud index
  const generateCloudStyle = (index: number, pos: {x: number, y: number}, velocity: number, mousePos: {x: number, y: number}) => {
    const cloud = clouds[index - 1];
    if (!cloud) return {};
    
    // Encode the folder name to handle spaces properly
    const folderPath = encodeURIComponent('World of Garu WebsiteImageLayers');
    const imgPath = `/img/${folderPath}/${cloud.name}`;
    
    // For clouds, we apply more dynamic movement based on scroll
    
    // Horizontal scroll-based movement: alternate directions based on cloud index
    // Even clouds move right, odd clouds move left when scrolling down
    const horizontalScrollFactor = index % 2 === 0 ? 0.3 : -0.3;
    
    // Calculate the horizontal scroll offset
    const scrollHorizontalOffset = scrollY * horizontalScrollFactor;
    
    // Sine wave amplitude varies by cloud size - larger for bigger clouds
    const sineAmplitude = Math.max(5, 14 - index * 1.2); // Smoother reduction in amplitude
    
    // Each cloud has a different sine wave frequency for more natural look
    const sineFrequency = 200 + (index * 40);
    
    // Get current zoom level based on scroll depth
    const zoomScale = getZoomScale();
    
    // Clouds should zoom at a different rate than mountains - more dramatic
    // This creates an enhanced sense of depth between clouds and mountains
    const cloudZoomFactor = 1 + ((zoomScale - 1) * (1.2 - (index * 0.1)));
    
    // Passive floating effect variables
    // Each cloud has a unique floating speed and phase
    const floatSpeed = 0.4 + (index * 0.08);  // Slightly slower for more gentle movement
    const phaseOffset = index * (Math.PI / 3.5); // Different starting phases
    
    // Enhanced mouse movement response for clouds
    // Further clouds (higher index) have more dramatic movement
    const mouseResponseFactor = 1.5 - (index * 0.1); // Stronger effect for closer clouds
    
    // Horizontal floating effect - gentle side to side
    const floatX = Math.sin(floatTime * floatSpeed + phaseOffset) * (7 - (index * 0.6));
    
    // Vertical floating effect - slight up and down (slower than horizontal)
    const floatY = Math.cos(floatTime * (floatSpeed * 0.6) + phaseOffset) * (4 - (index * 0.35));
    
    // Apply both mouse movement, scroll-based movement, and passive floating for x-axis
    const x = (
      (pos.x * cloud.moveFactorX * mouseResponseFactor * 1.2) + // Enhanced mouse-based movement
      scrollHorizontalOffset +             // Scroll-based horizontal movement
      (Math.sin(scrollY / sineFrequency + index) * sineAmplitude) + // Gentle sine wave with varied frequency
      floatX // Passive floating effect
    ).toFixed(2);
    
    // Calculate velocity effect with some damping
    const velocityEffect = velocity * cloud.springFactor * 0.8; // Reduce spring effect for smoother movement
    
    // Vertical movement based on scroll, mouse position, and passive floating
    const y = (
      pos.y * cloud.moveFactorY * mouseResponseFactor + // Enhanced mouse Y response
      (scrollY * cloud.scrollFactor * 1.1) + // Vertical scroll factor
      velocityEffect +
      (Math.cos(scrollY / (sineFrequency * 1.5)) * (sineAmplitude * 0.25)) + // Subtle vertical sine motion
      floatY // Passive vertical floating
    ).toFixed(2);

    // Cloud positions distributed across the screen
    const topPositions = [8, 5, 12, 7, 14, 18, 3]; // Spread clouds vertically
    const leftPositions = [15, 30, 65, 80, 45, 10, 65]; // Spread across width
    
    // Enhanced rotation effects
    // Combine mouse position, passive floating and scroll for more dynamic movement
    const mouseRotation = (pos.x * (0.8 - (index * 0.07))).toFixed(3); // Subtle rotation based on mouse X
    const passiveRotation = Math.sin(floatTime * (floatSpeed * 0.4) + phaseOffset) * 0.5;
    const scrollRotation = Math.sin(scrollY / 900 + (index * 0.7)) * 0.3;
    const rotationAmount = (passiveRotation + scrollRotation + parseFloat(mouseRotation) * 0.3).toFixed(3);
    
    // Add subtle scale effect based on mouse position (zoom effect)
    const baseScale = cloudZoomFactor; // Use scroll-based zoom as the base scale
    const mouseDistanceX = Math.min(1, Math.abs(pos.x)); // 0-1 value based on mouse distance from center
    const mouseDistanceY = Math.min(1, Math.abs(pos.y)); // 0-1 value based on mouse distance from center
    const mouseDistance = (mouseDistanceX + mouseDistanceY) / 2;
    
    // Scale slightly based on mouse position and scroll zoom - creates a subtle "depth" effect
    const scaleEffect = baseScale + (mouseDistance * 0.05 * (1 - (index * 0.05)));
    
    // Custom easing for clouds - more bouncy and playful
    const cloudEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // Calculate transition duration - faster for velocity-based movements, none for passive animation
    const transitionDuration = velocity !== 0 
      ? getTransitionDuration(Math.max(1, index - 3)) * 0.8 // Clouds use different timing than background layers
      : 0; // No transition for passive animation
    
    return {
      position: 'absolute' as const,
      top: `${topPositions[index-1]}%`,
      left: `${leftPositions[index-1]}%`,
      width: `${Math.max(30, 50 - index * 2)}%`, // Even larger cloud sizes for better visibility
      height: 'auto',
      zIndex: cloud.zIndex,
      opacity: cloud.opacity,
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rotationAmount}deg) scale(${scaleEffect.toFixed(3)})`, // Enhanced rotation and scale
      transition: transitionDuration > 0 ? `transform ${transitionDuration}ms ${cloudEasing}` : 'none',
      willChange: 'transform',
      pointerEvents: 'none' as const,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: -10,
        transformOrigin: 'center center',
      }}
      aria-hidden="true"
    >
      {/* Sky gradient */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#3b82f6', // Use a solid blue as fallback
          backgroundImage: 'linear-gradient(to bottom, #1e40af, #3b82f6, #93c5fd)',
          opacity: 1, // Make sure sky is fully visible
          zIndex: -99, // Ensure it's behind all other layers
        }}
      />
      
      {/* Main layers - from back to front */}
      <div className="layer-7" style={generateLayerStyle(7, position, scrollVelocity, position)} />
      <div className="layer-6" style={generateLayerStyle(6, position, scrollVelocity, position)} />
      <div className="layer-5" style={generateLayerStyle(5, position, scrollVelocity, position)} />
      <div className="layer-4" style={generateLayerStyle(4, position, scrollVelocity, position)} />
      <div className="layer-3" style={generateLayerStyle(3, position, scrollVelocity, position)} />
      <div className="layer-2" style={generateLayerStyle(2, position, scrollVelocity, position)} />
      
      {/* Cloud layers - rendered between mountains and house */}
      <div className="cloud-container" style={{ position: 'absolute', inset: 0, zIndex: -2.95 }}>
        {clouds.map((cloud, idx) => {
          // Encode the folder name to handle spaces properly
          const folderPath = encodeURIComponent('World of Garu WebsiteImageLayers');
          const imgPath = `/img/${folderPath}/${cloud.name}`;
          const cloudStyle = generateCloudStyle(idx + 1, position, scrollVelocity, position);
          
          return (
            <img 
              key={cloud.name}
              src={imgPath}
              alt=""
              className="absolute"
              style={cloudStyle}
            />
          );
        })}
      </div>
      
      {/* House layer (front) */}
      <div className="layer-1" style={generateLayerStyle(1, position, scrollVelocity, position)} />
      
      {/* Overlay gradients for atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay"></div>
      
      {/* Subtle dark gradient at the bottom for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
  );
} 