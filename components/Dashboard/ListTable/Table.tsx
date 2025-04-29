import React, { useState, useEffect, useCallback } from 'react';
import { Edit } from '../Edit/Edit';
import { Detail } from '../Detail/Detail';
import { ListTableProps, Todo } from '@/Types/Types';
import { Pagination } from './Pagintaion';
import { TableHeader } from './TableHeader';
import { Toolbar } from './Toolbar';
import { TodoRow } from './TodoRow';
import { EmptyRow } from './EmpetyRow';
import { useTodos } from '@/hooks/useTodos';

export const ListTable: React.FC<ListTableProps> = ({
    todos,
    paginatedTodos,
    sortedTodos,
    selected,
    selectedCount,
    filter,
    sortBy,
    currentPage,
    totalPages,
    itemsPerPage,
    setFilter,
    setSortBy,
    setCurrentPage,
    handleSelect,
    handleSelectAll,
    markSelectedAsCompleted,
    deleteSelected,
    toggleTodoStatus,
    deleteTodo,
    formatDate,
    getPriorityColor,
    isOverdue,
    fetchTodos
}) => {
    // Get the forceUpdate function from useTodos
    // const { forceUpdate } = useTodos();

    // State untuk modal dan sheet
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState<boolean>(false);

    // State untuk pencarian
    const [searchInput, setSearchInput] = useState<string>(''); // Input langsung dari user
    const [searchQuery, setSearchQuery] = useState<string>(''); // Debounced search query
    const [filteredTodos, setFilteredTodos] = useState<Todo[]>(paginatedTodos);
    const [isSearching, setIsSearching] = useState<boolean>(false); // State untuk indikator "sedang mencari"

    const { setTodoStatus } = useTodos()

    // Memoized search filter function untuk optimasi
    const filterTodos = useCallback(() => {
        if (searchQuery.trim()) {
            // Filter todos yang sesuai dengan search query (case insensitive)
            return todos.filter(todo =>
                todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return paginatedTodos;
    }, [searchQuery, todos, paginatedTodos]);

    // Force update filteredTodos when todos change
    useEffect(() => {
        console.log("Todos updated in ListTable, updating filtered todos");
        if (searchQuery.trim()) {
            const results = filterTodos();
            setFilteredTodos(results);
        } else {
            setFilteredTodos(paginatedTodos);
        }
    }, [todos, paginatedTodos, searchQuery, filterTodos]); // Menambahkan filterTodos ke dependencies

    // Debounce function untuk pencarian
    useEffect(() => {
        // Mulai timer indikator pencarian jika user sudah mengetik
        if (searchInput.trim()) {
            setIsSearching(true);
        }

        // Set timeout untuk debounce (300ms)
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
            setIsSearching(false); // Pencarian selesai
        }, 300);

        // Cleanup function untuk clear timer jika component unmount atau searchInput berubah lagi
        return () => {
            clearTimeout(timer);
        };
    }, [searchInput]);

    // Effect untuk filter todos berdasarkan pencarian yang sudah di-debounce
    useEffect(() => {
        const results = filterTodos();
        setFilteredTodos(results);

        // Reset halaman ke 1 ketika melakukan pencarian
        if (searchQuery.trim() && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchQuery, filterTodos, currentPage, setCurrentPage]);

    // ====== STATE MANAGEMENT HANDLERS ======

    // Fungsi untuk membuka modal Create dengan aman
    const handleOpenCreateModal = (value = true) => {
        // Jika menutup dialog, kita cukup set valuenya saja
        if (!value) {
            setIsCreateModalOpen(false);
            return;
        }

        // Jika membuka dialog, pastikan modal lain tertutup
        setIsEditModalOpen(false);
        setEditingTodo(null);
        setIsCreateModalOpen(true);
    };

    // Fungsi untuk membuka modal Edit dengan aman
    const handleOpenEditModal = (todo: Todo) => {
        // Pastikan modal Create tertutup terlebih dahulu
        setIsCreateModalOpen(false);
        // Set todo yang akan diedit dan buka modal Edit
        setEditingTodo(todo);
        setIsEditModalOpen(true);
    };

    // Fungsi untuk membuka detail sheet
    const handleOpenDetailSheet = (todo: Todo) => {
        // Set todo yang akan dilihat dan buka detail sheet
        setViewingTodo(todo);
        setIsDetailSheetOpen(true);
    };

    // ====== DETAIL VIEW ACTION HANDLERS ======

    // Handle detail actions
    const handleDetailEdit = (todo: Todo) => {
        // Tutup detail sheet
        setIsDetailSheetOpen(false);
        // Setelah ditutup, buka modal edit
        setTimeout(() => {
            handleOpenEditModal(todo);
        }, 300); // Delay sedikit untuk animasi sheet closing
    };

    const handleDetailDelete = (id: string | number) => {
        // Tutup detail sheet
        setIsDetailSheetOpen(false);
        // Hapus todo
        setTimeout(() => {
            deleteTodo(id as number);
            // forceUpdate(); // Force UI update
        }, 300);
    };

    const handleDetailToggleStatus = (id: string | number) => {
        // Toggle status tanpa menutup sheet
        toggleTodoStatus(id as number);
        // Refresh data setelah toggle
        fetchTodos();
        // forceUpdate(); // Force UI update

        // Perbarui viewingTodo untuk memastikan UI terupdate
        if (viewingTodo && viewingTodo.id === id) {
            setViewingTodo({
                ...viewingTodo,
                status: viewingTodo.status === 'completed' ? 'pending' : 'completed'
            });
        }
    };

    // Handler untuk membersihkan pencarian
    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
    };

    // Handle modal closing with refresh
    const handleModalClosed = () => {
        // Force refresh the display
        setTimeout(() => {
            fetchTodos();
            // forceUpdate();
        }, 100);
    };

    // Menentukan apakah pencarian aktif
    const isSearchActive = searchQuery.trim().length > 0;

    // Debug log to check data flow
    useEffect(() => {
        console.log("ListTable received todos:", todos.length);
        console.log("ListTable received paginatedTodos:", paginatedTodos.length);
        console.log("ListTable received sortedTodos:", sortedTodos.length);
    }, [todos, paginatedTodos, sortedTodos]);

    return (
        <div className="space-y-4">
            {/* Toolbar dengan filter dan actions */}
            <Toolbar
                handleOpenCreateModal={handleOpenCreateModal}
                isCreateModalOpen={isCreateModalOpen}
                selectedCount={selectedCount}
                markSelectedAsCompleted={markSelectedAsCompleted}
                deleteSelected={deleteSelected}
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchInput}
                setSearchQuery={setSearchInput}
                isSearching={isSearching}
            />

            <div className="bg-card rounded-lg border shadow-sm">
                {/* Table */}
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead>
                            <TableHeader
                                handleSelectAll={handleSelectAll}
                                paginatedTodos={isSearchActive ? filteredTodos : paginatedTodos}
                                selected={selected}
                            />
                        </thead>
                        <tbody>
                            {/* Show search results if search is active, otherwise show paginated todos */}
                            {(isSearchActive ? filteredTodos : paginatedTodos).map((todo) => (
                                <TodoRow
                                    key={todo.id}
                                    todo={todo}
                                    selected={selected}
                                    handleSelect={handleSelect}
                                    handleOpenDetailSheet={handleOpenDetailSheet}
                                    getPriorityColor={getPriorityColor}
                                    formatDate={formatDate}
                                    isOverdue={isOverdue}
                                    toggleTodoStatus={toggleTodoStatus}
                                    handleOpenEditModal={handleOpenEditModal}
                                    deleteTodo={deleteTodo}
                                    setTodoStatus={setTodoStatus} 
                                />
                            ))}

                            {/* Show appropriate empty state */}
                            {(isSearchActive ? filteredTodos : paginatedTodos).length === 0 &&
                                <EmptyRow
                                    searchActive={isSearchActive}
                                    isSearching={isSearching}
                                />
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination - only show when not searching and there are multiple pages */}
                {!isSearchActive && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        sortedTodos={sortedTodos}
                    />
                )}

                {/* Search results count - show when searching */}
                {isSearchActive && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Found {filteredTodos.length} {filteredTodos.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery}&rdquo;
                        </div>
                        <button
                            className="px-3 py-1 text-sm border rounded-md hover:bg-muted/50"
                            onClick={handleClearSearch}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Edit - Now using the refactored Edit component */}
            {editingTodo && (
                <Edit
                    todo={editingTodo}
                    open={isEditModalOpen}
                    setOpen={(value) => {
                        setIsEditModalOpen(value);
                        if (!value) handleModalClosed();
                    }}
                />
            )}

            {/* Komponen Detail dengan Sheet */}
            {viewingTodo && (
                <Detail
                    todo={viewingTodo}
                    onEdit={handleDetailEdit}
                    onDelete={handleDetailDelete}
                    onToggleStatus={handleDetailToggleStatus}
                    fetchTodos={fetchTodos}
                    open={isDetailSheetOpen}
                    setOpen={setIsDetailSheetOpen}
                    isRowClickable={true}
                />
            )}
        </div>
    );
};