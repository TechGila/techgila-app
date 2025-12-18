import { useSidebar } from "@/components/ui/sidebar";

export default function Logo() {
  // useSidebar throws when not wrapped in SidebarProvider. Guard so Logo can be used
  // in non-dashboard pages (e.g., the Auth page) without crashing.
  let collapsed = false;
  try {
    const ctx = useSidebar();
    collapsed = ctx?.state === "collapsed";
  } catch (e) {
    // Not inside a SidebarProvider — default to expanded logo
    collapsed = false;
  }

  return (
    <div
      className={`flex items-center ${
        collapsed ? "justify-center w-full px-0" : ""
      }`}
    >
      <img
        src='/logo.webp'
        alt='TechGila Logo'
        className={`transition-all duration-200 object-contain max-w-full ${
          collapsed ? "h-12 w-auto" : "h-20 sm:h-14 md:h-16 lg:h-20"
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
