import { addDoc, arrayUnion, collection, doc, updateDoc } from 'firebase/firestore'
import { useState } from 'react'
import { db } from './firebase'
import Client from './Client'
import { Newspaper } from './useNewspaper'
import useNewspaper from './useNewspaper'
import { getReadableToday } from './date-functions'


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
            date: getReadableToday(),
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
        <div className="flex justify-center md:py-32 min-h-screen">
            <div id="newspaper" className="z-20 newspaper border border-gray-200 shadow-md rounded-xl bg-white p-4 md:p-16 max-w-5xl w-full h-full">
                 { loading && <h1 className="text-4xl">Loading</h1> }
                {(userType == 'none' && !loading) && <StartingScreen setName={setName} setJoinCode={setJoinCode} handleCreatePaper={handleCreatePaper} handleJoinPaper={handleJoinPaper} />}

                { (userType != 'none' && !loading) && <Client isHost={userType=='host'} name={name} db={db} paperDocId={paperDocId} /> }
            </div>
            <Attribution />
        </div>
    );
}

function StartingScreen({ handleCreatePaper, handleJoinPaper, setJoinCode, setName }) {
    return (
        <div>
            <Heading />
            <div className="py-16 flex flex-col justify-center items-center">
                <div>
                    <p className="mb-1 font-semibold text-lg">Name</p>
                    <input type="text" className="input input-bordered block" onChange={(e) => setName(e.target.value)} placeholder="name here" />
                </div>

                <hr className="m-auto w-[40%] my-8 border-[1px] border-gray-300" />

                <button className="btn mb-8 mt-4" onClick={handleCreatePaper}>Start a paper</button>

                <p className="text-gray-600 font-semibold my-4">OR</p>

                <div>
                <p className="mb-1 font-semibold text-lg">Join Code</p>
                    <div className="input-group m-auto">
                        <input className="input input-bordered" onChange={(e) => setJoinCode(e.target.value)} type="text" placeholder="join code here" />
                        <button className="btn bg-blue-600 hover:bg-blue-700" onClick={handleJoinPaper}>Join a paper</button>
                    </div>
                </div>
                <p className="italic text-gray-600 mt-4">*Names must be unique (There can't be two Bobs)</p>
            </div>
        </div>
    )
}

export function Heading(){
    return (
        <div>
            <h1 className="text-4xl md:text-6xl uppercase font-black my-4 font-serif text-center">the story times</h1> 
            <hr className="m-auto w-[97%] border-[1px] border-gray-300" />
            <div className="py-1 flex justify-between">
                <p className="uppercase font-serif float-left text-left mr-2 md:ml-8">Vol. LXVII.</p>
                <p className="uppercase font-serif text-center">{getReadableToday()}</p>
                <p className="uppercase font-serif float-right text-right ml-2 md:mr-8">THREE CENTS</p>
            </div>
            <hr className="m-auto w-[97%] border-[1px] border-gray-300 mb-4" />
        </div>
    )
}

function Attribution(){
    return (
        <p className="fixed z-0 left-1/2 -translate-x-1/2 bottom-0 p-2 bg-white border">Created in under 36 hours for HackHarvard 2022 by Noah Rousell, Alexander Portland, Ryan Yang</p>
    )
}

export default App;
