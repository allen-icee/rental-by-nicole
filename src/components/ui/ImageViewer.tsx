// src/components/ui/ImageViewer.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  altText?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_CLICK_ZOOM = 2.5;

export function ImageViewer({ images, initialIndex = 0, altText = "Image viewer", onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDistance = useRef<number | null>(null);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);

  const resetZoom = useCallback(() => {
    setScale(MIN_ZOOM);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  }, [images.length, resetZoom]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "+" || event.key === "=") {
        handleZoom(0.5);
      } else if (event.key === "-") {
        handleZoom(-0.5);
      } else if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "ArrowLeft") {
        goToPrev();
      }
    }
    
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; 
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, goToNext, goToPrev]);

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
    if (event.button !== 0 && event.pointerType === "mouse") return;
    
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    
    if (pointers.current.size === 1) {
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
      if (scale > MIN_ZOOM) setIsDragging(true);
    } else if (pointers.current.size === 2) {
      lastPinchDistance.current = getPinchDistance();
      setIsDragging(false);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && lastPinchDistance.current !== null) {
      const currentDistance = getPinchDistance();
      if (currentDistance) {
        const delta = (currentDistance - lastPinchDistance.current) * 0.01;
        handleZoom(delta);
        lastPinchDistance.current = currentDistance;
      }
    } else if (isDragging && lastPanPoint.current) {
      const deltaX = event.clientX - lastPanPoint.current.x;
      const deltaY = event.clientY - lastPanPoint.current.y;
      
      setPosition(prev => clampPosition(prev.x + deltaX, prev.y + deltaY, scale));
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    pointers.current.delete(event.pointerId);
    
    if (pointers.current.size === 0) {
      setIsDragging(false);
      lastPanPoint.current = null;
    } else if (pointers.current.size === 1) {
      const remainingPointer = Array.from(pointers.current.values())[0];
      lastPanPoint.current = { x: remainingPointer.x, y: remainingPointer.y };
      lastPinchDistance.current = null;
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

  const cursorClass = scale > MIN_ZOOM 
    ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') 
    : 'cursor-zoom-in';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={handleWheel}
    >
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

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-6 top-1/2 z-[110] -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/20 text-white backdrop-blur transition hover:bg-black/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <Icon icon="mdi:chevron-left" className="size-8" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-6 top-1/2 z-[110] -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/20 text-white backdrop-blur transition hover:bg-black/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <Icon icon="mdi:chevron-right" className="size-8" />
          </button>
        </>
      )}

      <div
        ref={containerRef}
        className="relative flex items-center justify-center h-full w-full overflow-hidden pointer-events-none"
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
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
            transition: isDragging || pointers.current.size > 1 ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
        />
      </div>

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

      {images.length > 1 && (
        <div className="absolute bottom-6 left-6 z-[110] rounded-full bg-black/30 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
