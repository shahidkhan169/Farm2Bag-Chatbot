function Addcart() {
    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center">
            <div className="w-full h-full bg-white shadow-xl overflow-y-auto">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Close panel</span>
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <ul role="list" className="divide-y divide-gray-200">
                            <li className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img src="https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg" alt="Product" className="size-full object-cover" />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>Throwback Hip Bag</h3>
                                        <p className="ml-4">$90.00</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Salmon</p>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <p className="text-gray-500">Qty 1</p>
                                        <button type="button" className="font-medium text-red-500 hover:text-red-700">Remove</button>
                                    </div>
                                </div>
                            </li>

                            <li className="flex py-6">
                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img src="https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-02.jpg" alt="Product" className="size-full object-cover" />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>Medium Stuff Satchel</h3>
                                        <p className="ml-4">$32.00</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Blue</p>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                        <p className="text-gray-500">Qty 1</p>
                                        <button type="button" className="font-medium text-red-500 hover:text-red-700">Remove</button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6">
                        <div className="flex justify-between text-lg font-medium text-gray-900">
                            <p>Subtotal</p>
                            <p>$122.00</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                            <button className="w-full bg-indigo-600 text-white py-3 rounded-md text-lg font-medium hover:bg-indigo-700">Checkout</button>
                        </div>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            <button className="text-indigo-600 hover:text-indigo-700">Continue Shopping →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Addcart;
