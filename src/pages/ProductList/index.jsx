import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../../components/loading';
import { MD5 } from 'crypto-js';
import './index.css';

const LIMIT = 50;
const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const password = 'Valantis';
const authString = MD5(`${password}_${timestamp}`);

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [uniqueProductIds, setUniqueProductIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState({
    column: '',
    direction: 'asc',
  });

  useEffect(() => {
    (async() => {
  
      const response = await axios.post(
        'https://api.valantis.store:41000/',
        {
          action: 'get_ids',
        },
        {
          headers: {
            'X-Auth': authString
          }
        }
      );
  
      const uniqIds = Array.from(new Set(response.data.result));
      setUniqueProductIds(uniqIds);
      const totalCount = uniqIds.length;
      setTotalPages(Math.ceil(totalCount / LIMIT));
    })()
  }, []);

  useEffect(() => {
    setLoading(true);
    if (uniqueProductIds?.length) {
      fetchProductIds();
    }
  }, [currentPage, uniqueProductIds]);

  const fetchProductIds = () => {
    try {
      console.log(uniqueProductIds)
      const currentPageIds = uniqueProductIds.slice((currentPage - 1) * LIMIT, ((currentPage - 1) * LIMIT) + LIMIT);
      fetchProducts(currentPageIds);
    } catch (error) {
      console.error('Error fetching product IDs:', error);
    }
  };

  const fetchProducts = async (productIds) => {
    try {
      const response = await axios.post(
        'https://api.valantis.store:41000/',
        {
          action: 'get_items',
          params: { ids: productIds }
        },
        {
          headers: {
            'X-Auth': authString
          }
        }
      );

      const uniqueProducts = response.data.result.filter(
        (product, index, self) =>
          index ===
          self.findIndex((p) => p.id === product.id)
      );
      setProducts(uniqueProducts);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
    }
  };

  const sortProducts = (column) => {
    let direction = sortOrder.direction;
    direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc';
    const sortedProducts = [...products].sort((a, b) => {
      const valueA = a[column] === null || a[column] === undefined ? '' : typeof a[column] === 'string' ? a[column].toLowerCase() : a[column];
      const valueB = b[column] === null || b[column] === undefined ? '' : typeof b[column] === 'string' ? b[column].toLowerCase() : b[column];
      console.log(valueA, valueB);
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setProducts(sortedProducts);
    setSortOrder({ column, direction });
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container">
      <h1>Product List</h1>
      <table>
        <thead>
          <tr>
            <th>
              <button onClick={() => sortProducts('id')}>ID</button>
            </th>
            <th>
              <button onClick={() => sortProducts('product')}>Name</button>
            </th>
            <th>
              <button onClick={() => sortProducts('price')}>Price</button>
            </th>
            <th>
              <button onClick={() => sortProducts('brand')}>Brand</button>
            </th>
          </tr>
        </thead>
        
        {loading ? <Loading /> : (
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.product}</td>
                <td>{product.price}</td>
                <td>{product.brand || '-'}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1 || loading}>{`<`}</button>
        <span>{currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages || loading}>{`>`}</button>
      </div>
    </div>
  );
};

export default ProductList;