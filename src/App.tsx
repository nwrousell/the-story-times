import { addDoc, arrayUnion, collection, doc, updateDoc } from 'firebase/firestore'
import { useState } from 'react'
import { db } from './firebase'
import Client from './Client'
import { Newspaper } from './useNewspaper'
import useNewspaper from './useNewspaper'


type UserType = 'host' | 'non-host' | 'none'

function App() {
    const [userType, setUserType] = useState<UserType>('none')
    const [paperDocId, setPaperDocId] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [joinCode, setJoinCode] = useState('')

    const handleCreatePaper = async () => {
        setLoading(true)
        setUserType('host')
        const paper: Newspaper = {
            editors: [name],
            currentSectionIndex: -1,
            sectionIds: [],
            state: 'lobby',
            title: 'The Something Times'
        }

        const papersCollection = collection(db, 'papers')
        const paperDocRef = await addDoc(papersCollection, paper)

        setPaperDocId(paperDocRef.id)
        setLoading(false)
    }

    const handleJoinPaper = () => {
        setPaperDocId(joinCode)
        setUserType('non-host')
        setName(name)

        const paperDocRef = doc(db, 'papers', joinCode)
        updateDoc(paperDocRef, {
            editors: arrayUnion(name)
        })
    }

    return (
        <div className="flex justify-center pt-32 bg-zinc-200 min-h-screen">
            <div className="newspaper shadow-md rounded-xl bg-zinc-50 p-16 max-w-5xl w-full h-full">
                 { loading && <h1 className="text-4xl">Loading</h1> }
                {(userType == 'none' && !loading) && <StartingScreen setName={setName} setJoinCode={setJoinCode} handleCreatePaper={handleCreatePaper} handleJoinPaper={handleJoinPaper} />}

                { (userType != 'none' && !loading) && <Client isHost={userType=='host'} name={name} db={db} paperDocId={paperDocId} /> }
            </div>
        </div>
    );
}

function StartingScreen({ handleCreatePaper, handleJoinPaper, setJoinCode, setName }) {
    return (
        <div>
            <h1 className="text-5xl uppercase font-black chomsky">the bruno times</h1> 
            <input type="text" onChange={(e) => setName(e.target.value)} placeholder="name here" />
            <button onClick={handleCreatePaper}>Start a paper</button>

            <div>
                <input onChange={(e) => setJoinCode(e.target.value)} type="text" placeholder="join code here" />
                <button onClick={handleJoinPaper}>Join a paper</button>
            </div>
            <p className="italic text-gray-600">*Names must be unique (There can't be two Bobs)</p>
        </div>
    )
}

export default App;
