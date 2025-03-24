'use client';

import { useState, useEffect } from 'react';

export function StaticBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only render on the client to avoid hydration issues
  if (!mounted) return null;
  
  // Encode the folder name to handle spaces properly
  const folderPath = encodeURIComponent('World of Garu WebsiteImageLayers');
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -10 }} aria-hidden="true">
      {/* Sky background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#3b82f6', 
          backgroundImage: 'linear-gradient(to bottom, #1e40af, #3b82f6, #93c5fd)',
          opacity: 1,
          zIndex: -99,
        }}
      />
      
      {/* Layer 7 - Ice Mountain (furthest back) */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -9,
          backgroundImage: `url('/img/${folderPath}/14_IceMountain.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 6 - Small Hill */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -8,
          backgroundImage: `url('/img/${folderPath}/13_SmallHill.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 5 - Right Hill */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -7,
          backgroundImage: `url('/img/${folderPath}/12_RightHill.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 4 - Close Right Hill */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -6,
          backgroundImage: `url('/img/${folderPath}/5_CloseRightHill.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 3 - Left Hill */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -5,
          backgroundImage: `url('/img/${folderPath}/10_LeftHill.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 2 - Close Left Hill */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -4,
          backgroundImage: `url('/img/${folderPath}/9_CloseLeftHill.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Layer 1 - House (closest to viewer) */}
      <div
        className="absolute bottom-0 left-1/2 w-full h-full pointer-events-none"
        style={{
          zIndex: -3,
          backgroundImage: `url('/img/${folderPath}/1_House.png')`,
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '110% auto',
          transform: 'translateX(-50%)'
        }}
        aria-hidden="true"
      />
      
      {/* Cloud layers */}
      <div className="cloud-container" style={{ position: 'absolute', inset: 0, zIndex: -2.95 }}>
        <img 
          src={`/img/${folderPath}/11_cloud1.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '10%', 
            left: '15%', 
            width: '30%',
            zIndex: -2.9,
            opacity: 0.95
          }}
        />
        
        <img 
          src={`/img/${folderPath}/2_cloud2.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '5%', 
            left: '30%', 
            width: '28%',
            zIndex: -2.8,
            opacity: 0.9
          }}
        />
        
        <img 
          src={`/img/${folderPath}/3_cloud3.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '15%', 
            left: '65%', 
            width: '26%',
            zIndex: -2.7,
            opacity: 0.85
          }}
        />
        
        <img 
          src={`/img/${folderPath}/4_cloud4.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '8%', 
            left: '80%', 
            width: '24%',
            zIndex: -2.6,
            opacity: 0.95
          }}
        />
        
        <img 
          src={`/img/${folderPath}/6_cloud5.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '12%', 
            left: '45%', 
            width: '22%',
            zIndex: -2.5,
            opacity: 0.9
          }}
        />
        
        <img 
          src={`/img/${folderPath}/7_cloud6.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '18%', 
            left: '10%', 
            width: '20%',
            zIndex: -2.4,
            opacity: 0.85
          }}
        />
        
        <img 
          src={`/img/${folderPath}/8_cloud7.png`} 
          alt="" 
          className="absolute" 
          style={{ 
            top: '3%', 
            left: '65%', 
            width: '18%',
            zIndex: -2.3,
            opacity: 0.8
          }}
        />
      </div>
      
      {/* Gradient overlays */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(128, 0, 128, 0.2), transparent)',
          mixBlendMode: 'overlay',
          zIndex: -2 
        }}
        aria-hidden="true"
      />
      
      {/* Subtle dark gradient at the bottom for contrast */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent 40%)',
          zIndex: -1 
        }}
        aria-hidden="true"
      />
    </div>
  );
} 