'use client'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header/Header";
import React from "react";

export const ClientLayout = ({
    children
}: Readonly<{
    children: React.ReactNode
}>) => {
    const pathname = usePathname()
    const showSidebar = pathname ? !['/login', '/register'].some(path => pathname.startsWith(path)) : false;

    return (
        <>
            {showSidebar && (
                <SidebarProvider>
                    <AppSidebar />
                    <main className="w-full">
                        <Header />
                        <div className="w-8xl p-3">
                            {children}
                        </div>
                    </main>
                </SidebarProvider>
            )}
            {!showSidebar && (
                <div>{children}</div>
            )}
        </>
    )
}