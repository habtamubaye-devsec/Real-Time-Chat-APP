import { useEffect, type ReactNode } from "react";
import { useUserStore } from "../../stores/userStore";
import { useGeneralStore } from "../../stores/generalStore";

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  const userId = useUserStore((state) => state.id);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);

  useEffect(() => {
    if (!userId) {
      toggleLoginModal();
    }
  }, [userId, toggleLoginModal]);
  if (!userId) return <>Protected</>;
  return <>{children}</>;
};

export default ProtectedRoutes;