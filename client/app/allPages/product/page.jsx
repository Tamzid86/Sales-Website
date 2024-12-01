"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/component/navbar";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    productName: "",
    details: "",
    price: 0,
    ownerPercentage: 0,
    secondLevelPercentage: 0,
    thirdLevelPercentage: 0,
  });
  const [originalProductName, setOriginalProductName] = useState("");



  const [showAddProductModal, setShowAddProductModal] = useState(false);
const [addFormData, setAddFormData] = useState({
  productName: "",
  details: "",
  price: 0,
  ownerPercentage: 0,
  secondLevelPercentage: 0,
  thirdLevelPercentage: 0,
});

const handleAddInputChange = (e) => {
  const { name, value } = e.target;
  setAddFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleAddProduct = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: Token not found");
      return;
    }

    const res = await fetch("http://localhost:8000/add_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...addFormData,
        sales: [], 
      }),
    });

    if (res.ok) {
      alert("Product added successfully!");
      setShowAddProductModal(false);
      fetchProducts(); 
    } else {
      setError("Failed to add product.");
    }
  } catch (err) {
    setError("An error occurred while adding the product.");
  }
};



  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to fetch products.");
      }
    } catch (err) {
      setError("An error occurred while fetching products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditFormOpen = (product) => {
    setEditMode(true);
    setOriginalProductName(product.productName);
    setEditFormData({
      productName: product.productName,
      details: product.details,
      price: product.price,
      ownerPercentage: product.ownerPercentage || 0,
      secondLevelPercentage: product.secondLevelPercentage || 0,
      thirdLevelPercentage: product.thirdLevelPercentage || 0,
    });
  };

  const handleDeleteProduct = async (productName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Token not found");
        return;
      }
  
      const res = await fetch(`http://localhost:8000/delete-product/${productName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setProducts((prevProducts) =>
          prevProducts.filter((prod) => prod.productName !== productName)
        );
        setSelectedProduct(null); 
        setError(""); 
        alert("Product deleted successfully!");
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to delete product.");
      }
    } catch (err) {
      setError("An error occurred while deleting the product.");
    }
  };
  

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Token not found");
        return;
      }
  
 
      const updatedProduct = {
        ...editFormData,
        sales: selectedProduct.sales, 
      };
  
      const res = await fetch(
        `http://localhost:8000/edit_product/${originalProductName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProduct),
        }
      );
  
      if (res.ok) {
        alert("Product updated successfully!");
        setEditMode(false);
        fetchProducts(); 
      } else {
        setError("Failed to update product.");
      }
    } catch (err) {
      setError("An error occurred while updating the product.");
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  return (
    <div>
    <Navbar variable1="Profile" variable2="Employees" link1="/allPages/profile" link2="/allPages/employees" />
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Products</h1>
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-3 gap-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedProduct(product)}
          >
            <h2 className="font-bold">{product.productName}</h2>
            <p>Price: {product.price} Taka</p>
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-center mb-4">
        <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-10"
        >
            Add Product
        </button>
    </div>
    {showAddProductModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg w-[400px] max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold">Add New Product</h2>
        <form className="space-y-4">
            <div>
            <label className="block font-semibold">Product Name:</label>
            <input
                type="text"
                name="productName"
                value={addFormData.productName}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block font-semibold">Description:</label>
            <textarea
                name="details"
                value={addFormData.details}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block font-semibold">Price (Taka):</label>
            <input
                type="number"
                name="price"
                value={addFormData.price}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block font-semibold">Owner Percentage:</label>
            <input
                type="number"
                name="ownerPercentage"
                value={addFormData.ownerPercentage}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block font-semibold">Second Level Percentage:</label>
            <input
                type="number"
                name="secondLevelPercentage"
                value={addFormData.secondLevelPercentage}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
            <div>
            <label className="block font-semibold">Third Level Percentage:</label>
            <input
                type="number"
                name="thirdLevelPercentage"
                value={addFormData.thirdLevelPercentage}
                onChange={handleAddInputChange}
                className="w-full p-2 border rounded"
            />
            </div>
        </form>
        <div className="flex justify-end gap-2 mt-4">
            <button
            onClick={() => setShowAddProductModal(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
            Cancel
            </button>
            <button
            onClick={handleAddProduct}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
            Add Product
            </button>
        </div>
        </div>
    </div>
    )}



    {selectedProduct && !editMode && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg w-[600px] max-h-[90vh] overflow-y-auto space-y-4">
          <div>
          <h2 className="text-xl font-bold">Product Details</h2>
          <div className="h-[1px] w-[180px] bg-black"></div>
          </div>
          
          <div className="space-y-4">
            <div>
              <strong>Product Name: </strong>
              {selectedProduct.productName}
            </div>
            <div>
              <strong>Price: </strong>
              {selectedProduct.price} Taka
            </div>
            <div>
              <strong>Description: </strong>
              {selectedProduct.details}
            </div>
            <div>
              <strong>Sales: </strong>
              {selectedProduct.sales.length === 0 ? (
                <div>No sale yet</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border p-2">
                  {selectedProduct.sales.map((sale, index) => (
                    <div
                      key={index}
                      className="border-b pb-2 mb-2 last:border-none last:mb-0"
                    >
                      <p>
                        <strong>Product Name: </strong>
                        {sale.productName}
                      </p>
                      <p>
                        <strong>Date: </strong>
                        {sale.date}
                      </p>
                      <p>
                        <strong>Number of Items: </strong>
                        {sale.number_of_items}
                      </p>
                      <p>
                        <strong>Total Price: </strong>
                        {sale.total_price} Taka
                      </p>
                      <p>
                        <strong>Sold By: </strong>
                        {sale.sold_by}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Cancel
            </button>
            <button
              onClick={() => handleEditFormOpen(selectedProduct)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Product
            </button>
            <button
              onClick={() => handleDeleteProduct(selectedProduct.productName)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>
    )}

      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-xl font-bold">Edit Product</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-semibold">Product Name:</label>
                <input
                  type="text"
                  name="productName"
                  value={editFormData.productName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Description:</label>
                <textarea
                  name="details"
                  value={editFormData.details}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Price (Taka):</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">Owner Percentage:</label>
                <input
                  type="number"
                  name="ownerPercentage"
                  value={editFormData.ownerPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">
                  Second Level Percentage:
                </label>
                <input
                  type="number"
                  name="secondLevelPercentage"
                  value={editFormData.secondLevelPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold">
                  Third Level Percentage:
                </label>
                <input
                  type="number"
                  name="thirdLevelPercentage"
                  value={editFormData.thirdLevelPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </form>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditMode(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
