import Image from "next/image";
import { User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile, ClerkUser } from "../types";

interface UserProfileHeaderProps {
  userProfile: UserProfile | null;
  clerkUser: ClerkUser | null;
  isLoadingProfile: boolean;
}

export function UserProfileHeader({
  userProfile,
  clerkUser,
  isLoadingProfile,
}: UserProfileHeaderProps) {
  if (isLoadingProfile || (!userProfile && !clerkUser)) {
    return null;
  }

  // Use UserProfile data with fallback to ClerkUser
  const firstName = userProfile?.firstName || clerkUser?.firstName || "";
  const lastName = userProfile?.lastName || clerkUser?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const imageUrl = userProfile?.imageUrl || clerkUser?.imageUrl || "";
  const email =
    userProfile?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    "";
  const credits = userProfile?.credits || 0;

  return (
    <div className="flex items-center justify-between mb-4 bg-muted/40 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 border-2 border-primary">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={fullName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Avatar>
        <div>
          <h2 className="font-medium text-base">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <Badge variant="outline" className="text-sm">
        Credits: {credits}
      </Badge>
    </div>
  );
}
