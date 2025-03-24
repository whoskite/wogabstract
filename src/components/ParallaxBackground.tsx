"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface ParallaxBackgroundProps {
  enabled?: boolean;
}

export function ParallaxBackground({ enabled = true }: ParallaxBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [time, setTime] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<{[key: number]: boolean}>({});
  const parallaxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Set loaded state after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
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
      const centerY = rect.height / 2;
      
      // Get normalized values (-1 to 1) for mouse position
      const normalizedX = (e.clientX - centerX) / centerX;
      const normalizedY = (e.clientY - centerY) / centerY;
      
      setMouseX(normalizedX);
      setMouseY(normalizedY);
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
  
  // Handle image load status
  const handleImageLoad = (id: number) => {
    setImageLoadStatus(prev => ({
      ...prev,
      [id]: true
    }));
    console.log(`Image ${id} loaded successfully`);
  };
  
  const handleImageError = (id: number, e: any) => {
    console.error(`Error loading image ${id}:`, e);
    setImageLoadStatus(prev => ({
      ...prev,
      [id]: false
    }));
  };
  
  // Calculate translation values based on scroll position, mouse position, and time
  // Layer 1 (closest) moves the most, Layer 7 (farthest) moves the least
  const getTranslateY = (layer: number) => {
    if (!enabled) return 0;
    
    const factor = (8 - layer) / 35; // Creates a gradient of movement factors
    const scrollEffect = scrollY * factor;
    
    // Add subtle floating motion based on time
    const floatAmplitude = (8 - layer) * 0.4; // More movement for closer layers
    const floatEffect = Math.sin(time + layer * 0.5) * floatAmplitude;
    
    return scrollEffect + floatEffect;
  };
  
  const getTranslateX = (layer: number) => {
    if (!enabled) return 0;
    
    const factor = (8 - layer) / 20; // Creates a gradient of movement factors
    const mouseEffect = mouseX * 40 * factor; // Multiply by desired intensity
    
    // Add subtle side-to-side motion based on time, offset from Y to create diagonal motion
    const waveAmplitude = (8 - layer) * 0.3; // More movement for closer layers
    const waveEffect = Math.cos(time * 0.8 + layer * 0.7) * waveAmplitude;
    
    return mouseEffect + waveEffect;
  };
  
  // Define background layers - use the specific folder path
  const backgroundLayers = [
    { id: 7, name: 'Ice Mountain', path: '/World of Garu Website Image Layers/7_Ice Mountain.png', translateY: getTranslateY(7), translateX: getTranslateX(7) },
    { id: 6, name: 'Small Hill', path: '/World of Garu Website Image Layers/6_Small Hill.png', translateY: getTranslateY(6), translateX: getTranslateX(6) },
    { id: 5, name: 'Right Hill', path: '/World of Garu Website Image Layers/5_Right Hill.png', translateY: getTranslateY(5), translateX: getTranslateX(5) },
    { id: 4, name: 'Close Right Hill', path: '/World of Garu Website Image Layers/4_Close Right Hill.png', translateY: getTranslateY(4), translateX: getTranslateX(4) },
    { id: 3, name: 'Left Hill', path: '/World of Garu Website Image Layers/3_Left Hill.png', translateY: getTranslateY(3), translateX: getTranslateX(3) },
    { id: 2, name: 'Close Left Hill', path: '/World of Garu Website Image Layers/2_Close Left Hill.png', translateY: getTranslateY(2), translateX: getTranslateX(2) },
    { id: 1, name: 'House', path: '/World of Garu Website Image Layers/1_House.png', translateY: getTranslateY(1), translateX: getTranslateX(1) },
  ];
  
  return (
    <div ref={parallaxRef} className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Debugging overlay */}
      <div className="fixed top-24 left-4 z-50 p-2 bg-black/80 rounded-md text-white text-sm">
        <div>Image Status:</div>
        {backgroundLayers.map(layer => (
          <div key={`debug-${layer.id}`} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${
              imageLoadStatus[layer.id] === true ? 'bg-green-500' : 
              imageLoadStatus[layer.id] === false ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span>Layer {layer.id}: {imageLoadStatus[layer.id] === true ? 'Loaded' : 
                  imageLoadStatus[layer.id] === false ? 'Error' : 'Pending'}</span>
          </div>
        ))}
      </div>
      
      {/* Parallax layers */}
      {backgroundLayers.map((layer) => (
        <div 
          key={layer.id}
          className={`absolute inset-0 w-full h-full ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translateY(${layer.translateY}px) translateX(${layer.translateX}px)`,
            zIndex: layer.id - 10, // Ensure proper stacking
            transition: enabled 
              ? `transform 0.05s ease-out, opacity ${0.3 + layer.id * 0.15}s ease-in` 
              : 'none', // Staggered fade-in for layers
            transitionDelay: `${layer.id * 0.08}s`, // Staggered delay
          }}
        >
          <div className="relative w-full h-full scale-110"> {/* Scale to 110% as requested */}
            <Image
              src={layer.path}
              alt={layer.name}
              fill
              priority={true}
              sizes="100vw"
              onLoad={() => handleImageLoad(layer.id)}
              onError={(e) => handleImageError(layer.id, e)}
              style={{
                objectFit: 'cover',
                objectPosition: 'center bottom',
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Optional night sky effect with fade-in */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transition: 'opacity 0.8s ease-in',
          transitionDelay: '0.5s'
        }}
      ></div>
      
      {/* Optional overlay gradient for better text readability with fade-in */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transition: 'opacity 0.8s ease-in',
          transitionDelay: '0.2s'
        }}
      ></div>
    </div>
  );
} 