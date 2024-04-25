/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    categoryFromServer => categoryFromServer.id === product.categoryId,
  );
  const user = usersFromServer.find(
    userFromServer => userFromServer.id === category.ownerId,
  );

  return {
    ...product,
    category,
    user,
  };
});

function filterProducts(userId, query, categoriesId) {
  let filteredProducts = [...products];

  if (userId) {
    filteredProducts = filteredProducts.filter(
      product => product.user.id === userId,
    );
  }

  if (query) {
    const normalizedQuery = query.toLowerCase();

    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }

  if (categoriesId.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      categoriesId.includes(product.category.id),
    );
  }

  return filteredProducts;
}

function sortProducts(filteredProducts, sortBy) {
  let sortedProducts = [...filteredProducts];

  if (sortBy[0] === 'ID') {
    sortedProducts = sortedProducts.toSorted((product1, product2) => {
      const result = product1.id - product2.id;

      if (sortBy[1] === 'asc') {
        return result;
      }

      return result * -1;
    });
  }

  if (sortBy[0] === 'Product') {
    sortedProducts = sortedProducts.toSorted((product1, product2) => {
      const result = product1.name.localeCompare(product2.name);

      if (sortBy[1] === 'asc') {
        return result;
      }

      return result * -1;
    });
  }

  if (sortBy[0] === 'Category') {
    sortedProducts = sortedProducts.toSorted((product1, product2) => {
      const result = product1.category.title.localeCompare(
        product2.category.title,
      );

      if (sortBy[1] === 'asc') {
        return result;
      }

      return result * -1;
    });
  }

  if (sortBy[0] === 'User') {
    sortedProducts = sortedProducts.toSorted((product1, product2) => {
      const result = product1.user.name.localeCompare(product2.user.name);

      if (sortBy[1] === 'asc') {
        return result;
      }

      return result * -1;
    });
  }

  return sortedProducts;
}

export const App = () => {
  const [userId, setUserId] = useState('');
  const [query, setQuery] = useState('');
  const [categoriesId, setCategoriesId] = useState([]);
  const [sortBy, setSortBy] = useState([]);

  let visibleProducts = filterProducts(userId, query, categoriesId);

  if (sortBy.length > 0) {
    visibleProducts = sortProducts(visibleProducts, sortBy);
  }

  const handleCategoriesAdd = id => {
    if (categoriesId.includes(id)) {
      setCategoriesId(categoriesId.filter(categoryId => categoryId !== id));
    } else {
      setCategoriesId([...categoriesId, id]);
    }
  };

  const handleClearingFilters = () => {
    setQuery('');
    setUserId('');
    setCategoriesId([]);
  };

  const handleSortBy = columnName => {
    if (!sortBy.includes(columnName)) {
      setSortBy([columnName, 'asc']);
    }

    if (sortBy[0] === columnName && sortBy[1] === 'asc') {
      setSortBy([columnName, 'desc']);
    }

    if (sortBy[0] === columnName && sortBy[1] === 'desc') {
      setSortBy([]);
    }
  };

  const handleColumnIcon = columnName => {
    if (!sortBy.includes(columnName)) {
      return 'fas fa-sort';
    }

    if (sortBy[0] === columnName && sortBy[1] === 'asc') {
      return 'fas fa-sort-up';
    }

    if (sortBy[0] === columnName && sortBy[1] === 'desc') {
      return 'fas fa-sort-down';
    }

    return 'fas fa-sort';
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !userId })}
                onClick={() => setUserId('')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={cn({ 'is-active': userId === user.id })}
                  onClick={() => setUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': categoriesId.length > 0,
                })}
                onClick={() => setCategoriesId([])}
              >
                All
              </a>

              {categoriesFromServer.map(({ id, title }) => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': categoriesId.includes(id),
                  })}
                  href="#/"
                  onClick={() => handleCategoriesAdd(id)}
                >
                  {title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleClearingFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {['ID', 'Product', 'Category', 'User'].map(columnName => (
                    <th>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {columnName}
                        <a href="#/" onClick={() => handleSortBy(columnName)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={handleColumnIcon(columnName)}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(({ id, name, category, user }) => (
                  <tr data-cy="Product" key={id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {id}
                    </td>

                    <td data-cy="ProductName">{name}</td>
                    <td data-cy="ProductCategory">
                      {category.icon} - {category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn(
                        { 'has-text-link': user.sex === 'm' },
                        { 'has-text-danger': user.sex === 'f' },
                      )}
                    >
                      {user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
