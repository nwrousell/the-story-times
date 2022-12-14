import Image from "./ui/Image"

export default function Article({ article, lastArticle = true, flipped = false }) {
    return (
        <>
            <div className="mb-8">
                <p className="uppercase text-center text-4xl my-2 font-serif">{article.headline}</p>
                <hr className="my-4 w-[60%] m-auto border-[1px] border-gray-300" />
                <p className="text-center font-serif font-semibold text-gray-600 mb-4">by <span className="uppercase">{article.author}</span></p>
                <div className={`grid grid-cols-1 md:hidden gap-4`}>
                    <Image path={article.imagePath} />
                    <div className="">
                        <p className="text-lg font-serif first-letter:text-4xl first-letter:font-semibold">{article.body}</p>
                    </div>
                </div>
                <div className={`md:grid hidden md:grid-cols-2 gap-4 ${!flipped ? 'md:grid' : 'md:hidden'}`}>
                    <Image path={article.imagePath} />
                    <div className="">
                        <p className="text-lg font-serif first-letter:text-4xl first-letter:font-semibold">{article.body}</p>
                    </div>
                </div>
                <div className={`md:grid hidden md:grid-cols-2 gap-4 ${flipped ? 'md:grid' : 'md:hidden'}`}>
                    <div className="">
                        <p className="text-lg font-serif first-letter:text-4xl first-letter:font-semibold">{article.body}</p>
                    </div>
                    <Image path={article.imagePath} />
                </div>
            </div>
            { !lastArticle && (<><hr className="m-auto mt-4 border-gray-300 border-[1px] mb-2 w-full" />
            <hr className="m-auto mb-4 border-gray-300 border-[1px] mt-2 w-full" /></>)}
        </>
    )
}