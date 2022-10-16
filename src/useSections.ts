import { arrayUnion, collection, doc, Firestore, increment, query, setDoc, updateDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useState, useEffect } from 'react'
import { getDateXSecondsAway } from "./date-functions";
import { PROMPTS_PER_USER, TIME_TO_SEE_VOTING_RESULTS, TIME_TO_VOTE, TIME_TO_WRITE } from "./constants";

export interface CatchTheLiesArticleGame {
    sectionType: 'catch-the-lies'
    state: 'writing' | 'voting' | 'voting-show' | 'countdown';
    imagePaths: string[];
    articles: Article[],
    currentTrueVotes: number;
    currentFalseVotes: number;
    prompts: string[]; // each player gets their share of prompts (determined by their index)
    currentArticle: number; // the article everyone is currently voting on
    articlesLeft: number[]; // the articles seen so far (so we can randomly pick one without missing or duplicating any)
    timerEnd: Date; // used to calculate how much time is left for writing / voting (so everyone's timer is synced)
}

export interface Article {
    headline: string;
    body: string;
    author: string;
    imagePath: string;
    trueVotes: number;
    falseVotes: number;
    isLie: boolean;
}

type SectionActionType = 'state-change' | 'add-article' | 'vote' | 'voting-time'

type SectionAction = { type: SectionActionType, value: any }

/**  */
export default function useSections(db: Firestore, paperDocId: string, sectionIds: string[], currentSectionIndex: number, numOfPlayers: number) {
    const sectionsCollection = collection(db, 'papers', paperDocId, 'sections')
    const q = query(sectionsCollection)
    const [sectionsSnapshot, sectionsLoading, sectionsError] = useCollection(q);
    const [sections, setSections] = useState([])

    const previousSections = sections.filter((val, i) => sectionIds.findIndex((id) => id == val.id) < currentSectionIndex)
    const currentSection = sections.find(({ id }, i) => id == sectionIds[currentSectionIndex])

    useEffect(() => {
        if (sectionsLoading) return

        const _sections = sectionsSnapshot.docs.map((snapshot) => { return { ...snapshot.data(), id: snapshot.id, timerEnd: snapshot.data().timerEnd.toDate() } })
        setSections(_sections)
    }, [sectionsSnapshot])

    const onAction = async (action: SectionAction) => {
        const { type, value }: SectionAction = action

        let tempCurrentSection = { ...currentSection }
        const currentSectionDocRef = doc(db, 'papers', paperDocId, 'sections', sectionIds[currentSectionIndex])
        switch (type) {
            case 'state-change':
                switch (value as CatchTheLiesArticleGame["state"]) {
                    case 'writing':
                        updateDoc(currentSectionDocRef, {
                            state: 'writing',
                            timerEnd: getDateXSecondsAway(TIME_TO_WRITE)
                        })
                        break;
                    case 'voting':
                        if(currentSection.articles.length < numOfPlayers) setTimeout(() => onAction({ type: 'state-change', value: 'voting' }), 500)
                        
                        // this branch is returned to after each article is voted on (except for the last)
                        let articlesLeft = currentSection.articlesLeft
                        if (articlesLeft == null) {
                            articlesLeft = []
                            for(let index in currentSection.articles) articlesLeft.push(index)
                        }
                        console.log(articlesLeft)
                        const randIndex = Math.floor(Math.random() * articlesLeft.length)
                        const currentArticle = articlesLeft[randIndex]

                        articlesLeft.splice(randIndex, 1)

                        updateDoc(currentSectionDocRef, {
                            state: 'voting',
                            timerEnd: getDateXSecondsAway(TIME_TO_VOTE),
                            articlesLeft: articlesLeft,
                            currentArticle: currentArticle,
                            currentTrueVotes: 0,
                            currentFalseVotes: 0,
                        })
                        break;
                    case 'voting-show':
                        // tempCurrentSection.articles[currentSection.currentArticle].trueVotes = currentSection.currentTrueVotes
                        // tempCurrentSection.articles[currentSection.currentArticle].falseVotes = currentSection.currentFalseVotes

                        updateDoc(currentSectionDocRef, {
                            state: 'voting-show',
                            // articles: tempCurrentSection.articles,
                            timerEnd: getDateXSecondsAway(TIME_TO_SEE_VOTING_RESULTS),
                        })
                        break;
                }
                break;
            case 'add-article':
                const isLastArticle = currentSection.articles.length + 1 == currentSection.prompts.length / PROMPTS_PER_USER
                tempCurrentSection.articles.push({ ...value, trueVotes: 0, falseVotes: 0 })
                await setSections([tempCurrentSection])
                await updateDoc(currentSectionDocRef, {
                    articles: arrayUnion({ ...value, trueVotes: 0, falseVotes: 0 })
                })
                if (isLastArticle) onAction({ type: 'state-change', value: 'voting' })
                break;
            case 'vote':
                const { thisVote, lastVote } = value
                // if (thisVote == lastVote) return

                let trueChange = 0
                let falseChange = 0
                if (thisVote == 'truth') {
                    trueChange += 1
                } else {
                    falseChange += 1
                }
                if (lastVote == 'truth') {
                    trueChange -= 1
                } else if (lastVote == 'lie') {
                    falseChange -= 1
                }

                updateDoc(currentSectionDocRef, {
                    currentTrueVotes: increment(trueChange),
                    currentFalseVotes: increment(falseChange),
                })
                break;
        }

    }

    return [previousSections, currentSection, onAction]
}