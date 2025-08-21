// useFilePagination.tsx
import { useState, useRef } from "react";

type FilePaginationOptions = {
    pageSize?: number; // số dòng mỗi trang
    onPage?: (pageData: string[], pageIndex: number) => void;
};

export function useFilePagination({ pageSize = 100, onPage }: FilePaginationOptions) {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<string[]>([]);
    const fileRef = useRef<File | null>(null);

    // đọc một chunk dựa trên pageIndex
    const readPage = async (file: File, pageIndex: number) => {
        const chunkSize = 1024 * 1024; // 1MB
        const reader = new FileReader();

        let offset = 0;
        let accumulated = "";
        let lines: string[] = [];

        while (lines.length < (pageIndex + 1) * pageSize && offset < file.size) {
            const slice = file.slice(offset, offset + chunkSize);
            const text: string = await new Promise((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsText(slice);
            });
            accumulated += text;
            lines = accumulated.split("\n");
            offset += chunkSize;
        }

        const start = pageIndex * pageSize;
        const end = start + pageSize;
        const pageData = lines.slice(start, end);

        setPage(pageIndex);
        setData(pageData);
        onPage?.(pageData, pageIndex);

        return pageData;
    };

    const readFile = (file: File) => {
        fileRef.current = file;
        return readPage(file, 0);
    };

    const goToPage = (pageIndex: number) => {
        if (fileRef.current) {
            return readPage(fileRef.current, pageIndex);
        }
        return Promise.resolve([]);
    };

    const nextPage = () => goToPage(page + 1);
    const prevPage = () => goToPage(page - 1);

    return {
        readFile,
        nextPage,
        prevPage,
        goToPage,
        currentPage: page,
        data, // ✅ return luôn data hiện tại
    };
}
