export default function Logo() {
  return (
    <div className='flex items-center space-x-2'>
      <img
        src='/logo.webp'
        alt='TechGila Logo'
        className='h-20 w-auto'
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
