import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {

    return (

        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <Sidebar />
            <Navbar />
            <div
                style={{
                    marginLeft: "260px",
                    paddingTop: "90px",
                    paddingRight: "30px",
                    paddingBottom: "40px",
                    paddingLeft: "30px",
                    minHeight: "calc(100vh - 90px)",
                    background: "#f8fafc"
                }}
            >
                {children}
            </div>
        </div>

    );

}

export default DashboardLayout;