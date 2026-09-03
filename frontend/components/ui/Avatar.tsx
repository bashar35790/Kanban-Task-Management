type AvatarProps = {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  imageUrl?: string | null;
  className?: string;
};

const sizes = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

// Generates pleasant pastels based on name
const avatarColors = [
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-sky-100 text-sky-800 border-sky-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-teal-100 text-teal-800 border-teal-200",
];

export function Avatar({ name, size = "md", imageUrl, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = avatarColors[Math.abs(hash) % avatarColors.length];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover border border-white shadow-xs ${sizes[size]} ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold border border-white shadow-xs select-none ${colorClass} ${sizes[size]} ${className ?? ""}`}
      title={name}
    >
      {initials || "?"}
    </div>
  );
}
