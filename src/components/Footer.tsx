

export default function Footer() {
    return (
        <footer className="mx-auto mb-20 w-[85%] font-mono md:max-w-3xl">
            <p className="border-image-clip-path flex w-full justify-end border-b-2 pr-1 text-[14px]">
                {new Date().getFullYear()} • Bui Trung Tinh
            </p>
        </footer>
    )
}