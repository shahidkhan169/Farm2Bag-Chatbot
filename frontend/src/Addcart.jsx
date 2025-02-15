import Nav from "./Nav";
import ban from "./Photos/banana.jpg"
import jac from "./Photos/jackfruit.jpg"

function Addcart() {
    return (
        <div className="flex flex-col h-screen">
            <Nav />

            {/* Cart Section */}
            <div className="flex-1 flex justify-center items-center bg-gray-900 bg-opacity-75">
                <div className="w-3/4 h-[85vh] bg-white shadow-xl overflow-y-auto flex">
                    {/* Left Side - Shopping Cart */}
                    <div className="w-2/3 flex flex-col border-r border-gray-200">
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
                                        <img src={ban} alt="Product" className="size-full object-cover" />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>Banana</h3>
                                            <p className="ml-4">$90.00</p>
                                        </div>
                                        
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center">
                                                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                                                    <span className="sr-only">Decrease quantity</span>
                                                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                    </svg>
                                                </button>
                                                <span className="mx-2 text-gray-900">1</span>
                                                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                                                    <span className="sr-only">Increase quantity</span>
                                                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button type="button" className="font-medium text-red-500 hover:text-red-700">Remove</button>
                                        </div>
                                    </div>
                                </li>

                                <li className="flex py-6">
                                    <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img src={jac} alt="Product" className="size-full object-cover" />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>JackFruit</h3>
                                            <p className="ml-4">$32.00</p>
                                        </div>
                                    
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center">
                                                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                                                    <span className="sr-only">Decrease quantity</span>
                                                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                    </svg>
                                                </button>
                                                <span className="mx-2 text-gray-900">1</span>
                                                <button type="button" className="p-1 text-gray-500 hover:text-gray-700">
                                                    <span className="sr-only">Increase quantity</span>
                                                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <button type="button" className="font-medium text-red-500 hover:text-red-700">Remove</button>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="w-1/3 p-6 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">$99.00</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping estimate</span>
                                <span className="font-medium text-gray-900">$5.00</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax estimate</span>
                                <span className="font-medium text-gray-900">$8.32</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
                                <span>Order total</span>
                                <span>$112.32</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-indigo-700">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Addcart;