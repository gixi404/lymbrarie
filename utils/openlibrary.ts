export interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  cover_i?: number;
  key: string;
}

export interface OpenLibraryResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

export interface BookSearchResult {
  title: string;
  author: string;
  image: string;
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query.trim()) return [];
  
  try {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    const data: OpenLibraryResponse = await res.json();

    return data.docs.map((doc) => {
      const author = doc.author_name ? doc.author_name.join(", ") : "";
      const image = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : "";
      return {
        title: doc.title,
        author,
        image,
      };
    });
  } catch (error) {
    console.error("Error searching books:", error);
    return [];
  }
}
