import Image from "./ui/Image";
import { useState, useEffect } from 'react'
import { MdClear, MdCheck } from 'react-icons/md'
import Article from "./Article";

export default function Voting({ article, trueVotes, falseVotes, onVote, show=false, }){
    const [hasVoted, setHasVoted] = useState(false)
    const [lastVote, setLastVote] = useState<'lie' | 'truth' | ''>('')

    useEffect(() => {
        setLastVote('')
    }, [article.author])

    const handleVote = (vote) => {
        if(vote == lastVote) return

        onVote(vote, lastVote)

        setLastVote(vote)
    }

    const correct = (article.isLie && trueVotes < falseVotes) || (!article.isLie && falseVotes < trueVotes)

    return (
        <div>
            <div className="my-8"><Article article={article} /></div>
            { !show && (<div className="flex items-center justify-between">
                <div>
                    <button onClick={() => handleVote('lie')} className="btn w-16 h-16 btn-xl btn-error">
                        <MdClear size={32} className="text-white" />
                        <p className="text-white text-sm">Lie</p>
                    </button>
                    <p>{ falseVotes } votes</p>
                </div>
                <div>
                    <button onClick={() => handleVote('truth')} className="btn w-16 h-16 btn-xl btn-success">
                        <MdCheck size={32} className="text-white" />
                        <p className="text-white text-sm">Truth</p>
                    </button>
                    <p>{ trueVotes } votes</p>
                </div>
            </div>)}
            { (show && trueVotes == falseVotes) && <p className="text-3xl font-bold">Split down the middle! No one knew what was up with this one.</p> }
            { (show && trueVotes != falseVotes) && <p className="text-3xl font-bold">The group was { correct ? 'correct!' : 'incorrect!' }! The article was <span className="italic font-semibold">{ article.isLie ? 'a lie' : 'true' }</span>.</p> }
        </div>
    )
}