"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface ParallaxBackgroundAltProps {
  enabled?: boolean;
}

// Client-only component implementation 
function ParallaxBackgroundAltClient({ enabled = true }: ParallaxBackgroundAltProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [time, setTime] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(Array(7).fill(false));
  const parallaxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Update scroll position
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);
  
  // Track mouse movement for horizontal parallax
  useEffect(() => {
    if (!enabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return;
      
      // Calculate mouse position relative to the center of the screen
      const rect = parallaxRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      
      // Get normalized values (-1 to 1) for mouse position
      const normalizedX = (e.clientX - centerX) / centerX;
      
      setMouseX(normalizedX);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);
  
  // Continuous animation loop for subtle movement
  useEffect(() => {
    if (!enabled) return;
    
    const animate = () => {
      setTime(prevTime => prevTime + 0.005);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);
  
  // Image load handler
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    console.log(`Image ${index+1} loaded successfully`);
  };
  
  // Image error handler
  const handleImageError = (index: number) => {
    console.error(`Failed to load image ${index+1}`);
  };
  
  // Calculate movement factors for each layer - enhanced for more prominent movement
  const layer7Y = enabled ? scrollY * 0.05 + Math.sin(time) * 1.5 : 0;
  const layer7X = enabled ? mouseX * 10 + Math.cos(time * 0.8) * 1.2 : 0;
  
  const layer6Y = enabled ? scrollY * 0.08 + Math.sin(time + 0.5) * 2 : 0;
  const layer6X = enabled ? mouseX * 15 + Math.cos(time * 0.8 + 0.7) * 1.8 : 0;
  
  const layer5Y = enabled ? scrollY * 0.12 + Math.sin(time + 1) * 2.5 : 0;
  const layer5X = enabled ? mouseX * 20 + Math.cos(time * 0.8 + 1.4) * 2.2 : 0;
  
  const layer4Y = enabled ? scrollY * 0.16 + Math.sin(time + 1.5) * 3 : 0;
  const layer4X = enabled ? mouseX * 25 + Math.cos(time * 0.8 + 2.1) * 2.8 : 0;
  
  const layer3Y = enabled ? scrollY * 0.2 + Math.sin(time + 2) * 3.5 : 0;
  const layer3X = enabled ? mouseX * 30 + Math.cos(time * 0.8 + 2.8) * 3.2 : 0;
  
  const layer2Y = enabled ? scrollY * 0.25 + Math.sin(time + 2.5) * 4 : 0;
  const layer2X = enabled ? mouseX * 40 + Math.cos(time * 0.8 + 3.5) * 4 : 0;
  
  const layer1Y = enabled ? scrollY * 0.3 + Math.sin(time + 3) * 5 : 0;
  const layer1X = enabled ? mouseX * 50 + Math.cos(time * 0.8 + 4.2) * 5 : 0;
  
  // Common style for layer container
  const layerStyle = {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'hidden',
    pointerEvents: 'none' as const,
  };
  
  // Common style for layer images - note we're using 120% width for scaling
  const imgBaseStyle = {
    width: '120%',
    height: 'auto',
    objectFit: 'contain' as const,
    objectPosition: 'center bottom',
    transition: enabled ? 'transform 0.05s ease-out' : 'none',
  };
  
  return (
    <div ref={parallaxRef} className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Debug overlay - will only appear in client component */}
      {enabled && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white p-2 z-50 text-xs rounded">
          <div>Images loaded from: /img/World of Garu WebsiteImageLayers/</div>
          <div>Layer 1: 1_House.png {imagesLoaded[0] ? '✅' : '❌'}</div>
          <div>Layer 2: 2_CloseLeftHill.png {imagesLoaded[1] ? '✅' : '❌'}</div>
          <div>Layer 3: 3_LeftHill.png {imagesLoaded[2] ? '✅' : '❌'}</div>
          <div>Layer 4: 4_CloseRightHill.png {imagesLoaded[3] ? '✅' : '❌'}</div>
          <div>Layer 5: 5_RightHill.png {imagesLoaded[4] ? '✅' : '❌'}</div>
          <div>Layer 6: 6_SmallHill.png {imagesLoaded[5] ? '✅' : '❌'}</div>
          <div>Layer 7: 7_IceMountain.png {imagesLoaded[6] ? '✅' : '❌'}</div>
          <div>ScrollY: {scrollY.toFixed(0)}px</div>
        </div>
      )}
      
      {/* Debug controls */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white p-2 z-50 text-xs rounded flex flex-col space-y-1">
        <button 
          className="px-2 py-1 bg-blue-600 rounded text-xs"
          onClick={() => {
            // Force reload the images with a cache-busting parameter
            setImagesLoaded(Array(7).fill(false));
            const timestamp = new Date().getTime();
            
            // This will force React to unmount and remount the images
            document.querySelectorAll('img').forEach(img => {
              if (img.src.includes('World%20of%20Garu%20WebsiteImageLayers')) {
                const newSrc = img.src.includes('?') 
                  ? img.src.split('?')[0] + '?t=' + timestamp
                  : img.src + '?t=' + timestamp;
                img.src = newSrc;
              }
            });
          }}
        >
          Reload Images
        </button>
      </div>
      
      {/* Layer 7 - Ice Mountain (furthest) */}
      <div style={{...layerStyle, zIndex: -3}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png"
          alt="Layer 7 - Ice Mountain"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer7Y}px) translateX(${layer7X}px) scale(${1 + scrollY * 0.0001})`,
          }}
          onLoad={() => handleImageLoad(6)}
          onError={() => handleImageError(6)}
        />
      </div>
      
      {/* Layer 6 - Small Hill */}
      <div style={{...layerStyle, zIndex: -4}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/6_SmallHill.png"
          alt="Layer 6 - Small Hill"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer6Y}px) translateX(${layer6X}px) scale(${1 + scrollY * 0.00015})`,
          }}
          onLoad={() => handleImageLoad(5)}
          onError={() => handleImageError(5)}
        />
      </div>
      
      {/* Layer 5 - Right Hill */}
      <div style={{...layerStyle, zIndex: -5}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/5_RightHill.png"
          alt="Layer 5 - Right Hill"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer5Y}px) translateX(${layer5X}px) scale(${1 + scrollY * 0.0002})`,
          }}
          onLoad={() => handleImageLoad(4)}
          onError={() => handleImageError(4)}
        />
      </div>
      
      {/* Layer 4 - Close Right Hill */}
      <div style={{...layerStyle, zIndex: -6}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/4_CloseRightHill.png"
          alt="Layer 4 - Close Right Hill"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer4Y}px) translateX(${layer4X}px) scale(${1 + scrollY * 0.00025})`,
          }}
          onLoad={() => handleImageLoad(3)}
          onError={() => handleImageError(3)}
        />
      </div>
      
      {/* Layer 3 - Left Hill */}
      <div style={{...layerStyle, zIndex: -7}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/3_LeftHill.png"
          alt="Layer 3 - Left Hill"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer3Y}px) translateX(${layer3X}px) scale(${1 + scrollY * 0.0003})`,
          }}
          onLoad={() => handleImageLoad(2)}
          onError={() => handleImageError(2)}
        />
      </div>
      
      {/* Layer 2 - Close Left Hill */}
      <div style={{...layerStyle, zIndex: -8}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/2_CloseLeftHill.png"
          alt="Layer 2 - Close Left Hill"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer2Y}px) translateX(${layer2X}px) scale(${1 + scrollY * 0.00035})`,
          }}
          onLoad={() => handleImageLoad(1)}
          onError={() => handleImageError(1)}
        />
      </div>
      
      {/* Layer 1 - House (closest) */}
      <div style={{...layerStyle, zIndex: -9}}>
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png"
          alt="Layer 1 - House"
          style={{
            ...imgBaseStyle,
            transform: `translateY(${layer1Y}px) translateX(${layer1X}px) scale(${1 + scrollY * 0.0004})`,
          }}
          onLoad={() => handleImageLoad(0)}
          onError={() => handleImageError(0)}
        />
      </div>
      
      {/* Night sky overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Server-side fallback component
function ParallaxBackgroundAltFallback() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Static layers with no animations */}
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
        <div className="relative w-full">
          {[7, 6, 5, 4, 3, 2, 1].map((layer) => (
            <img
              key={layer}
              src={`/img/World%20of%20Garu%20WebsiteImageLayers/${layer}_${
                layer === 7 ? 'IceMountain' : 
                layer === 6 ? 'SmallHill' : 
                layer === 5 ? 'RightHill' : 
                layer === 4 ? 'CloseRightHill' : 
                layer === 3 ? 'LeftHill' : 
                layer === 2 ? 'CloseLeftHill' : 
                'House'
              }.png`}
              alt={`Layer ${layer}`}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[120%] h-auto object-contain"
              style={{ zIndex: layer - 10 }}
            />
          ))}
        </div>
      </div>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Export a dynamic import of the client component with SSR disabled
export const ParallaxBackgroundAlt = dynamic(
  () => Promise.resolve(ParallaxBackgroundAltClient),
  { 
    ssr: false,
    loading: ParallaxBackgroundAltFallback 
  }
); 