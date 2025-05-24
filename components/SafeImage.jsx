// components/SafeImage.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SafeImage({ src, alt, fallbackSrc, ...props }) {
  const [imgSrc, setImgSrc] = useState("/placeholder.svg");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset states when src changes
    if (src) {
      setImgSrc(src);
      setIsLoading(true);
      setHasError(false);
    } else if (fallbackSrc) {
      setImgSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, fallbackSrc]);
  
  // Check if the URL is external
  const isExternal = imgSrc && typeof imgSrc === 'string' && (
    imgSrc.startsWith('http:') || imgSrc.startsWith('https:')
  );
  
  const handleError = () => {
    setHasError(true);
    
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      console.log("Image load error, using fallback:", fallbackSrc);
      setImgSrc(fallbackSrc);
      setIsLoading(true); // Reset loading state for the fallback image
    } else {
      console.log("Using placeholder as final fallback");
      setImgSrc("/placeholder.svg");
    }
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt || 'Image'}
        unoptimized={isExternal}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
        quality={75}
        priority={true}
      />
    </>
  );
}