import useNewspaper, { SectionType } from "./useNewspaper"
import useSections, { CatchTheLiesArticleGame } from "./useSections"
import FlipCountdown from '@rumess/react-flip-countdown';
import { getDateForFlipdown } from "./date-functions";
import Writing from "./Writing";
import { useState } from 'react'
import Image from "./ui/Image";
import Voting from "./Voting";
import Article from "./Article";
import { doc } from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore'


export default function Client({ db, paperDocId, name, isHost }) {
    const [paper, onPaperAction] = useNewspaper(db, paperDocId, isHost, name)

    if (!paper) return <div>loading</div>

    switch (paper.state) {
        case 'lobby':
            return <Lobby isHost={isHost} paper={paper} paperDocId={paperDocId} onPaperAction={onPaperAction} />
        case 'game':
            return <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-8 max-w-4xl w-full bg-white rounded-md"><Game onPaperAction={onPaperAction} isHost={isHost} paperDocId={paperDocId} db={db} paper={paper} name={name} /></div>
        case 'completed':
            return <CompletedPaper paperDocId={paperDocId} db={db} paper={paper} />
    }
}

function Lobby({ paper, onPaperAction, paperDocId, isHost }) {
    return (
        <div>
            {isHost && "I'm a host"}
            <h1>{paper.title}</h1>
            <ul>
                {paper.editors.map((text, i) => <li key={i}>{text}</li>)}
            </ul>

            {isHost && (<div>
                <h1><strong>Paper Code:</strong> {paperDocId}</h1>
                <button onClick={() => onPaperAction({ type: 'state-change', value: 'game' })}>Start game</button>
            </div>)}
        </div>
    )
}
function Game({ paperDocId, db, paper, name, isHost, onPaperAction }) {
    const [previousSections, currentSection, onSectionAction] = useSections(db, paperDocId, paper.sectionIds, paper.currentSectionIndex)
    const [article, setArticle] = useState()
    const [submitted, setSubmitted] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    if (!currentSection) return <div>loading</div>

    const playerIndex = paper.editors.findIndex((editorName) => editorName == name)

    const handleArticleSubmit = () => {
        onSectionAction({ type: 'add-article', value: article })
        setSubmitted(true)
    }

    const handleWritingTimeUp = () => {
        if(!submitted) handleArticleSubmit()

        if(isHost){
            setTimeout(() => onSectionAction({ type: 'state-change', value: 'voting' }), 1000)
        }
    }

    const handleVotingTimeUp = () => {
        if(!isHost) return

        console.log("IEGIUHOI")
        if(currentSection.state == 'voting'){
            onSectionAction({ type: 'state-change', value: 'voting-show' })
        }else{
            if(currentSection.articlesLeft.length == 0){
                // round is done
                console.log("PAPER COMPLETED")
                onPaperAction({ type: 'state-change', value: 'completed' })
            }else{
                onSectionAction({ type: 'state-change', value: 'voting' })
            }
        }
    }

    const handleVote = (thisVote, lastVote) => {
        onSectionAction({ type: 'vote', value: { thisVote, lastVote } })
    }

    switch (currentSection.sectionType as SectionType) {
        case 'catch-the-lies':
            switch (currentSection.state as CatchTheLiesArticleGame["state"]) {
                case 'countdown':
                    return (
                        <div className="flex justify-center items-center">
                            <FlipCountdown endAtZero hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} onTimeUp={() => isHost && onSectionAction({ type: 'state-change', value: 'writing' })} />
                        </div>
                    )
                case 'writing':
                    return (
                        <div>
                            <FlipCountdown endAtZero onTimeUp={handleWritingTimeUp} hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} />
                            { submitted && <div>Submitted</div> }
                            { !submitted && <Writing playerName={name} setArticle={setArticle} onSubmit={handleArticleSubmit} currentSection={currentSection} playerIndex={playerIndex} /> }
                        </div>
                    )
                case 'voting':
                    return (
                        <div>
                            <FlipCountdown endAtZero onTimeUp={handleVotingTimeUp} hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} />
                            <Voting trueVotes={currentSection.currentTrueVotes} falseVotes={currentSection.currentFalseVotes} article={currentSection.articles[currentSection.currentArticle]} onVote={handleVote} />
                        </div>
                    )
                case 'voting-show':
                    const trueVotes = currentSection.currentTrueVotes
                    const falseVotes = currentSection.currentFalseVotes
                    return (
                        <div>
                            <FlipCountdown endAtZero onTimeUp={handleVotingTimeUp} hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} />
                            <Voting trueVotes={trueVotes} falseVotes={falseVotes} show={true} article={currentSection.articles[currentSection.currentArticle]} onVote={handleVote} />
                        </div>
                    )
            }
    }
}
function CompletedPaper({paperDocId, db, paper}){
    // console.log(paperDocId, db, paper)
    // const [previousSections, currentSection, onSectionAction] = useSections(db, paperDocId, paper.sectionIds, paper.currentSectionId)
    const sectionDocRef = doc(db, 'papers', paperDocId, 'sections', paper.sectionIds[0])
    const [currentSection, loading, error, snapshot] = useDocumentData(sectionDocRef);

    if (!currentSection) return <div>loading</div>

    return (
        <div>
            { currentSection.articles.map((article, i) => <Article key={i} article={article} />) }
        </div>
    )
}