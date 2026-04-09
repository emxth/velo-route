const LoadingVehicle = ({ message = "Loading Schedules..." }) => {

    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative w-32 h-32">

                {/*Animated Vehicle SVG*/}
                <svg
                    className="absolute w-full h-full animate-bounce"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Bus body */}
                    <rect x="15" y="40" width="70" height="30" rx="5" fill="#1A5276" />
                    {/* Windows */}
                    <rect x="25" y="45" width="10" height="15" fill="#E67E22" />
                    <rect x="40" y="45" width="10" height="15" fill="#E67E22" />
                    <rect x="55" y="45" width="10" height="15" fill="#E67E22" />
                    <rect x="70" y="45" width="10" height="15" fill="#E67E22" />
                    {/* Wheels */}
                    <circle cx="30" cy="70" r="6" fill="#2C3E50" />
                    <circle cx="70" cy="70" r="6" fill="#2C3E50" />
                    {/* Headlight */}
                    <circle cx="85" cy="50" r="3" fill="#F1C40F" />
                </svg>

                {/*Road line*/}
                <div className="absolute bottom-0 w-full h-1 overflow-hidden">
                    <div className="w-full h-full bg-gray-400">
                        <div className="w-1/3 h-full bg-primary-500 animate-slid"></div>
                    </div>
                </div>
            </div>
            <p className="text-neutral-600 font-medium">{message}</p>
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-200"></div>
            </div>
        </div>
    );
};

export default LoadingVehicle;