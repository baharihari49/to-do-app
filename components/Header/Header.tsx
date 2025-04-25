import { SidebarTrigger } from "../ui/sidebar"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { AvatarUser } from "./Avatar"

export const Header = () => {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                <div className="flex items-center justify-between w-full gap-2 px-4">
                    <div className="flex items-center gap-5">
                        <SidebarTrigger />
                        <div className="flex items-center gap-3 w-3xl">
                            <div className="flex-1 flex">
                                <div className="relative max-w-md w-full">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search tasks..."
                                        className="pl-8 bg-muted/50 border-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <AvatarUser />
                </div>
            </header>
        </>
    )
}