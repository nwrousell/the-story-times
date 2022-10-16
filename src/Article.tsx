import Image from "./ui/Image"

export default function Article({ article }) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Image path={article.imagePath} />
            <div className="">
                <p className="text-2xl text-gray-800 font-semibold">{article.headline}</p>
                <p className="text-gray-600 italic">{article.author}</p>
                <p className="text-lg">{article.body}</p>
            </div>
        </div>
    )
}