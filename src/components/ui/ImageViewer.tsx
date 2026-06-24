import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";

interface ImageViewerProps {
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_CLICK_ZOOM = 2.5;

export function ImageViewer({ imageUrl, altText = "Image viewer", onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDistance = useRef<number | null>(null);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);

  // Close on Escape key, zoom on +/- keys
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "+" || event.key === "=") {
        handleZoom(0.5);
      } else if (event.key === "-") {
        handleZoom(-0.5);
      }
    }
    
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent body scroll
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const clampZoom = (value: number) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
  };

  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (!containerRef.current || !imageRef.current) return { x, y };
    
    const imgWidth = imageRef.current.offsetWidth;
    const imgHeight = imageRef.current.offsetHeight;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const scaledWidth = imgWidth * currentScale;
    const scaledHeight = imgHeight * currentScale;

    const maxPanX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxPanY = Math.max(0, (scaledHeight - containerHeight) / 2);

    return {
      x: Math.min(Math.max(x, -maxPanX), maxPanX),
      y: Math.min(Math.max(y, -maxPanY), maxPanY)
    };
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setScale((currentScale) => {
      const newScale = clampZoom(currentScale + delta);
      if (newScale === MIN_ZOOM) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition(prev => clampPosition(prev.x, prev.y, newScale));
      }
      return newScale;
    });
  }, [clampPosition]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // Determine zoom direction
    const delta = event.deltaY < 0 ? -0.2 : 0.2;
    handleZoom(delta);
  };

  const getPinchDistance = () => {
    const points = Array.from(pointers.current.values());
    if (points.length < 2) return null;
    const [first, second] = points;
    return Math.hypot(first.x - second.x, first.y - second.y);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    // Only capture left click or touch
    if (event.button !== 0 && event.pointerType === "mouse") return;
    
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    
    if (pointers.current.size === 1 && scale > 1) {
      setIsDragging(true);
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
    } else if (pointers.current.size === 2) {
      setIsDragging(false); // Stop panning when pinching
      lastPinchDistance.current = getPinchDistance();
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!pointers.current.has(event.pointerId)) return;

    // Update pointer position
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Handle Pinch (Zoom)
    if (pointers.current.size === 2) {
      const distance = getPinchDistance();
      if (!distance || !lastPinchDistance.current) {
        lastPinchDistance.current = distance;
        return;
      }
      const change = (distance - lastPinchDistance.current) / 100;
      handleZoom(change);
      lastPinchDistance.current = distance;
      return;
    }

    // Handle Pan (Drag)
    if (pointers.current.size === 1 && isDragging && lastPanPoint.current && scale > 1) {
      const deltaX = event.clientX - lastPanPoint.current.x;
      const deltaY = event.clientY - lastPanPoint.current.y;
      
      setPosition((prev) => clampPosition(prev.x + deltaX, prev.y + deltaY, scale));
      
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      lastPinchDistance.current = null;
    }
    if (pointers.current.size === 0) {
      setIsDragging(false);
      lastPanPoint.current = null;
    } else if (pointers.current.size === 1) {
      // Re-initialize pan base if falling back from pinch to single touch
      const remainingPointer = Array.from(pointers.current.values())[0];
      if (scale > 1) {
        setIsDragging(true);
        lastPanPoint.current = { x: remainingPointer.x, y: remainingPointer.y };
      }
    }
  };

  const handleDoubleClick = () => {
    if (scale > MIN_ZOOM) {
      setScale(MIN_ZOOM);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(DOUBLE_CLICK_ZOOM);
    }
  };

  const cursorClass = scale === MIN_ZOOM 
    ? "cursor-default" 
    : isDragging ? "cursor-grabbing" : "cursor-grab";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-pink-950/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      // Prevent clicks on backdrop from bubbling, close if clicked exactly on backdrop
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={handleWheel}
    >
      {/* Live region for screen readers to announce zoom level */}
      <div className="sr-only" aria-live="polite">
        {`Image zoomed to ${Math.round(scale * 100)}%`}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-[110] grid size-12 place-items-center rounded-full bg-black/20 text-white backdrop-blur transition hover:bg-black/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close image viewer"
      >
        <Icon icon="mdi:close" className="size-6" />
      </button>

      <div
        ref={containerRef}
        className="relative flex items-center justify-center h-full w-full overflow-hidden pointer-events-none"
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={altText}
          draggable={false}
          onDoubleClick={handleDoubleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          className={`max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-lg pointer-events-auto touch-none ${cursorClass}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            // Add transition only if not currently dragging/pinching to ensure responsive tracking
            transition: isDragging || pointers.current.size > 1 ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Subtle floating zoom controls */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-black/30 p-1.5 backdrop-blur-sm opacity-100"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }}
          disabled={scale === MIN_ZOOM}
          className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Zoom out"
        >
          <Icon icon="mdi:minus" className="size-5" />
        </button>
        <div className="w-12 text-center text-sm font-semibold text-white pointer-events-none select-none">
          {Math.round(scale * 100)}%
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }}
          disabled={scale === MAX_ZOOM}
          className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Zoom in"
        >
          <Icon icon="mdi:plus" className="size-5" />
        </button>
      </div>
    </div>
  );
}
