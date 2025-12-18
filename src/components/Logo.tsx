import { useSidebar } from "@/components/ui/sidebar";

export default function Logo() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div
      className={`flex items-center ${
        collapsed ? "justify-center w-full" : ""
      }`}
    >
      <img
        src='/logo.webp'
        alt='TechGila Logo'
        className={`transition-all duration-200 object-contain max-w-full ${
          collapsed ? "h-8" : "h-20 sm:h-14 md:h-16 lg:h-20"
        }`}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = "/";
        }}
      />
    </div>
  );
}
