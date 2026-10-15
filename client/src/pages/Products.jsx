import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters and Sort State
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");
    const [wishlistIds, setWishlistIds] = useState(new Set());
    
    // Debounce search state
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Setup debounce for search input to avoid spamming the API
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Construct query parameters
                const params = new URLSearchParams();
                if (debouncedSearch) params.append('search', debouncedSearch);
                if (category) params.append('category', category);
                if (sort) params.append('sort', sort);
                
                // Fetch products and wishlist in parallel
                const [productRes, wishlistRes] = await Promise.all([
                    api.get(`/products?${params.toString()}`),
                    api.get('/wishlist').catch(() => ({ data: { wishlist: [] } })) // gracefully handle error if any
                ]);
                
                if (productRes.data.success) {
                    setProducts(productRes.data.products);
                } else {
                    setError("Failed to fetch products");
                }

                if (wishlistRes.data && wishlistRes.data.wishlist) {
                    const ids = wishlistRes.data.wishlist.map(w => w._id || w);
                    setWishlistIds(new Set(ids));
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Something went wrong while loading products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [debouncedSearch, category, sort]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Products</h1>
                    <p className="mt-2 text-lg text-gray-500">Find what you're looking for</p>
                </div>
            </div>

            <SearchBar 
                search={search} 
                setSearch={setSearch} 
                category={category} 
                setCategory={setCategory} 
                sort={sort}
                setSort={setSort}
            />

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading products...</p>
                    </div>
                </div>
            ) : (
                /* Main Content Area */
                <>
                    {/* Empty State */}
                    {products.length === 0 && !error ? (
                        <div className="text-center bg-white rounded-2xl border border-gray-100 p-16 shadow-sm">
                            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any products matching your current filters. Try adjusting your search or category.
                            </p>
                            {(search || category) && (
                                <button 
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("");
                                    }}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product} 
                                    initialWishlistState={wishlistIds.has(product._id)} 
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;
