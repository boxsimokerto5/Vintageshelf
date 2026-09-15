import React, { useState, useEffect } from 'react';
import { Book } from './types';
import { getStoredBooks, deleteBookRecord } from './utils/storage';
import { VintageBookshelf } from './components/VintageBookshelf';
import { VintageBookReader } from './components/VintageBookReader';
import { ImportModal } from './components/ImportModal';
import { AntiqueDeleteConfirmModal } from './components/AntiqueDeleteConfirmModal';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load books from IndexedDB on startup
  useEffect(() => {
    async function loadBooks() {
      try {
        const stored = await getStoredBooks();
        setBooks(stored);
      } catch (err) {
        console.error('Failed to load books from IndexedDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, []);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    setSelectedBook(updatedBook);
  };

  const handleBookAdded = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const handleDeleteBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = books.find((b) => b.id === id);
    if (target) {
      setBookToDelete(target);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteBookRecord(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (selectedBook?.id === id) {
        setSelectedBook(null);
      }
    } catch (err) {
      console.error('Failed to delete book record:', err);
    } finally {
      setBookToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen h-[100dvh] w-full wood-cabinet flex flex-col items-center justify-center text-[#d4af37] font-serif overflow-hidden">
        <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase font-display">Membuka Pustaka Kayu Kuno...</p>
      </div>
    );
  }

  return (
    <main className="h-screen h-[100dvh] w-full bg-[#170e08] text-[#ebdcc2] relative select-none overflow-hidden flex flex-col">
      {/* Bookshelf View */}
      <VintageBookshelf
        books={books}
        onSelectBook={handleSelectBook}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onDeleteBook={handleDeleteBook}
      />

      {/* Reader Modal View */}
      {selectedBook && (
        <VintageBookReader
          book={selectedBook}
          onClose={handleCloseReader}
          onUpdateBook={handleUpdateBook}
        />
      )}

      {/* Import PDF Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* Antique Book Deletion Confirmation Modal */}
      <AntiqueDeleteConfirmModal
        isOpen={bookToDelete !== null}
        book={bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
