import React, { useState } from 'react';

function ProductCard({ imageSrc, name }) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="cursor-pointer" onClick={() => setIsImageOpen(true)}>
        <img src={imageSrc} alt={name} className="rounded-md w-full h-60 object-cover" />
        <h2 className="text-center font-semibold mt-2">{name}</h2>
      </div>

      {/* Lightbox */}
      {isImageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <img
            src={imageSrc}
            alt={name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
          />
          <button
            onClick={() => setIsImageOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}

export default ProductCard;
