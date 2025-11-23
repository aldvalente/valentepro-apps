export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 3L4 9L16 15L28 9L16 3Z"
            fill="#EF4444"
          />
          <path
            d="M4 15L16 21L28 15V23L16 29L4 23V15Z"
            fill="#DC2626"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-primary-600">Gearbnb</span>
    </div>
  );
}
