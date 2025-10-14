const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="flex space-x-2 text-4xl font-bold text-white">
        {"PREVILEY".split("").map((letter, index) => (
          <span
            key={index}
            className="relative before:absolute before:top-0 before:left-0 before:h-full before:w-full before:bg-white before:content-[''] before:transition-all before:duration-500 before:ease-in-out"
            style={{
              animation: `fillUp 1.5s ease-in-out ${index * 0.2}s forwards`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <style>
        {`
        @keyframes fillUp {
          0% { opacity: 0.2; transform: translateY(10px); }
          50% { opacity: 1; transform: translateY(0px); }
          100% { color: #ffffff; }
        }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
