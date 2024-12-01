"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeProfile() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellDate, setSellDate] = useState(new Date().toISOString().split("T")[0]); 
  const [numberOfItems, setNumberOfItems] = useState(1);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter();
 
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/products");
      const products = await response.json();
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/employee/currentuser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = await response.json();
      setUser(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleSell = async () => {
    try {
      if (!selectedProduct || !numberOfItems) return;
      const response = await fetch(
        `http://localhost:8000/employee/sell/${selectedProduct.productName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            date: sellDate,
            number_of_items: numberOfItems,
          }),
        }
      );
      closeModal()

      const result = await response.json();
      if (response.ok) {
        alert("Product sold successfully!");
        setIsModalOpen(false);
      } else {
        setError(result.detail || "Error selling product.");
      }
      setIsDisabled(true);
      window.location.reload();
    } catch (error) {
      console.error("Error selling product:", error);
      setError("An error occurred, please try again.");
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // setSellDate(new Date().toISOString().split("T")[0]);
    setNumberOfItems(1);
  };

  useEffect(() => {
    fetchProducts();
    fetchCurrentUser();
    const currentDate = new Date().toISOString().split("T")[0];
    setSellDate(currentDate);
  }, []);

  const handleConfirmButton=()=>{
    closeModal();
    handleSell()
  }
  

  return (
    <div>
      <nav className="bg-slate-300 h-[80px] w-[100%] mb-5 shadow-md flex justify-between p-[30px]">
        <h1 className="text-xl font-semibold shadow-sm">
          {user ? `Welcome, ${user.username}` : "Employee name"}
        </h1>
        <button
          className="text-lg shadow-xl mr-[50px] bg-white w-[80px] h-[35px] rounded hover:bg-black hover:text-white"
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/");
          }}
        >
          Logout
        </button>
      </nav>

      {user && (
        <div className="bg-gray-100 p-6 rounded-md shadow-md mb-6 mx-5 gap-5 flex flex-col">
          <div>
          <h2 className="text-xl font-semibold">Your Information</h2>
            <div className="w-[20%] h-[1px] bg-black"></div>
          </div>
          <p><strong>Full Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Wallet Balance:</strong> {user.employeeWallet} Taka</p>
          <p><strong>Reference:</strong> {user.reference || "No reference"}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-6 p-5">
        {products.map((product) => (
          <div key={product.productName} className="w-[240px] bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold">{product.productName}</h3>
            <p className="text-sm mb-3">Price: {product.price} Taka</p>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all"
              onClick={() => openModal(product)}
            >
              Sell
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-[400px]">
            <h2 className="text-2xl font-semibold">Sell {selectedProduct.productName}</h2>
            <div className="my-4">
              <label className="block text-sm mb-2">Date</label>
              <input
                type="date"
                value={sellDate}
                readOnly
                onChange={(e) => setSellDate(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>

            <div className="my-4">
              <label className="block text-sm mb-2">Number of items</label>
              <input
                type="number"
                value={numberOfItems}
                onChange={(e) => setNumberOfItems(Number(e.target.value))}
                min="1"
                className="p-2 border border-gray-300 rounded w-full"
              />
            </div>

            {error && <div className="text-red-500 text-sm my-2">{error}</div>}

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`py-2 px-4 rounded ${
                  isDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={handleConfirmButton}
              >
                Confirm
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
