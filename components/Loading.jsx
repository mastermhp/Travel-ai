export default function Loading() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-black animate-spin"></div>
        <div
          className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-gray-200 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
    </div>
  )
}
