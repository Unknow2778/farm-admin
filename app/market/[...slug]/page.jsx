'use client';

import React, { useState } from 'react';
import ProductsPrice from './ProductsPrice';
import Products from './Products';

function Page() {
  const [isProducts, setIsProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProducts(false);
  };

  const handleBackToProducts = () => {
    setIsProducts(true);
    setSelectedProduct(null);
  };

  return (
    <div>
      {isProducts ? (
        <Products onProductClick={handleProductClick} />
      ) : (
        <ProductsPrice
          product={selectedProduct}
          onBack={handleBackToProducts}
        />
      )}
    </div>
  );
}

export default Page;
