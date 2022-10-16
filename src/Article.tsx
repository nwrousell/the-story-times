import Image from "./ui/Image"

export default function Article({ article, flipped = false }) {
    return (
        <div className="mb-8">
            <p className="uppercase text-center text-4xl my-2 font-serif">{article.headline}</p>
            <hr className="my-4 w-[60%] m-auto border-[1px] border-gray-300" />
            <p className="text-center font-serif font-semibold text-gray-600 mb-4 uppercase">By {article.author}</p>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${flipped && 'md:hidden'}`}>
                <Image path={article.imagePath} />
                <div className="">
                    <p className="text-lg font-serif first-letter:text-4xl">{article.body}</p>
                </div>
            </div>
            <div className={`md:grid hidden md:grid-cols-2 gap-4 ${!flipped ? 'md:block' : 'hidden'}`}>
                <Image path={article.imagePath} />
                <div className="">
                    <p className="text-lg font-serif first-letter:text-4xl first-letter:font-bold">{article.body}</p>
                </div>
            </div>
        </div>
    )
}