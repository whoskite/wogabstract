"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface ParallaxBackgroundSimpleProps {
  enabled?: boolean;
}

// Client-only component implementation 
function ParallaxBackgroundSimpleClient({ enabled = true }: ParallaxBackgroundSimpleProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [time, setTime] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(Array(7).fill(false));
  const parallaxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Check if images are loaded
  useEffect(() => {
    const imageUrls = [
      '/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/2_CloseLeftHill.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/3_LeftHill.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/4_CloseRightHill.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/5_RightHill.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/6_SmallHill.png',
      '/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png'
    ];
    
    // Load each image and update the status
    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.onerror = (e) => {
        console.error(`Failed to load image: ${url}`, e);
      };
      img.src = url;
    });
  }, []);
  
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
            // Force reload the images
            const cache = {};
            document.querySelectorAll('img').forEach(img => {
              if (img.src.includes('World%20of%20Garu%20WebsiteImageLayers')) {
                const newSrc = img.src.includes('?') 
                  ? img.src.split('?')[0] + '?t=' + new Date().getTime()
                  : img.src + '?t=' + new Date().getTime();
                img.src = newSrc;
              }
            });
          }}
        >
          Reload Images
        </button>
        
        <div className="text-xs">
          Raw paths (for debug):
          <div style={{fontSize: '9px', wordBreak: 'break-all'}}>/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png</div>
          <div style={{fontSize: '9px', wordBreak: 'break-all'}}>/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png</div>
        </div>
      </div>
      
      {/* Direct image tags for testing */}
      <div className="fixed bottom-0 right-0 h-20 w-20 opacity-10 z-50 pointer-events-none">
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png" 
          alt="Test image 1" 
          className="h-5 w-5 object-contain"
          onLoad={() => console.log("House image loaded!")}
          onError={(e) => console.error("Failed to load House image", e)}
        />
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png" 
          alt="Test image 7" 
          className="h-5 w-5 object-contain"
          onLoad={() => console.log("Mountain image loaded!")}
          onError={(e) => console.error("Failed to load Mountain image", e)}
        />
      </div>
      
      {/* Layer 7 - Ice Mountain (furthest) */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer7Y}px) translateX(${layer7X}px) scale(${1 + scrollY * 0.0001})`,
          zIndex: -3,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 6 - Small Hill */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/6_SmallHill.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer6Y}px) translateX(${layer6X}px) scale(${1 + scrollY * 0.00015})`,
          zIndex: -4,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 5 - Right Hill */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/5_RightHill.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer5Y}px) translateX(${layer5X}px) scale(${1 + scrollY * 0.0002})`,
          zIndex: -5,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 4 - Close Right Hill */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/4_CloseRightHill.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer4Y}px) translateX(${layer4X}px) scale(${1 + scrollY * 0.00025})`,
          zIndex: -6,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 3 - Left Hill */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/3_LeftHill.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer3Y}px) translateX(${layer3X}px) scale(${1 + scrollY * 0.0003})`,
          zIndex: -7,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 2 - Close Left Hill */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/2_CloseLeftHill.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer2Y}px) translateX(${layer2X}px) scale(${1 + scrollY * 0.00035})`,
          zIndex: -8,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Layer 1 - House (closest) */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{
          backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png')`,
          backgroundSize: '120% auto',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${layer1Y}px) translateX(${layer1X}px) scale(${1 + scrollY * 0.0004})`,
          zIndex: -9,
          transition: enabled ? 'transform 0.05s ease-out' : 'none'
        }}
      />
      
      {/* Night sky overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Server-side fallback component
function ParallaxBackgroundFallback() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Static layers with no animations */}
      {[7, 6, 5, 4, 3, 2, 1].map((layer) => (
        <div 
          key={layer}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/${layer}_${
              layer === 7 ? 'IceMountain' : 
              layer === 6 ? 'SmallHill' : 
              layer === 5 ? 'RightHill' : 
              layer === 4 ? 'CloseRightHill' : 
              layer === 3 ? 'LeftHill' : 
              layer === 2 ? 'CloseLeftHill' : 
              'House'
            }.png')`,
            backgroundSize: '120% auto',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            zIndex: layer - 10,
          }}
        />
      ))}
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Export a dynamic import of the client component with SSR disabled
export const ParallaxBackgroundSimple = dynamic(
  () => Promise.resolve(ParallaxBackgroundSimpleClient),
  { 
    ssr: false,
    loading: ParallaxBackgroundFallback 
  }
); 