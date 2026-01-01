import MainLayout from "../layouts/MainLayout";
import Sidebar from "../components/Sidebar";
import ProtectedRoutes from "../components/ProtectedRoutes";

function Home() {
  return (
    <MainLayout>
      <>
        <Sidebar />
        HOME PAGE
      </>
    </MainLayout>
  );
}

export default Home;
