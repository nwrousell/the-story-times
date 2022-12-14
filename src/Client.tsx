import useNewspaper, { SectionType } from "./useNewspaper"
import useSections, { CatchTheLiesArticleGame } from "./useSections"
import FlipCountdown from '@rumess/react-flip-countdown';
import { getDateForFlipdown } from "./date-functions";
import Writing from "./Writing";
import { useState } from 'react'
import Image from "./ui/Image";
import Voting from "./Voting";
import Article from "./Article";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { Heading } from "./App";
import { FiClipboard } from 'react-icons/fi'


export default function Client({ db, paperDocId, name, isHost }) {
    const [paper, onPaperAction] = useNewspaper(db, paperDocId, isHost, name)

    if (!paper) return <div>loading</div>

    const numOfPlayers = paper.editors.length

    switch (paper.state) {
        case 'lobby':
            return <Lobby isHost={isHost} paper={paper} paperDocId={paperDocId} onPaperAction={onPaperAction} />
        case 'game':
            return <>
                <Overlay />
                <div className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-8 max-w-6xl w-full bg-white rounded-md"><Game numOfPlayers={numOfPlayers} onPaperAction={onPaperAction} isHost={isHost} paperDocId={paperDocId} db={db} paper={paper} name={name} /></div>
            </>
        case 'completed':
            return <CompletedPaper paperDocId={paperDocId} db={db} paper={paper} />
    }
}

function Overlay() {
    return <div className="fixed inset-0 z-20 bg-gray-800 dark:bg-gray-200 opacity-30" />
}

function Lobby({ paper, onPaperAction, paperDocId, isHost }) {
    const [copied, setCopied] = useState(false)

    return (
        <div>
            <Heading />

            <p className="text-3xl font-semibold text-gray-800 text-center mb-4">Lobby:</p>
            <div className="flex justify-around max-w-md flex-wrap m-auto mb-2">
                {paper.editors.map((text, i) => <div className="badge badge-lg px-6 py-4" key={i}>{text}</div>)}
            </div>

            <hr className="m-auto w-[97%] my-8 border-[1px] border-gray-300" />

            {isHost && (<div className="m-auto text-center">
                <div className="flex items-center justify-center">
                    <p className="text-2xl mr-2"><strong>Paper Code:</strong> {paperDocId}</p>
                    {!copied ? <FiClipboard className="cursor-pointer hover:text-blue-600" size={24} onClick={() => { navigator.clipboard.writeText(paperDocId); setCopied(true) }} /> :
                        <p >Copied to clipboard!</p>}
                </div>
                <button className="btn bg-blue-600 hover:bg-blue-700 mt-4 m-auto" onClick={() => onPaperAction({ type: 'state-change', value: 'game' })}>Start game</button>
            </div>)}
        </div>
    )
}
function Game({ paperDocId, db, paper, name, isHost, onPaperAction, numOfPlayers }) {
    const [previousSections, currentSection, onSectionAction] = useSections(db, paperDocId, paper.sectionIds, paper.currentSectionIndex, numOfPlayers)
    const [article, setArticle] = useState({ test: true })
    const [submitted, setSubmitted] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    if (!currentSection) return <div>loading</div>

    const playerIndex = paper.editors.findIndex((editorName) => editorName == name)

    const handleArticleSubmit = () => {
        console.log("hello", article)
        onSectionAction({ type: 'add-article', value: article })
        // const sectionDocRef = doc(db, 'papers', paperDocId, 'sections', paper.sectionIds[0])
        // updateDoc(sectionDocRef, {
        //     articles: arrayUnion(article)
        // })
        setSubmitted(true)
    }

    const callIt = () => {
        onSectionAction({ type: 'state-change', value: 'voting' })
    }

    const handleWritingTimeUp = () => {
        if (!submitted) handleArticleSubmit()

        if (isHost) {
            setTimeout(callIt, 3000)
        }
    }

    const handleVotingTimeUp = () => {
        if (!isHost) return

        if (currentSection.state == 'voting') {
            onSectionAction({ type: 'state-change', value: 'voting-show' })
        } else {
            if (currentSection.articlesLeft.length == 0) {
                // round is done
                console.log("PAPER COMPLETED")
                onPaperAction({ type: 'state-change', value: 'completed' })
            } else {
                onSectionAction({ type: 'state-change', value: 'voting' })
            }
        }
    }

    const handleVote = (thisVote, lastVote) => {
        onSectionAction({ type: 'vote', value: { thisVote, lastVote } })
    }

    console.log(article)

    switch (currentSection.sectionType as SectionType) {
        case 'catch-the-lies':
            switch (currentSection.state as CatchTheLiesArticleGame["state"]) {
                case 'countdown':
                    return (
                        <div className="flex justify-center items-center my-32">
                            <FlipCountdown endAtZero hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} onTimeUp={() => isHost && onSectionAction({ type: 'state-change', value: 'writing' })} />
                        </div>
                    )
                case 'writing':
                    return (
                        <div>
                            {/* <FlipCountdown endAtZero onTimeUp={() => handleWritingTimeUp()} hideYear hideMonth hideDay hideHour endAt={getDateForFlipdown(currentSection.timerEnd)} /> */}
                            {submitted && <div>Submitted</div>}
                            {!submitted && <Writing playerName={name} setArticle={setArticle} onSubmit={handleArticleSubmit} currentSection={currentSection} playerIndex={playerIndex} />}
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
function CompletedPaper({ paperDocId, db, paper }) {
    // console.log(paperDocId, db, paper)
    // const [previousSections, currentSection, onSectionAction] = useSections(db, paperDocId, paper.sectionIds, paper.currentSectionId)
    const sectionDocRef = doc(db, 'papers', paperDocId, 'sections', paper.sectionIds[0])
    const [currentSection, loading, error, snapshot] = useDocumentData(sectionDocRef);

    if (!currentSection) return <div>loading</div>

    const printNewspaper = () => {
        var pdf = document.getElementById("newspaper");
        var mywindow = window.open("", "PRINT", "height=1000,width=1152");
        mywindow.document.write(document.head.innerHTML);
        mywindow.document.write(pdf.innerHTML);
        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
    }

    return (
        <div>
            <Heading />
            {currentSection.articles.map((article, i) => <Article lastArticle={i + 1 == currentSection.articles.length} flipped={i % 2 == 0} key={i} article={article} />)}

            <button onClick={printNewspaper} className="btn fixed right-4 bottom-4">
                Print
            </button>
        </div>
    )
}