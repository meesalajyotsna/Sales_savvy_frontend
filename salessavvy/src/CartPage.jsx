import React, { useEffect, useState } from "react";
import "./CartPage.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [username, setUsername] = useState("");
  const navigate = useNavigate(); //To redirect users after successful payment

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/cart/items", {
          credentials: "include",  //Include session cookie
        });
        if (!response.ok) throw new Error("Failed to fetch cart items");

        const data = await response.json();
        setCartItems(
          data?.cart?.products.map((item) => ({
            ...item,
            total_price: parseFloat(item.total_price).toFixed(2),
            price_per_unit: parseFloat(item.price_per_unit).toFixed(2),
          })) || []
        );
        setUsername(data?.username || "");
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    setSubtotal(total.toFixed(2));
  }, [cartItems]);
 
  //Remove item from from the cart
  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId }),
      });
      if (response.status === 204) {
        setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      } else {
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try{
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    
      const response = await fetch("http://localhost:9090/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId, quantity: newQuantity }),
      });
      if (response.ok) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total_price: (item.price_per_unit * newQuantity).toFixed(2),
                }
              : item
          )
        );
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };


  //Razorpay integration for payment
  const handleCheckout = async () => {
    try {
      const requestBody = {
        totalAmount: subtotal,
        cartItems: cartItems.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price_per_unit,
        })),
      };

      // Create Razorpay order via backend
      const response = await fetch("http://localhost:9090/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      const razorpayOrderId = await response.text();

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load.");
        return;
      }


      //Open Razorpay checkout interface
      const options = {
        key: "rzp_test_FTlEnSloSo3oGi", //  Replace with your test key
        amount: subtotal * 100, // in paise
        currency: "INR",
        name: "SalesSavvy",
        description: "Test Transaction",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            //payment success, verify on backend
            const verifyRes = await fetch("http://localhost:9090/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,   //Ensure key matches backend
                razorpayPaymentId: response.razorpay_payment_id, //Ensure key matches backend
                razorpaySignature: response.razorpay_signature, //Ensure key matches backend
              }),
            });

            const result = await verifyRes.text();
            if (verifyRes.ok) {
              alert("Payment successful!");
              navigate("/customerhome");
            } else {
              alert("Payment verification failed: " + result);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: username,
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Try again.");
    }
  };

  const totalProducts = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shipping = (5 * 74).toFixed(2); // Static ₹370 for example

  if (cartItems.length === 0) {
    return (
      <div className="cartfooter">
        <Header cartCount={0} username={username} />
      <div className="cart-page empty">
        <div className="empty-cart-container">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty Cart"
            className="empty-cart-image"
          />
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven’t added anything to your cart yet.</p>
          <a href="/customerhome" className="shop-now-button">🛒 Shop Now</a>
        </div>
         </div>
        <Footer/>
      </div>
     
    );
  
  
  }

  return (
    <div style={{ width: "100vw" }}>
      <Header cartCount={totalProducts()} username={username} />
      <div className="cart-container">
        <div className="cart-page">
          <a href="/customerhome" className="back-button">← Continue Shopping</a>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>You have {cartItems.length} item(s) in your cart</p>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={item.image_url || "https://via.placeholder.com/80?text=No+Image"}
                  alt={item.name}
                />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="price">₹{item.total_price}</span>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.product_id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="summary-row"><span>Shipping</span><span>₹{shipping}</span></div>
            <div className="summary-row"><span>Total Products</span><span>{totalProducts()}</span></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{(parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)}</span>
            </div>
            <button className="checkout-button" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
