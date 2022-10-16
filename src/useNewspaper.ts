import { addDoc, arrayUnion, collection, doc, Firestore, setDoc, updateDoc } from "firebase/firestore"
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { getDateXSecondsAway } from "./date-functions";
import { generatePrompts, generateImagePaths } from "./helpers";
import { CatchTheLiesArticleGame } from "./useSections";

export interface Newspaper {
    title: string;
    editors: string[]; // Each person's name, the index of this matters too for which prompts you receive, etc.
    state: 'lobby' | 'game' | 'completed'; // the state of the overall newspaper
    sectionIds: string[]; // a list of doc ids pointing to each game
    currentSectionIndex: number; // index of which game you're currently in
    /* 
        * Collection of games

    */
}

type PaperActionType = 'add-user' | 'state-change' | 'next-game' | 'title-change' | 'edit-user-name'

type PaperAction = { type: PaperActionType, value: any }

export type SectionType = 'catch-the-lies'

/**  */
export default function useNewspaper(db: Firestore, paperDocId: string, isHost: boolean, playerName: string){
    const paperDocRef = doc(db, 'papers', paperDocId)
    const [paperDocData, paperDocLoading, paperDocError, paperDocSnapshot] = useDocumentData(paperDocRef);

    const updateDatabase = (newPaperData) => {
        setDoc(paperDocRef, newPaperData)
    }

    const onAction = (action) => {
        const { type, value }: PaperAction = action

        const playerIndex = paperDocData.editors.findIndex((editorName) => editorName == playerName)

        const tempPaper: Newspaper = {...paperDocData as Newspaper}

        switch(type){
            case 'add-user':
                tempPaper.editors.push(value)
                break;
            case 'edit-user-name':
                tempPaper.editors[playerIndex] = value
                break;
            case 'title-change':
                tempPaper.title = value
                break;
            case 'state-change':
                switch(value as Newspaper["state"]){
                    case 'game':
                        // create game
                        createArticlesGame()
                        return
                    case 'completed':
                        tempPaper.state = 'completed'
                        break;
                }
                break;
        }

        updateDatabase(tempPaper)
    }

    const createArticlesGame = async () => {
        const game: CatchTheLiesArticleGame = {
            sectionType: 'catch-the-lies',
            articlesLeft: null,
            currentArticle: 0,
            articles: [],
            currentTrueVotes: 0,
            currentFalseVotes: 0,
            state: 'countdown',
            prompts: generatePrompts(paperDocData.editors.length),
            imagePaths: generateImagePaths(paperDocData.editors.length),
            timerEnd: getDateXSecondsAway(5),
        }
        const sectionsCollection = collection(db, 'papers', paperDocId, 'sections')
        const sectionDocRef = await addDoc(sectionsCollection, game)

        updateDoc(paperDocRef, {
            sectionIds: arrayUnion(sectionDocRef.id),
            currentSectionIndex: 0,
            state: 'game',
        })
    }

    return [paperDocData, onAction] as [Newspaper, (PaperAction) => void]
}
