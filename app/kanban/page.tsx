import KanbanOnly from "@/components/Kanban"
export default function page() {
    return (
        <div className="container mx-auto py-6 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <KanbanOnly />
            </div>
        </div>
    )
}