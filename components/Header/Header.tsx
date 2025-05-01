import { SidebarTrigger } from "../ui/sidebar"
import { AvatarUser } from "./Avatar"

export const Header = () => {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                <div className="flex items-center justify-between w-full gap-2 px-4">
                    <div className="flex items-center gap-5">
                        <SidebarTrigger />
                        <h1 className="text-xl font-medium">NexDo</h1>
                    </div>
                    <AvatarUser />
                </div>
            </header>
        </>
    )
}