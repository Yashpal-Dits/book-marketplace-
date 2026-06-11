import { Outlet } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";

export const CustomerLayout = () => (
    <div className="min-h-screen bg-[#faf7ef] text-stone-800">
        <Header/>
        <main><Outlet/></main>
        <Footer/>
    </div>
)