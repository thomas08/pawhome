import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { DogStatusBadge } from "./DogStatusBadge";
import { dogSizeLabel } from "@/lib/utils";

interface DogCardProps {
  dog: {
    id: string;
    name: string;
    breed: string | null;
    size: string;
    status: string;
    photos: { url: string; isMain: boolean }[];
    _count?: { follows: number };
  };
  size?: "sm" | "md";
}

export function DogCard({ dog, size = "md" }: DogCardProps) {
  const photo = dog.photos.find((p) => p.isMain) ?? dog.photos[0];

  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Photo */}
      <div className={`relative bg-amber-50 ${size === "sm" ? "aspect-[4/3]" : "aspect-square"}`}>
        {photo ? (
          <Image
            src={photo.url}
            alt={dog.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">🐶</div>
        )}
        {/* Status overlay */}
        <div className="absolute top-2 left-2">
          <DogStatusBadge status={dog.status} />
        </div>
        {/* Follow count */}
        {dog._count && dog._count.follows > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/85 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-gray-600 font-medium">
            <Heart size={11} className="text-coral-500 fill-coral-500" />
            {dog._count.follows}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">{dog.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {dog.breed ?? "พันธุ์ผสม"} · {dogSizeLabel(dog.size)}
        </p>
      </div>
    </Link>
  );
}
