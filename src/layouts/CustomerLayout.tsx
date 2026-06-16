import { Outlet, useNavigate } from "react-router-dom";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/enums/role.enum";
import { FiX } from "react-icons/fi";


export const CustomerLayout = () => {
    const navigate = useNavigate();
    const { user, impersonatedCustomerId, impersonatedCustomerName, stopCustomerImpersonation } = useAuthStore();
    const isImpersonating = user?.role === Role.ADMIN && Boolean(impersonatedCustomerId);

    const handleStopImpersonation = () => {
        stopCustomerImpersonation();
        navigate('/admin/customers');
    };

    return (
        <div className="min-h-screen bg-[#faf7ef] text-stone-800">
            <Header/>
            {isImpersonating && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Impersonation Active</span>
                            <span>Viewing as <span className="font-bold">{impersonatedCustomerName}</span></span>
                        </div>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleStopImpersonation}
                            className="h-7 px-3 text-[10px] gap-1"
                        >
                            <FiX /> Stop View
                        </Button>
                    </div>
                </div>
            )}
            <main><Outlet/></main>
            <Footer/>
        </div>
    )
}