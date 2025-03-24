"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface CssParallaxBackgroundProps {
  enabled?: boolean;
}

// Client-only component implementation
function CssParallaxBackgroundClient({ enabled = true }: CssParallaxBackgroundProps) {
  const [debug, setDebug] = useState(true);
  const [parallaxValues, setParallaxValues] = useState({ x: 0, y: 0 });
  const [imageStatus, setImageStatus] = useState<Record<number, boolean>>({});
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const layerInfo = [
    { id: 7, name: 'IceMountain', loaded: false },
    { id: 6, name: 'SmallHill', loaded: false },
    { id: 5, name: 'RightHill', loaded: false },
    { id: 4, name: 'CloseRightHill', loaded: false },
    { id: 3, name: 'LeftHill', loaded: false },
    { id: 2, name: 'CloseLeftHill', loaded: false },
    { id: 1, name: 'House', loaded: false },
  ];
  
  // Handle image loading status
  const handleImageLoad = (id: number) => {
    setImageStatus(prev => ({ ...prev, [id]: true }));
    console.log(`Image ${id} loaded successfully`);
  };
  
  const handleImageError = (id: number) => {
    setImageStatus(prev => ({ ...prev, [id]: false }));
    console.error(`Failed to load image ${id}`);
  };
  
  // Handle mouse movement
  useEffect(() => {
    if (!enabled) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.clientX) / 50;
      const y = (window.innerHeight / 2 - e.clientY) / 50;
      
      setParallaxValues({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);
  
  // Handle scroll
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      setLastScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Static layers with parallax effect */}
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
        {layerInfo.map((layer) => {
          // Calculate parallax strength based on layer (deeper layers move less)
          const parallaxStrength = 1 - (layer.id - 1) / 7; // 0-1 scale
          const parallaxX = parallaxValues.x * parallaxStrength * 3;
          const parallaxY = ((parallaxValues.y * parallaxStrength * 2) - (lastScrollY * parallaxStrength * 0.1));
          
          return (
            <div
              key={layer.id}
              className="absolute bottom-0 w-full h-full"
              style={{
                zIndex: layer.id - 10,
                backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/${layer.id}_${layer.name}.png')`,
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '120% auto',
                transform: enabled 
                  ? `translate(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px)` 
                  : 'none',
                transition: 'transform 0.1s ease-out',
                willChange: 'transform',
              }}
              onLoad={() => handleImageLoad(layer.id)}
              onError={() => handleImageError(layer.id)}
            />
          );
        })}
        
        {/* Animated movement for first layer when not scrolling/mouse moving */}
        <div
          className="absolute bottom-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 0,
            backgroundImage: `url('/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png')`,
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '120% auto',
            animation: enabled ? 'gentle-float 8s ease-in-out infinite' : 'none',
            opacity: 0.01, // Nearly invisible, just for animation
          }}
        />
      </div>
      
      {/* Fallback direct image tags */}
      <div className="absolute inset-0 flex items-end justify-center">
        {layerInfo.map((layer) => (
          <img
            key={layer.id}
            src={`/img/World%20of%20Garu%20WebsiteImageLayers/${layer.id}_${layer.name}.png`}
            alt={`Layer ${layer.id}`}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-0"
            style={{ 
              width: '120%',
              height: 'auto',
              zIndex: layer.id - 100, // Very low z-index to not interfere
            }}
            onLoad={() => handleImageLoad(layer.id)}
            onError={() => handleImageError(layer.id)}
          />
        ))}
      </div>
      
      {/* Debug overlay */}
      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white p-2 z-50 text-xs rounded">
          <div>CSS Parallax Background</div>
          <div>Images from: /img/World of Garu WebsiteImageLayers/</div>
          <div>Parallax X: {parallaxValues.x.toFixed(2)}, Y: {parallaxValues.y.toFixed(2)}</div>
          <div>Scroll Y: {lastScrollY}</div>
          <div>Enabled: {enabled ? 'Yes' : 'No'}</div>
          
          {/* Image status */}
          {layerInfo.map(layer => (
            <div key={layer.id}>
              Layer {layer.id}: {layer.name}.png {imageStatus[layer.id] === true ? '✅' : imageStatus[layer.id] === false ? '❌' : '🔄'}
            </div>
          ))}
          
          {/* Test image */}
          <div className="mt-2">
            <div>Direct IMG tag test:</div>
            <img 
              src="/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png" 
              alt="Test image" 
              className="w-16 h-auto mt-1"
              onLoad={() => console.log("Test image loaded")}
              onError={() => console.log("Test image failed to load")}
            />
          </div>
          
          <button 
            className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
            onClick={() => setDebug(false)}
          >
            Hide Debug
          </button>
        </div>
      )}
      
      {/* Debug toggle button when debug is hidden */}
      {!debug && (
        <button 
          className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 z-50 text-xs rounded"
          onClick={() => setDebug(true)}
        >
          Show Debug
        </button>
      )}
      
      {/* Overlay gradients for better visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      
      {/* CSS animation for gentle floating */}
      <style jsx global>{`
        @keyframes gentle-float {
          0%, 100% { 
            transform: translate(0, 0); 
          }
          50% { 
            transform: translate(3px, -3px); 
          }
        }
      `}</style>
    </div>
  );
}

// Fallback server component
function CssParallaxBackgroundFallback() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Static base layer only */}
      <div className="absolute inset-0 flex items-end justify-center">
        <img 
          src="/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png" 
          alt="Background" 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[120%] h-auto object-contain"
        />
      </div>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Export a dynamic import of the client component with SSR disabled
export const CssParallaxBackground = dynamic(
  () => Promise.resolve(CssParallaxBackgroundClient),
  { 
    ssr: false,
    loading: CssParallaxBackgroundFallback 
  }
); 