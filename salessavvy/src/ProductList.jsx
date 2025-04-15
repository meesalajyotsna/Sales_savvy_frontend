import React, { useState } from 'react';
import './assets/styles.css';

export function ProductList({ products, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(null); // for modal

  if (products.length === 0) {
    return <p className="no-products">No products available.</p>;
  }

  return (
    <>
      {/* Product List */}
      <div className="product-list">
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.product_id} className="product-card">
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onClick={() => setSelectedImage(product.images[0])}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
                style={{ cursor: 'pointer' }}
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(product.product_id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged product"
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
