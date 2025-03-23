import Image from "next/image";
import { User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "../types";

interface UserProfileHeaderProps {
  userProfile: UserProfile | null;
  clerkUser: any;
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

  return (
    <div className="flex items-center justify-between mb-4 bg-muted/40 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 border-2 border-primary">
          {userProfile?.imageUrl || clerkUser?.imageUrl ? (
            <Image
              src={userProfile?.imageUrl || clerkUser?.imageUrl || ""}
              alt={`${userProfile?.firstName || clerkUser?.firstName} ${
                userProfile?.lastName || clerkUser?.lastName
              }`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Avatar>
        <div>
          <h2 className="font-medium text-base">
            {userProfile?.firstName || clerkUser?.firstName}{" "}
            {userProfile?.lastName || clerkUser?.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {userProfile?.emailAddress ||
              clerkUser?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>
      <Badge variant="outline" className="text-sm">
        Credits: {userProfile?.credits || 0}
      </Badge>
    </div>
  );
}
