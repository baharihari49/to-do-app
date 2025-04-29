'use client'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header/Header";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient()

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
                <QueryClientProvider client={queryClient}>
                    <SidebarProvider>
                        <AppSidebar />
                        <main className="w-full">
                            <Header />
                            <div className="w-8xl p-3">
                                {children}
                            </div>
                        </main>
                    </SidebarProvider>
                </QueryClientProvider>
            )}
            {!showSidebar && (
                <div>{children}</div>
            )}
        </>
    )
}