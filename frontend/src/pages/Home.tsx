import MainLayout from "../layouts/MainLayout";
import Sidebar from "../components/Sidebar";
import ProtectedRoutes from "../components/ProtectedRoutes";

function Home() {
  return (
    <MainLayout>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>HOME PAGE</div>
    </MainLayout>
  );
}

export default Home;
