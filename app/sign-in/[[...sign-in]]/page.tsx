import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen w-full content-center items-center justify-center">
      <SignIn />
    </div>
  );
}
