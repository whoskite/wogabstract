"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

interface ThreeJsParallaxBackgroundProps {
  enabled?: boolean;
}

// Client-only component implementation
function ThreeJsParallaxBackgroundClient({ enabled = true }: ThreeJsParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(Array(7).fill(false));
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const layersRef = useRef<THREE.Mesh[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [debug, setDebug] = useState(true);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current || !enabled) return;
    
    // Log to make sure this is running
    console.log("Setting up Three.js scene");
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;
    
    // Initialize camera with adjusted frustum
    // Use a larger frustum to ensure all content is visible
    const camera = new THREE.OrthographicCamera(
      -1.5, 1.5, 1.5 * (height / width), -1.5 * (height / width), 0.1, 1000
    );
    camera.position.z = 5; // Position closer to see layers better
    cameraRef.current = camera;
    
    // Initialize renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newAspect = newWidth / newHeight;
      
      // Update camera with new aspect ratio
      cameraRef.current.left = -1.5;
      cameraRef.current.right = 1.5;
      cameraRef.current.top = 1.5 / newAspect;
      cameraRef.current.bottom = -1.5 / newAspect;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Load textures and create layers
    const textureLoader = new THREE.TextureLoader();
    // Add query param to bust cache
    const timestamp = Date.now();
    const layerUrls = [
      `/img/World%20of%20Garu%20WebsiteImageLayers/7_IceMountain.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/6_SmallHill.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/5_RightHill.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/4_CloseRightHill.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/3_LeftHill.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/2_CloseLeftHill.png?t=${timestamp}`,
      `/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png?t=${timestamp}`,
    ];
    
    // Helper to check if image can be loaded
    const checkImageExists = async (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };
    
    const loadLayers = async () => {
      const layers: THREE.Mesh[] = [];
      
      console.log("Starting to load layers");
      
      // Check if images exist first
      for (let i = 0; i < layerUrls.length; i++) {
        const url = layerUrls[i];
        const exists = await checkImageExists(url);
        console.log(`Image ${i+1} exists: ${exists} - ${url}`);
      }
      
      // Create each layer
      for (let i = 0; i < layerUrls.length; i++) {
        const url = layerUrls[i];
        const layerName = url.split('/').pop()?.split('?')[0] || `Layer ${i+1}`;
        
        try {
          console.log(`Loading texture ${i+1}: ${url}`);
          
          // Create texture and set properties
          const texture = await new Promise<THREE.Texture>((resolve, reject) => {
            textureLoader.load(
              url,
              (tex) => {
                console.log(`Successfully loaded texture ${i+1}`);
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[i] = true;
                  return newState;
                });
                resolve(tex);
              },
              (progress) => {
                console.log(`Loading progress for ${i+1}: ${Math.round(progress.loaded / progress.total * 100)}%`);
              },
              (err) => {
                console.error(`Failed to load texture ${i+1}:`, err);
                reject(err);
              }
            );
          });
          
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          
          // Calculate aspect ratio to maintain image proportions
          const imageAspect = texture.image.width / texture.image.height;
          console.log(`Image ${i+1} aspect ratio: ${imageAspect}`);
          
          // Create a plane sized to maintain image proportions
          // Use a wider plane to ensure it covers the screen
          const planeWidth = 3.5;
          const planeHeight = planeWidth / imageAspect;
          
          const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          
          // Set material with transparency
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
          });
          
          // Create mesh for this layer
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position layers properly (layer 7 furthest, layer 1 closest)
          // Adjust to position at bottom
          mesh.position.z = i * -0.5; // Increase z-distance between layers for clearer separation
          mesh.position.y = -0.75; // Position lower to show bottom of image
          
          scene.add(mesh);
          layers.push(mesh);
          console.log(`Added layer ${i+1} to scene`);
          
        } catch (error) {
          console.error(`Error loading layer ${i+1}:`, error);
        }
      }
      
      // Store layers and mark loading complete
      layersRef.current = layers;
      setLoaded(true);
      console.log(`Loaded ${layers.length} layers`);
    };
    
    loadLayers();
    
    // Animation loop
    let prevTime = 0;
    const animate = (time: number) => {
      const deltaTime = (time - prevTime) / 1000;
      prevTime = time;
      
      if (layersRef.current.length > 0 && cameraRef.current && rendererRef.current) {
        // Add slight continuous motion to layers
        layersRef.current.forEach((layer, i) => {
          const index = layersRef.current.length - 1 - i; // Invert index so layer 7 moves least, layer 1 moves most
          
          // Apply very gentle wave-like motion
          const wave = Math.sin(time * 0.0003 + index * 0.5) * 0.01 * (index + 1);
          const xWave = Math.cos(time * 0.0002 + index * 0.7) * 0.008 * (index + 1);
          
          layer.position.y = -0.75 + wave;
          layer.position.x = xWave;
        });
        
        rendererRef.current.render(scene, cameraRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      // Dispose geometries and materials
      layersRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    };
  }, [enabled]);
  
  // Handle mouse movement
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || layersRef.current.length === 0) return;
      
      // Mark as moving
      setIsMouseMoving(true);
      
      // Clear previous timeout and set new one
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      
      mouseMoveTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 200);
      
      // Calculate mouse position relative to center
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const normalizedX = (e.clientX - rect.left - centerX) / centerX; // -1 to 1
      
      // Apply parallax effect based on mouse position
      layersRef.current.forEach((layer, i) => {
        const index = layersRef.current.length - 1 - i; // Layer 7 moves least, layer 1 moves most
        const moveX = normalizedX * 0.1 * (index + 1);
        
        // Apply smooth transition
        layer.position.x = moveX;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [enabled]);
  
  // Handle scroll movement
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      if (layersRef.current.length === 0) return;
      
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const normalizedScrollY = scrollY / viewportHeight; // Normalize to viewport units
      
      // Apply parallax effect based on scroll position
      layersRef.current.forEach((layer, i) => {
        const index = layersRef.current.length - 1 - i; // Layer 7 moves least, layer 1 moves most
        const moveY = normalizedScrollY * 0.2 * (index + 1);
        
        // Apply scroll-based Y movement, preserving the existing wave motion
        layer.position.y = -0.75 - moveY;
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled]);
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Debug overlay */}
      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white p-2 z-50 text-xs rounded">
          <div>Three.js Parallax Background</div>
          <div>Images loaded from: /img/World of Garu WebsiteImageLayers/</div>
          <div>Scene initialized: {sceneRef.current ? '✅' : '❌'}</div>
          <div>All layers loaded: {loaded ? '✅' : '❌'}</div>
          <div>Layer 1: 1_House.png {imagesLoaded[6] ? '✅' : '❌'}</div>
          <div>Layer 2: 2_CloseLeftHill.png {imagesLoaded[5] ? '✅' : '❌'}</div>
          <div>Layer 3: 3_LeftHill.png {imagesLoaded[4] ? '✅' : '❌'}</div>
          <div>Layer 4: 4_CloseRightHill.png {imagesLoaded[3] ? '✅' : '❌'}</div>
          <div>Layer 5: 5_RightHill.png {imagesLoaded[2] ? '✅' : '❌'}</div>
          <div>Layer 6: 6_SmallHill.png {imagesLoaded[1] ? '✅' : '❌'}</div>
          <div>Layer 7: 7_IceMountain.png {imagesLoaded[0] ? '✅' : '❌'}</div>
          <div>Mouse moving: {isMouseMoving ? 'Yes' : 'No'}</div>
          
          {/* Add image test */}
          <div className="mt-2">
            <div>Direct IMG tag tests:</div>
            <img 
              src="/img/World%20of%20Garu%20WebsiteImageLayers/1_House.png" 
              alt="Test image" 
              className="w-16 h-auto mt-1"
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
      
      {/* Fallback direct img tags in case Three.js fails */}
      <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: -20 }}>
        {!loaded && (
          <>
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
                style={{ zIndex: -20 + layer }}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Overlay gradients for better visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Simple fallback without any effect
function ThreeJsParallaxBackgroundFallback() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Base black background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Static images for all layers */}
      <div className="absolute inset-0 flex items-end justify-center">
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
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
  );
}

// Export a dynamic import of the client component with SSR disabled
export const ThreeJsParallaxBackground = dynamic(
  () => Promise.resolve(ThreeJsParallaxBackgroundClient),
  { 
    ssr: false,
    loading: ThreeJsParallaxBackgroundFallback 
  }
); 